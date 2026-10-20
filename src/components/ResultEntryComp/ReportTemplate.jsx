import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import  {TEST_CATALOG}  from '../../testCatalog.js';

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

export function ReportTemplateContent({ patient, selectedTests, testState, comments, showQR, qrString }) {
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
      <div key={pageIdx} className="a4-page text-black text-[12px] leading-normal" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex-1">
          <div className="flex justify-between items-center border-2 border-black rounded p-2 mb-4 bg-white text-[12px] shrink-0">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 flex-1">
              <div><strong>Patient Name:</strong> <span className="uppercase font-bold text-[13px]">{patient.patientName}</span></div>
              <div><strong>Patient ID:</strong> <span className="font-semibold">2026{patient.id || '10124'}</span></div>
              <div><strong>Age / Gender:</strong> <span className="font-semibold">{patient.age} Yrs / {patient.gender}</span></div>
              <div><strong>Registered On:</strong> <span className="font-semibold">{patient.bookingDate}</span></div>
              <div><strong>Referred By:</strong> <span className="font-semibold">{patient.doctor || 'SELF'}</span></div>
              <div className="flex justify-between items-center pr-2">
                <div><strong>Reported On:</strong> <span className="font-semibold">{new Date().toLocaleDateString()}</span></div>
                {totalPages > 1 && <span className="text-[11px] font-bold border border-black px-2 py-0.5 rounded">Page {pageNumber} of {totalPages}</span>}
              </div>
            </div>
            {showQR && (
              <div className="pl-3 ml-2 border-l border-black flex flex-col items-center">
                <QRCodeSVG value={qrString} size={50} />
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
                    <div 
                      className="border-y-2 border-black bg-gray-200 py-1.5 px-3 font-bold text-center text-[13px] uppercase tracking-wider mb-2"
                      style={{ WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' }}
                    >
                      {isSingleTest ? `${dept} — ${TEST_CATALOG[testsInDept[0]].name}` : dept}
                    </div>
                    
                    <table className="w-full border-collapse text-[12.5px]">
                      <thead>
                        <tr className="border-b-2 border-black text-left font-bold text-black">
                          <th className="py-1 px-2 w-[42%]">Test Parameter</th>
                          <th className="py-1 px-1 text-center w-[20%]">Observed Value</th>
                          <th className="py-1 px-2 text-left w-[18%]">Unit</th>
                          <th className="py-1 px-2 text-left w-[20%]">Biological Ref. Interval</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-300">
                        {testsInDept.map((testKey) => {
                          const item = TEST_CATALOG[testKey];
                          const rows = testState[testKey].filter((r) => r.value !== '');
                          if (rows.length === 0) return null;

                          return (
                            <React.Fragment key={testKey}>
                              {!isSingleTest && (
                                <tr>
                                  <td colSpan="4" className="py-1.5 px-2 font-bold text-black text-[11.5px] uppercase border-b border-gray-400 bg-white">
                                    {item.name}
                                  </td>
                                </tr>
                              )}
                              {rows.map((row) => {
                                const { isAbnormal, flag } = checkAbnormal(row.value, row.normal);
                                return (
                                  <tr key={row.id} className="h-6">
                                    <td className={`py-1 px-2 font-semibold text-black ${!isSingleTest ? 'pl-4' : ''}`}>
                                      {row.name}
                                    </td>
                                    <td className="py-1 px-1 text-center">
                                      {isAbnormal ? (
                                        <span className="font-extrabold text-[13.5px] text-black underline underline-offset-2 tracking-wide">
                                          {row.value} {flag && <span className="text-[10px] no-underline font-bold ml-0.5">({flag})</span>}
                                        </span>
                                      ) : (
                                        <span className="font-semibold text-black">{row.value}</span>
                                      )}
                                    </td>
                                    <td className="py-1 px-2 text-black font-medium">{row.unit || '-'}</td>
                                    <td className="py-1 px-2 text-black">{row.normal}</td>
                                  </tr>
                                );
                              })}
                              {item.notes && (
                                <tr>
                                  <td colSpan="4" className="py-1 px-2 text-[10px] text-gray-700 italic border-b border-gray-200">
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
            <div className="mb-2 p-1.5 border border-black rounded text-[11px]">
              <strong>Remarks:</strong> <em>{comments}</em>
            </div>
          )}
          {isLastPage ? (
            <div className="pt-2 flex justify-between items-end border-t border-black text-[11px]">
              <div>
                <p className="font-bold text-[11.5px]">Kindly Correlate Clinically!</p>
                <p className="text-gray-600 text-[10px]">Thanks for referral</p>
              </div>
              <div className="text-center">
                <div className="h-10"></div>
                <p className="border-t border-black px-8 pt-0.5 font-bold text-[11.5px]">Checked By / Medical Pathologist</p>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-400 text-right text-[10px] font-semibold">
              Continue on Next Page (Page {pageNumber + 1})...
            </div>
          )}
        </div>
      </div>
    );
  });
}