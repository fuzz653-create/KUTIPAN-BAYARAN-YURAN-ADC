import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Filter, ArrowUpRight, ArrowDownRight, Download, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LedgerItem } from '../../types';

export const TransactionLedger: React.FC = () => {
  const { ledgerItems, formatMYR, formatDate, currentBalance, settings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'HASIL' | 'PERBELANJAAN'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Extract all unique categories
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    ledgerItems.forEach((item) => set.add(item.category));
    return Array.from(set).sort();
  }, [ledgerItems]);

  // Filtered ledger items
  const filteredItems = useMemo(() => {
    return ledgerItems.filter((item) => {
      const matchSearch =
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.trxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.recipientOrOfficer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = typeFilter === 'ALL' || item.type === typeFilter;
      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

      let matchDate = true;
      if (startDate && new Date(item.date) < new Date(startDate)) matchDate = false;
      if (endDate && new Date(item.date) > new Date(endDate)) matchDate = false;

      return matchSearch && matchType && matchCategory && matchDate;
    });
  }, [ledgerItems, searchQuery, typeFilter, categoryFilter, startDate, endDate]);

  const totalIn = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + item.incomeAmount, 0);
  }, [filteredItems]);

  const totalOut = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + item.expenseAmount, 0);
  }, [filteredItems]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Tarikh', 'ID Transaksi', 'Jenis', 'Kategori', 'Butiran', 'Masuk (RM)', 'Keluar (RM)', 'Baki (RM)', 'Penerima / Pegawai', 'Catatan'];
    const rows = filteredItems.map((item) => [
      item.date,
      item.trxId,
      item.type,
      item.category,
      `"${item.description.replace(/"/g, '""')}"`,
      item.incomeAmount > 0 ? item.incomeAmount.toFixed(2) : '0.00',
      item.expenseAmount > 0 ? item.expenseAmount.toFixed(2) : '0.00',
      item.runningBalance.toFixed(2),
      `"${item.recipientOrOfficer.replace(/"/g, '""')}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LEJAR_TRANSAKSI_ADC_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Buku Lejar Transaksi Kewangan ADC (Transaction Ledger)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Penyata lejar komprehensif menggabungkan semua hasil, perbelanjaan dan baki bergerak secara automatik.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Lejar (CSV)</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari butiran, ID atau nama..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Jenis Transaksi</option>
              <option value="HASIL">Hanya HASIL (Masuk)</option>
              <option value="PERBELANJAAN">Hanya PERBELANJAAN (Keluar)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Kategori</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-700/60 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Hingga:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {(startDate || endDate || typeFilter !== 'ALL' || categoryFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setTypeFilter('ALL');
                setCategoryFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold ml-auto"
            >
              Set Semula Penapis
            </button>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-3">Tarikh</th>
                <th className="py-3 px-3">ID Transaksi</th>
                <th className="py-3 px-3">Jenis</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Butiran</th>
                <th className="py-3 px-3 text-right text-emerald-400">Masuk (RM)</th>
                <th className="py-3 px-3 text-right text-rose-400">Keluar (RM)</th>
                <th className="py-3 px-3 text-right text-teal-300">Baki (RM)</th>
                <th className="py-3 px-3">Penerima / Pegawai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tiada rekod transaksi dijumpai mengikut tapisan.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isIncome = item.type === 'HASIL';
                  return (
                    <tr key={item.id} className="hover:bg-slate-700/40 transition">
                      <td className="py-3 px-3 text-slate-300 font-mono-num whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400 font-semibold whitespace-nowrap">
                        {item.trxId}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-medium">
                        {item.category}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{item.description}</div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-400 italic">{item.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num font-bold text-emerald-400 whitespace-nowrap">
                        {item.incomeAmount > 0 ? `+${formatMYR(item.incomeAmount)}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num font-bold text-rose-400 whitespace-nowrap">
                        {item.expenseAmount > 0 ? `-${formatMYR(item.expenseAmount)}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num font-extrabold text-teal-300 whitespace-nowrap">
                        {formatMYR(item.runningBalance)}
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-[11px]">
                        {item.recipientOrOfficer}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-slate-900/80 border-t border-slate-700 text-slate-300 font-bold">
              <tr>
                <td colSpan={5} className="py-3 px-3 text-right uppercase text-[11px] text-slate-400">
                  Jumlah Transaksi Dipaparkan ({filteredItems.length}):
                </td>
                <td className="py-3 px-3 text-right font-mono-num text-emerald-400 font-extrabold">
                  +{formatMYR(totalIn)}
                </td>
                <td className="py-3 px-3 text-right font-mono-num text-rose-400 font-extrabold">
                  -{formatMYR(totalOut)}
                </td>
                <td className="py-3 px-3 text-right font-mono-num text-teal-300 font-extrabold text-sm">
                  {formatMYR(currentBalance)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
