import React, { useState, useEffect } from 'react';

export default function DoctorMasterModal({ isOpen, onClose, onDoctorSelected }) {
  const [doctors, setDoctors] = useState([]);
  const [name, setName] = useState('');
  const [degree, setDegree] = useState('');
  const [hospital, setHospital] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe API Bridge (preload me window.api exposed hai)
  const getAPI = () => window.api || window.electronAPI;

  // Doctors list fetch karna
  const fetchDoctors = async () => {
    const api = getAPI();
    if (api?.getDoctors) {
      try {
        const list = await api.getDoctors();
        setDoctors(list || []);
      } catch (err) {
        console.error('Failed to load doctors:', err);
      }
    } else {
      // Local fallback for browser testing
      setDoctors([
        { id: 1, name: 'SELF', degree: '', hospital: '' },
        { id: 2, name: 'Dr. DR NARESH G. UMERJAKER', degree: 'MBBS, DCH', hospital: 'Prime Children Hospital' },
      ]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
      setName('');
      setDegree('');
      setHospital('');
    }
  }, [isOpen]);

  // Naya doctor add karna
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const api = getAPI();
    try {
      setIsSubmitting(true);
      if (api?.addDoctor) {
        const addedName = name.trim();
        const res = await api.addDoctor({
          name: addedName,
          degree: degree.trim(),
          hospital: hospital.trim(),
        });
        if (res?.success) {
          await fetchDoctors();
          if (onDoctorSelected) {
            onDoctorSelected(addedName);
          }
          setName('');
          setDegree('');
          setHospital('');
          onClose();
        }
      } else {
        const newDoc = { id: Date.now(), name: name.trim(), degree: degree.trim(), hospital: hospital.trim() };
        setDoctors([...doctors, newDoc]);
        if (onDoctorSelected) onDoctorSelected(newDoc.name);
        onClose();
      }
    } catch (error) {
      alert(error?.message || error || 'Doctor add karne me error aaya');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Doctor delete karna
  const handleDeleteDoctor = async (id, docName) => {
    if (docName === 'SELF') {
      alert('SELF ko delete nahi kiya ja sakta.');
      return;
    }

    if (window.confirm(`Kya aap "${docName}" ko directory se delete karna chahte hain?`)) {
      const api = getAPI();
      try {
        if (api?.deleteDoctor) {
          await api.deleteDoctor(id);
          fetchDoctors();
        } else {
          setDoctors(doctors.filter((d) => d.id !== id));
        }
      } catch (err) {
        alert('Delete failed: ' + err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm tracking-wide">Doctor Master Directory</h3>
            <p className="text-[10px] text-slate-400">Add or manage referring doctors for billing & reports</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-base px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Add Doctor Form */}
        <form onSubmit={handleAddDoctor} className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="text-[11px] font-bold text-slate-700 uppercase mb-2">Add New Doctor:</div>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Doctor Name (e.g. Dr. Sharma)"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                required
              />
            </div>
            <div className="col-span-3">
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="Degree (MBBS)"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded py-1.5 text-xs shadow transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : '+ Add'}
              </button>
            </div>
          </div>
        </form>

        {/* Doctor List */}
        <div className="p-4 flex-1 overflow-y-auto max-h-[300px]">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
            <span>Saved Doctors ({doctors.length})</span>
            <span className="text-[10px] text-slate-400">Click Select to auto-fill</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
            {doctors.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">Koi doctor nahi mila. Upar se naya add karein.</div>
            ) : (
              doctors.map((doc) => (
                <div key={doc.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <span className="font-bold text-slate-800 text-xs">{doc.name}</span>
                    {doc.degree && (
                      <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                        {doc.degree}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {onDoctorSelected && (
                      <button
                        type="button"
                        onClick={() => {
                          onDoctorSelected(doc.name);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-bold cursor-pointer"
                      >
                        Select
                      </button>
                    )}
                    {doc.name !== 'SELF' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                        className="text-red-500 hover:text-red-700 text-xs p-1 font-semibold cursor-pointer"
                        title="Delete Doctor"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}