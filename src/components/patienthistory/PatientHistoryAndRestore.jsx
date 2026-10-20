import React, { useState } from 'react';

export default function PatientHistoryAndRestore() {
  // States for History Search
  const [mobile, setMobile] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // States for Cloud Restore
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState('');

  // States for CSV Import
  const [importLoading, setImportLoading] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  // State for Report Modal
  const [viewingReport, setViewingReport] = useState(null);
// 🔍 1. Search History (Updated for Flexible Search)
  const searchHistory = async () => {
    // Check: Ya toh Mobile ho, YA dono Dates hon.
    if (!mobile && (!fromDate || !toDate)) {
      return alert("Please enter either a Mobile Number OR select both Dates!");
    }
    
    setLoading(true);
    try {
      const response = await window.api.getPatientHistory({ mobile, fromDate, toDate });
      
      if (response.success) {
        setHistory(response.data);
        if(response.data.length === 0) alert("No records found for this search.");
      } else {
        alert("Search failed: " + response.message);
      }
    } catch (error) {
      alert("Asli Error: " + error.message);
    }
    setLoading(false);
  };

  // ☁️ 2. Cloud Restore
  const handleRestore = async () => {
    if(!window.confirm("⚠️ This will download cloud data. Proceed?")) return;
    setRestoreLoading(true);
    setRestoreMsg("Downloading data...");
    const response = await window.api.restoreFromCloud();
    setRestoreMsg(response.success ? `✅ ${response.message}` : `❌ Error: ${response.message}`);
    setRestoreLoading(false);
  };

  // 📥 3. CSV Import Logic (Aapka Master Idea!)
// 📥 3. CSV Import Logic (With Date Format Fix)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert("Please upload a .csv file only!");
      e.target.value = '';
      return;
    }

    setImportLoading(true);
    setImportMsg("Reading file...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
          const currentline = lines[i].split(',');
          let obj = {};
          
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j] ? currentline[j].trim() : '';
          }

          // 👇 DATE FORMAT FIX (DD-MM-YYYY se YYYY-MM-DD banayega) 👇
          if (obj.date && obj.date.includes('-')) {
            const parts = obj.date.split('-');
            // Agar pehla hissa 2 digit ka hai (DD) aur aakhiri 4 digit ka hai (YYYY)
            if (parts[0].length === 2 && parts[2].length === 4) {
              obj.date = `${parts[2]}-${parts[1]}-${parts[0]}`; 
            }
          } else if (obj.date && obj.date.includes('/')) {
             // Agar date me slash (/) laga ho jaise 20/10/2026
             const parts = obj.date.split('/');
             if (parts[0].length === 2 && parts[2].length === 4) {
               obj.date = `${parts[2]}-${parts[1]}-${parts[0]}`; 
             }
          }

          // Basic validation checking if mobile exists
          if(obj.mobile) rows.push(obj); 
        }

        if(rows.length === 0) throw new Error("No valid data found in CSV!");

        setImportMsg(`Sending ${rows.length} records to database...`);
        const response = await window.api.importOldData(rows);

        setImportMsg(response.success ? `✅ Data Imported Successfully!` : `❌ ${response.message}`);
      } catch (error) {
        setImportMsg(`❌ Error parsing file: ${error.message}`);
      }
      setImportLoading(false);
    };
    reader.readAsText(file);
  };

  // Helpers
// Helper: Smart Test Parser (Har format ka data clean karega)
  const parseTests = (testsStr) => {
    // 1. Agar data khali hai (jaise Taiyaba ke case mein)
    if (!testsStr || testsStr === 'null' || testsStr === '[]') return "-";

    // 2. Agar already array hai
    if (Array.isArray(testsStr)) return testsStr.join(", ");

    try {
      // 3. Agar JSON string hai (jaise '["CBC", "WIDAL"]')
      if (typeof testsStr === 'string' && testsStr.includes('[')) {
        // Pehle string se ajeeb double quotes ("") aur brackets hata dete hain manual tareeqe se
        const cleanedStr = testsStr.replace(/[[\]\\"]/g, ' ').replace(/\s+/g, ' ').trim();
        // Ab comma ke hisaab se split karke proper text banate hain
        return cleanedStr.split(',').map(t => t.trim()).filter(t => t).join(", ");
      }
      
      // 4. Agar normal string hai
      return typeof testsStr === 'string' ? testsStr.trim() : String(testsStr);
    } 
    catch (e) {
      // 5. Agar sab fail ho jaye, toh raw string ko clean karke bhej do
      return typeof testsStr === 'string' ? testsStr.replace(/[[\]'"]/g, '').trim() : testsStr;
    }
  };

// 📄 Report Viewer Opener (Smart Check)
  const openReport = (record) => {
    // 1. Agar result column poora khali hai
    if (!record.results || record.results === 'null' || record.results === '{}') {
      return alert("Report is not generated/saved for this patient yet.");
    }
    
    try {
      const parsedResults = JSON.parse(record.results);
      
      // 2. Agar result column mein data hai, par koi test value nahi hai (Empty Object)
      if (Object.keys(parsedResults).length === 0) {
        return alert("Report is not generated/saved for this patient yet.");
      }

      // 3. Agar sab theek hai toh Modal open karo
      setViewingReport({ ...record, parsedResults });
    } catch { 
      alert("Report format is invalid or corrupted."); 
    }
  };
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ☁️ Cloud Restore Section */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-800">Cloud Backup & Restore</h2>
            <p className="text-xs text-slate-500">Download previous data if PC was formatted.</p>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={handleRestore} disabled={restoreLoading} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1.5 px-4 rounded text-sm shadow transition-all disabled:opacity-50">
              {restoreLoading ? 'Restoring...' : '⬇️ Download Cloud Data'}
            </button>
            {restoreMsg && <span className="text-xs font-bold text-blue-600">{restoreMsg}</span>}
          </div>
        </div>

        {/* 📥 Manual CSV Import Section */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-200 flex flex-col justify-between bg-emerald-50/30">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-emerald-800">Manual Data Import (CSV)</h2>
            <p className="text-xs text-emerald-600">CSV Headers must be: name, age, gender, mobile, date, tests, amount</p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              disabled={importLoading}
              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer w-full"
            />
            {importMsg && <span className="text-xs font-bold text-emerald-700 text-right w-1/2">{importMsg}</span>}
          </div>
        </div>
      </div>

      {/* 🔍 Patient History Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-black text-blue-800 mb-4 border-b pb-2">🔍 Search Patient History</h2>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Mobile Number</label>
            <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} maxLength="10" placeholder="e.g. 9876543210" className="border border-slate-300 rounded-md px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 w-48 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-slate-300 rounded-md px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 w-40 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-slate-300 rounded-md px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 w-40 transition-all" />
          </div>
          <div className="flex items-end">
            <button onClick={searchHistory} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md shadow-md transition-all disabled:opacity-50">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {history.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b">
                <tr>
                  <th className="p-3">Visit Date</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Tests Prescribed</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3 text-right">Bill Amount</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {history.map((record) => (
                  <tr key={record.booking_id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3 text-slate-600 font-medium">{record.booking_date}</td>
                    <td className="p-3 font-bold text-blue-900">
                      {record.name} <span className="text-xs font-normal text-slate-500 ml-1">({record.age}/{record.gender?.charAt(0)})</span>
                    </td>
                    <td className="p-3 text-xs font-semibold text-slate-700">
                      {parseTests(record.tests)}
                    </td>
                    <td className="p-3 text-slate-600 text-xs font-semibold">{record.doctor || 'SELF'}</td>
                    <td className="p-3 font-black text-emerald-600 text-right">₹{record.total_amount}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => openReport(record)} className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold px-3 py-1.5 rounded text-xs transition-colors border border-emerald-200">
                        📄 View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    {/* 📄 Report Viewer Modal */}
      {viewingReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
            
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-4 flex justify-between items-center shadow-md">
              <div>
                <h3 className="font-black text-lg tracking-wide">{viewingReport.name}'s Lab Report</h3>
                <p className="text-xs text-blue-100 font-medium">Visit Date: {viewingReport.booking_date} | Doctor: {viewingReport.doctor}</p>
              </div>
              <button onClick={() => setViewingReport(null)} className="text-white hover:text-red-300 font-black text-2xl px-2 transition-colors">&times;</button>
            </div>
            
            <div className="p-5 overflow-y-auto bg-slate-50 flex-1 space-y-5 custom-scrollbar">
              {/* Yahan se .filter() hata diya gaya hai, seedha .map() chal raha hai */}
              {Object.keys(viewingReport.parsedResults).map(testName => (
                <div key={testName} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-blue-50/50 font-bold text-sm p-3 text-blue-900 border-b uppercase tracking-wider">{testName}</div>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 border-b font-bold">
                      <tr>
                        <th className="p-2.5 pl-4 w-2/5">Parameter</th>
                        <th className="p-2.5">Result</th>
                        <th className="p-2.5">Unit</th>
                        <th className="p-2.5">Normal Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {viewingReport.parsedResults[testName].map((param, i) => (
                        <tr key={i} className="hover:bg-blue-50/20">
                          <td className="p-2.5 pl-4 border-r border-slate-100">{param.name}</td>
                          <td className="p-2.5 font-bold text-blue-700 border-r border-slate-100 bg-blue-50/10">{param.value || '-'}</td>
                          <td className="p-2.5 text-slate-500 border-r border-slate-100">{param.unit}</td>
                          <td className="p-2.5 text-slate-500 text-[11px]">{param.normal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
            
            <div className="bg-slate-100 p-3 flex justify-end border-t border-slate-200">
              <button onClick={() => setViewingReport(null)} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-1.5 px-6 rounded shadow transition-all text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}