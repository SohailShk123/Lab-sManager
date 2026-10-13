import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TEST_CATALOG } from './testCatalog';

// Range parser to detect Low or High values automatically
function checkAbnormal(valStr, rangeStr) {
  if (!valStr || !rangeStr) return { isAbnormal: false, flag: '' };
  const val = parseFloat(valStr.toString().replace(/,/g, '').trim());
  if (isNaN(val)) return { isAbnormal: false, flag: '' };

  const rangeMatch = rangeStr.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (val < min) return { isAbnormal: true, flag: 'L' };
    if (val > max) return { isAbnormal: true, flag: 'H' };
    return { isAbnormal: false, flag: '' };
  }

  const lessMatch = rangeStr.match(/<\s*([\d.]+)/);
  if (lessMatch) {
    const max = parseFloat(lessMatch[1]);
    if (val > max) return { isAbnormal: true, flag: 'H' };
    return { isAbnormal: false, flag: '' };
  }

  const greaterMatch = rangeStr.match(/>\s*([\d.]+)/);
  if (greaterMatch) {
    const min = parseFloat(greaterMatch[1]);
    if (val < min) return { isAbnormal: true, flag: 'L' };
    return { isAbnormal: false, flag: '' };
  }

  return { isAbnormal: false, flag: '' };
}

export default function ResultEntry({ patient, onBack }) {
  const [selectedTests, setSelectedTests] = useState(() => {
    if (patient.selectedTests && Array.isArray(patient.selectedTests)) {
      return patient.selectedTests;
    }
    if (typeof patient.selected_tests === 'string') {
      try {
        return JSON.parse(patient.selected_tests);
      } catch (e) {
        return ['CBC'];
      }
    }
    return ['CBC']; 
  });

  const [testState, setTestState] = useState(() => {
    const initial = {};
    Object.keys(TEST_CATALOG).forEach((key) => {
      initial[key] = JSON.parse(JSON.stringify(TEST_CATALOG[key].parameters));
    });
    return initial;
  });

  const [comments, setComments] = useState('');
  const [showQR, setShowQR] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [allowAutoEdit, setAllowAutoEdit] = useState(false); 
  const [searchQuery, setSearchQuery] = useState(''); // NEW: For adding tests on the fly

  // Load existing report
  useEffect(() => {
    let isMounted = true;
    const loadSavedReport = async () => {
      if (patient?.id && window.electronAPI?.getReport) {
        try {
          setIsLoadingReport(true);
          const savedData = await window.electronAPI.getReport(patient.id);
          if (savedData && isMounted) {
            if (savedData.selectedTests?.length > 0) setSelectedTests(savedData.selectedTests);
            if (savedData.results && Object.keys(savedData.results).length > 0) {
              setTestState((prev) => ({ ...prev, ...savedData.results }));
            }
            if (savedData.comments) setComments(savedData.comments);
          }
        } catch (error) {
          console.error('Error loading report:', error);
        } finally {
          if (isMounted) setIsLoadingReport(false);
        }
      }
    };
    loadSavedReport();
    return () => { isMounted = false; };
  }, [patient?.id]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const formElements = Array.from(
        document.querySelectorAll('input.tab-field:not([disabled]), select.tab-field')
      );
      const currentIndex = formElements.indexOf(e.target);
      if (currentIndex !== -1 && currentIndex + 1 < formElements.length) {
        formElements[currentIndex + 1].focus();
        if (formElements[currentIndex + 1].select) {
          formElements[currentIndex + 1].select();
        }
      }
    }
  };

  const handleParamChange = (testId, paramIndex, newValue) => {
    const updatedList = [...testState[testId]];
    updatedList[paramIndex].value = newValue;

    const getVal = (id) => {
      const itm = updatedList.find((p) => p.id === id);
      return itm && itm.value !== '' ? parseFloat(itm.value) : NaN;
    };

    const setVal = (id, val, decimals = 1) => {
      const itm = updatedList.find((p) => p.id === id);
      if (itm && !isNaN(val) && isFinite(val)) {
        itm.value = val.toFixed(decimals);
      }
    };

    if (testId === 'CBC') {
      const hb = getVal('hb');
      const rbc = getVal('rbc');
      const mcv = getVal('mcv');
      let pcv = getVal('pcv');
      if (!isNaN(hb) && !isNaN(rbc) && rbc > 0) setVal('mch', (hb / rbc) * 10, 2);
      if (!isNaN(rbc) && !isNaN(mcv)) {
        pcv = (rbc * mcv) / 10;
        setVal('pcv', pcv, 1);
      }
      if (!isNaN(hb) && !isNaN(pcv) && pcv > 0) setVal('mchc', (hb / pcv) * 100, 2);
    }
    if (testId === 'LFT') {
      const tb = getVal('tbili');
      const db = getVal('dbili');
      if (!isNaN(tb) && !isNaN(db)) setVal('ibili', Math.max(0, tb - db), 2);
      const tp = getVal('tprotein');
      const alb = getVal('albumin');
      if (!isNaN(tp) && !isNaN(alb)) {
        const glob = Math.max(0, tp - alb);
        setVal('globulin', glob, 2);
        if (glob > 0) setVal('ag_ratio', alb / glob, 2);
      }
    }
    if (testId === 'KFT') {
      const urea = getVal('urea');
      if (!isNaN(urea)) setVal('bun', urea / 2.14, 1);
    }
    if (testId === 'LIPID') {
      const tg = getVal('tg');
      const chol = getVal('chol');
      const hdl = getVal('hdl');
      let vldl = NaN;
      if (!isNaN(tg)) { vldl = tg / 5; setVal('vldl', vldl, 1); }
      if (!isNaN(chol) && !isNaN(hdl) && !isNaN(vldl)) setVal('ldl', Math.max(0, chol - (hdl + vldl)), 1);
      if (!isNaN(chol) && !isNaN(hdl) && hdl > 0) setVal('chol_hdl', chol / hdl, 2);
    }
    if (testId === 'HBA1C') {
      const a1c = getVal('hba1c_val');
      if (!isNaN(a1c)) setVal('eag_val', 28.7 * a1c - 46.7, 0);
    }
    if (testId === 'PT_INR') {
      const ptTest = getVal('pt_test');
      const ptCtrl = getVal('pt_control');
      if (!isNaN(ptTest) && !isNaN(ptCtrl) && ptCtrl > 0) setVal('pt_inr', ptTest / ptCtrl, 2);
    }
    setTestState({ ...testState, [testId]: updatedList });
  };

  const handleSaveOnly = async () => {
    try {
      setIsSaving(true);
      const payload = { patientId: patient.id, selectedTests, results: testState, comments };
      if (window.electronAPI?.saveReport) {
        const res = await window.electronAPI.saveReport(payload);
        if (res?.success) alert('Report database me successfully save ho gayi!');
        else alert('Error: ' + (res?.error || 'Failed to save'));
      } else {
        alert('Save successful (Browser Test Mode)');
      }
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => window.print();
  const handleMakePDF = () => window.print();

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Hello ${patient.patientName}, aapki Prime Plus Pathology Lab report ready hai. Sample Date: ${patient.bookingDate}.`);
    window.open(`https://wa.me/91${patient.mobile || ''}?text=${text}`, '_blank');
  };

  const qrString = `LAB: PRIME PLUS | PID: 2026${patient.id || '101'} | PATIENT: ${patient.patientName} | TESTS: ${selectedTests.join(',')}`;

  // Filter catalog for search dropdown
  const filteredCatalog = Object.keys(TEST_CATALOG).filter(key => 
    (key.toLowerCase().includes(searchQuery.toLowerCase()) || 
    TEST_CATALOG[key].name.toLowerCase().includes(searchQuery.toLowerCase())) && 
    !selectedTests.includes(key)
  );

 return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ========================================== */}
      {/* 1. MAIN UI SCREEN (Hidden completely during Print) */}
      {/* ========================================== */}
      <div 
        className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 max-w-7xl mx-auto mt-1 print:hidden flex flex-col h-[calc(100vh-20px)]"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Diagnostic Entry Studio</h2>
              {isLoadingReport && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full animate-pulse">
                  Loading saved data...
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Use [Enter] key to navigate instantly between editable fields</p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
              <input 
                type="checkbox" 
                checked={allowAutoEdit} 
                onChange={(e) => setAllowAutoEdit(e.target.checked)} 
                className="w-3.5 h-3.5"
              />
              <span>Unlock Auto-Calc Fields</span>
            </label>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 text-xs shadow-sm"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Patient Meta Strip */}
        <div className="grid grid-cols-5 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-2 shrink-0 text-xs">
          <div className="col-span-2">
            <span className="font-semibold text-slate-500">Patient:</span>{' '}
            <span className="font-bold uppercase text-slate-900">{patient.patientName}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Age / Gender:</span>{' '}
            <span className="font-medium text-slate-800">{patient.age} Yrs / {patient.gender}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Doctor:</span>{' '}
            <span className="font-medium text-slate-800">{patient.doctor || 'SELF'}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Date:</span>{' '}
            <span className="font-bold text-blue-700">{patient.bookingDate}</span>
          </div>
        </div>

        {/* Booked Tests Chips & Quick Search */}
        <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded-lg mb-2 shrink-0 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider mr-1">Booked Tests:</span>
            {selectedTests.length === 0 && <span className="text-xs text-slate-400 italic">No tests booked. Search below to add.</span>}
            
            {selectedTests.map((key) => (
              <div key={key} className="flex items-center bg-blue-600 text-white px-2.5 py-1 rounded shadow-sm text-[11px] font-bold">
                <span>✓ {key}</span>
                <button 
                  onClick={() => setSelectedTests(selectedTests.filter(t => t !== key))}
                  className="ml-2 hover:bg-rose-500 rounded-full w-4 h-4 flex items-center justify-center text-[9px] transition-colors bg-blue-800/50"
                  title="Remove Test"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="relative w-full max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs">🔍</span>
            <input 
              type="text" 
              placeholder="Search to add a missed test (e.g. Dengue, Lipid)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-blue-300 text-slate-800 text-xs rounded-md pl-8 pr-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            {searchQuery && (
              <div className="absolute top-8 left-0 w-full bg-white border border-slate-200 shadow-2xl max-h-48 overflow-y-auto z-50 rounded-lg divide-y divide-slate-100">
                {filteredCatalog.length > 0 ? (
                  filteredCatalog.map(key => (
                    <div 
                      key={key} 
                      onClick={() => {
                        setSelectedTests([...selectedTests, key]);
                        setSearchQuery('');
                      }}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      + {TEST_CATALOG[key].name} <span className="text-[10px] text-slate-400">({key})</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-xs text-slate-400 text-center">No matching test found.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Inputs Table Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {selectedTests.map((testKey) => {
            const item = TEST_CATALOG[testKey];
            const params = testState[testKey];
            if (!item || !params) return null;

            return (
              <div key={testKey} className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs text-slate-700 uppercase flex justify-between">
                  <span>
                    {item.department} — <span className="text-blue-700">{item.name}</span>
                  </span>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-[10px] text-slate-600 uppercase border-b border-slate-200 font-bold">
                    <tr>
                      <th className="py-1 px-3 text-left w-2/5 border-r border-slate-200">Parameter</th>
                      <th className="py-1 px-2 text-center w-40 border-r border-slate-200 text-blue-800 bg-blue-50/40">Patient Value</th>
                      <th className="py-1 px-3 text-left w-24 border-r border-slate-200">Unit</th>
                      <th className="py-1 px-3 text-left">Biological Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {params.map((p, idx) => {
                      const isLocked = p.auto && !allowAutoEdit;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-1 px-3 text-slate-700 border-r border-slate-100">
                            {p.name}
                            {p.auto && (
                              <span className="ml-1 text-[8px] bg-green-100 text-green-800 px-1 py-0.5 rounded font-bold">AUTO</span>
                            )}
                          </td>
                          <td className="py-0.5 px-1 border-r border-slate-100 bg-blue-50/20">
                            {p.isOption ? (
                              <select
                                value={p.value}
                                onChange={(e) => handleParamChange(testKey, idx, e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="tab-field w-full border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold text-center bg-white outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                {p.options.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={p.value}
                                disabled={isLocked}
                                onChange={(e) => handleParamChange(testKey, idx, e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={p.auto ? 'Auto' : '0.0'}
                                className={`tab-field w-full border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold text-center outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
                                  isLocked ? 'bg-slate-100 text-blue-800 cursor-not-allowed select-none' : 'bg-white text-slate-900'
                                }`}
                              />
                            )}
                          </td>
                          <td className="py-1 px-3 text-slate-500 border-r border-slate-100">{p.unit || '-'}</td>
                          <td className="py-1 px-3 text-slate-500 text-[11px]">{p.normal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* Remarks Input */}
        <div className="mt-2 shrink-0">
          <input
            type="text"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Clinical Remarks (Optional - will be printed on report)"
            className="tab-field w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-medium bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Action Toolbar */}
        <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-300 mt-2 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer bg-white px-2.5 py-1 rounded border border-slate-200 shadow-sm">
              <input
                type="checkbox"
                checked={showQR}
                onChange={(e) => setShowQR(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded cursor-pointer"
              />
              <span>QR Code on Report</span>
            </label>
            <button
              type="button"
              onClick={handleWhatsApp}
              className="px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 font-semibold rounded text-xs hover:bg-emerald-100 shadow-sm flex items-center gap-1 cursor-pointer"
            >
              💬 WhatsApp
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveOnly}
              className="px-4 py-1.5 bg-white border border-slate-300 text-slate-800 font-semibold rounded-lg text-xs hover:bg-slate-50 shadow-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              💾 {isSaving ? 'Saving...' : 'Save Data'}
            </button>

            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold rounded-lg text-xs hover:bg-indigo-100 shadow-sm flex items-center gap-1 cursor-pointer"
            >
              👁️ Print Preview
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg text-xs shadow-md hover:from-blue-700 hover:to-blue-800 flex items-center gap-1.5 cursor-pointer"
            >
              🖨️ Direct Print
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. PREVIEW MODAL (Hidden completely during Print) */}
      {/* ========================================== */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-slate-900 rounded-xl shadow-2xl max-w-5xl w-full h-[95vh] flex flex-col overflow-hidden border border-slate-700">
            <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center shrink-0 border-b border-slate-700">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">📄 A4 Letterhead Print Preview</h3>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => window.print()} // Direct print without needing to close modal!
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-md text-xs hover:bg-blue-500 shadow-md cursor-pointer"
                >
                  🖨 Print Now
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-md text-xs hover:bg-rose-500 shadow-md cursor-pointer"
                >
                  ✕ Close Preview
                </button>
              </div>
            </div>
            {/* Modal Body Preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-300 flex flex-col items-center">
              <ReportTemplate
                patient={patient}
                selectedTests={selectedTests}
                testState={testState}
                comments={comments}
                showQR={showQR}
                qrString={qrString}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. PRINT ONLY AREA (This is the ONLY thing that prints) */}
      {/* ========================================== */}
      <div className="hidden print:block w-full p-0 m-0">
        <ReportTemplate
          patient={patient}
          selectedTests={selectedTests}
          testState={testState}
          comments={comments}
          showQR={showQR}
          qrString={qrString}
        />
      </div>
    </>
  );
}

// SMART DYNAMIC A4 REPORT TEMPLATE (with Poppins & Dynamic Pagination)
function ReportTemplate({ patient, selectedTests, testState, comments, showQR, qrString }) {
  const activeTests = selectedTests.filter((key) => {
    const rows = testState[key];
    return rows && rows.some((r) => r.value && r.value !== '');
  });

  const PAGE_CAPACITY = 18;
  const pages = [];
  let currentPageTests = [];
  let currentLoad = 0;

  activeTests.forEach((key) => {
    const validRowsCount = testState[key].filter((r) => r.value !== '').length;
    const testWeight = validRowsCount + 3.5;

    if (key === 'CBC') {
      if (currentPageTests.length > 0) {
        pages.push(currentPageTests);
        currentPageTests = [];
        currentLoad = 0;
      }
      pages.push([key]);
      return;
    }

    if (currentLoad + testWeight > PAGE_CAPACITY && currentPageTests.length > 0) {
      pages.push(currentPageTests);
      currentPageTests = [key];
      currentLoad = testWeight;
    } else {
      currentPageTests.push(key);
      currentLoad += testWeight;
    }
  });

  if (currentPageTests.length > 0) pages.push(currentPageTests);
  if (pages.length === 0) pages.push([]);

  const totalPages = pages.length;

  const renderPatientMeta = (pageNumber) => (
    <div className="flex justify-between items-center border border-slate-700 rounded p-2.5 mb-3 bg-white text-[12px] shrink-0">
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 flex-1">
        <div><strong className="text-slate-700">Patient Name:</strong> <span className="uppercase font-bold text-slate-950 text-[13px]">{patient.patientName}</span></div>
        <div><strong className="text-slate-700">Patient ID:</strong> <span className="font-semibold text-slate-900">2026{patient.id || '10124'}</span></div>
        <div><strong className="text-slate-700">Age / Gender:</strong> <span className="font-semibold text-slate-900">{patient.age} Yrs / {patient.gender}</span></div>
        <div><strong className="text-slate-700">Registered On:</strong> <span className="font-semibold text-slate-900">{patient.bookingDate}</span></div>
        <div><strong className="text-slate-700">Referred By:</strong> <span className="font-semibold text-slate-900">{patient.doctor || 'SELF'}</span></div>
        <div className="flex justify-between items-center pr-2">
          <div><strong className="text-slate-700">Reported On:</strong> <span className="font-semibold text-slate-900">{new Date().toLocaleDateString()}</span></div>
          {totalPages > 1 && (
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              Page {pageNumber} of {totalPages}
            </span>
          )}
        </div>
      </div>

      {showQR && (
        <div className="pl-3 ml-2 border-l border-slate-400 flex flex-col items-center">
          <QRCodeSVG value={qrString} size={54} />
          <span className="text-[8px] text-slate-600 mt-0.5 font-bold tracking-wider">VERIFY</span>
        </div>
      )}
    </div>
  );

  const renderTestTable = (testKey, isSpacious) => {
    const item = TEST_CATALOG[testKey];
    const rows = testState[testKey];
    if (!item || !rows) return null;

    return (
      <div key={testKey} className="mb-3">
        <div className="bg-slate-200 border-y border-slate-400 py-1 px-3 font-bold text-center text-[12px] uppercase tracking-wider text-slate-900 mb-1">
          {item.department} — {item.name}
        </div>

        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b-2 border-slate-800 text-left font-bold text-slate-800 bg-slate-50">
              <th className={`py-1 px-2 w-[42%] ${isSpacious ? 'py-1.5' : ''}`}>Test Parameter</th>
              <th className={`py-1 px-1 text-center w-[20%] ${isSpacious ? 'py-1.5' : ''}`}>Observed Value</th>
              <th className={`py-1 px-2 text-left w-[18%] ${isSpacious ? 'py-1.5' : ''}`}>Unit</th>
              <th className={`py-1 px-2 text-left w-[20%] ${isSpacious ? 'py-1.5' : ''}`}>Biological Reference Interval</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {rows
              .filter((r) => r.value !== '')
              .map((row) => {
                const { isAbnormal, flag } = checkAbnormal(row.value, row.normal);
                return (
                  <tr key={row.id} className={isSpacious ? 'h-7' : 'h-6'}>
                    <td className="py-1 px-2 font-medium text-slate-800">{row.name}</td>
                    <td className="py-1 px-1 text-center">
                      {isAbnormal ? (
                        <span className="font-extrabold text-[13.5px] text-black underline underline-offset-2 tracking-wide">
                          {row.value} {flag && <span className="text-[10px] no-underline font-bold ml-0.5">({flag})</span>}
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-900">{row.value}</span>
                      )}
                    </td>
                    <td className="py-1 px-2 text-slate-700 font-medium">{row.unit || '-'}</td>
                    <td className="py-1 px-2 text-slate-700">{row.normal}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {item.notes && (
          <div className="text-[10px] text-slate-600 bg-slate-50 px-2 py-1 border border-slate-200 rounded mt-1">
            {item.notes}
          </div>
        )}
      </div>
    );
  };

  const renderSignatures = () => (
    <div className="mt-4 pt-2 flex justify-between items-end border-t border-slate-500 text-[11px] shrink-0">
      <div>
        <p className="font-bold text-slate-900 text-[11.5px]">Kindly Correlate Clinically!</p>
        <p className="text-slate-500 text-[10px]">Thanks for referral</p>
      </div>
      <div className="text-center">
        <div className="h-10"></div>
        <p className="border-t border-slate-600 px-8 pt-0.5 font-bold text-slate-900 text-[11.5px]">
          Checked By / Medical Pathologist
        </p>
      </div>
    </div>
  );

  return (
    <div 
      className="report-root text-black text-[12px] leading-normal select-none"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
    <style>{`
        @page {
          size: A4 portrait;
          margin-top: 32mm;    
          margin-bottom: 10mm; /* Bottom margin ko 20mm se 10mm kar diya taaki space waste na ho */
          margin-left: 14mm;
          margin-right: 14mm;
        }
        @media print {
          html, body { 
            margin: 0 !important; 
            padding: 0 !important; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          .a4-page {
            width: 100%;
            height: 85vh; /* Aapke suggestion ke hisaab se height 88vh set kar di */
            max-height: 90vh;
            padding: 0; 
            margin: 0;
            box-sizing: border-box;
            display: flex; 
            flex-direction: column; 
            justify-content: space-between;
            overflow: hidden; /* Extra space ko force hide karega */
            page-break-inside: avoid;
            page-break-after: always; 
            break-after: page;
          }
          .a4-page:last-child { 
            page-break-after: auto; 
            break-after: auto; 
          }
          .no-print { display: none !important; }
          .only-print { display: block !important; }
        }
        @media screen {
          .a4-page {
            width: 210mm;
            height: 297mm;
            max-height: 297mm;
            padding: 32mm 14mm 10mm 14mm;
            background: white;
            box-sizing: border-box;
            margin: 0 auto 28px auto;
            box-shadow: 0 6px 20px rgba(0,0,0,0.22);
            display: flex; 
            flex-direction: column; 
            justify-content: space-between;
            overflow: hidden;
          }
          .only-print { display: none !important; }
        }
      `}</style>

      {pages.map((testKeysInPage, pageIdx) => {
        const pageNumber = pageIdx + 1;
        const isLastPage = pageNumber === totalPages;
        const isOnlyCBC = testKeysInPage.length === 1 && testKeysInPage[0] === 'CBC';

        return (
          <div key={pageIdx} className="a4-page">
            <div className="flex-1 overflow-hidden">
              {renderPatientMeta(pageNumber)}
              <div className="space-y-3">
                {testKeysInPage.map((testKey) => renderTestTable(testKey, isOnlyCBC))}
              </div>
              {isLastPage && comments && (
                <div className="mt-2 p-1.5 border border-slate-300 rounded bg-slate-50 text-[11px]">
                  <strong>Remarks:</strong> <em>{comments}</em>
                </div>
              )}
            </div>
            {isLastPage ? renderSignatures() : (
              <div className="pt-2 border-t border-slate-300 text-right text-[10px] text-slate-500 font-semibold shrink-0">
                Continue on Next Page (Page {pageNumber + 1})...
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}