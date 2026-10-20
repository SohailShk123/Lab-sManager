import { app, BrowserWindow, ipcMain, net } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import os from "node:os";

function getMacAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (!iface.internal && iface.mac !== '00:00:00:00:00:00') {
        return iface.mac;
      }
    }
  }
  return "UNKNOWN_MAC";
}

// 👇 Apni nayi database file ko yahan import karein
import db from "./database.js"; // agar error aaye toh require('./database.js') use karein

if (started) {
  app.quit();
}

let isQuitting = false;



// ==========================================
// 1. CLOUD SYNC FUNCTIONS
// ==========================================
async function syncLicenseWithCloud() {
  try {
    db.all("SELECT * FROM app_config", [], async (err, rows) => {
      if (err || !rows || rows.length === 0) return;
      
      const config = {};
      rows.forEach((r) => (config[r.key] = r.value));

      if (!config.lab_id || !config.pin || !config.mac_address) return;

      console.log("Checking license securely for Lab ID:", config.lab_id);

      const response = await fetch("https://lms-backend-lab-s.vercel.app/api/check-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          labId: config.lab_id, 
          pin: config.pin, 
          macAddress: config.mac_address 
        }),
      });

      const rawText = await response.text();
      try {
        const data = JSON.parse(rawText);
        if (response.ok) {
          const workingStatus = data.working ? "true" : "false";
          db.run("UPDATE app_config SET value = ? WHERE key = 'working'", [workingStatus]);
        }
      } catch (jsonErr) {
        console.error("Invalid JSON:", rawText.substring(0, 50));
      }
    });
  } catch (err) {
    console.log("Offline Mode: Could not connect to licensing server.");
  }
}

async function syncLocalDataToCloud() {
  db.get("SELECT value FROM app_config WHERE key = 'lab_id'", (err, row) => {
    if (!row || !row.value) return;
    const labId = row.value;

    db.all("SELECT * FROM bookings", [], async (err, bookings) => {
      if (err || bookings.length === 0) return;
      const syncPayload = bookings.map(b => ({ tableName: 'bookings', localId: b.id, recordData: b }));

      try {
        await fetch('https://lms-backend-lab-s.vercel.app/api/sync-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ labId: labId, records: syncPayload })
        });
      } catch (syncErr) {}
    });
  });
}

// ==========================================
// 2. IPC HANDLERS (Frontend se baat karne ke liye)
// ==========================================

ipcMain.handle("get-lab-config", () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM app_config", [], (err, rows) => {
      if (err) reject(err);
      else {
        const config = {};
        rows.forEach((r) => (config[r.key] = r.value));
        resolve(config);
      }
    });
  });
});

ipcMain.handle("verify-and-save-lab-id", async (event, authData) => {
  try {
    const inputId = authData.labId.trim().toUpperCase();
    const inputPin = authData.pin.trim();
    const macAddress = getMacAddress(); // PC ka Hardware ID nikala
    
    // Cloud par check karo
    const response = await fetch('https://lms-backend-lab-s.vercel.app/api/check-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labId: inputId, pin: inputPin, macAddress: macAddress })
    });
    
    const data = await response.json();

    // Agar valid hai, toh SQLite database mein sab save kar do
    if (data.working === true) {
      db.run("INSERT OR REPLACE INTO app_config (key, value) VALUES ('lab_id', ?)", [inputId]);
      db.run("INSERT OR REPLACE INTO app_config (key, value) VALUES ('pin', ?)", [inputPin]);
      db.run("INSERT OR REPLACE INTO app_config (key, value) VALUES ('mac_address', ?)", [macAddress]);
      db.run("INSERT OR REPLACE INTO app_config (key, value) VALUES ('working', 'true')");
      db.run("INSERT OR REPLACE INTO app_config (key, value) VALUES ('expiry_date', ?)", [data.expiryDate || '']);
      
      return { success: true, message: "License Activated Successfully!" };
    } else {
      // Agar ID block hai, PIN galat hai, ya PC lock hai
      return { success: false, message: data.message || "Invalid Details!" };
    }
  } catch (err) {
    return { success: false, message: "Network Error! Server se connect nahi ho paaya." };
  }
});

// ==========================================
// 💾 SAVE REPORT DATA (Test Results)
// ==========================================
ipcMain.handle("save-report", async (event, data) => {
  return new Promise((resolve) => {
    // Frontend se jo ID aayegi (Booking ID ya Patient ID) aur test results
    const id = data.id || data.booking_id || data.patientId; 
    const resultsJSON = JSON.stringify(data.results || data);

    // Hum bookings table mein results ko save kar rahe hain
    const query = `UPDATE bookings SET results = ? WHERE id = ?`;

    db.run(query, [resultsJSON, id], function (err) {
      if (err) {
        console.error("Save Report Error:", err);
        
        // Agar 'results' column database me nahi hai, toh yeh usko auto-add karne ka backup logic hai
        if (err.message.includes("no such column: results")) {
          db.run("ALTER TABLE bookings ADD COLUMN results TEXT", () => {
            // Column banne ke baad dobara save try karo
            db.run(query, [resultsJSON, id], (retryErr) => {
              if (retryErr) {
                resolve({ success: false, message: "Database Error: " + retryErr.message });
              } else {
                resolve({ success: true, message: "Report saved successfully!" });
              }
            });
          });
        } else {
          resolve({ success: false, message: "Error saving report: " + err.message });
        }
      } else {
        resolve({ success: true, message: "Report saved successfully!" });
      }
    });
  });
});

// ==========================================
// 📂 GET REPORT DATA (Saved Results lana)
// ==========================================
ipcMain.handle("get-report", async (event, id) => {
  return new Promise((resolve) => {
    // Booking table se us ID ka result nikalna
    db.get("SELECT results FROM bookings WHERE id = ?", [id], (err, row) => {
      if (err) {
        console.error("Get Report Error:", err);
        resolve({ success: false, message: err.message });
      } else if (row && row.results) {
        try {
          // JSON string ko wapas Object bana kar frontend ko dena
          const data = JSON.parse(row.results);
          resolve({ success: true, data: data });
        } catch (e) {
          resolve({ success: false, message: "Invalid data format in database" });
        }
      } else {
        // Agar pehle se koi report save nahi hai
        resolve({ success: true, data: null }); 
      }
    });
  });
});

// ==========================================
// 🚀 ALL IPC HANDLERS (Tests, Doctors, Bookings, Reports)
// ==========================================

// --- TESTS HANDLERS ---
ipcMain.handle("get-tests", () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tests ORDER BY id ASC", [], (err, rows) => {
      if (err) reject(err.message);
      else resolve(rows || []);
    });
  });
});

ipcMain.handle("add-test", (event, testData) => {
  return new Promise((resolve, reject) => {
    const { name, cost, normalRange } = testData;
    db.run("INSERT INTO tests (name, cost, normalRange) VALUES (?, ?, ?)",
      [name.trim().toUpperCase(), Number(cost) || 0, normalRange || ""],
      function (err) {
        if (err) reject(err.message);
        else resolve({ success: true, id: this.lastID });
      });
  });
});

ipcMain.handle("update-test", (event, testData) => {
  return new Promise((resolve, reject) => {
    const { id, name, cost, normalRange } = testData;
    db.run("UPDATE tests SET name = ?, cost = ?, normalRange = ? WHERE id = ?",
      [name.trim().toUpperCase(), Number(cost) || 0, normalRange || "", id],
      function (err) {
        if (err) reject(err.message);
        else resolve({ success: true });
      });
  });
});

ipcMain.handle("delete-test", (event, id) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM tests WHERE id = ?", [id], function (err) {
      if (err) reject(err.message);
      else resolve({ success: true });
    });
  });
});

// --- DOCTORS HANDLERS ---
ipcMain.handle("get-doctors", () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM doctors ORDER BY name ASC", [], (err, rows) => {
      if (err) reject(err.message);
      else resolve(rows || []);
    });
  });
});

ipcMain.handle("add-doctor", (event, docData) => {
  return new Promise((resolve, reject) => {
    const { name, degree, hospital } = docData;
    db.run("INSERT INTO doctors (name, degree, hospital) VALUES (?, ?, ?)", 
      [name.trim(), degree || "", hospital || ""], 
      function (err) {
        if (err) reject(err.message.includes("UNIQUE") ? "Doctor already exists." : err.message);
        else resolve({ success: true, id: this.lastID });
      });
  });
});

ipcMain.handle("delete-doctor", (event, doctorId) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM doctors WHERE id = ?", [doctorId], function (err) {
      if (err) reject(err.message);
      else resolve({ success: true });
    });
  });
});

ipcMain.handle("get-patient-history", async (event, data) => {
  return new Promise((resolve) => {
    try {
      const mobile = data.mobile || "";
      const fromDate = data.fromDate || "";
      const toDate = data.toDate || "";

      let query = `
        SELECT b.id as booking_id, b.bookingDate as booking_date, b.doctor, b.tests, b.results, b.totalAmount as total_amount,
               p.name, p.age, p.gender, p.mobile
        FROM bookings b
        JOIN patients p ON b.patient_id = p.id
        WHERE 1=1
      `;
      let params = [];

      if (mobile) {
        query += ` AND p.mobile LIKE ?`;
        params.push(`%${mobile}%`);
      }

      if (fromDate && toDate) {
        query += ` AND b.bookingDate BETWEEN ? AND ?`;
        params.push(fromDate, toDate);
      }

      query += ` ORDER BY b.bookingDate DESC`;

      db.all(query, params, (err, rows) => {
        if (err) resolve({ success: false, message: err.message });
        else resolve({ success: true, data: rows });
      });
    } catch (err) {
      resolve({ success: false, message: err.message });
    }
  });
});
// ==========================================
// CLOUD RESTORE (Vercel se Local me save)
// ==========================================
ipcMain.handle("restore-from-cloud", async () => {
  return new Promise((resolve) => {
    db.get("SELECT value FROM app_config WHERE key = 'lab_id'", async (err, row) => {
      if (err || !row || !row.value) {
        return resolve({ success: false, message: "Lab ID not found. Please activate software first." });
      }

      const labId = row.value;

      try {
        const response = await fetch("https://lms-backend-lab-s.vercel.app/api/restore-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ labId })
        });

        const data = await response.json();

        if (!data.success || !data.records || data.records.length === 0) {
          return resolve({ success: true, message: "No previous data found on cloud to restore." });
        }

        db.serialize(() => {
          db.run("BEGIN TRANSACTION");

          data.records.forEach((record) => {
            const table = record.tableName;
            const rowData = record.recordData;

            if (table === "patients") {
              const stmt = db.prepare("INSERT OR REPLACE INTO patients (id, name, age, gender, mobile) VALUES (?, ?, ?, ?, ?)");
              stmt.run(rowData.id, rowData.name, rowData.age, rowData.gender, rowData.mobile);
              stmt.finalize();
            } 
            else if (table === "bookings") {
              const stmt = db.prepare("INSERT OR REPLACE INTO bookings (id, patient_id, tests, total_amount, advance, balance, booking_date, doctor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
              stmt.run(rowData.id, rowData.patient_id, rowData.tests, rowData.total_amount, rowData.advance, rowData.balance, rowData.booking_date, rowData.doctor);
              stmt.finalize();
            }
          });

          db.run("COMMIT", (commitErr) => {
            if (commitErr) {
              db.run("ROLLBACK");
              resolve({ success: false, message: "Failed to save restored data locally." });
            } else {
              resolve({ success: true, message: `Successfully restored ${data.records.length} records!` });
            }
          });
        });

      } catch (networkErr) {
        resolve({ success: false, message: "Network Error! Could not connect to cloud." });
      }
    });
  });
});


// --- SMART BOOKINGS HANDLER (WITH PATIENT CHECK) ---
ipcMain.handle('save-booking', async (event, data) => {
  return new Promise((resolve) => {
    const {
      bookingDate,
      patientName,
      mobile, 
      age,
      gender,
      doctor,
      totalAmount,
      discount,
      paidAmount,
      tests
    } = data;
    
    const testsData = tests || "[]"; 
    const balance = (totalAmount || 0) - (discount || 0) - (paidAmount || 0);

    // 👇 YAHAN SMART FIX HAI: Ab app 'mobile' ke sath 'name' bhi match karega
    db.get("SELECT id FROM patients WHERE mobile = ? AND name = ?", [mobile, patientName], (err, row) => {
      if (err) return resolve({ success: false, error: err.message });

      if (row) {
        // Agar Naam aur Mobile DONO match karte hain, toh same patient ki age/gender update karke nai booking banao
        db.run("UPDATE patients SET age = ?, gender = ? WHERE id = ?", [age, gender, row.id], () => {
          insertBooking(row.id);
        });
      } else {
        // Agar Mobile same hai lekin Naam alag hai (jaise family member), ya bilkul naya number hai, toh naya patient banao
        db.run("INSERT INTO patients (name, mobile, age, gender) VALUES (?, ?, ?, ?)", 
          [patientName, mobile, age, gender], 
          function (err2) {
            if (err2) return resolve({ success: false, error: err2.message });
            insertBooking(this.lastID); // Naye family member ki ID use karo
          }
        );
      }
    });

    // Booking Insert karne ka function
    function insertBooking(patientId) {
      db.run(`INSERT INTO bookings (patient_id, bookingDate, doctor, tests, totalAmount, discount, paidAmount, balance) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [patientId, bookingDate, doctor, testsData, totalAmount, discount, paidAmount, balance],
        function (err3) {
          if (err3) resolve({ success: false, error: err3.message });
          else resolve({ success: true, bookingId: this.lastID });
        }
      );
    }
  });
});


// --- GET BOOKINGS (JOIN PATIENT INFO) ---
ipcMain.handle("get-bookings", () => {
  return new Promise((resolve, reject) => {
    // Ab data do tables se mila kar lana hoga (JOIN ka magic!)
    const query = `
      SELECT b.*, p.name as patientName, p.mobile, p.age, p.gender 
      FROM bookings b
      JOIN patients p ON b.patient_id = p.id
      ORDER BY b.id DESC LIMIT 100
    `;
    db.all(query, [], (err, rows) => {
      if (err) reject(err.message);
      else resolve(rows || []);
    });
  });
});

// ==========================================
// IMPORT OLD DATA (CSV / Excel Migration)
// ==========================================
ipcMain.handle("import-old-data", async (event, rows) => {
  return new Promise((resolve) => {
    db.serialize(async () => {
      db.run("BEGIN TRANSACTION;");

      // SQLite ke purane callbacks ko naye Promise me convert karna (taaki await kaam kare)
      const runQuery = (query, params) => new Promise((res, rej) => db.run(query, params, function(err) { if (err) rej(err); else res(this); }));
      const getQuery = (query, params) => new Promise((res, rej) => db.get(query, params, (err, row) => { if (err) rej(err); else res(row); }));

      try {
        for (const row of rows) {
          if (!row.mobile) continue; // Mobile number zaruri hai

          // 1. Patient ko insert karo (Agar pehle se nahi hai toh)
          await runQuery(
            `INSERT OR IGNORE INTO patients (name, age, gender, mobile) VALUES (?, ?, ?, ?)`,
            [row.name || 'Unknown', row.age || null, row.gender || '', row.mobile]
          );

          // 2. Patient ki ID lo (naya ho ya purana)
          const patient = await getQuery(`SELECT id FROM patients WHERE mobile = ?`, [row.mobile]);

          if (patient) {
            // 3. Patient ki Booking/Tests save karo
            await runQuery(
              `INSERT INTO bookings (patient_id, bookingDate, doctor, tests, results, totalAmount, discount, paidAmount, balance) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                patient.id,
                row.date || new Date().toISOString().split('T')[0],
                row.doctor || 'SELF',
                row.tests ? `["${row.tests}"]` : '["CBC"]', // Tests ko array string me badalna taaki frontend crash na ho
                '{}', 
                parseFloat(row.amount) || 0,
                0,
                parseFloat(row.amount) || 0,
                0
              ]
            );
          }
        }

        // Sab successfully insert hone ke baad save (COMMIT) karo
        db.run("COMMIT;", (err) => {
          if (err) resolve({ success: false, message: err.message });
          else resolve({ success: true, message: `Successfully imported records!` });
        });

      } catch (error) {
        db.run("ROLLBACK;"); // Agar koi error aaye toh changes wapas le lo
        resolve({ success: false, message: "Import failed: " + error.message });
      }
    });
  });
});


// ==========================================
// 3. WINDOW LIFECYCLE
// ==========================================
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Smart Sync & Exit
  mainWindow.on('close', async (event) => {
    if (isQuitting) return;
    event.preventDefault();
    mainWindow.hide();

    try {
      const isOnline = await net.isOnline();
      if (isOnline) {
        const safetyTimer = setTimeout(() => { isQuitting = true; app.quit(); }, 3000);
        await syncLocalDataToCloud(); 
        clearTimeout(safetyTimer);
      }
    } catch (err) {}
    isQuitting = true;
    app.quit();
  });
};

app.whenReady().then(() => {
  createWindow();
  syncLicenseWithCloud();
  setTimeout(() => syncLocalDataToCloud(), 5000);
});