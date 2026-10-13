// src/data/testCatalog.js

export const TEST_CATALOG = {
  // ===================== HAEMATOLOGY =====================
  'CBC': {
    id: 'CBC', name: 'Complete Blood Count (CBC)', department: 'HAEMATOLOGY',
    parameters: [
      { id: 'hb', name: 'Haemoglobin', unit: 'gm%', normal: '12 - 16', auto: false },
      { id: 'rbc', name: 'RBC Count', unit: 'Millions/cumm', normal: '3.8 - 5.8', auto: false },
      { id: 'wbc', name: 'Total WBC Count', unit: '/cumm', normal: '4000 - 11000', auto: false },
      { id: 'neutro', name: 'Neutrophils', unit: '%', normal: '40 - 75', auto: false },
      { id: 'lympho', name: 'Lymphocytes', unit: '%', normal: '20 - 45', auto: false },
      { id: 'eosino', name: 'Eosinophils', unit: '%', normal: '1 - 6', auto: false },
      { id: 'mono', name: 'Monocytes', unit: '%', normal: '1 - 10', auto: false },
      { id: 'baso', name: 'Basophil', unit: '%', normal: '0 - 1', auto: false },
      { id: 'pcv', name: 'HCT(PCV)', unit: '%', normal: '37 - 47', auto: true },
      { id: 'mcv', name: 'MCV', unit: 'fl', normal: '76 - 100', auto: false },
      { id: 'mch', name: 'MCH', unit: 'pg', normal: '27 - 32', auto: true },
      { id: 'mchc', name: 'MCHC', unit: 'g/dl', normal: '32 - 36', auto: true },
      { id: 'rdw', name: 'RDW-CV', unit: '%', normal: '11 - 16', auto: false },
      { id: 'plt', name: 'Platelet Count', unit: '/cu.mm', normal: '150000 - 450000', auto: false },
    ],
    notes: 'Method: Fully Automated Cell Counter'
  },
  'ESR': {
    id: 'ESR', name: 'Erythrocyte Sedimentation Rate', department: 'HAEMATOLOGY',
    parameters: [{ id: 'esr_val', name: 'ESR', unit: 'mm/hr', normal: '0 - 20', auto: false }]
  },
  'BLOOD GROUP': {
    id: 'BLOOD GROUP', name: 'Blood Grouping & Rh Factor', department: 'HAEMATOLOGY',
    parameters: [
      { id: 'bg_val', name: 'ABO Blood Group', unit: '', normal: 'A/B/AB/O', isOption: true, options: ['A', 'B', 'AB', 'O'], default: 'B' },
      { id: 'rh_val', name: 'Rh (D) Factor', unit: '', normal: 'Positive/Negative', isOption: true, options: ['Positive', 'Negative'], default: 'Positive' }
    ]
  },
  'MP (MALARIA PARASITE)': {
    id: 'MP (MALARIA PARASITE)', name: 'Malaria Parasite Smear', department: 'HAEMATOLOGY',
    parameters: [{ id: 'mp_smear', name: 'Peripheral Smear for MP', unit: '', normal: 'Not Seen', isOption: true, options: ['Not Seen', 'P. Vivax Seen', 'P. Falciparum Seen'], default: 'Not Seen' }]
  },
  'PERIPHERAL SMEAR': {
    id: 'PERIPHERAL SMEAR', name: 'Peripheral Blood Smear', department: 'HAEMATOLOGY',
    parameters: [
      { id: 'ps_rbc', name: 'RBC Morphology', unit: '', normal: 'Normocytic Normochromic', default: 'Normocytic Normochromic' },
      { id: 'ps_wbc', name: 'WBC Morphology', unit: '', normal: 'Normal', default: 'Normal in number and morphology' },
      { id: 'ps_plt', name: 'Platelets', unit: '', normal: 'Adequate', default: 'Adequate on smear' }
    ]
  },
  'AEC (ABSOLUTE EOSINOPHIL COUNT)': {
    id: 'AEC', name: 'Absolute Eosinophil Count', department: 'HAEMATOLOGY',
    parameters: [{ id: 'aec_val', name: 'AEC', unit: 'cells/cumm', normal: '40 - 440', auto: false }]
  },
  'BT & CT': {
    id: 'BT & CT', name: 'Bleeding & Clotting Time', department: 'HAEMATOLOGY',
    parameters: [
      { id: 'bt_val', name: 'Bleeding Time (BT)', unit: 'min:sec', normal: '2:00 - 6:00', auto: false },
      { id: 'ct_val', name: 'Clotting Time (CT)', unit: 'min:sec', normal: '3:00 - 8:00', auto: false }
    ]
  },
  'PT / INR': {
    id: 'PT / INR', name: 'Prothrombin Time with INR', department: 'COAGULATION',
    parameters: [
      { id: 'pt_test', name: 'Patient Test Time', unit: 'Seconds', normal: '11.0 - 15.0', auto: false },
      { id: 'pt_control', name: 'Control Time', unit: 'Seconds', normal: '12.0 - 13.0', default: '12.5', auto: false },
      { id: 'pt_inr', name: 'INR (Calculated)', unit: 'Ratio', normal: '0.8 - 1.2', auto: true },
    ]
  },
  'APTT': {
    id: 'APTT', name: 'Activated Partial Thromboplastin Time', department: 'COAGULATION',
    parameters: [
      { id: 'aptt_test', name: 'Patient APTT', unit: 'Seconds', normal: '26.0 - 40.0', auto: false },
      { id: 'aptt_control', name: 'Control APTT', unit: 'Seconds', normal: '26.0 - 33.0', default: '28.0', auto: false }
    ]
  },
  'RETICULOCYTE COUNT': {
    id: 'RETICULOCYTE COUNT', name: 'Reticulocyte Count', department: 'HAEMATOLOGY',
    parameters: [{ id: 'retic', name: 'Reticulocytes', unit: '%', normal: '0.5 - 2.5', auto: false }]
  },

  // ===================== DIABETOLOGY =====================
  'FBS (FASTING BLOOD SUGAR)': {
    id: 'FBS', name: 'Fasting Blood Sugar', department: 'BIOCHEMISTRY',
    parameters: [
      { id: 'fbs_val', name: 'Fasting Blood Sugar', unit: 'mg/dl', normal: '70 - 110', auto: false },
      { id: 'u_sug_f', name: 'Fasting Urine Sugar', unit: '', normal: 'Nil', isOption: true, options: ['Nil', 'Trace', '+', '++', '+++'], default: 'Nil' }
    ]
  },
  'PPBS (POST PRANDIAL BLOOD SUGAR)': {
    id: 'PPBS', name: 'Post Prandial Blood Sugar', department: 'BIOCHEMISTRY',
    parameters: [
      { id: 'ppbs_val', name: 'PP Blood Sugar', unit: 'mg/dl', normal: '< 140', auto: false },
      { id: 'u_sug_pp', name: 'PP Urine Sugar', unit: '', normal: 'Nil', isOption: true, options: ['Nil', 'Trace', '+', '++', '+++'], default: 'Nil' }
    ]
  },
  'RBS (RANDOM BLOOD SUGAR)': {
    id: 'RBS', name: 'Random Blood Sugar', department: 'BIOCHEMISTRY',
    parameters: [{ id: 'rbs_val', name: 'Random Blood Sugar', unit: 'mg/dl', normal: '70 - 140', auto: false }]
  },
  'HBA1C (GLYCOSYLATED HB)': {
    id: 'HBA1C', name: 'Glycosylated Hemoglobin (HbA1c)', department: 'BIOCHEMISTRY',
    parameters: [
      { id: 'hba1c_val', name: 'HbA1c', unit: '%', normal: '< 5.7', auto: false },
      { id: 'eag_val', name: 'Estimated Average Glucose', unit: 'mg/dl', normal: '70 - 126', auto: true }
    ]
  },
  'GTT (GLUCOSE TOLERANCE TEST)': {
    id: 'GTT', name: 'Glucose Tolerance Test', department: 'BIOCHEMISTRY',
    parameters: [
      { id: 'gtt_fast', name: 'Fasting Sample', unit: 'mg/dl', normal: '70 - 110', auto: false },
      { id: 'gtt_1hr', name: '1 Hour Sample', unit: 'mg/dl', normal: '< 160', auto: false },
      { id: 'gtt_2hr', name: '2 Hour Sample', unit: 'mg/dl', normal: '< 140', auto: false }
    ]
  },
  'INSULIN FASTING': {
    id: 'INSULIN FASTING', name: 'Fasting Insulin', department: 'HORMONES',
    parameters: [{ id: 'ins_fast', name: 'Fasting Insulin', unit: 'uIU/ml', normal: '2.6 - 24.9', auto: false }]
  },

  // ===================== BIOCHEMISTRY PROFILES =====================
  'LFT (LIVER FUNCTION TEST)': {
    id: 'LFT', name: 'Liver Function Test (LFT)', department: 'BIOCHEMISTRY',
    parameters: [
      { id: 'tbili', name: 'Total Bilirubin', unit: 'mg/dl', normal: '0.2 - 1.2', auto: false },
      { id: 'dbili', name: 'Direct Bilirubin', unit: 'mg/dl', normal: '0.0 - 0.3', auto: false },
      { id: 'ibili', name: 'Indirect Bilirubin', unit: 'mg/dl', normal: '0.2 - 0.9', auto: true },
      { id: 'sgot', name: 'SGOT (AST)', unit: 'IU/L', normal: '5 - 40', auto: false },
      { id: 'sgpt', name: 'SGPT (ALT)', unit: 'IU/L', normal: '5 - 40', auto: false },
      { id: 'alp', name: 'Alkaline Phosphatase', unit: 'IU/L', normal: '64 - 306', auto: false },
      { id: 'tprotein', name: 'Total Protein', unit: 'gm/dl', normal: '6.0 - 8.3', auto: false },
      { id: 'albumin', name: 'Serum Albumin', unit: 'gm/dl', normal: '3.5 - 5.0', auto: false },
      { id: 'globulin', name: 'Serum Globulin', unit: 'gm/dl', normal: '2.0 - 3.5', auto: true },
      { id: 'ag_ratio', name: 'A/G Ratio', unit: '', normal: '1.2 - 2.2', auto: true },
    ]
  },
  'KFT (KIDNEY FUNCTION TEST)': {
    id: 'KFT', name: 'Kidney Function Test (KFT)', department: 'BIOCHEMISTRY',
    parameters: [
      { id: 'urea', name: 'Blood Urea', unit: 'mg/dl', normal: '15 - 40', auto: false },
      { id: 'bun', name: 'Blood Urea Nitrogen (BUN)', unit: 'mg/dl', normal: '7 - 20', auto: true },
      { id: 'creat', name: 'Serum Creatinine', unit: 'mg/dl', normal: '0.6 - 1.4', auto: false },
      { id: 'uric', name: 'Serum Uric Acid', unit: 'mg/dl', normal: '3.5 - 7.2', auto: false },
      { id: 'calcium', name: 'Serum Calcium', unit: 'mg/dl', normal: '8.5 - 10.5', auto: false }
    ]
  },
  'LIPID PROFILE': {
    id: 'LIPID PROFILE', name: 'Lipid Profile', department: 'BIOCHEMISTRY',
    parameters: [
      { id: 'chol', name: 'Total Cholesterol', unit: 'mg/dl', normal: '< 200', auto: false },
      { id: 'tg', name: 'Serum Triglycerides', unit: 'mg/dl', normal: '< 150', auto: false },
      { id: 'hdl', name: 'HDL Cholesterol', unit: 'mg/dl', normal: '40 - 60', auto: false },
      { id: 'vldl', name: 'VLDL Cholesterol', unit: 'mg/dl', normal: '5 - 35', auto: true },
      { id: 'ldl', name: 'LDL Cholesterol', unit: 'mg/dl', normal: '< 100', auto: true },
      { id: 'chol_hdl', name: 'Total Chol / HDL Ratio', unit: '', normal: '3.3 - 4.4', auto: true }
    ]
  },

  // ===================== INDIVIDUAL BIOCHEMISTRY =====================
  'BLOOD UREA': { id: 'BLOOD UREA', name: 'Blood Urea', department: 'BIOCHEMISTRY', parameters: [{ id: 'urea', name: 'Blood Urea', unit: 'mg/dl', normal: '15 - 40', auto: false }] },
  'SERUM CREATININE': { id: 'SERUM CREATININE', name: 'Serum Creatinine', department: 'BIOCHEMISTRY', parameters: [{ id: 'creat', name: 'Serum Creatinine', unit: 'mg/dl', normal: '0.6 - 1.4', auto: false }] },
  'URIC ACID': { id: 'URIC ACID', name: 'Serum Uric Acid', department: 'BIOCHEMISTRY', parameters: [{ id: 'uric', name: 'Serum Uric Acid', unit: 'mg/dl', normal: '3.5 - 7.2', auto: false }] },
  'SGOT (AST)': { id: 'SGOT (AST)', name: 'SGOT (AST)', department: 'BIOCHEMISTRY', parameters: [{ id: 'sgot', name: 'SGOT', unit: 'IU/L', normal: '5 - 40', auto: false }] },
  'SGPT (ALT)': { id: 'SGPT (ALT)', name: 'SGPT (ALT)', department: 'BIOCHEMISTRY', parameters: [{ id: 'sgpt', name: 'SGPT', unit: 'IU/L', normal: '5 - 40', auto: false }] },
  'BILIRUBIN (TOTAL & DIRECT)': { id: 'BILIRUBIN', name: 'Bilirubin Total & Direct', department: 'BIOCHEMISTRY', parameters: [
    { id: 'tbili', name: 'Total Bilirubin', unit: 'mg/dl', normal: '0.2 - 1.2', auto: false },
    { id: 'dbili', name: 'Direct Bilirubin', unit: 'mg/dl', normal: '0.0 - 0.3', auto: false },
    { id: 'ibili', name: 'Indirect Bilirubin', unit: 'mg/dl', normal: '0.2 - 0.9', auto: true }
  ]},
  'ALKALINE PHOSPHATASE (ALP)': { id: 'ALP', name: 'Alkaline Phosphatase', department: 'BIOCHEMISTRY', parameters: [{ id: 'alp', name: 'Alkaline Phosphatase', unit: 'IU/L', normal: '64 - 306', auto: false }] },
  'TOTAL PROTEIN & A/G RATIO': { id: 'PROTEIN', name: 'Total Protein & A/G Ratio', department: 'BIOCHEMISTRY', parameters: [
    { id: 'tprotein', name: 'Total Protein', unit: 'gm/dl', normal: '6.0 - 8.3', auto: false },
    { id: 'albumin', name: 'Serum Albumin', unit: 'gm/dl', normal: '3.5 - 5.0', auto: false },
    { id: 'globulin', name: 'Serum Globulin', unit: 'gm/dl', normal: '2.0 - 3.5', auto: true },
    { id: 'ag_ratio', name: 'A/G Ratio', unit: '', normal: '1.2 - 2.2', auto: true }
  ]},

  // ===================== ELECTROLYTES & MINERALS =====================
  'ELECTROLYTES (NA, K, CL)': {
    id: 'ELECTROLYTES', name: 'Serum Electrolytes', department: 'BIOCHEMISTRY',
    parameters: [
      { id: 'na', name: 'Sodium (Na+)', unit: 'mmol/L', normal: '135 - 145', auto: false },
      { id: 'k', name: 'Potassium (K+)', unit: 'mmol/L', normal: '3.5 - 5.1', auto: false },
      { id: 'cl', name: 'Chloride (Cl-)', unit: 'mmol/L', normal: '98 - 107', auto: false }
    ]
  },
  'CALCIUM (TOTAL)': { id: 'CALCIUM', name: 'Serum Calcium', department: 'BIOCHEMISTRY', parameters: [{ id: 'ca', name: 'Total Calcium', unit: 'mg/dl', normal: '8.5 - 10.5', auto: false }] },
  'PHOSPHORUS': { id: 'PHOSPHORUS', name: 'Serum Phosphorus', department: 'BIOCHEMISTRY', parameters: [{ id: 'phos', name: 'Phosphorus', unit: 'mg/dl', normal: '2.5 - 4.5', auto: false }] },
  'MAGNESIUM': { id: 'MAGNESIUM', name: 'Serum Magnesium', department: 'BIOCHEMISTRY', parameters: [{ id: 'mg', name: 'Magnesium', unit: 'mg/dl', normal: '1.7 - 2.2', auto: false }] },
  'IRON PROFILE': {
    id: 'IRON PROFILE', name: 'Iron Profile', department: 'BIOCHEMISTRY',
    parameters: [
      { id: 'iron', name: 'Serum Iron', unit: 'ug/dl', normal: '60 - 170', auto: false },
      { id: 'tibc', name: 'TIBC', unit: 'ug/dl', normal: '240 - 450', auto: false },
      { id: 'tsat', name: '% Transferrin Saturation', unit: '%', normal: '20 - 50', auto: false }
    ]
  },
  'FERRITIN': { id: 'FERRITIN', name: 'Serum Ferritin', department: 'BIOCHEMISTRY', parameters: [{ id: 'ferritin', name: 'Ferritin', unit: 'ng/ml', normal: '30 - 400', auto: false }] },

  // ===================== SEROLOGY & IMMUNOLOGY =====================
  'CRP (C-REACTIVE PROTEIN)': { id: 'CRP_QUAL', name: 'CRP Qualitative', department: 'SEROLOGY', parameters: [{ id: 'crp_q', name: 'CRP', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' }] },
  'CRP QUANTITATIVE': { id: 'CRP', name: 'CRP Quantitative', department: 'SEROLOGY', parameters: [{ id: 'crp_val', name: 'CRP', unit: 'mg/L', normal: '0 - 6', auto: false }] },
  'WIDAL (SLIDE TEST)': { id: 'WIDAL_SLIDE', name: 'Widal Slide Agglutination', department: 'SEROLOGY', parameters: [
    { id: 'widal_o', name: 'Typhi O', unit: '', normal: 'Non-Reactive', isOption: true, options: ['Non-Reactive', 'Reactive (1:80)', 'Reactive (1:160)', 'Reactive (1:320)'], default: 'Non-Reactive' },
    { id: 'widal_h', name: 'Typhi H', unit: '', normal: 'Non-Reactive', isOption: true, options: ['Non-Reactive', 'Reactive (1:80)', 'Reactive (1:160)', 'Reactive (1:320)'], default: 'Non-Reactive' }
  ]},
  'WIDAL (TUBE TEST)': { id: 'WIDAL_TUBE', name: 'Widal Tube Agglutination', department: 'SEROLOGY', parameters: [
    { id: 'widal_t_o', name: 'Typhi O Titre', unit: '', normal: '< 1:80', default: '< 1:80' },
    { id: 'widal_t_h', name: 'Typhi H Titre', unit: '', normal: '< 1:80', default: '< 1:80' }
  ]},
  'TYPHIDOT': { id: 'TYPHIDOT', name: 'Typhidot (IgM & IgG)', department: 'SEROLOGY', parameters: [
    { id: 'typhi_igm', name: 'Typhoid IgM', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' },
    { id: 'typhi_igg', name: 'Typhoid IgG', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' }
  ]},
  'DENGUE NS1': { id: 'DENGUE NS1', name: 'Dengue NS1 Antigen', department: 'SEROLOGY', parameters: [{ id: 'ns1', name: 'Dengue NS1 Ag', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' }] },
  'DENGUE IGG/IGM': { id: 'DENGUE IGG_IGM', name: 'Dengue Antibodies', department: 'SEROLOGY', parameters: [
    { id: 'den_igg', name: 'Dengue IgG', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' },
    { id: 'den_igm', name: 'Dengue IgM', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' }
  ]},
  'CHIKUNGUNYA IGM': { id: 'CHIKUNGUNYA', name: 'Chikungunya IgM', department: 'SEROLOGY', parameters: [{ id: 'chik', name: 'Chikungunya IgM', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' }] },
  'MALARIA ANTIGEN (RAPID)': { id: 'MALARIA_AG', name: 'Malaria Rapid Antigen', department: 'SEROLOGY', parameters: [
    { id: 'mal_pv', name: 'P. Vivax Ag', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' },
    { id: 'mal_pf', name: 'P. Falciparum Ag', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' }
  ]},

  // ===================== VIRAL MARKERS =====================
  'VIRAL MARKERS (ALL 4)': { id: 'VIRAL_MARKERS', name: 'Viral Markers Profile', department: 'SEROLOGY', parameters: [
    { id: 'hiv', name: 'HIV 1 & 2', unit: '', normal: 'Non-Reactive', isOption: true, options: ['Non-Reactive', 'Reactive'], default: 'Non-Reactive' },
    { id: 'hbsag', name: 'HBsAg', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' },
    { id: 'hcv', name: 'HCV', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' },
    { id: 'vdrl', name: 'VDRL / Syphilis', unit: '', normal: 'Non-Reactive', isOption: true, options: ['Non-Reactive', 'Reactive'], default: 'Non-Reactive' }
  ]},
  'HIV (I & II)': { id: 'HIV', name: 'HIV 1 & 2', department: 'SEROLOGY', parameters: [{ id: 'hiv', name: 'HIV 1 & 2', unit: '', normal: 'Non-Reactive', isOption: true, options: ['Non-Reactive', 'Reactive'], default: 'Non-Reactive' }] },
  'HBSAG (HEPATITIS B)': { id: 'HBSAG', name: 'HBsAg (Hepatitis B)', department: 'SEROLOGY', parameters: [{ id: 'hbsag', name: 'HBsAg', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' }] },
  'HCV (HEPATITIS C)': { id: 'HCV', name: 'HCV (Hepatitis C)', department: 'SEROLOGY', parameters: [{ id: 'hcv', name: 'HCV', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' }] },
  'VDRL / RPR': { id: 'VDRL', name: 'VDRL / RPR', department: 'SEROLOGY', parameters: [{ id: 'vdrl', name: 'VDRL', unit: '', normal: 'Non-Reactive', isOption: true, options: ['Non-Reactive', 'Reactive'], default: 'Non-Reactive' }] },

  // ===================== ARTHRITIS & AUTOIMMUNE =====================
  'RA FACTOR': { id: 'RA', name: 'Rheumatoid Factor', department: 'IMMUNOLOGY', parameters: [{ id: 'ra_val', name: 'RA Factor', unit: 'IU/ml', normal: '< 14', auto: false }] },
  'ASO TITRE': { id: 'ASO', name: 'ASO Titre', department: 'IMMUNOLOGY', parameters: [{ id: 'aso_val', name: 'ASO Titre', unit: 'IU/ml', normal: '< 200', auto: false }] },
  'ANA (ANTI NUCLEAR ANTIBODY)': { id: 'ANA', name: 'Anti Nuclear Antibody', department: 'IMMUNOLOGY', parameters: [{ id: 'ana_val', name: 'ANA', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' }] },
  'ANTI CCP': { id: 'CCP', name: 'Anti CCP', department: 'IMMUNOLOGY', parameters: [{ id: 'ccp_val', name: 'Anti CCP', unit: 'U/ml', normal: '< 20', auto: false }] },

  // ===================== HORMONES & VITAMINS =====================
  'THYROID PROFILE (T3, T4, TSH)': {
    id: 'THYROID', name: 'Thyroid Profile', department: 'HORMONES',
    parameters: [
      { id: 't3', name: 'Total T3', unit: 'ng/ml', normal: '0.8 - 2.0', auto: false },
      { id: 't4', name: 'Total T4', unit: 'ug/dl', normal: '5.1 - 14.1', auto: false },
      { id: 'tsh', name: 'TSH', unit: 'uIU/ml', normal: '0.27 - 4.2', auto: false }
    ]
  },
  'FREE THYROID PROFILE (FT3, FT4, TSH)': {
    id: 'FREE_THYROID', name: 'Free Thyroid Profile', department: 'HORMONES',
    parameters: [
      { id: 'ft3', name: 'Free T3', unit: 'pg/ml', normal: '2.0 - 4.4', auto: false },
      { id: 'ft4', name: 'Free T4', unit: 'ng/dl', normal: '0.93 - 1.70', auto: false },
      { id: 'tsh', name: 'TSH', unit: 'uIU/ml', normal: '0.27 - 4.2', auto: false }
    ]
  },
  'VITAMIN D3 (25 OH)': { id: 'VITD', name: 'Vitamin D3', department: 'VITAMINS', parameters: [{ id: 'vitd', name: 'Vitamin D3 (25 OH)', unit: 'ng/ml', normal: '30 - 100', auto: false }] },
  'VITAMIN B12': { id: 'VITB12', name: 'Vitamin B12', department: 'VITAMINS', parameters: [{ id: 'vitb12', name: 'Vitamin B12', unit: 'pg/ml', normal: '211 - 911', auto: false }] },
  'PROLACTIN': { id: 'PRL', name: 'Prolactin', department: 'HORMONES', parameters: [{ id: 'prl', name: 'Prolactin', unit: 'ng/ml', normal: '4.7 - 23.3', auto: false }] },
  'FSH': { id: 'FSH', name: 'Follicle Stimulating Hormone', department: 'HORMONES', parameters: [{ id: 'fsh', name: 'FSH', unit: 'mIU/ml', normal: '1.5 - 12.4', auto: false }] },
  'LH': { id: 'LH', name: 'Luteinizing Hormone', department: 'HORMONES', parameters: [{ id: 'lh', name: 'LH', unit: 'mIU/ml', normal: '1.7 - 8.6', auto: false }] },
  'TESTOSTERONE (TOTAL)': { id: 'TESTO', name: 'Testosterone Total', department: 'HORMONES', parameters: [{ id: 'testo', name: 'Testosterone', unit: 'ng/dl', normal: '249 - 836', auto: false }] },

  // ===================== CARDIAC & PANCREAS =====================
  'CPK TOTAL': { id: 'CPK', name: 'Creatine Phosphokinase', department: 'BIOCHEMISTRY', parameters: [{ id: 'cpk', name: 'CPK Total', unit: 'U/L', normal: '39 - 308', auto: false }] },
  'CK MB': { id: 'CKMB', name: 'CK-MB', department: 'BIOCHEMISTRY', parameters: [{ id: 'ckmb', name: 'CK-MB', unit: 'U/L', normal: '0 - 24', auto: false }] },
  'TROPONIN I (QUALITATIVE)': { id: 'TROPI', name: 'Troponin I', department: 'CARDIAC', parameters: [{ id: 'tropi', name: 'Troponin I', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' }] },
  'SERUM AMYLASE': { id: 'AMYLASE', name: 'Serum Amylase', department: 'BIOCHEMISTRY', parameters: [{ id: 'amy', name: 'Serum Amylase', unit: 'U/L', normal: '28 - 100', auto: false }] },
  'SERUM LIPASE': { id: 'LIPASE', name: 'Serum Lipase', department: 'BIOCHEMISTRY', parameters: [{ id: 'lip', name: 'Serum Lipase', unit: 'U/L', normal: '13 - 60', auto: false }] },

  // ===================== TUMOR MARKERS =====================
  'PSA (TOTAL)': { id: 'PSA', name: 'Prostate Specific Antigen', department: 'TUMOR MARKERS', parameters: [{ id: 'psa', name: 'PSA Total', unit: 'ng/ml', normal: '0.0 - 4.0', auto: false }] },
  'CEA': { id: 'CEA', name: 'Carcinoembryonic Antigen', department: 'TUMOR MARKERS', parameters: [{ id: 'cea', name: 'CEA', unit: 'ng/ml', normal: '0.0 - 5.0', auto: false }] },
  'CA 125': { id: 'CA125', name: 'CA 125', department: 'TUMOR MARKERS', parameters: [{ id: 'ca125', name: 'CA 125', unit: 'U/ml', normal: '0.0 - 35.0', auto: false }] },
  'AFP (ALPHA FETO PROTEIN)': { id: 'AFP', name: 'Alpha Feto Protein', department: 'TUMOR MARKERS', parameters: [{ id: 'afp', name: 'AFP', unit: 'IU/ml', normal: '0.0 - 5.8', auto: false }] },

  // ===================== CLINICAL PATHOLOGY & MICRO =====================
  'URINE ROUTINE & MICROSCOPY': {
    id: 'URINE ROUTINE', name: 'Urine Routine & Microscopic', department: 'CLINICAL PATHOLOGY',
    parameters: [
      { id: 'u_color', name: 'Color', unit: '', normal: 'Pale Yellow', isOption: true, options: ['Pale Yellow', 'Yellow', 'Amber', 'Reddish'], default: 'Pale Yellow' },
      { id: 'u_trans', name: 'Transparency', unit: '', normal: 'Clear', isOption: true, options: ['Clear', 'Hazy', 'Turbid'], default: 'Clear' },
      { id: 'u_ph', name: 'Reaction (pH)', unit: '', normal: '4.5 - 7.5', default: '6.0' },
      { id: 'u_sg', name: 'Specific Gravity', unit: '', normal: '1.010 - 1.025', default: '1.015' },
      { id: 'u_alb', name: 'Albumin (Protein)', unit: '', normal: 'Nil', isOption: true, options: ['Nil', 'Trace', '+ (Present)', '++ (Moderate)', '+++ (Heavy)'], default: 'Nil' },
      { id: 'u_sug', name: 'Sugar', unit: '', normal: 'Nil', isOption: true, options: ['Nil', 'Trace', '+', '++', '+++'], default: 'Nil' },
      { id: 'u_pus', name: 'Pus Cells', unit: '/hpf', normal: '0 - 5', default: '1 - 2' },
      { id: 'u_rbc', name: 'RBCs', unit: '/hpf', normal: 'Nil', default: 'Nil' },
      { id: 'u_epi', name: 'Epithelial Cells', unit: '/hpf', normal: '1 - 3', default: '1 - 3' },
      { id: 'u_casts', name: 'Casts', unit: '', normal: 'Not Seen', default: 'Not Seen' },
      { id: 'u_cryst', name: 'Crystals', unit: '', normal: 'Not Seen', default: 'Not Seen' }
    ]
  },
  'STOOL ROUTINE': {
    id: 'STOOL', name: 'Stool Routine & Microscopic', department: 'CLINICAL PATHOLOGY',
    parameters: [
      { id: 's_col', name: 'Color', unit: '', normal: 'Brown', isOption: true, options: ['Brown', 'Yellow', 'Black', 'Clay'], default: 'Brown' },
      { id: 's_cons', name: 'Consistency', unit: '', normal: 'Formed', isOption: true, options: ['Formed', 'Semi-formed', 'Loose', 'Watery'], default: 'Formed' },
      { id: 's_ova', name: 'Ova / Cysts', unit: '', normal: 'Not Seen', default: 'Not Seen' },
      { id: 's_pus', name: 'Pus Cells', unit: '/hpf', normal: '0 - 2', default: '0 - 1' },
      { id: 's_rbc', name: 'RBCs', unit: '/hpf', normal: 'Nil', default: 'Nil' }
    ]
  },
  'STOOL OCCULT BLOOD': { id: 'STOOL_OB', name: 'Stool Occult Blood', department: 'CLINICAL PATHOLOGY', parameters: [{ id: 's_ob', name: 'Occult Blood', unit: '', normal: 'Negative', isOption: true, options: ['Negative', 'Positive'], default: 'Negative' }] },
  'SEMEN ANALYSIS': {
    id: 'SEMEN', name: 'Semen Analysis', department: 'CLINICAL PATHOLOGY',
    parameters: [
      { id: 'se_vol', name: 'Volume', unit: 'ml', normal: '1.5 - 5.0', auto: false },
      { id: 'se_liq', name: 'Liquefaction Time', unit: 'mins', normal: '< 30', default: '20', auto: false },
      { id: 'se_count', name: 'Sperm Count', unit: 'Millions/ml', normal: '> 15', auto: false },
      { id: 'se_act', name: 'Active Motility', unit: '%', normal: '> 40', auto: false },
      { id: 'se_slug', name: 'Sluggish Motility', unit: '%', normal: '', auto: false },
      { id: 'se_dead', name: 'Non-Motile (Dead)', unit: '%', normal: '', auto: false },
      { id: 'se_morph', name: 'Normal Morphology', unit: '%', normal: '> 4', auto: false },
      { id: 'se_pus', name: 'Pus Cells', unit: '/hpf', normal: '0 - 4', auto: false }
    ]
  },
  'URINE CULTURE': {
    id: 'URINE_CULTURE', name: 'Urine Culture & Sensitivity', department: 'MICROBIOLOGY',
    parameters: [
      { id: 'uc_org', name: 'Organism Isolated', unit: '', normal: 'No Growth', default: 'No Growth after 48 hrs of incubation' },
      { id: 'uc_count', name: 'Colony Count', unit: 'CFU/ml', normal: '< 10^5', default: 'N/A' }
    ]
  },
  'BLOOD CULTURE': { id: 'BLOOD_CULTURE', name: 'Blood Culture', department: 'MICROBIOLOGY', parameters: [{ id: 'bc_org', name: 'Organism Isolated', unit: '', normal: 'No Growth', default: 'No Growth after 7 days of incubation' }] },
  'SPUTUM FOR AFB': { id: 'SPUTUM_AFB', name: 'Sputum for AFB', department: 'MICROBIOLOGY', parameters: [{ id: 'afb', name: 'AFB (Z-N Stain)', unit: '', normal: 'Not Seen', isOption: true, options: ['Not Seen', 'Seen (+)', 'Seen (++)', 'Seen (+++)'], default: 'Not Seen' }] }
};