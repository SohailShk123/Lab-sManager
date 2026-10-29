import React, { useState, useEffect } from 'react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  
  // Existing Lab Config state
  const [config, setConfig] = useState({
    labName: '',
    labAddress: '',
    phone: '', 
    email: '',
    marginTop: '32',
    marginBottom: '10'
  });

  // 👇 NAYE STATES (Cloud Backup ke liye)
  const [cloudCount, setCloudCount] = useState(0);
  const [downloadLimit, setDownloadLimit] = useState(1000);
  const [isDownloading, setIsDownloading] = useState(false);

  const api = window.electronAPI || window.api;

  useEffect(() => {
    if (isAuthenticated && api?.getConfig) {
      api.getConfig().then(data => {
        if (data.labName) setConfig({ ...config, ...data });
      });

      // 👇 Jaise hi Admin khule, Cloud se data ka count mangwa lo
      if (api?.checkCloudBackupSize) {
        api.checkCloudBackupSize().then(res => {
          if (res.success) setCloudCount(res.totalRecords);
        });
      }
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === 'unknown_2169') setIsAuthenticated(true);
    else alert('Incorrect PIN!');
  };

  const handleSave = async () => {
    if (api?.saveConfig) {
      await api.saveConfig(config);
      alert('Settings Saved Successfully!');
    }
  };

  // 👇 NAYA FUNCTION (Download Start Karne Ke Liye)
  const handleDownload = async () => {
    if (api?.restoreFromCloud) {
      setIsDownloading(true);
      const res = await api.restoreFromCloud(downloadLimit);
      setIsDownloading(false);
      alert(res.message); // Jaise: "Successfully restored 1000 records!"
    } else {
      alert("Error: Backend connection missing.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center mt-20">
        <h2 className="text-xl font-bold mb-4">Admin Setup (Locked)</h2>
        <form onSubmit={handleLogin} className="flex gap-2">
          <input 
            type="password" 
            placeholder="Enter Admin PIN" 
            className="border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold cursor-pointer">Unlock</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      
      {/* 🟢 1. EXISTING BLOCK: Lab Print Settings */}
      <div className="bg-white p-6 rounded shadow border">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Lab Print Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block font-semibold">Lab Name (For PDF)</label>
            <input type="text" className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
              value={config.labName} onChange={e => setConfig({...config, labName: e.target.value})} placeholder="e.g. Prime Plus Diagnostics" />
          </div>
          
          <div>
            <label className="block font-semibold">Lab Address</label>
            <input type="text" className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
              value={config.labAddress} onChange={e => setConfig({...config, labAddress: e.target.value})} placeholder="e.g. 123 Health Street, Pune" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Phone Number</label>
              <input type="text" className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
                value={config.phone || ''} onChange={e => setConfig({...config, phone: e.target.value})} placeholder="e.g. +91 98765 43210" />
            </div>
            <div>
              <label className="block font-semibold">Email ID</label>
              <input type="email" className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
                value={config.email || ''} onChange={e => setConfig({...config, email: e.target.value})} placeholder="e.g. lab@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Letterhead Top Margin (mm)</label>
              <input type="number" className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
                value={config.marginTop} onChange={e => setConfig({...config, marginTop: e.target.value})} />
            </div>
            <div>
              <label className="block font-semibold">Letterhead Bottom Margin (mm)</label>
              <input type="number" className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
                value={config.marginBottom} onChange={e => setConfig({...config, marginBottom: e.target.value})} />
            </div>
          </div>

          <button onClick={handleSave} className="mt-4 bg-green-600 text-white px-6 py-2 rounded font-bold cursor-pointer hover:bg-green-700 transition">
            Save Settings
          </button>
        </div>
      </div>

      {/* 🔵 2. NAYA BLOCK: Cloud Backup Restore */}
      <div className="bg-white p-6 rounded shadow border">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">☁️ Cloud Data Recovery</h2>
        
        <p className="mb-4 text-gray-700">
          Total Records Available on Cloud: <span className="font-bold text-blue-600 text-lg">{cloudCount}</span>
        </p>

        {cloudCount > 0 ? (
          <div className="bg-blue-50 p-4 rounded border border-blue-100 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="block font-semibold mb-1">Select records to download:</label>
              <select 
                value={downloadLimit} 
                onChange={(e) => setDownloadLimit(Number(e.target.value))}
                className="w-full p-2 border rounded outline-none bg-white"
                disabled={isDownloading}
              >
                <option value={1000}>Latest 1,000 Records</option>
                <option value={5000}>Latest 5,000 Records</option>
                <option value={10000}>Latest 10,000 Records</option>
                <option value={cloudCount}>Download All ({cloudCount})</option>
              </select>
            </div>
            
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className={`px-6 py-2 rounded font-bold text-white transition mt-6 md:mt-0 ${
                isDownloading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {isDownloading ? 'Downloading...' : 'Start Download'}
            </button>
          </div>
        ) : (
          <div className="p-3 bg-yellow-50 text-yellow-700 rounded font-semibold text-center border border-yellow-200">
            No backup found on the cloud yet. Please run the app to auto-sync data.
          </div>
        )}
      </div>

    </div>
  );
}