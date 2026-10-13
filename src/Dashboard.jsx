import React, { useState, useEffect } from 'react';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayPatients: 0,
    totalRevenue: 0,
    totalPending: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await window.api.getBookings();
        setRecentBookings(data.slice(0, 5)); // Sirf latest 5 bookings dikhayenge

        const today = new Date().toISOString().split('T')[0];
        let tPatients = data.length;
        let todayP = 0;
        let tRevenue = 0;
        let tPending = 0;

        data.forEach(booking => {
          tRevenue += (booking.totalAmount - booking.discount);
          tPending += booking.balance;
          if (booking.bookingDate === today) {
            todayP += 1;
          }
        });

        setStats({
          totalPatients: tPatients,
          todayPatients: todayP,
          totalRevenue: tRevenue,
          totalPending: tPending
        });

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-8 print:hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Lab Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here is your business overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Today's Patients</p>
          <p className="text-4xl font-black text-slate-800">{stats.todayPatients}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Patients</p>
          <p className="text-4xl font-black text-slate-800">{stats.totalPatients}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Net Revenue</p>
          <p className="text-4xl font-black text-green-600">₹{stats.totalRevenue}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Pending Balance</p>
          <p className="text-4xl font-black text-red-600">₹{stats.totalPending}</p>
        </div>
      </div>

      {/* Quick Actions & Recent Patients */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Recent Registrations</h2>
            <button onClick={() => onNavigate('list')} className="text-blue-600 font-bold hover:underline text-sm">View All</button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Patient Name</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Balance</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr><td colSpan="4" className="p-4 text-center text-slate-400">No recent patients.</td></tr>
              ) : recentBookings.map(p => (
                <tr key={p.id} className="border-b border-slate-50">
                  <td className="p-3 font-bold text-blue-600">#{p.id}</td>
                  <td className="p-3 font-semibold text-slate-800">{p.patientName}</td>
                  <td className="p-3">₹{p.totalAmount - p.discount}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.balance > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      ₹{p.balance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-center">
          <h2 className="text-xl font-bold mb-6 text-slate-100">Quick Actions</h2>
          <button onClick={() => onNavigate('register')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mb-4 shadow-md transition-all">
            + New Registration
          </button>
          <button onClick={() => onNavigate('settings')} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl shadow-md transition-all">
            ⚙️️ Test Master (Settings)
          </button>
        </div>
      </div>
    </div>
  );
}