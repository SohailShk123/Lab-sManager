import React, { useState, useEffect } from 'react';

export default function PatientList({ onSelectPatient }) {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await window.api.getBookings();
        setPatients(data);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto mt-4 print:hidden">
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Recent Patients</h2>

      {/* Scrollable Container with Fixed Height */}
      <div className="max-h-[70vh] overflow-y-auto overflow-x-auto border border-gray-200 rounded-lg custom-scrollbar">
        <table className="w-full text-left border-collapse relative">
          <thead>
            <tr className="text-gray-700">
              {/* Sticky Headers */}
              <th className="p-3 border-b sticky top-0 bg-gray-200 z-10 shadow-sm">ID</th>
              <th className="p-3 border-b sticky top-0 bg-gray-200 z-10 shadow-sm">Date</th>
              <th className="p-3 border-b sticky top-0 bg-gray-200 z-10 shadow-sm">Patient Name</th>
              <th className="p-3 border-b sticky top-0 bg-gray-200 z-10 shadow-sm">Age/Sex</th>
              <th className="p-3 border-b sticky top-0 bg-gray-200 z-10 shadow-sm">Doctor</th>
              <th className="p-3 border-b sticky top-0 bg-gray-200 z-10 shadow-sm">Net Bill</th>
              <th className="p-3 border-b sticky top-0 bg-gray-200 z-10 shadow-sm">Balance</th>
              <th className="p-3 border-b sticky top-0 bg-gray-200 z-10 shadow-sm text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr><td colSpan="8" className="p-6 text-center text-gray-500">No patients found.</td></tr>
            ) : patients.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-bold text-blue-600">#{p.id}</td>
                <td className="p-3 whitespace-nowrap">{p.bookingDate}</td>
                {/* 👇 Yahan fallback lagaya hai taaki naam khali na dikhe */}
                <td className="p-3 font-semibold">{p.patientName || "Unknown"}</td>
                {/* 👇 Yahan gender aur age ko safe kar diya hai taaki app crash na ho */}
                <td className="p-3 whitespace-nowrap">{p.age || 0} / {(p.gender || "U")[0]}</td>
                <td className="p-3">{p.doctor || 'Self'}</td>
                <td className="p-3 font-medium">₹{(p.totalAmount || 0) - (p.discount || 0)}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.balance > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    ₹{p.balance || 0}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => onSelectPatient(p)}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded font-bold hover:bg-green-200 text-sm transition-colors"
                  >
                    Enter Results
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}