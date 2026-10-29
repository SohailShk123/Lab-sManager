import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TEST_CATALOG } from '../../testCatalog.js';

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
  if (lessMatch && val > parseFloat(lessMatch[1])) return { isAbnormal: true, flag: 'H' };

  const greaterMatch = rangeStr.match(/>\s*([\d.]+)/);
  if (greaterMatch && val < parseFloat(greaterMatch[1])) return { isAbnormal: true, flag: 'L' };

  return { isAbnormal: false, flag: '' };
}

export function ReportTemplateContent({ patient, selectedTests, testState, comments, showQR, qrString, printConfig, isDigitalPDF }) {
  const activeTests = selectedTests.filter((key) => testState[key] && testState[key].some((r) => r.value && r.value !== ''));
  
  const PAGE_CAPACITY = 27;
  const pages = [];
  let currentPageTests = [];
  let currentLoad = 0;

  activeTests.forEach((key) => {
    const validRowsCount = testState[key].filter((r) => r.value !== '').length;
    const testWeight = validRowsCount + 3.5;

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

  return pages.map((testKeysInPage, pageIdx) => {
    const pageNumber = pageIdx + 1;
    const isLastPage = pageNumber === totalPages;

    return (
      <div 
        key={pageIdx} 
        className={`a4-page text-[12px] leading-normal ${isDigitalPDF ? 'text-slate-800' : 'text-black'}`}
        style={{ 
          fontFamily: "'Poppins', sans-serif",
          paddingTop: isDigitalPDF ? '10mm' : `${printConfig?.marginTop || 32}mm`,
          paddingBottom: `${printConfig?.marginBottom || 10}mm`,
          paddingLeft: '14mm',
          paddingRight: '14mm'
        }}
      >
     <div className="flex-1">
          
          {/* 👇 PREMIUM MEDICAL DIGITAL LETTERHEAD (LEFT-RIGHT SPLIT) */}
          {isDigitalPDF && printConfig?.labName && (
            <div className="flex justify-between items-end mb-5 pb-4 border-b-[3px] border-blue-900 shrink-0">
              
              {/* LEFT SIDE: Logo, Name & Address */}
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-3 mb-1">
                  
                  {/* Original Logo matched from your image */}
                  <div className="bg-[#e40000] w-[42px] h-[42px] rounded-[12px] flex items-center justify-center shadow-sm shrink-0">
                    <div className="bg-white w-[22px] h-[22px] rounded-[6px] flex items-center justify-center relative">
                      <div className="absolute w-[5px] h-[12px] bg-[#e40000] rounded-sm"></div>
                      <div className="absolute w-[12px] h-[5px] bg-[#e40000] rounded-sm"></div>
                    </div>
                  </div>

                  <h1 className="text-3xl font-black uppercase tracking-widest text-blue-900 drop-shadow-sm" style={{ letterSpacing: '0.08em' }}>
                    {printConfig.labName}
                  </h1>
                </div>
                
                {/* Address Line (Logo ke baad se shuru hoga) */}
               {printConfig?.labAddress && (
                  <p className="text-[13px] font-bold text-slate-700 tracking-wide mt-1 ml-[54px] max-w-[450px] leading-snug">
                    {printConfig.labAddress}
                  </p>
                )}
              </div>

              {/* RIGHT SIDE: Contact Info (Phone & Email) stacked vertically */}
              {(printConfig?.phone || printConfig?.email) && (
                <div className="flex flex-col items-end gap-2 text-[11px] font-semibold text-slate-700">
                  {printConfig?.phone && (
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                      <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      {printConfig.phone}
                    </span>
                  )}
                  {printConfig?.email && (
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                      <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      {printConfig.email}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PATIENT INFO STRIP - Dual Theme */}
          <div className={`flex justify-between items-center border-2 p-2 mb-4 text-[12px] shrink-0 ${
            isDigitalPDF 
              ? 'border-blue-200 bg-blue-50/50 rounded-xl shadow-sm text-slate-800' 
              : 'border-black bg-white rounded text-black'
          }`}>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 flex-1">
              <div><strong>Patient Name:</strong> <span className={`uppercase font-bold text-[13px] ${isDigitalPDF ? 'text-blue-900' : ''}`}>{patient.patientName}</span></div>
              <div><strong>Patient ID:</strong> <span className="font-semibold">2026{patient.id || '10124'}</span></div>
              <div><strong>Age / Gender:</strong> <span className="font-semibold">{patient.age} Yrs / {patient.gender}</span></div>
              <div><strong>Registered On:</strong> <span className="font-semibold">{patient.bookingDate}</span></div>
              <div><strong>Referred By:</strong> <span className="font-semibold">{patient.doctor || 'SELF'}</span></div>
              <div className="flex justify-between items-center pr-2">
                <div><strong>Reported On:</strong> <span className="font-semibold">{new Date().toLocaleDateString()}</span></div>
                {totalPages > 1 && (
                  <span className={`text-[11px] font-bold border px-2 py-0.5 rounded ${
                    isDigitalPDF ? 'border-blue-300 bg-white text-blue-800' : 'border-black text-black'
                  }`}>
                    Page {pageNumber} of {totalPages}
                  </span>
                )}
              </div>
            </div>
            {showQR && (
              <div className={`pl-3 ml-2 border-l flex flex-col items-center ${isDigitalPDF ? 'border-blue-200' : 'border-black'}`}>
                <QRCodeSVG value={qrString} size={50} fgColor={isDigitalPDF ? '#1e3a8a' : '#000000'} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {(() => {
              const deptGroups = {};
              testKeysInPage.forEach((key) => {
                const dept = TEST_CATALOG[key]?.department || 'PATHOLOGY';
                if (!deptGroups[dept]) deptGroups[dept] = [];
                deptGroups[dept].push(key);
              });

              return Object.keys(deptGroups).map((dept) => {
                const testsInDept = deptGroups[dept];
                const isSingleTest = testsInDept.length === 1;

                return (
                  <div key={dept} className="mb-2">
                    {/* DEPARTMENT HEADER - Dual Theme */}
                    <div
                      className={`border-y-2 py-1.5 px-3 font-bold text-center text-[13px] uppercase tracking-wider mb-2 ${
                        isDigitalPDF 
                          ? 'border-blue-300 bg-blue-100/60 text-blue-900 rounded-md' 
                          : 'border-black bg-gray-200 text-black'
                      }`}
                      style={{ WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' }}
                    >
                      {isSingleTest ? `${dept} — ${TEST_CATALOG[testsInDept[0]].name}` : dept}
                    </div>

                    <table className="w-full border-collapse text-[12.5px]">
                      <thead>
                        <tr className={`border-b-2 text-left font-bold ${isDigitalPDF ? 'border-blue-300 text-blue-900' : 'border-black text-black'}`}>
                          <th className="py-1 px-2 w-[42%]">Test Parameter</th>
                          <th className="py-1 px-1 text-center w-[20%]">Observed Value</th>
                          <th className="py-1 px-2 text-left w-[18%]">Unit</th>
                          <th className="py-1 px-2 text-left w-[20%]">Biological Ref. Interval</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDigitalPDF ? 'divide-blue-100' : 'divide-gray-300'}`}>
                        {testsInDept.map((testKey) => {
                          const item = TEST_CATALOG[testKey];
                          const rows = testState[testKey].filter((r) => r.value !== '');
                          if (rows.length === 0) return null;

                          return (
                            <React.Fragment key={testKey}>
                              {!isSingleTest && (
                                <tr>
                                  <td colSpan="4" className={`py-1.5 px-2 font-bold text-[11.5px] uppercase border-b ${
                                    isDigitalPDF ? 'border-blue-200 bg-blue-50/30 text-blue-800' : 'border-gray-400 bg-white text-black'
                                  }`}>
                                    {item.name}
                                  </td>
                                </tr>
                              )}
                              {rows.map((row) => {
                                const { isAbnormal, flag } = checkAbnormal(row.value, row.normal);
                                return (
                                  <tr key={row.id} className="h-6">
                                    <td className={`py-1 px-2 font-semibold ${!isSingleTest ? 'pl-4' : ''} ${isDigitalPDF ? 'text-slate-700' : 'text-black'}`}>
                                      {row.name}
                                    </td>
                                    <td className="py-1 px-1 text-center">
                                      {isAbnormal ? (
                                        <span className="font-extrabold text-[13.5px] text-red-600 tracking-wide" style={{ WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' }}>
                                          {row.value} {flag && <span className="text-[10px] font-bold ml-0.5">({flag})</span>}
                                        </span>
                                      ) : (
                                        <span className={`font-semibold ${isDigitalPDF ? 'text-slate-800' : 'text-black'}`}>{row.value}</span>
                                      )}
                                    </td>
                                    <td className={`py-1 px-2 font-medium ${isDigitalPDF ? 'text-slate-600' : 'text-black'}`}>{row.unit || '-'}</td>
                                    <td className={`py-1 px-2 ${isDigitalPDF ? 'text-slate-700' : 'text-black'}`}>{row.normal}</td>
                                  </tr>
                                );
                              })}
                              {item.notes && (
                                <tr>
                                  <td colSpan="4" className={`py-1 px-2 text-[10px] italic border-b ${isDigitalPDF ? 'text-slate-500 border-blue-100' : 'text-gray-700 border-gray-200'}`}>
                                    {item.notes}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        <div className="shrink-0 mt-4 pb-2">
          {isLastPage && comments && (
            <div className={`mb-2 p-1.5 border rounded text-[11px] ${isDigitalPDF ? 'border-blue-300 bg-blue-50 text-blue-900' : 'border-black text-black'}`}>
              <strong>Remarks:</strong> <em>{comments}</em>
            </div>
          )}
          {isLastPage ? (
            <div className={`pt-2 flex justify-between items-end border-t-2 text-[11px] ${isDigitalPDF ? 'border-blue-300' : 'border-black'}`}>
              <div>
                <p className={`font-bold text-[11.5px] ${isDigitalPDF ? 'text-blue-900' : 'text-black'}`}>Kindly Correlate Clinically!</p>
                <p className={isDigitalPDF ? 'text-blue-600/70 text-[10px]' : 'text-gray-600 text-[10px]'}>Thanks for referral</p>
              </div>
              <div className="text-center">
                <div className="h-10"></div>
                <p className={`border-t px-8 pt-0.5 font-bold text-[11.5px] ${isDigitalPDF ? 'border-blue-300 text-blue-900' : 'border-black text-black'}`}>
                  Checked By / Medical Pathologist
                </p>
              </div>
            </div>
          ) : (
            <div className={`pt-2 border-t text-right text-[10px] font-semibold ${isDigitalPDF ? 'border-blue-200 text-blue-600' : 'border-gray-400 text-black'}`}>
              Continue on Next Page (Page {pageNumber + 1})...
            </div>
          )}
        </div>
      </div>
    );
  });
}