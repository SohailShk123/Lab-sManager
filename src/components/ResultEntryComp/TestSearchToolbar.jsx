import React from 'react';
import { TEST_CATALOG } from '../../testCatalog';

export default function TestSearchToolbar({ selectedTests, setSelectedTests, searchQuery, setSearchQuery }) {
  
  // 1. Safety Check: Guarantee ki selectedTests hamesha Array hi ho
  const safeSelected = Array.isArray(selectedTests) ? selectedTests : typeof selectedTests === 'string' ? [selectedTests] : [];

  const filteredCatalog = Object.keys(TEST_CATALOG).filter(key => 
    (key.toLowerCase().includes(searchQuery.toLowerCase()) || 
     TEST_CATALOG[key].name.toLowerCase().includes(searchQuery.toLowerCase())) && 
    !safeSelected.includes(key)
  );

  // 2. Smart Add Function: Hamesha latest list me add karega
  const handleAddTest = (key) => {
    setSelectedTests(prev => {
      const prevArr = Array.isArray(prev) ? prev : typeof prev === 'string' ? [prev] : [];
      if (!prevArr.includes(key)) {
        return [...prevArr, key]; // Purane tests ke aage naya test lagao
      }
      return prevArr;
    });
    setSearchQuery(''); // Search bar clear karo
  };

  // 3. Smart Remove Function
  const handleRemoveTest = (key) => {
    setSelectedTests(prev => {
      const prevArr = Array.isArray(prev) ? prev : typeof prev === 'string' ? [prev] : [];
      return prevArr.filter(t => t !== key);
    });
  };

  return (
    <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded-lg mb-2 shrink-0 flex flex-col gap-2.5 shadow-sm">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider mr-1">Booked Tests:</span>
        {safeSelected.map((key) => (
          <div key={key} className="flex items-center bg-blue-600 text-white px-2.5 py-1 rounded shadow-sm text-[11px] font-bold">
            <span>✓ {key}</span>
            <button 
              onClick={() => handleRemoveTest(key)} 
              className="ml-2 hover:bg-rose-500 rounded-full w-4 h-4 flex items-center justify-center text-[9px] bg-blue-800/50 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-sm">
        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs">🔍</span>
        <input 
          type="text" 
          placeholder="Search to add a missed test..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-blue-300 text-slate-800 text-xs rounded-md pl-8 pr-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        {searchQuery && (
          <div className="absolute top-8 left-0 w-full bg-white border border-slate-200 shadow-2xl max-h-48 overflow-y-auto z-50 rounded-lg divide-y">
            {filteredCatalog.map(key => (
              <div 
                key={key} 
                onClick={() => handleAddTest(key)} 
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 cursor-pointer"
              >
                + {TEST_CATALOG[key].name} ({key})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}