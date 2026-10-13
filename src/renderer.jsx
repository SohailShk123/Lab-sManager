import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Dashboard from './Dashboard';
import RegistrationForm from './RegistrationForm';
import PatientList from './PatientList';
import ResultEntry from './ResultEntry';
import TestMaster from './TestMaster';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('report');
  };

  // Common button classes for Navbar
  const navBtnClass = (tabName) => `px-4 py-2 rounded-lg font-bold transition-all ${activeTab === tabName ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:bg-blue-600 hover:text-white'}`;

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-900">
      
      {/* 🚀 SENIOR FIX: Added sticky, top-0, aur z-50 yahan par */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 to-blue-600 p-4 shadow-lg flex items-center gap-2 print:hidden">
        <h1 className="text-white font-black text-2xl tracking-wider mr-8 drop-shadow-md">Patho Manager</h1>
        <button onClick={() => setActiveTab('dashboard')} className={navBtnClass('dashboard')}>Dashboard</button>
        <button onClick={() => setActiveTab('register')} className={navBtnClass('register')}>New Registration</button>
        <button onClick={() => { setActiveTab('list'); setSelectedPatient(null); }} className={navBtnClass('list')}>Patient List</button>
        <button onClick={() => setActiveTab('settings')} className={navBtnClass('settings')}>Test Master</button>
      </nav>

      <div className="p-4">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'register' && <RegistrationForm />}
        {activeTab === 'list' && <PatientList onSelectPatient={handleSelectPatient} />}
        {activeTab === 'report' && selectedPatient && <ResultEntry patient={selectedPatient} onBack={() => setActiveTab('list')} />}
        {activeTab === 'settings' && <TestMaster />}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);