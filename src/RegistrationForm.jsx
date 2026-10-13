import React from 'react';
import { useRegistration } from './hook/useRegistration';
import PatientDetailsSection from './components/RegisFormComp/PatientDetailsSection';
import TestSelectionSection from './components/RegisFormComp/TestSelectionSection';
import BillingSummarySection from './components/RegisFormComp/BillingSummarySection.jsx'
import DoctorMasterModal from './components/RegisFormComp/DoctorMasterModal';
import InvoicePreviewModal from './components/RegisFormComp/PreviewIncoive.jsx';
import PrintInvoice from './components/RegisFormComp/PrintInvoice.jsx';


export default function RegistrationForm() {
  const reg = useRegistration();

  const handleSave = async () => {
    const id = await reg.saveBookingToDB();
    if (id) alert(`Booking Saved! ID: #${id}`);
  };

  const handlePrint = async () => {
    if (!reg.lastBookingId) {
      const id = await reg.saveBookingToDB();
      if (!id) return;
    }
    setTimeout(() => window.print(), 200);
  };

  return (
    <>
      <div className="max-w-5xl mx-auto p-5 bg-white rounded-2xl shadow-lg border border-slate-200 space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-black text-slate-800">Patient Registration & Billing</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">⚡ Fast Keyboard Entry</span>
        </div>

        <PatientDetailsSection
          formData={reg.formData}
          handleInputChange={reg.handleInputChange}
          handleKeyDown={reg.handleKeyDown}
          doctorList={reg.doctorList}
          setIsDoctorModalOpen={reg.setIsDoctorModalOpen}
          nameRef={reg.nameRef}
        />

        <TestSelectionSection
          searchQuery={reg.searchQuery}
          setSearchQuery={reg.setSearchQuery}
          availableTests={reg.availableTests}
          selectedTests={reg.selectedTests}
          addTest={reg.addTest}
          removeTest={reg.removeTest}
          handleKeyDown={reg.handleKeyDown}
        />

        <BillingSummarySection
          formData={reg.formData}
          handleInputChange={reg.handleInputChange}
          handleKeyDown={reg.handleKeyDown}
          balance={reg.balance}
        />

        <div className="flex justify-between items-center pt-2 border-t">
          <button type="button" onClick={reg.resetForm} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">Clear Form</button>
          <div className="flex gap-2">
            <button type="button" onClick={() => reg.setIsPreviewOpen(true)} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">👁️ Preview</button>
            <button type="button" onClick={handleSave} className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-md">💾 Save Record</button>
            <button type="button" onClick={handlePrint} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-black shadow-md">🖨️ Print Invoice</button>
          </div>
        </div>
      </div>

      <DoctorMasterModal isOpen={reg.isDoctorModalOpen} onClose={() => reg.setIsDoctorModalOpen(false)} onDoctorSelected={() => reg.loadDoctors()} />
      <InvoicePreviewModal isOpen={reg.isPreviewOpen} onClose={() => reg.setIsPreviewOpen(false)} onPrint={handlePrint} formData={reg.formData} selectedTests={reg.selectedTests} balance={reg.balance} />
      <PrintInvoice formData={reg.formData} selectedTests={reg.selectedTests} balance={reg.balance} lastBookingId={reg.lastBookingId} />
    </>
  );
}