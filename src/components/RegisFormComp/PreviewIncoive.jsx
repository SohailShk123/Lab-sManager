import React from 'react';

export default function InvoicePreviewModal({ isOpen, onClose, onPrint, formData, selectedTests, balance }) {
  if (!isOpen) return null; // Agar open nahi hai, toh render mat karo

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 flex flex-col border border-slate-200">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="font-extrabold text-base text-slate-800">📄 Invoice Print Preview</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
        </div>

        <div className="border border-dashed border-slate-300 p-4 rounded-xl bg-slate-50/50 text-xs">
          <div className="text-center pb-2 border-b border-slate-300 mb-3">
            <h4 className="font-black text-base uppercase">PrimePlus Diagnostics</h4>
            <p className="text-xs text-slate-500">Ph: +91-9876543210 | Medical Counter</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div><strong>Patient:</strong> {formData.patientName || 'N/A'}</div>
            <div><strong>Age/Sex:</strong> {formData.age || '0'} Y / {formData.gender}</div>
            <div><strong>Doctor:</strong> {formData.doctor}</div>
            <div><strong>Date:</strong> {formData.bookingDate}</div>
          </div>

          <div className="border-t border-b border-slate-200 py-2 mb-2 font-bold flex justify-between text-xs">
            <span>Test Name</span>
            <span>Amount (₹)</span>
          </div>

          <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 mb-3">
            {selectedTests.map((t, idx) => (
              <div key={idx} className="flex justify-between py-1.5 text-xs">
                <span>{t.name}</span>
                <span>₹{Number(t.cost).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-300 pt-3 space-y-1 text-right text-xs">
            <div>Total: <strong>₹{Number(formData.totalAmount).toFixed(2)}</strong></div>
            <div>Discount: ₹{Number(formData.discount).toFixed(2)}</div>
            <div>Paid: ₹{Number(formData.paidAmount).toFixed(2)}</div>
            <div className="text-sm font-black text-blue-700 pt-1 border-t">Balance: ₹{balance.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer">
            Close
          </button>
          <button onClick={() => { onClose(); onPrint(); }} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer">
            Print Now
          </button>
        </div>
      </div>
    </div>
  );
}