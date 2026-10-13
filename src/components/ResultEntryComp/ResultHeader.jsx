import React from 'react';

export default function ResultHeader({ patient, isLoadingReport, allowAutoEdit, setAllowAutoEdit, onBack }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2 shrink-0">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Diagnostic Entry Studio</h2>
          {isLoadingReport && <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full animate-pulse">Loading saved data...</span>}
        </div>
        <p className="text-[11px] text-slate-500 font-medium">Use [Enter] key to navigate instantly between editable fields</p>
      </div>
      
      <div className="flex items-center gap-3">
        <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded border border-slate-300">
          <input type="checkbox" checked={allowAutoEdit} onChange={(e) => setAllowAutoEdit(e.target.checked)} className="w-3.5 h-3.5" />
          <span>Unlock Auto-Calc Fields</span>
        </label>
        <button type="button" onClick={onBack} className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 text-xs shadow-sm cursor-pointer">
          ← Back
        </button>
      </div>
    </div>
  );
}