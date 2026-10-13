import React from 'react';

export default function TestSelectionSection({
  searchQuery,
  setSearchQuery,
  availableTests,
  selectedTests,
  addTest,
  removeTest,
  handleKeyDown
}) {
  const filtered = availableTests.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="border border-slate-200 rounded-xl flex flex-col shadow-sm">
      <div className="bg-slate-50 p-3 border-b border-slate-200 relative">
        <input
          type="text"
          placeholder="🔍 Search and add tests (e.g. CBC, CRP, LFT)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && filtered.length > 0) {
              e.preventDefault();
              addTest(filtered[0]);
            } else if (e.key === 'Enter') {
              handleKeyDown(e);
            }
          }}
          className="fast-field w-full bg-white border border-slate-300 text-sm font-semibold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <div className="absolute top-12 left-3 right-3 bg-white border border-slate-200 shadow-xl max-h-48 overflow-y-auto z-50 rounded-xl divide-y">
            {filtered.map((t) => (
              <div key={t.id} onClick={() => addTest(t)} className="px-4 py-2 hover:bg-blue-50 flex justify-between cursor-pointer text-sm">
                <span className="font-bold text-slate-800">{t.name}</span>
                <span className="text-emerald-700 font-black">₹{t.cost}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-y-auto min-h-[130px] max-h-[160px] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-100 text-slate-600 uppercase text-xs font-bold border-b">
            <tr>
              <th className="py-2 px-4">Selected Tests ({selectedTests.length})</th>
              <th className="py-2 px-4 w-32">Cost</th>
              <th className="py-2 px-4 w-20 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {selectedTests.length === 0 ? (
              <tr><td colSpan="3" className="py-8 text-center text-slate-400 italic">No tests selected.</td></tr>
            ) : (
              selectedTests.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-1.5 px-4 font-bold text-slate-800">{t.name}</td>
                  <td className="py-1.5 px-4 font-bold text-slate-700">₹{t.cost}</td>
                  <td className="py-1.5 px-4 text-center">
                    <button type="button" onClick={() => removeTest(idx)} className="px-2 py-0.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded text-xs font-bold">
                      Drop
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}