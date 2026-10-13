import React from 'react';
import { TEST_CATALOG } from '../../testCatalog';

export default function TestParametersTable({ selectedTests, testState, allowAutoEdit, handleParamChange, handleKeyDown }) {
  return (
    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
      {selectedTests.map((testKey) => {
        const item = TEST_CATALOG[testKey];
        const params = testState[testKey];
        if (!item || !params) return null;

        return (
          <div key={testKey} className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs text-slate-700 uppercase border-b">
              <span>{item.department} — <span className="text-blue-700">{item.name}</span></span>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[10px] text-slate-600 uppercase border-b font-bold">
                <tr>
                  <th className="py-1 px-3 text-left w-2/5 border-r">Parameter</th>
                  <th className="py-1 px-2 text-center w-40 border-r text-blue-800 bg-blue-50/40">Patient Value</th>
                  <th className="py-1 px-3 text-left w-24 border-r">Unit</th>
                  <th className="py-1 px-3 text-left">Biological Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {params.map((p, idx) => {
                  const isLocked = p.auto && !allowAutoEdit;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 text-slate-700 border-r">
                        {p.name} {p.auto && <span className="ml-1 text-[8px] bg-green-100 text-green-800 px-1 py-0.5 rounded font-bold">AUTO</span>}
                      </td>
                      <td className="py-1 px-1 border-r bg-blue-50/20">
                        {p.isOption ? (
                          <select value={p.value} onChange={(e) => handleParamChange(testKey, idx, e.target.value)} onKeyDown={handleKeyDown} className="tab-field w-full border rounded px-2 py-1 text-xs font-semibold text-center bg-white">
                            {p.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input type="text" value={p.value} disabled={isLocked} onChange={(e) => handleParamChange(testKey, idx, e.target.value)} onKeyDown={handleKeyDown} className={`tab-field w-full border rounded px-2 py-1 text-xs font-semibold text-center ${isLocked ? 'bg-slate-100 text-blue-800 cursor-not-allowed' : 'bg-white'}`} />
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-slate-500 border-r">{p.unit || '-'}</td>
                      <td className="py-1.5 px-3 text-slate-500 text-[11px]">{p.normal}</td>
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