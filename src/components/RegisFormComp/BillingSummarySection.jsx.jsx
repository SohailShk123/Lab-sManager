export default function BillingSummarySection({ formData, handleInputChange, handleKeyDown, balance }) {
  const inputClass = "fast-field w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block px-3 py-2 outline-none font-bold";

  return (
    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 grid grid-cols-4 gap-4 items-end">
      <div>
        <label className="block text-slate-600 text-xs font-bold uppercase mb-1">Total (₹)</label>
        <input type="number" readOnly value={formData.totalAmount} className="w-full bg-slate-200 border text-slate-800 text-lg font-black rounded-lg p-1.5 cursor-not-allowed" />
      </div>
      <div>
        <label className="block text-slate-600 text-xs font-bold uppercase mb-1">Discount (₹)</label>
        <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} onKeyDown={handleKeyDown} className={inputClass} />
      </div>
      <div>
        <label className="block text-blue-800 text-xs font-bold uppercase mb-1">Paid Amount (₹)</label>
        <input type="number" name="paidAmount" value={formData.paidAmount} onChange={handleInputChange} onKeyDown={handleKeyDown} className="fast-field w-full bg-white border border-blue-400 text-blue-700 text-lg font-black rounded-lg p-1.5 outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className={`p-2 rounded-lg text-center flex flex-col justify-center ${balance > 0 ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
        <span className={`text-[10px] font-black uppercase tracking-wider ${balance > 0 ? 'text-red-600' : 'text-emerald-700'}`}>Balance Due</span>
        <span className={`text-xl font-black ${balance > 0 ? 'text-red-700' : 'text-emerald-700'}`}>₹ {balance}</span>
      </div>
    </div>
  );
}