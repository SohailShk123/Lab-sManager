import React from 'react';
import { TEST_CATALOG } from '../../testCatalog';

export default function TestParametersTable({ selectedTests, testState, allowAutoEdit, handleParamChange, handleKeyDown }) {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
      {selectedTests.map((testKey) => {
        const item = TEST_CATALOG[testKey];
        const params = testState[testKey];
        if (!item || !params) return null;

        return (
          <div key={testKey} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
            
            {/* 🟦 Modern Card Header with Subtle Gradient */}
            <div className="bg-gradient-to-r from-blue-50/80 to-transparent px-4 py-2.5 font-bold text-xs text-slate-800 tracking-wide uppercase border-b border-slate-100 flex items-center">
              <span className="text-slate-500 mr-1">{item.department} <span className="mx-1 text-slate-300">|</span></span>
              <span className="text-blue-700">{item.name}</span>
            </div>

            <table className="w-full text-xs">
              <thead className="bg-slate-50/50 text-[10.5px] tracking-wider text-slate-500 uppercase border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-2 px-4 text-left w-2/5 border-r border-slate-100">Parameter</th>
                  <th className="py-2 px-3 text-center w-40 border-r border-slate-100 text-blue-700 bg-blue-50/30">Patient Value</th>
                  <th className="py-2 px-4 text-left w-24 border-r border-slate-100">Unit</th>
                  <th className="py-2 px-4 text-left">Biological Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {params.map((p, idx) => {
                  const isLocked = p.auto && !allowAutoEdit;
                  return (
                    <tr key={p.id} className="hover:bg-blue-50/20 transition-colors group">
                      
                      {/* Parameter Name */}
                      <td className="py-2 px-4 border-r border-slate-100">
                        <div className="flex items-center">
                          {p.name} 
                          {p.auto && (
                            <span className="ml-2 text-[9px] bg-emerald-100/80 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold tracking-wide border border-emerald-200/50">
                              AUTO
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Input Field (Modernized with Focus Rings) */}
                      <td className="py-1.5 px-2 border-r border-slate-100 bg-blue-50/10">
                        {p.isOption ? (
                          <select 
                              value={p.value || '' } 
                            onChange={(e) => handleParamChange(testKey, idx, e.target.value)} 
                            onKeyDown={handleKeyDown} 
                            className="tab-field w-full border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-center text-blue-900 bg-slate-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all cursor-pointer"
                          >
                            {p.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input 
                            type="text" 
                            value={p.value || ''}
                            disabled={isLocked} 
                            onChange={(e) => handleParamChange(testKey, idx, e.target.value)} 
                            onKeyDown={handleKeyDown} 
                            className={`tab-field w-full border rounded-md px-2 py-1.5 text-xs font-bold text-center outline-none transition-all
                              ${isLocked 
                                ? 'bg-slate-100 border-slate-200 text-blue-800/60 cursor-not-allowed' 
                                : 'bg-slate-50 border-slate-200 text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500'
                              }`} 
                          />
                        )}
                      </td>

                      {/* Units */}
                      <td className="py-2 px-4 text-slate-500 border-r border-slate-100">{p.unit || '-'}</td>
                      
                      {/* Biological Range */}
                      <td className="py-2 px-4 text-slate-500 text-[11px] leading-tight">{p.normal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}