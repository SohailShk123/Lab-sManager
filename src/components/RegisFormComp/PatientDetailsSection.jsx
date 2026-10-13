import React from 'react';

export default function PatientDetailsSection({
  formData,
  handleInputChange,
  handleKeyDown,
  doctorList,
  setIsDoctorModalOpen,
  nameRef
}) {
  const inputClass = "fast-field w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block px-3 py-2 outline-none transition-all";
  const labelClass = "block mb-1 text-xs font-bold uppercase tracking-wider text-slate-700";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className={labelClass}>Booking Date</label>
          <input type="date" name="bookingDate" value={formData.bookingDate} onChange={handleInputChange} onKeyDown={handleKeyDown} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Referring Doctor</label>
          <div className="flex gap-2">
            <select name="doctor" value={formData.doctor} onChange={handleInputChange} onKeyDown={handleKeyDown} className={`${inputClass} font-semibold`}>
              <option value="SELF">SELF</option>
              {doctorList.filter(d => d.name !== 'SELF').map(doc => (
                <option key={doc.id} value={doc.name}>{doc.name} {doc.degree ? `(${doc.degree})` : ''}</option>
              ))}
            </select>
            <button type="button" onClick={() => setIsDoctorModalOpen(true)} className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs">
              + Manage
            </button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Department</label>
          <select onKeyDown={handleKeyDown} className={inputClass}><option>OPD</option><option>IPD</option></select>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="col-span-2">
          <label className={labelClass}>Patient Full Name</label>
          <input ref={nameRef} type="text" name="patientName" value={formData.patientName} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="e.g. Rahul Sharma" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Age (Yrs)</label>
          <input type="number" name="age" value={formData.age} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="e.g. 28" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleInputChange} onKeyDown={handleKeyDown} className={inputClass}>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Mobile</label>
          <input type="text" name="mobile" value={formData.mobile || ''} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="10 Digits" className={inputClass} />
        </div>
      </div>
    </div>
  );
}