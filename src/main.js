import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import sqlite3Pkg from "sqlite3";

const sqlite3 = sqlite3Pkg.verbose();

// 1. Database connection
const dbPath = path.join(app.getPath("userData"), "patho_manager.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Database connection error:", err);
  else console.log("Connected to SQLite at:", dbPath);
});

// 2. Tables create karna & Auto-seed
db.serialize(() => {
  // Bookings Table
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookingDate TEXT,
      patientName TEXT,
      age INTEGER,
      gender TEXT,
      doctor TEXT,
      totalAmount REAL,
      discount REAL,
      paidAmount REAL,
      balance REAL
    )
  `);
db.run(`
      CREATE TABLE IF NOT EXISTS tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cost REAL DEFAULT 0,
        normalRange TEXT
      )
    `);

    // 2. 🧹 Sabse pehle saare duplicates ko permanently saaf karein (Case & Space insensitive)
    db.run(`
      DELETE FROM tests
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM tests
        GROUP BY UPPER(TRIM(name))
      )
    `);

    // 3. 🔒 Ab Unique Index banayein taaki future me kabhi duplicate entry aa hi na sake
    db.run(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_tests_name_unique 
      ON tests (UPPER(TRIM(name)))
    `);

  // Reports Table
  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      selected_tests TEXT,
      results TEXT,
      comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Doctors Table
  db.run(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      degree TEXT,
      hospital TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  

  // Seed Default Doctors (agar table empty ho)
  db.get("SELECT COUNT(*) as count FROM doctors", (err, row) => {
    if (!err && row && row.count === 0) {
      const stmt = db.prepare(
        "INSERT INTO doctors (name, degree) VALUES (?, ?)",
      );
      stmt.run("SELF", "");
      stmt.run("Dr. DR NARESH G. UMERJAKER", "MBBS, DCH");
      stmt.finalize();
      console.log("Default doctors seeded successfully.");
    }
  });

  // Seed Default Tests (agar table empty ho)

 const masterTests = [
    // --- Hematology ---
    { name: 'CBC', cost: 350 },
    { name: 'ESR', cost: 100 },
    { name: 'BLOOD GROUP', cost: 100 },
    { name: 'MP (MALARIA PARASITE)', cost: 150 },
    { name: 'PERIPHERAL SMEAR', cost: 250 },
    { name: 'AEC (ABSOLUTE EOSINOPHIL COUNT)', cost: 150 },
    { name: 'BT & CT', cost: 150 },
    { name: 'PT / INR', cost: 400 },
    { name: 'APTT', cost: 450 },
    { name: 'RETICULOCYTE COUNT', cost: 200 },
    
    // --- Diabetology ---
    { name: 'FBS (FASTING BLOOD SUGAR)', cost: 80 },
    { name: 'PPBS (POST PRANDIAL BLOOD SUGAR)', cost: 80 },
    { name: 'RBS (RANDOM BLOOD SUGAR)', cost: 80 },
    { name: 'HBA1C (GLYCOSYLATED HB)', cost: 500 },
    { name: 'GTT (GLUCOSE TOLERANCE TEST)', cost: 300 },
    { name: 'INSULIN FASTING', cost: 600 },
    
    // --- Biochemistry Profiles ---
    { name: 'LFT (LIVER FUNCTION TEST)', cost: 700 },
    { name: 'KFT (KIDNEY FUNCTION TEST)', cost: 700 },
    { name: 'LIPID PROFILE', cost: 650 },
    
    // --- Biochemistry Individual ---
    { name: 'BLOOD UREA', cost: 150 },
    { name: 'SERUM CREATININE', cost: 150 },
    { name: 'URIC ACID', cost: 150 },
    { name: 'SGOT (AST)', cost: 150 },
    { name: 'SGPT (ALT)', cost: 150 },
    { name: 'BILIRUBIN (TOTAL & DIRECT)', cost: 200 },
    { name: 'ALKALINE PHOSPHATASE (ALP)', cost: 180 },
    { name: 'TOTAL PROTEIN & A/G RATIO', cost: 250 },
    
    // --- Electrolytes & Minerals ---
    { name: 'ELECTROLYTES (NA, K, CL)', cost: 450 },
    { name: 'CALCIUM (TOTAL)', cost: 200 },
    { name: 'PHOSPHORUS', cost: 200 },
    { name: 'MAGNESIUM', cost: 300 },
    { name: 'IRON PROFILE', cost: 800 },
    { name: 'FERRITIN', cost: 750 },
    
    // --- Serology & Immunology ---
    { name: 'CRP (C-REACTIVE PROTEIN)', cost: 350 },
    { name: 'CRP QUANTITATIVE', cost: 500 },
    { name: 'WIDAL (SLIDE TEST)', cost: 150 },
    { name: 'WIDAL (TUBE TEST)', cost: 250 },
    { name: 'TYPHIDOT', cost: 450 },
    { name: 'DENGUE NS1', cost: 600 },
    { name: 'DENGUE IGG/IGM', cost: 600 },
    { name: 'CHIKUNGUNYA IGM', cost: 700 },
    { name: 'MALARIA ANTIGEN (RAPID)', cost: 300 },
    
    // --- Viral Markers ---
    { name: 'VIRAL MARKERS (ALL 4)', cost: 1000 },
    { name: 'HIV (I & II)', cost: 300 },
    { name: 'HBSAG (HEPATITIS B)', cost: 300 },
    { name: 'HCV (HEPATITIS C)', cost: 400 },
    { name: 'VDRL / RPR', cost: 200 },
    
    // --- Arthritis & Autoimmune ---
    { name: 'RA FACTOR', cost: 350 },
    { name: 'ASO TITRE', cost: 350 },
    { name: 'ANA (ANTI NUCLEAR ANTIBODY)', cost: 750 },
    { name: 'ANTI CCP', cost: 1200 },
    
    // --- Hormones & Vitamins ---
    { name: 'THYROID PROFILE (T3, T4, TSH)', cost: 500 },
    { name: 'FREE THYROID PROFILE (FT3, FT4, TSH)', cost: 750 },
    { name: 'VITAMIN D3 (25 OH)', cost: 1200 },
    { name: 'VITAMIN B12', cost: 1000 },
    { name: 'PROLACTIN', cost: 450 },
    { name: 'FSH', cost: 450 },
    { name: 'LH', cost: 450 },
    { name: 'TESTOSTERONE (TOTAL)', cost: 600 },
    
    // --- Cardiac & Pancreas ---
    { name: 'CPK TOTAL', cost: 400 },
    { name: 'CK MB', cost: 500 },
    { name: 'TROPONIN I (QUALITATIVE)', cost: 600 },
    { name: 'SERUM AMYLASE', cost: 350 },
    { name: 'SERUM LIPASE', cost: 450 },
    
    // --- Tumor Markers ---
    { name: 'PSA (TOTAL)', cost: 650 },
    { name: 'CEA', cost: 800 },
    { name: 'CA 125', cost: 900 },
    { name: 'AFP (ALPHA FETO PROTEIN)', cost: 750 },
    
    // --- Clinical Pathology & Micro ---
    { name: 'URINE ROUTINE & MICROSCOPY', cost: 150 },
    { name: 'STOOL ROUTINE', cost: 150 },
    { name: 'STOOL OCCULT BLOOD', cost: 150 },
    { name: 'SEMEN ANALYSIS', cost: 400 },
    { name: 'URINE CULTURE', cost: 600 },
    { name: 'BLOOD CULTURE', cost: 800 },
    { name: 'SPUTUM FOR AFB', cost: 200 }
  ];

  // 3. SAFE SEEDING LOGIC (INSERT OR IGNORE)
  // Ye nayi strategy check karegi ki agar koi test pehle se hai toh use ignore karegi,
  // aur jo naye tests hain sirf unhe add karegi. User ke purane tests aur custom costs delete nahi honge.
  const stmt = db.prepare("INSERT OR IGNORE INTO tests (name, cost, normalRange) VALUES (?, ?, ?)");
  
  masterTests.forEach((test) => {
    stmt.run(test.name, test.cost, '');
  });
  
  stmt.finalize();
  console.log("Default tests synchronized safely into Test Master.");
});

// 3. Bookings Handlers
ipcMain.handle("save-booking", (event, bookingData) => {
  return new Promise((resolve, reject) => {
    const {
      bookingDate,
      patientName,
      age,
      gender,
      doctor,
      totalAmount,
      discount,
      paidAmount,
    } = bookingData;
    const balance = (totalAmount || 0) - (discount || 0) - (paidAmount || 0);

    const query = `INSERT INTO bookings (bookingDate, patientName, age, gender, doctor, totalAmount, discount, paidAmount, balance) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(
      query,
      [
        bookingDate,
        patientName,
        age,
        gender,
        doctor,
        totalAmount,
        discount,
        paidAmount,
        balance,
      ],
      function (err) {
        if (err) reject(err.message);
        else resolve({ success: true, bookingId: this.lastID });
      },
    );
  });
});

ipcMain.handle("get-bookings", () => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM bookings ORDER BY id DESC LIMIT 100",
      [],
      (err, rows) => {
        if (err) reject(err.message);
        else resolve(rows || []);
      },
    );
  });
});

// 4. Test Catalog Handlers (Single Registration)
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


// 5. Reports Handlers
ipcMain.handle("save-report", (event, reportData) => {
  return new Promise((resolve, reject) => {
    const { patientId, selectedTests, results, comments } = reportData;

    db.get(
      "SELECT id FROM reports WHERE patient_id = ?",
      [patientId],
      (err, row) => {
        if (err) return reject(err.message);

        if (row) {
          const updateQuery = `
          UPDATE reports 
          SET selected_tests = ?, results = ?, comments = ?, created_at = CURRENT_TIMESTAMP 
          WHERE patient_id = ?
        `;
          db.run(
            updateQuery,
            [
              JSON.stringify(selectedTests),
              JSON.stringify(results),
              comments || "",
              patientId,
            ],
            function (updateErr) {
              if (updateErr) reject(updateErr.message);
              else resolve({ success: true, reportId: row.id, updated: true });
            },
          );
        } else {
          const insertQuery = `
          INSERT INTO reports (patient_id, selected_tests, results, comments) 
          VALUES (?, ?, ?, ?)
        `;
          db.run(
            insertQuery,
            [
              patientId,
              JSON.stringify(selectedTests),
              JSON.stringify(results),
              comments || "",
            ],
            function (insertErr) {
              if (insertErr) reject(insertErr.message);
              else
                resolve({
                  success: true,
                  reportId: this.lastID,
                  inserted: true,
                });
            },
          );
        }
      },
    );
  });
});

ipcMain.handle("get-report", (event, patientId) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM reports WHERE patient_id = ? ORDER BY id DESC LIMIT 1",
      [patientId],
      (err, row) => {
        if (err) {
          reject(err.message);
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            ...row,
            selectedTests: JSON.parse(row.selected_tests || "[]"),
            results: JSON.parse(row.results || "{}"),
          });
        }
      },
    );
  });
});

// 6. Doctor Management Handlers
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
    const query =
      "INSERT INTO doctors (name, degree, hospital) VALUES (?, ?, ?)";
    db.run(query, [name.trim(), degree || "", hospital || ""], function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          reject("Yeh doctor pehle se list me maujood hai.");
        } else {
          reject(err.message);
        }
      } else {
        resolve({ success: true, id: this.lastID });
      }
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

// 7. Window Creation
if (started) {
  app.quit();
}

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
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
