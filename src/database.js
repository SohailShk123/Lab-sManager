const sqlite3 = require("sqlite3").verbose();
const path = require("node:path");
const { app } = require("electron");

const dbPath = path.join(app.getPath("userData"), "patho_manager.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Database connection error:", err);
  else console.log("Connected to SQLite at:", dbPath);
});

// 🛠️ TABLES SETUP (Naya 2-Table Structure Yahan Hai)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS app_config (key TEXT PRIMARY KEY, value TEXT)`);

  // 1. PATIENTS TABLE (Isme sirf patient details hongi)
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL, 
      age INTEGER,
      gender TEXT
    )
  `);

// 2. BOOKINGS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      bookingDate TEXT,
      doctor TEXT,
      tests TEXT,
      results TEXT,       -- 👈 YEH NAYI LINE ADD KARNI HAI
      totalAmount REAL,
      discount REAL,
      paidAmount REAL,
      balance REAL,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);
// 👇 MIGRATION: Table banne ke turant baad baaki columns ensure kar lo (db.serialize ke andar)
  db.run("ALTER TABLE bookings ADD COLUMN results TEXT", (err) => {});
  db.run("ALTER TABLE bookings ADD COLUMN totalAmount REAL", (err) => {});
  db.run("ALTER TABLE bookings ADD COLUMN total_amount REAL", (err) => {}); 
  db.run("ALTER TABLE bookings ADD COLUMN discount REAL", (err) => {});
  db.run("ALTER TABLE bookings ADD COLUMN paidAmount REAL", (err) => {});
  db.run("ALTER TABLE bookings ADD COLUMN balance REAL", (err) => {});
  // 3. TESTS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cost REAL DEFAULT 0,
      normalRange TEXT
    )
  `);

  // Unique Index for Tests
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_tests_name_unique ON tests (UPPER(TRIM(name)))`);

  // 4. REPORTS TABLE
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

  // 5. DOCTORS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      degree TEXT,
      hospital TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed Default Doctors & Tests (Aapka purana logic yahan rahega)
  db.get("SELECT COUNT(*) as count FROM doctors", (err, row) => {
    if (!err && row && row.count === 0) {
      const stmt = db.prepare("INSERT INTO doctors (name, degree) VALUES (?, ?)");
      stmt.run("SELF", "");
      stmt.run("Dr. DR NARESH G. UMERJAKER", "MBBS, DCH");
      stmt.finalize();
    }
  });

  // Seed Default Tests (Agar table empty ho)
  db.get("SELECT COUNT(*) as count FROM tests", (err, row) => {
    if (!err && row && row.count === 0) {
      const masterTests = [
        // --- Hematology ---
        { name: "CBC", cost: 350 },
        { name: "ESR", cost: 100 },
        { name: "BLOOD GROUP", cost: 100 },
        { name: "MP (MALARIA PARASITE)", cost: 150 },
        { name: "PERIPHERAL SMEAR", cost: 250 },
        { name: "AEC (ABSOLUTE EOSINOPHIL COUNT)", cost: 150 },
        { name: "BT & CT", cost: 150 },
        { name: "PT / INR", cost: 400 },
        { name: "APTT", cost: 450 },
        { name: "RETICULOCYTE COUNT", cost: 200 },

        // --- Diabetology ---
        { name: "FBS (FASTING BLOOD SUGAR)", cost: 80 },
        { name: "PPBS (POST PRANDIAL BLOOD SUGAR)", cost: 80 },
        { name: "RBS (RANDOM BLOOD SUGAR)", cost: 80 },
        { name: "HBA1C (GLYCOSYLATED HB)", cost: 500 },
        { name: "GTT (GLUCOSE TOLERANCE TEST)", cost: 300 },
        { name: "INSULIN FASTING", cost: 600 },

        // --- Biochemistry Profiles ---
        { name: "LFT (LIVER FUNCTION TEST)", cost: 700 },
        { name: "KFT (KIDNEY FUNCTION TEST)", cost: 700 },
        { name: "LIPID PROFILE", cost: 650 },

        // --- Biochemistry Individual ---
        { name: "BLOOD UREA", cost: 150 },
        { name: "SERUM CREATININE", cost: 150 },
        { name: "URIC ACID", cost: 150 },
        { name: "SGOT (AST)", cost: 150 },
        { name: "SGPT (ALT)", cost: 150 },
        { name: "BILIRUBIN (TOTAL & DIRECT)", cost: 200 },
        { name: "ALKALINE PHOSPHATASE (ALP)", cost: 180 },
        { name: "TOTAL PROTEIN & A/G RATIO", cost: 250 },

        // --- Electrolytes & Minerals ---
        { name: "ELECTROLYTES (NA, K, CL)", cost: 450 },
        { name: "CALCIUM (TOTAL)", cost: 200 },
        { name: "PHOSPHORUS", cost: 200 },
        { name: "MAGNESIUM", cost: 300 },
        { name: "IRON PROFILE", cost: 800 },
        { name: "FERRITIN", cost: 750 },

        // --- Serology & Immunology ---
        { name: "CRP (C-REACTIVE PROTEIN)", cost: 350 },
        { name: "CRP QUANTITATIVE", cost: 500 },
        { name: "WIDAL (SLIDE TEST)", cost: 150 },
        { name: "WIDAL (TUBE TEST)", cost: 250 },
        { name: "TYPHIDOT", cost: 450 },
        { name: "DENGUE NS1", cost: 600 },
        { name: "DENGUE IGG/IGM", cost: 600 },
        { name: "CHIKUNGUNYA IGM", cost: 700 },
        { name: "MALARIA ANTIGEN (RAPID)", cost: 300 },

        // --- Viral Markers ---
        { name: "VIRAL MARKERS (ALL 4)", cost: 1000 },
        { name: "HIV (I & II)", cost: 300 },
        { name: "HBSAG (HEPATITIS B)", cost: 300 },
        { name: "HCV (HEPATITIS C)", cost: 400 },
        { name: "VDRL / RPR", cost: 200 },

        // --- Arthritis & Autoimmune ---
        { name: "RA FACTOR", cost: 350 },
        { name: "ASO TITRE", cost: 350 },
        { name: "ANA (ANTI NUCLEAR ANTIBODY)", cost: 750 },
        { name: "ANTI CCP", cost: 1200 },

        // --- Hormones & Vitamins ---
        { name: "THYROID PROFILE (T3, T4, TSH)", cost: 500 },
        { name: "FREE THYROID PROFILE (FT3, FT4, TSH)", cost: 750 },
        { name: "VITAMIN D3 (25 OH)", cost: 1200 },
        { name: "VITAMIN B12", cost: 1000 },
        { name: "PROLACTIN", cost: 450 },
        { name: "FSH", cost: 450 },
        { name: "LH", cost: 450 },
        { name: "TESTOSTERONE (TOTAL)", cost: 600 },

        // --- Cardiac & Pancreas ---
        { name: "CPK TOTAL", cost: 400 },
        { name: "CK MB", cost: 500 },
        { name: "TROPONIN I (QUALITATIVE)", cost: 600 },
        { name: "SERUM AMYLASE", cost: 350 },
        { name: "SERUM LIPASE", cost: 450 },

        // --- Tumor Markers ---
        { name: "PSA (TOTAL)", cost: 650 },
        { name: "CEA", cost: 800 },
        { name: "CA 125", cost: 900 },
        { name: "AFP (ALPHA FETO PROTEIN)", cost: 750 },

        // --- Clinical Pathology & Micro ---
        { name: "URINE ROUTINE & MICROSCOPY", cost: 150 },
        { name: "STOOL ROUTINE", cost: 150 },
        { name: "STOOL OCCULT BLOOD", cost: 150 },
        { name: "SEMEN ANALYSIS", cost: 400 },
        { name: "URINE CULTURE", cost: 600 },
        { name: "BLOOD CULTURE", cost: 800 },
        { name: "SPUTUM FOR AFB", cost: 200 }
      ];

      // Safe Seeding Logic
      const stmt = db.prepare("INSERT OR IGNORE INTO tests (name, cost, normalRange) VALUES (?, ?, ?)");
      masterTests.forEach((test) => {
        stmt.run(test.name, test.cost, "");
      });
      stmt.finalize();
      console.log("All default tests synchronized safely into Test Master.");
    }
  });
});


// Module ko export karna zaroori hai taaki main.js isko use kar sake
module.exports = db;