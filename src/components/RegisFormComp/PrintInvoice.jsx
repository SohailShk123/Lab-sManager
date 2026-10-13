import React from 'react';

export default function PrintInvoice({ formData, selectedTests, balance, lastBookingId }) {
  return (
    <div className="hidden print:block p-8 bg-white text-black w-full">
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-black uppercase tracking-wider">PrimePlus Diagnostics</h1>
        <p className="text-sm">123 Health Street, Medical District | Ph: +91-9876543210</p>
      </div>
      <div className="flex justify-between mb-8 text-sm">
        <div>
          <p><strong>Patient Name:</strong> {formData.patientName || 'N/A'}</p>
          <p><strong>Age/Gender:</strong> {formData.age} Yrs / {formData.gender}</p>
          <p><strong>Ref. Doctor:</strong> {formData.doctor || 'Self'}</p>
        </div>
        <div className="text-right">
          <p><strong>Booking ID:</strong> #{lastBookingId || 'N/A'}</p>
          <p><strong>Date:</strong> {formData.bookingDate}</p>
        </div>
      </div>
      <table className="w-full mb-8 border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-800 text-left">
            <th className="py-2">Test Name</th>
            <th className="py-2 text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {selectedTests.map((test, index) => (
            <tr key={index} className="border-b">
              <td className="py-2 font-medium">{test.name}</td>
              <td className="py-2 text-right">₹{Number(test.cost).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end text-sm">
        <div className="w-64 space-y-1">
          <div className="flex justify-between"><span>Total Amount:</span><span className="font-bold">₹{Number(formData.totalAmount).toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Discount:</span><span>₹{Number(formData.discount).toFixed(2)}</span></div>
          <div className="flex justify-between border-b pb-1"><span>Paid Amount:</span><span>₹{Number(formData.paidAmount).toFixed(2)}</span></div>
          <div className="flex justify-between text-base font-black pt-1"><span>Balance Due:</span><span>₹{balance.toFixed(2)}</span></div>
        </div>
      </div>
      <div className="mt-16 text-center text-xs text-gray-500">
        <p>Thank you for choosing PrimePlus Diagnostics!</p>
        <p>Computer Generated Invoice - No Signature Required.</p>
      </div>
    </div>
  );
}