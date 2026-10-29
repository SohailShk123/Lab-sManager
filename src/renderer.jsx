import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Dashboard from './Pages/Dashboard';
import RegistrationForm from './Pages/RegistrationForm';
import PatientList from './Pages/PatientList';
import ResultEntry from './Pages/ResultEntry';
import TestMaster from './Pages/TestMaster';
import Admin from './Pages/Admin';
import PatientHistoryAndRestore from './components/patienthistory/PatientHistoryAndRestore'; 

function App() {
  // Authentication states
  const [isChecking, setIsChecking] = useState(true);
  const [isActivated, setIsActivated] = useState(false);
  const [labIdInput, setLabIdInput] = useState('');
  const [pin, setPin] = useState("");

  // Navigation states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // App start hote hi check karo ki License active hai ya nahi
  useEffect(() => {
    async function checkLicense() {
      try {
        const config = await window.api.getLabConfig();
        // Agar lab_id hai aur working status true hai, toh direct app kholo
        if (config && config.lab_id && config.working === 'true') {
          setIsActivated(true);
        } else {
          setIsActivated(false);
        }
      } catch (error) {
        console.error("Config load error:", error);
        setIsActivated(false);
      } finally {
        setIsChecking(false);
      }
    }
    checkLicense();
  }, []);

  // Login Handle karne ka function
  const handleActivate = async (e) => {
    e.preventDefault(); // Form submit ko page reload karne se roko
    if(!labIdInput || !pin) { // labIdInput variable fix kiya
      alert("Please enter both Lab ID and PIN!");
      return;
    }

    // Ab hum object bhej rahe hain backend ko
    const response = await window.api.verifyLabId({ labId: labIdInput, pin: pin }); 
    
    if (response.success) {
      alert("Software Activated & Locked to this PC!");
      setIsActivated(true); // Direct app open kar do
    } else {
      alert(response.message); // Error aayega jaise "Incorrect PIN" ya "Locked to another PC"
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('report');
  };

  const navBtnClass = (tabName) => `px-4 py-2 rounded-lg font-bold transition-all ${activeTab === tabName ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:bg-blue-600 hover:text-white'}`;

  // 1. Agar check chal raha hai toh loading dikhao
  if (isChecking) {
    return <div className="flex h-screen items-center justify-center bg-slate-100 text-xl font-bold text-blue-700">Verifying License...</div>;
  }

  // 2. Agar lab active nahi hai, toh sirf Activation Screen dikhao
  if (!isActivated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-96 text-center">
          <h2 className="text-2xl font-black text-blue-700 mb-2">Software Activation</h2>
          <p className="text-gray-500 mb-6 text-sm">Please enter your Lab ID to continue</p>

          <form onSubmit={handleActivate} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="e.g. LAB_001"
              value={labIdInput}
              onChange={(e) => setLabIdInput(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-bold text-center uppercase"
            />
            <input
              type="password" // Security ke liye password type kar diya
              placeholder="Enter 4-Digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength="4"
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-bold text-center mt-2"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md mt-2"
            >
              Verify & Activate
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Agar Lab active hai, toh original App dikhao
  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-900">

      <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 to-blue-600 p-4 shadow-lg flex flex-wrap items-center gap-2 print:hidden">
        <h1 className="text-white font-black text-xl md:text-2xl tracking-wider mr-4 md:mr-8 drop-shadow-md">Patho Manager</h1>
        <button onClick={() => setActiveTab('dashboard')} className={navBtnClass('dashboard')}>Dashboard</button>
        <button onClick={() => setActiveTab('register')} className={navBtnClass('register')}>New Registration</button>
        <button onClick={() => { setActiveTab('list'); setSelectedPatient(null); }} className={navBtnClass('list')}>Patient List</button>
        <button onClick={() => setActiveTab('settings')} className={navBtnClass('settings')}>Test Master</button>
        {/* 2. Naya Navbar Button add kiya */}
        <button onClick={() => setActiveTab('history')} className={navBtnClass('history')}>History & Backup</button>
        <button onClick={() => setActiveTab('admin')} className={navBtnClass('admin')}>Admin</button>
      </nav>

      <div className="p-4">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'register' && <RegistrationForm />}
        {activeTab === 'list' && <PatientList onSelectPatient={handleSelectPatient} />}
        {activeTab === 'report' && selectedPatient && <ResultEntry patient={selectedPatient} onBack={() => setActiveTab('list')} />}
        {activeTab === 'settings' && <TestMaster />}
        {activeTab === 'history' && <PatientHistoryAndRestore />}
        {activeTab === 'admin' && <Admin />}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);