import React, { useState, useEffect } from 'react';

export default function TestMaster() {
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');
  const [editingTest, setEditingTest] = useState(null);
  const [newCost, setNewCost] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const getAPI = () => window.api || window.electronAPI;

  const fetchTests = async () => {
    try {
      const api = getAPI();
      if (api?.getTests) {
        const data = await api.getTests();
        setTests(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch tests", error);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleStartEdit = (t) => {
    setEditingTest(t);
    setNewCost(t.cost || 0);
  };

  const handleCancelEdit = () => {
    setEditingTest(null);
    setNewCost('');
  };

  // 🔒 Sirf Price Update Hoga (Naya test add ya delete karne ka option band)
  const handleUpdateCost = async (e) => {
    e.preventDefault();
    if (!editingTest) return;

    const parsedCost = parseFloat(newCost);
    if (isNaN(parsedCost) || parsedCost < 0) {
      alert("Kripya valid rate enter karein!");
      return;
    }

    try {
      setIsUpdating(true);
      const api = getAPI();
      if (api?.updateTest) {
        await api.updateTest({
          id: editingTest.id,
          name: editingTest.name,
          cost: parsedCost
        });
      }
      setEditingTest(null);
      setNewCost('');
      await fetchTests();
    } catch (error) {
      alert("Rate update failed: " + error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTests = tests.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto my-4 px-4 print:hidden">

      {/* 1. TOP SECURE BANNER & EDIT PANEL */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              🏷️ Diagnostic Price Master (Secured)
            </h2>
            <p className="text-[11px] text-slate-500">
              System catalog is locked. Lab staff can only update test pricing for billing.
            </p>
          </div>
          <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-3 py-1 rounded-full">
            🛡️ Read-Only Catalog
          </span>
        </div>

        {/* Active Edit Strip */}
        {editingTest ? (
          <form onSubmit={handleUpdateCost} className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 flex items-center justify-between gap-4">
            <div className="flex-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Selected Test Profile</span>
              <span className="font-extrabold text-slate-900 text-sm tracking-wide">{editingTest.name}</span>
            </div>

            <div className="w-44">
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">New Rate (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                autoFocus
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                className="w-full bg-white border border-blue-300 rounded px-3 py-1.5 text-sm font-black text-emerald-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                placeholder="0"
                required
              />
            </div>

            <div className="flex gap-2 items-end pt-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm cursor-pointer"
              >
                {isUpdating ? "Saving..." : "Save Rate"}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-200 p-3 rounded-lg text-center">
            Niche di gayi directory me se kisi bhi test ke samne <strong>"Edit Rate"</strong> par click karke uska price update karein. Naye tests sirf developer update ke zariye add kiye jayenge.
          </div>
        )}
      </div>

      {/* 2. PROTECTED TEST DIRECTORY TABLE */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Configured Test Profiles</h3>
            <span className="text-[11px] text-slate-500">Total {tests.length} active profiles</span>
          </div>

          <input
            type="text"
            placeholder="🔍 Search test profile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-y-auto max-h-[440px] border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 text-slate-700 uppercase text-[10.5px] font-bold z-10 shadow-sm">
              <tr className="border-b border-slate-200">
                <th className="py-2.5 px-4 w-16">ID</th>
                <th className="py-2.5 px-4">Test Profile Name</th>
                <th className="py-2.5 px-4 w-36">Current Price</th>
                <th className="py-2.5 px-4 w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-slate-400 italic">
                    Koi test match nahi hua.
                  </td>
                </tr>
              ) : (
                filteredTests.map((t) => (
                  <tr
                    key={t.id}
                    className={`transition-colors ${editingTest?.id === t.id ? 'bg-blue-50/70' : 'hover:bg-slate-50'}`}
                  >
                    <td className="py-2 px-4 text-slate-400 font-bold">#{t.id}</td>
                    <td className="py-2 px-4 font-bold text-slate-800 text-xs">
                      {t.name}
                    </td>
                    <td className="py-2 px-4 font-black text-emerald-700 text-xs">
                      ₹{Number(t.cost || 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(t)}
                        className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white rounded text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Edit Rate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}