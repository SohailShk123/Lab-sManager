import { app, BrowserWindow, ipcMain, net } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import os from "node:os";

function getMacAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (!iface.internal && iface.mac !== "00:00:00:00:00:00") {
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

      // console.log("Checking license securely for Lab ID:", config.lab_id);

      const response = await fetch(
        "https://lms-backend-lab-s.vercel.app/api/check-license",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            labId: config.lab_id,
            pin: config.pin,
            macAddress: config.mac_address,
          }),
        },
      );

      const rawText = await response.text();
      try {
        const data = JSON.parse(rawText);
        if (response.ok) {
          const workingStatus = data.working ? "true" : "false";
          db.run("UPDATE app_config SET value = ? WHERE key = 'working'", [
            workingStatus,
          ]);
        }
      } catch (jsonErr) {
        console.error("Invalid JSON:", rawText.substring(0, 50));
      }
    });
  } catch (err) {
    console.log("Offline Mode: Could not connect to licensing server.");
  }
}

// async function syncLocalDataToCloud() {
//   db.get("SELECT value FROM app_config WHERE key = 'lab_id'", (err, row) => {
//     if (!row || !row.value) return;
//     const labId = row.value;

//     db.all("SELECT * FROM bookings", [], async (err, bookings) => {
//       if (err || bookings.length === 0) return;
//       const syncPayload = bookings.map((b) => ({
//         tableName: "bookings",
//         localId: b.id,
//         recordData: b,
//       }));

//       try {
//         await fetch("https://lms-backend-lab-s.vercel.app/api/sync-data", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ labId: labId, records: syncPayload }),
//         });
//       } catch (syncErr) {}
//     });
//   });
// }

// ==========================================
// 2. IPC HANDLERS (Frontend se baat karne ke liye)
// ==========================================
async function syncLocalDataToCloud() {
  db.get("SELECT value FROM app_config WHERE key = 'lab_id'", async (err, row) => {
    if (!row || !row.value) return;
    const labId = row.value;

    // 1. Patients ka data nikalo
    const getPatients = new Promise((resolve) => {
      db.all("SELECT * FROM patients", [], (err, rows) => resolve(err ? [] : rows));
    });

    // 2. Bookings ka data nikalo
    const getBookings = new Promise((resolve) => {
      db.all("SELECT * FROM bookings", [], (err, rows) => resolve(err ? [] : rows));
    });

    const patients = await getPatients;
    const bookings = await getBookings;

    if (patients.length === 0 && bookings.length === 0) return;

    // 3. Dono tables ke data ko cloud ke format me set karo
    const patientsPayload = patients.map((p) => ({
      tableName: "patients",
      localId: p.id,
      recordData: p,
    }));

    const bookingsPayload = bookings.map((b) => ({
      tableName: "bookings",
      localId: b.id,
      recordData: b,
    }));

    // 4. Dono arrays ko ek sath jod do
    const syncPayload = [...patientsPayload, ...bookingsPayload];

    // 5. Cloud par bhej do
    try {
      await fetch("https://lms-backend-lab-s.vercel.app/api/sync-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labId: labId, records: syncPayload }),
      });
      console.log(`☁️ Sync Success: ${patients.length} patients and ${bookings.length} bookings sent to cloud.`);
    } catch (syncErr) {
      console.error("Cloud sync failed:", syncErr.message);
    }
  });
}
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
// Settings Load Karne Ke Liye
ipcMain.handle("getConfig", async () => {
  return new Promise((resolve) => {
    db.all("SELECT key, value FROM app_config", (err, rows) => {
      if (err || !rows) return resolve({});
      const config = {};
      rows.forEach((row) => {
        config[row.key] = row.value;
      });
      resolve(config);
    });
  });
});

// Settings Save Karne Ke Liye
ipcMain.handle("saveConfig", async (event, configData) => {
  return new Promise((resolve) => {
    db.serialize(() => {
      const stmt = db.prepare(
        "INSERT OR REPLACE INTO app_config (key, value) VALUES (?, ?)",
      );
      for (const [key, value] of Object.entries(configData)) {
        stmt.run(key, value ? value.toString() : "");
      }
      stmt.finalize(() => resolve({ success: true }));
    });
  });
});

ipcMain.handle("verify-and-save-lab-id", async (event, authData) => {
  try {
    const inputId = authData.labId.trim().toUpperCase();
    const inputPin = authData.pin.trim();
    const macAddress = getMacAddress(); // PC ka Hardware ID nikala

    // Cloud par check karo
    const response = await fetch(
      "https://lms-backend-lab-s.vercel.app/api/check-license",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labId: inputId,
          pin: inputPin,
          macAddress: macAddress,
        }),
      },
    );

    const data = await response.json();

    // Agar valid hai, toh SQLite database mein sab save kar do
    if (data.working === true) {
      db.run(
        "INSERT OR REPLACE INTO app_config (key, value) VALUES ('lab_id', ?)",
        [inputId],
      );
      db.run(
        "INSERT OR REPLACE INTO app_config (key, value) VALUES ('pin', ?)",
        [inputPin],
      );
      db.run(
        "INSERT OR REPLACE INTO app_config (key, value) VALUES ('mac_address', ?)",
        [macAddress],
      );
      db.run(
        "INSERT OR REPLACE INTO app_config (key, value) VALUES ('working', 'true')",
      );
      db.run(
        "INSERT OR REPLACE INTO app_config (key, value) VALUES ('expiry_date', ?)",
        [data.expiryDate || ""],
      );

      return { success: true, message: "License Activated Successfully!" };
    } else {
      // Agar ID block hai, PIN galat hai, ya PC lock hai
      return { success: false, message: data.message || "Invalid Details!" };
    }
  } catch (err) {
    return {
      success: false,
      message: "Network Error! Server se connect nahi ho paaya.",
    };
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
                resolve({
                  success: false,
                  message: "Database Error: " + retryErr.message,
                });
              } else {
                resolve({
                  success: true,
                  message: "Report saved successfully!",
                });
              }
            });
          });
        } else {
          resolve({
            success: false,
            message: "Error saving report: " + err.message,
          });
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
          resolve({
            success: false,
            message: "Invalid data format in database",
          });
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
    db.run(
      "INSERT INTO tests (name, cost, normalRange) VALUES (?, ?, ?)",
      [name.trim().toUpperCase(), Number(cost) || 0, normalRange || ""],
      function (err) {
        if (err) reject(err.message);
        else resolve({ success: true, id: this.lastID });
      },
    );
  });
});

ipcMain.handle("update-test", (event, testData) => {
  return new Promise((resolve, reject) => {
    const { id, name, cost, normalRange } = testData;
    db.run(
      "UPDATE tests SET name = ?, cost = ?, normalRange = ? WHERE id = ?",
      [name.trim().toUpperCase(), Number(cost) || 0, normalRange || "", id],
      function (err) {
        if (err) reject(err.message);
        else resolve({ success: true });
      },
    );
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
    db.run(
      "INSERT INTO doctors (name, degree, hospital) VALUES (?, ?, ?)",
      [name.trim(), degree || "", hospital || ""],
      function (err) {
        if (err)
          reject(
            err.message.includes("UNIQUE")
              ? "Doctor already exists."
              : err.message,
          );
        else resolve({ success: true, id: this.lastID });
      },
    );
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

      // 👇 YAHAN BAS 'LEFT JOIN' LAGA DIYA HAI TAAKI KOI RECORD CHHUPE NAHI
      let query = `
        SELECT b.id as booking_id, b.bookingDate as booking_date, b.doctor, b.tests, b.results, b.totalAmount as total_amount,
               p.name, p.age, p.gender, p.mobile
        FROM bookings b
        LEFT JOIN patients p ON b.patient_id = p.id
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
// ipcMain.handle("restore-from-cloud", async () => {
//   return new Promise((resolve) => {
//     db.get("SELECT value FROM app_config WHERE key = 'lab_id'", async (err, row) => {
//       if (err || !row || !row.value) {
//         return resolve({ success: false, message: "Lab ID not found. Please activate software first." });
//       }

//       const labId = row.value;

//       try {
//         const response = await fetch("https://lms-backend-lab-s.vercel.app/api/restore-data", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ labId })
//         });

//         const data = await response.json();

//         if (!data.success || !data.records || data.records.length === 0) {
//           return resolve({ success: true, message: "No previous data found on cloud to restore." });
//         }

//         db.serialize(() => {
//           db.run("BEGIN TRANSACTION", (beginErr) => {
//             if (beginErr) {
//               return resolve({ success: false, message: "Failed to start database transaction." });
//             }

//             let successCount = 0;

//             try {
//               data.records.forEach((record) => {
//                 const table = record.tableName;
//                 const r = record.recordData;

//                 if (table === "patients") {
//                   // Patients table insert/replace
//                   const stmt = db.prepare("INSERT OR REPLACE INTO patients (id, name, age, gender, mobile) VALUES (?, ?, ?, ?, ?)");
//                   stmt.run(r.id, r.name, r.age, r.gender, r.mobile);
//                   stmt.finalize();
//                   successCount++;
//                 }
//                 else if (table === "bookings") {
//                   // 👇 Aapke local bookings columns ke sath 100% matched mapping
//                   const stmt = db.prepare(`
//                     INSERT OR REPLACE INTO bookings
//                     (id, patient_id, tests, results, totalAmount, discount, paidAmount, balance, bookingDate, doctor)
//                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//                   `);

//                   stmt.run(
//                     r.id,
//                     r.patient_id,
//                     r.tests || '',
//                     r.results || '',
//                     r.total_amount || r.totalAmount || 0,
//                     r.discount || 0,
//                     r.advance || r.paidAmount || 0,
//                     r.balance || 0,
//                     r.booking_date || r.bookingDate || '',
//                     r.doctor || 'SELF'
//                   );
//                   stmt.finalize();
//                   successCount++;
//                 }
//               });

//               db.run("COMMIT", (commitErr) => {
//                 if (commitErr) {
//                   db.run("ROLLBACK");
//                   resolve({ success: false, message: "Failed to save restored data locally." });
//                 } else {
//                   resolve({ success: true, message: `Successfully restored ${successCount} records!` });
//                 }
//               });

//             } catch (loopErr) {
//               db.run("ROLLBACK");
//               resolve({ success: false, message: "Error processing records during restore." });
//             }
//           });
//         });

//       } catch (networkErr) {
//         resolve({ success: false, message: "Network Error! Could not connect to cloud." });
//       }
//     });
//   });
// });

// ipcMain.handle("restore-from-cloud", async (event, userLimit) => {
//   return new Promise((resolve) => {
//     db.get(
//       "SELECT value FROM app_config WHERE key = 'lab_id'",
//       async (err, row) => {
//         if (err || !row || !row.value) {
//           return resolve({
//             success: false,
//             message: "Lab ID not found. Please activate software first.",
//           });
//         }

//         const labId = row.value;

//         try {
//           const response = await fetch(
//             "https://lms-backend-lab-s.vercel.app/api/restore-data",
//             {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ labId }),
//             },
//           );

//           const data = await response.json();

//           // 🔍 👇 PEHLA LOG YAHAN DALNA HAI (Yeh check karega ki cloud se data aa raha hai ya nahi)
//           // console.log("☁️ Cloud API Response:", JSON.stringify(data, null, 2));

//           if (!data.success || !data.records || data.records.length === 0) {
//             return resolve({
//               success: true,
//               message: "No previous data found on cloud to restore.",
//             });
//           }

//           db.serialize(() => {
//             db.run("BEGIN TRANSACTION", (beginErr) => {
//               if (beginErr) {
//                 return resolve({
//                   success: false,
//                   message: "Failed to start database transaction.",
//                 });
//               }

//               let successCount = 0;

//               try {
//                 data.records.forEach((record) => {

//                   const table = record.tableName;
//                   const r = record.recordData;

//                   if (table === "patients") {
//                     const stmt = db.prepare(
//                       "INSERT OR REPLACE INTO patients (id, name, age, gender, mobile) VALUES (?, ?, ?, ?, ?)",
//                     );

//                     // 👇 Yahan fallback lagaya hai taaki NOT NULL ka error kabhi na aaye
//                     const pName =
//                       r.name ||
//                       r.patientName ||
//                       r.patient_name ||
//                       "Unknown Patient";
//                     const pMobile = r.mobile || r.phone || "0000000000";
//                     const pAge = r.age || 0;
//                     const pGender = r.gender || "";

//                     stmt.run(r.id, pName, pAge, pGender, pMobile);
//                     stmt.finalize();
//                     successCount++;
//                   } else if (table === "bookings") {
//                     const stmt = db.prepare(`
//                     INSERT OR REPLACE INTO bookings 
//                     (id, patient_id, tests, results, totalAmount, discount, paidAmount, balance, bookingDate, doctor) 
//                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//                   `);

//                     stmt.run(
//                       r.id,
//                       r.patient_id,
//                       r.tests || "",
//                       r.results || "",
//                       r.total_amount || r.totalAmount || 0,
//                       r.discount || 0,
//                       r.advance || r.paidAmount || 0,
//                       r.balance || 0,
//                       r.booking_date || r.bookingDate || "",
//                       r.doctor || "SELF",
//                     );
//                     stmt.finalize();
//                     successCount++;
//                   }
//                 });

//                 db.run("COMMIT", (commitErr) => {
//                   if (commitErr) {
//                     db.run("ROLLBACK");
//                     resolve({
//                       success: false,
//                       message: "Failed to save restored data locally.",
//                     });
//                   } else {
//                     resolve({
//                       success: true,
//                       message: `Successfully restored ${successCount} records!`,
//                     });
//                   }
//                 });
//               } catch (loopErr) {
//                 db.run("ROLLBACK");
//                 resolve({
//                   success: false,
//                   message: "Error processing records during restore.",
//                 });
//               }
//             });
//           });
//         } catch (networkErr) {
//           resolve({
//             success: false,
//             message: "Network Error! Could not connect to cloud.",
//           });
//         }
//       },
//     );
//   });
// });
// // cloud data size detais
// ipcMain.handle("check-cloud-backup-size", async () => {
//   return new Promise((resolve) => {
//     db.get("SELECT value FROM app_config WHERE key = 'lab_id'", async (err, row) => {
//       if (!row || !row.value) return resolve({ success: false, totalRecords: 0 });
      
//       try {
//         const response = await fetch("https://lms-backend-lab-s.vercel.app/api/get-backup-size", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ labId: row.value })
//         });
//         const data = await response.json();
//         resolve({ success: true, totalRecords: data.totalRecords || 0 });
//       } catch (err) {
//         resolve({ success: false, totalRecords: 0 });
//       }
//     });
//   });
// });

// ==========================================
// 1. CLOUD BACKUP SIZE CHECKER (Frontend ke liye)
// ==========================================
ipcMain.handle("check-cloud-backup-size", async () => {
  return new Promise((resolve) => {
    db.get("SELECT value FROM app_config WHERE key = 'lab_id'", async (err, row) => {
      if (!row || !row.value) return resolve({ success: false, totalRecords: 0 });
      
      try {
        const response = await fetch("https://lms-backend-lab-s.vercel.app/api/get-backup-size", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ labId: row.value })
        });
        const data = await response.json();
        resolve({ success: true, totalRecords: data.totalRecords || 0 });
      } catch (err) {
        resolve({ success: false, totalRecords: 0 });
      }
    });
  });
});

// ==========================================
// 2. CLOUD RESTORE (SMART CHUNKING & LIMIT)
// ==========================================
ipcMain.handle("restore-from-cloud", async (event, userLimit) => {
  return new Promise((resolve) => {
    db.get("SELECT value FROM app_config WHERE key = 'lab_id'", async (err, row) => {
      if (err || !row || !row.value) {
        return resolve({ success: false, message: "Lab ID not found. Please activate software first." });
      }

      const labId = row.value;
      const maxLimit = userLimit || 10000; // Frontend se aayi limit
      let page = 1;
      const chunkSize = 500; // Ek baar me max 500 mangenge
      let hasMoreData = true;

      try {
        // 1️⃣ Pehle sara data chunks me download karke memory me jama karenge
        let allRecordsToRestore = [];

        while (hasMoreData && allRecordsToRestore.length < maxLimit) {
          // Determine karenge ki agla chunk kitna bada hoga
          const fetchLimit = Math.min(chunkSize, maxLimit - allRecordsToRestore.length);

          const response = await fetch("https://lms-backend-lab-s.vercel.app/api/restore-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ labId, page, limit: fetchLimit }) // Backend ko limit bhej rahe hain
          });
          const data = await response.json();

          if (!data.success || !data.records || data.records.length === 0) {
            hasMoreData = false;
            break;
          }

          allRecordsToRestore = allRecordsToRestore.concat(data.records);

          // Agar backend ne kam data bheja, matlab data khatam ho gaya
          if (data.records.length < fetchLimit) {
            hasMoreData = false; 
          } else {
            page++;
          }
        }

        if (allRecordsToRestore.length === 0) {
          return resolve({ success: true, message: "No previous data found on cloud to restore." });
        }

        // 2️⃣ Download poora hone ke baad usko bulk me SQLite me save karenge (No Hanging)
        db.serialize(() => {
          db.run("BEGIN TRANSACTION", (beginErr) => {
            if (beginErr) return resolve({ success: false, message: "Failed to start database transaction." });

            let successCount = 0;
            try {
              allRecordsToRestore.forEach((record) => {
                const table = record.tableName;
                const r = record.recordData;

                if (table === "patients") {
                  const stmt = db.prepare("INSERT OR REPLACE INTO patients (id, name, age, gender, mobile) VALUES (?, ?, ?, ?, ?)");
                  const pName = r.name || r.patientName || r.patient_name || "Unknown Patient";
                  const pMobile = r.mobile || r.phone || "0000000000";
                  stmt.run(r.id, pName, r.age || 0, r.gender || "", pMobile);
                  stmt.finalize();
                  successCount++;
                } 
                else if (table === "bookings") {
                  const stmt = db.prepare(`
                    INSERT OR REPLACE INTO bookings 
                    (id, patient_id, tests, results, totalAmount, discount, paidAmount, balance, bookingDate, doctor) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                  `);
                  stmt.run(
                    r.id, r.patient_id, r.tests || "", r.results || "",
                    r.total_amount || r.totalAmount || 0, r.discount || 0,
                    r.advance || r.paidAmount || 0, r.balance || 0,
                    r.booking_date || r.bookingDate || "", r.doctor || "SELF"
                  );
                  stmt.finalize();
                  successCount++;
                }
              });

              db.run("COMMIT", (commitErr) => {
                if (commitErr) {
                  db.run("ROLLBACK");
                  resolve({ success: false, message: "Failed to save restored data locally." });
                } else {
                  resolve({ success: true, message: `Successfully downloaded and restored ${successCount} records!` });
                }
              });
            } catch (loopErr) {
              db.run("ROLLBACK");
              resolve({ success: false, message: "Error processing records during restore." });
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
ipcMain.handle("save-booking", async (event, data) => {
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
      tests,
    } = data;

    const testsData = tests || "[]";
    const balance = (totalAmount || 0) - (discount || 0) - (paidAmount || 0);

    // 👇 YAHAN SMART FIX HAI: Ab app 'mobile' ke sath 'name' bhi match karega
    db.get(
      "SELECT id FROM patients WHERE mobile = ? AND name = ?",
      [mobile, patientName],
      (err, row) => {
        if (err) return resolve({ success: false, error: err.message });

        if (row) {
          // Agar Naam aur Mobile DONO match karte hain, toh same patient ki age/gender update karke nai booking banao
          db.run(
            "UPDATE patients SET age = ?, gender = ? WHERE id = ?",
            [age, gender, row.id],
            () => {
              insertBooking(row.id);
            },
          );
        } else {
          // Agar Mobile same hai lekin Naam alag hai (jaise family member), ya bilkul naya number hai, toh naya patient banao
          db.run(
            "INSERT INTO patients (name, mobile, age, gender) VALUES (?, ?, ?, ?)",
            [patientName, mobile, age, gender],
            function (err2) {
              if (err2) return resolve({ success: false, error: err2.message });
              insertBooking(this.lastID); // Naye family member ki ID use karo
            },
          );
        }
      },
    );

    // Booking Insert karne ka function
    function insertBooking(patientId) {
      db.run(
        `INSERT INTO bookings (patient_id, bookingDate, doctor, tests, totalAmount, discount, paidAmount, balance) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          patientId,
          bookingDate,
          doctor,
          testsData,
          totalAmount,
          discount,
          paidAmount,
          balance,
        ],
        function (err3) {
          if (err3) resolve({ success: false, error: err3.message });
          else resolve({ success: true, bookingId: this.lastID });
        },
      );
    }
  });
});

// --- GET BOOKINGS (JOIN PATIENT INFO) ---
// ipcMain.handle("get-bookings", () => {
//   return new Promise((resolve, reject) => {
//     // Ab data do tables se mila kar lana hoga (JOIN ka magic!)
//     const query = `
//       SELECT b.*, p.name as patientName, p.mobile, p.age, p.gender
//       FROM bookings b
//       JOIN patients p ON b.patient_id = p.id
//       ORDER BY b.id DESC LIMIT 100
//     `;
//     db.all(query, [], (err, rows) => {
//       if (err) reject(err.message);
//       else resolve(rows || []);
//     });
//   });
// });

// --- GET BOOKINGS (JOIN PATIENT INFO) ---
ipcMain.handle("get-bookings", () => {
  return new Promise((resolve, reject) => {
    // 👇 Yahan 'JOIN' ki jagah 'LEFT JOIN' kar diya hai
    const query = `
      SELECT b.*, p.name as patientName, p.mobile, p.age, p.gender 
      FROM bookings b
      LEFT JOIN patients p ON b.patient_id = p.id
      ORDER BY b.id DESC LIMIT 100
    `;

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("❌ get-bookings Error:", err.message);
        reject(err.message);
      } else {
        console.log(
          `📊 Dashboard ko ${rows ? rows.length : 0} bookings bhej di gayi hain.`,
        );
        resolve(rows || []);
      }
    });
  });
});

// --- GET PATIENTS LIST ---
ipcMain.handle("get-patients", () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM patients ORDER BY id DESC", [], (err, rows) => {
      if (err) resolve([]);
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
      const runQuery = (query, params) =>
        new Promise((res, rej) =>
          db.run(query, params, function (err) {
            if (err) rej(err);
            else res(this);
          }),
        );
      const getQuery = (query, params) =>
        new Promise((res, rej) =>
          db.get(query, params, (err, row) => {
            if (err) rej(err);
            else res(row);
          }),
        );

      try {
        for (const row of rows) {
          if (!row.mobile) continue; // Mobile number zaruri hai

          // 1. Patient ko insert karo (Agar pehle se nahi hai toh)
          await runQuery(
            `INSERT OR IGNORE INTO patients (name, age, gender, mobile) VALUES (?, ?, ?, ?)`,
            [
              row.name || "Unknown",
              row.age || null,
              row.gender || "",
              row.mobile,
            ],
          );

          // 2. Patient ki ID lo (naya ho ya purana)
          const patient = await getQuery(
            `SELECT id FROM patients WHERE mobile = ?`,
            [row.mobile],
          );

          if (patient) {
            // 3. Patient ki Booking/Tests save karo
            await runQuery(
              `INSERT INTO bookings (patient_id, bookingDate, doctor, tests, results, totalAmount, discount, paidAmount, balance) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                patient.id,
                row.date || new Date().toISOString().split("T")[0],
                row.doctor || "SELF",
                row.tests ? `["${row.tests}"]` : '["CBC"]', // Tests ko array string me badalna taaki frontend crash na ho
                "{}",
                parseFloat(row.amount) || 0,
                0,
                parseFloat(row.amount) || 0,
                0,
              ],
            );
          }
        }

        // Sab successfully insert hone ke baad save (COMMIT) karo
        db.run("COMMIT;", (err) => {
          if (err) resolve({ success: false, message: err.message });
          else
            resolve({
              success: true,
              message: `Successfully imported records!`,
            });
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
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Smart Sync & Exit
  mainWindow.on("close", async (event) => {
    if (isQuitting) return;
    event.preventDefault();
    mainWindow.hide();

    try {
      const isOnline = await net.isOnline();
      if (isOnline) {
        const safetyTimer = setTimeout(() => {
          isQuitting = true;
          app.quit();
        }, 3000);
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
