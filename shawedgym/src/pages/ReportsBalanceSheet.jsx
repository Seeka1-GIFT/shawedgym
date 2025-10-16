import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api.js';
import { Download, FileText, Calendar } from 'lucide-react';

const currency = (n) => `$${(Number(n)||0).toLocaleString()}`;

const ReportsBalanceSheet = () => {
  const today = new Date().toISOString().slice(0,10);
  const [start, setStart] = useState(new Date(new Date().getFullYear(),0,1).toISOString().slice(0,10));
  const [end, setEnd] = useState(today);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true); setError('');
      const res = await apiService.getBalanceSheet({ start, end });
      setData(res?.data || res);
    } catch (e) {
      setError(e?.message || 'Failed to load balance sheet');
      setData(null);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onExport = async (format) => {
    try {
      const res = await apiService.exportBalanceSheet({ start, end, format });
      const blob = new Blob([res.data], { type: format === 'csv' ? 'text/csv' : 'text/html' });
      const url = URL.createObjectURL(blob);
      if (format === 'csv') {
        const a = document.createElement('a'); a.href = url; a.download = `balance_sheet_${start}_to_${end}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      } else {
        const w = window.open(url, '_blank');
        const done = () => { try { w.focus(); w.print(); } catch {} setTimeout(() => { try { w.close(); URL.revokeObjectURL(url); } catch {} }, 400); };
        if (w) { w.onload = done; setTimeout(done, 800); }
      }
    } catch (e) { console.error('Export failed', e); }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Balance Sheet</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Real-time financial position for the selected period</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onExport('csv')} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"><Download className="w-4 h-4"/>CSV</button>
          <button onClick={() => onExport('pdf')} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2"><FileText className="w-4 h-4"/>PDF</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-600 dark:text-gray-300">From</span>
            <input type="date" value={start} onChange={(e)=>setStart(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
          </div>
          <div className="flex items-center gap-2"><span className="text-sm text-gray-600 dark:text-gray-300">To</span>
            <input type="date" value={end} onChange={(e)=>setEnd(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
          </div>
          <button onClick={load} className="px-4 py-2 bg-gray-900 dark:bg-gray-600 text-white rounded-lg">Apply</button>
        </div>
      </div>

      {loading && (<div className="p-6 text-center text-gray-600 dark:text-gray-300">Loading...</div>)}
      {error && (<div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg mb-4">{error}</div>)}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Assets</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Cash</span><span className="font-medium">{currency(data.sections.assets.cash)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Receivables</span><span className="font-medium">{currency(data.sections.assets.receivables)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Fixed Assets</span><span className="font-medium">{currency(data.sections.assets.fixedAssets)}</span></div>
              <div className="flex justify-between border-t pt-2"><span className="font-semibold">Total Assets</span><span className="font-bold">{currency(data.sections.assets.total)}</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Liabilities</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Loans</span><span className="font-medium">{currency(data.sections.liabilities.loans)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Payables</span><span className="font-medium">{currency(data.sections.liabilities.payables)}</span></div>
              <div className="flex justify-between border-t pt-2"><span className="font-semibold">Total Liabilities</span><span className="font-bold">{currency(data.sections.liabilities.total)}</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Equity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Opening Equity</span><span className="font-medium">{currency(data.sections.equity.openingEquity)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Retained Earnings</span><span className="font-medium">{currency(data.sections.equity.retainedEarnings)}</span></div>
              <div className="flex justify-between border-t pt-2"><span className="font-semibold">Total Equity</span><span className="font-bold">{currency(data.sections.equity.total)}</span></div>
            </div>
            <div className={`mt-4 text-sm ${data.check ? 'text-green-600' : 'text-red-600'}`}>
              {data.check ? 'Balanced: Assets = Liabilities + Equity' : 'Not Balanced'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ReportsBalanceSheet };


