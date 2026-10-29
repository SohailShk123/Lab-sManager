import React, { useState, useEffect } from 'react';
import { useResultEntry } from '../hook/useResultEntry.js';
import { ReportTemplateContent } from '../components/ResultEntryComp/ReportTemplate.jsx';
import ResultHeader from '../components/ResultEntryComp/ResultHeader.jsx';
import TestSearchToolbar from '../components/ResultEntryComp/TestSearchToolbar.jsx';
import TestParametersTable from '../components/ResultEntryComp/TestParametersTable.jsx';

export default function ResultEntry({ patient, onBack }) {
  const reg = useResultEntry(patient);
  
  // 👇 State to handle whether we are printing on paper or generating a PDF
  const [printMode, setPrintMode] = useState('paper'); 

  // Local Database se Settings save karne ke liye
  const [printConfig, setPrintConfig] = useState({ marginTop: 32, marginBottom: 10, labName: '', labAddress: '' });

  // API Call: Page load hote hi Local DB se margins mangwao
  useEffect(() => {
    if (window.api && window.api.getConfig) {
      window.api.getConfig().then(data => {
        if(data && Object.keys(data).length > 0) {
          setPrintConfig({
            marginTop: data.marginTop || 32,
            marginBottom: data.marginBottom || 10,
            labName: data.labName || '',
            labAddress: data.labAddress || '',
            phone: data.phone || '',    
            email: data.email || ''     
          });
        }
      });
    }
  }, []);

  // 👇 PDF Download Handler
  const handleDownloadPDF = () => {
    setPrintMode('pdf'); // Pehle mode ko PDF set karo
    
    // React ko DOM update karne ka time dene ke liye setTimeout lagaya hai
    setTimeout(async () => {
      const printElement = document.getElementById('true-print-area');
      if (!printElement) return;

      try {
        if (window.api && window.api.downloadPDF) {
          await window.api.downloadPDF();
        } else {
          window.print(); // Fallback to browser print dialog
        }
      } catch (error) {
        console.error("PDF Generate Error:", error);
        alert("PDF banne me error aayi!");
      }
    }, 150);
  };

  // 👇 Direct Print Handler
  const handleDirectPrint = () => {
    setPrintMode('paper'); // Pehle mode ko paper set karo (B&W, no header)
    
    setTimeout(() => {
      if (reg.handlePrint) {
        reg.handlePrint();
      } else {
        window.print();
      }
    }, 150);
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #true-print-area, #true-print-area * { visibility: visible !important; }
          #true-print-area { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
          html, body { background-color: white !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .a4-page { width: 100%; height: 97vh; display: flex; flex-direction: column; justify-content: space-between; page-break-inside: avoid; page-break-after: always; background: white; margin: 0; overflow: hidden; box-sizing: border-box; }
          .a4-page:last-child { page-break-after: auto; }
        }
        @page { size: A4 portrait; margin: 0; }
        
        @media screen {
          #true-print-area { display: none !important; }
          .a4-page { width: 210mm; height: 297mm; background: white; margin: 0 auto 30px auto; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 25px rgba(0,0,0,0.5); box-sizing: border-box; overflow: hidden; }
        }
      `}</style>

      {/* Main UI */}
      <div className="bg-slate-50 p-4 rounded-xl shadow-lg border border-slate-200 max-w-7xl mx-auto mt-1 print:hidden flex flex-col h-[calc(100vh-20px)]" style={{ fontFamily: "'Poppins', sans-serif" }}>

        <ResultHeader patient={patient} isLoadingReport={reg.isLoadingReport} allowAutoEdit={reg.allowAutoEdit} setAllowAutoEdit={reg.setAllowAutoEdit} onBack={onBack} />

        <div className="grid grid-cols-5 gap-3 bg-white p-2.5 rounded-lg border border-slate-200 mb-2 shrink-0 text-xs shadow-sm">
          <div className="col-span-2"><span className="font-semibold text-slate-500">Patient:</span> <span className="font-bold uppercase text-slate-900">{patient.patientName}</span></div>
          <div><span className="font-semibold text-slate-500">Age/Gender:</span> <span className="font-medium text-slate-800">{patient.age} Yrs / {patient.gender}</span></div>
          <div><span className="font-semibold text-slate-500">Doctor:</span> <span className="font-medium text-slate-800">{patient.doctor || 'SELF'}</span></div>
          <div><span className="font-semibold text-slate-500">Date:</span> <span className="font-bold text-blue-700">{patient.bookingDate}</span></div>
        </div>

        <TestSearchToolbar selectedTests={reg.selectedTests} setSelectedTests={reg.setSelectedTests} searchQuery={reg.searchQuery} setSearchQuery={reg.setSearchQuery} />

        <TestParametersTable selectedTests={reg.selectedTests} testState={reg.testState} allowAutoEdit={reg.allowAutoEdit} handleParamChange={reg.handleParamChange} handleKeyDown={reg.handleKeyDown} />

        <div className="mt-2 shrink-0">
          <input type="text" value={reg.comments} onChange={(e) => reg.setComments(e.target.value)} onKeyDown={reg.handleKeyDown} placeholder="Clinical Remarks (Optional)" className="tab-field w-full border rounded px-2.5 py-2 text-xs font-medium bg-white shadow-sm outline-none focus:ring-1 focus:ring-blue-500" />
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-300 mt-2 shrink-0 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded border">
              <input type="checkbox" checked={reg.showQR} onChange={(e) => reg.setShowQR(e.target.checked)} className="w-3.5 h-3.5" />
              <span>QR Code on Report</span>
            </label>
            <button type="button" onClick={reg.handleWhatsApp} className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-700 font-semibold rounded text-xs cursor-pointer">💬 WhatsApp</button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" disabled={reg.isSaving} onClick={reg.handleSaveOnly} className="px-4 py-2 bg-slate-100 border text-slate-800 font-semibold rounded-lg text-xs cursor-pointer">💾 Save Data</button>
            <button type="button" onClick={handleDownloadPDF} className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 font-bold rounded-lg text-xs cursor-pointer">📄 Download PDF</button>
            <button type="button" onClick={() => reg.setShowPreviewModal(true)} className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold rounded-lg text-xs cursor-pointer">👁️ Preview</button>
            <button type="button" onClick={handleDirectPrint} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs cursor-pointer">🖨️ Direct Print</button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {reg.showPreviewModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-slate-900 rounded-xl shadow-2xl max-w-5xl w-full h-[95vh] flex flex-col overflow-hidden border">
            <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm uppercase">📄 Print Preview</h3>
              <div className="flex gap-3">
                <button onClick={handleDirectPrint} className="px-5 py-1.5 bg-blue-600 text-white font-bold rounded-md text-xs cursor-pointer">🖨 Print Now</button>
                <button onClick={() => reg.setShowPreviewModal(false)} className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-md text-xs cursor-pointer">✕ Close</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-300 flex flex-col items-center">
              <div className="a4-preview-page shadow-2xl">
                {/* Preview screen me PDF mode hamesha TRUE rahega */}
                <ReportTemplateContent patient={patient} selectedTests={reg.selectedTests} testState={reg.testState} comments={reg.comments} showQR={reg.showQR} qrString={reg.qrString} printConfig={printConfig} isDigitalPDF={true} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* True Print Area */}
      <div id="true-print-area">
        {/* 👇 YAHAN MAGIC HAI: 'isDigitalPDF' printMode state ke hisaab se dynamically change hoga */}
        <ReportTemplateContent 
          patient={patient} 
          selectedTests={reg.selectedTests} 
          testState={reg.testState} 
          comments={reg.comments} 
          showQR={reg.showQR} 
          qrString={reg.qrString} 
          printConfig={printConfig} 
          isDigitalPDF={printMode === 'pdf'} 
        />
      </div>
    </>
  );
}