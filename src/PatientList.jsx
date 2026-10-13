import React, { useState, useEffect } from 'react';

export default function PatientList({ onSelectPatient }) {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    // Component load hote hi database se data mangwao
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
    <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto mt-6 print:hidden">
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Recent Patients</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border-b">ID</th>
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Patient Name</th>
              <th className="p-3 border-b">Age/Sex</th>
              <th className="p-3 border-b">Doctor</th>
              <th className="p-3 border-b">Net Bill</th>
              <th className="p-3 border-b">Balance</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr><td colSpan="7" className="p-6 text-center text-gray-500">No patients found.</td></tr>
            ) : patients.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-bold text-blue-600">#{p.id}</td>
                <td className="p-3">{p.bookingDate}</td>
                <td className="p-3 font-semibold">{p.patientName}</td>
                <td className="p-3">{p.age} / {p.gender[0]}</td>
                <td className="p-3">{p.doctor || 'Self'}</td>
                <td className="p-3">₹{p.totalAmount - p.discount}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.balance > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    ₹{p.balance}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button 
                    onClick={() => onSelectPatient(p)} 
                    className="bg-green-100 text-green-700 px-3 py-1 rounded font-bold hover:bg-green-200 text-sm"
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