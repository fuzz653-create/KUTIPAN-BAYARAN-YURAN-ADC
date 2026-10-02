import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  ArrowUpRight,
  AlertTriangle,
  Target,
  Trophy,
  Layers,
  Calendar,
  DollarSign,
  PieChart,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Income, IncomeCategory } from '../../types';
import { IncomeModal } from './IncomeModal';

export const IncomeList: React.FC = () => {
  const { income, deleteIncome, formatMYR, formatDate, totalIncome, selectedYear, setSelectedYear, availableYears } = useApp();
  const { canEditFinance, canDeleteFinance } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | IncomeCategory>('ALL');
  const [periodPreset, setPeriodPreset] = useState<'ALL' | 'JAN_14APR'>('JAN_14APR');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-04-14');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);

  const categories: IncomeCategory[] = [
    'GAME / PERLAWANAN',
    'SEWAAN',
    'YURAN AHLI',
    'PERTANDINGAN',
    'SUMBANGAN',
    'SPONSOR',
    'JUALAN',
    'LAIN-LAIN',
  ];

  // Set preset handler
  const handleSelectPreset = (preset: 'ALL' | 'JAN_14APR') => {
    setPeriodPreset(preset);
    if (preset === 'JAN_14APR') {
      setStartDate('2026-01-01');
      setEndDate('2026-04-14');
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  // Filtered income based on dates, search, and category
  const filteredIncome = useMemo(() => {
    return income.filter((item) => {
      const matchSearch =
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.trxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.officer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;

      let matchDate = true;
      if (startDate && new Date(item.date) < new Date(startDate)) matchDate = false;
      if (endDate && new Date(item.date) > new Date(endDate)) matchDate = false;

      return matchSearch && matchCat && matchDate;
    });
  }, [income, searchQuery, selectedCategory, startDate, endDate]);

  // Statistics calculation for the filtered period
  const stats = useMemo(() => {
    let totalGame = 0;
    let totalSewaan = 0;
    let totalYuran = 0;
    let totalOther = 0;
    let totalAll = 0;

    let countGame = 0;
    let countSewaan = 0;

    filteredIncome.forEach((item) => {
      totalAll += item.amount;
      if (item.category === 'GAME / PERLAWANAN' || item.category === 'PERTANDINGAN') {
        totalGame += item.amount;
        countGame++;
      } else if (item.category === 'SEWAAN') {
        totalSewaan += item.amount;
        countSewaan++;
      } else if (item.category === 'YURAN AHLI') {
        totalYuran += item.amount;
      } else {
        totalOther += item.amount;
      }
    });

    const percentGame = totalAll > 0 ? (totalGame / totalAll) * 100 : 0;
    const percentSewaan = totalAll > 0 ? (totalSewaan / totalAll) * 100 : 0;

    return {
      totalAll,
      totalGame,
      totalSewaan,
      totalYuran,
      totalOther,
      countGame,
      countSewaan,
      percentGame,
      percentSewaan,
    };
  }, [filteredIncome]);

  const handleDelete = async () => {
    if (!incomeToDelete) return;
    await deleteIncome(incomeToDelete.id);
    setIncomeToDelete(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Sumber Hasil ADC & Analisis Game / Sewaan {selectedYear}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pemantauan hasil Game Mingguan, Sewaan Papan Dart/Premis, Yuran Ahli dan Sumbangan sepanjang tahun.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-emerald-400 focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-slate-900 text-white">
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {canEditFinance && (
            <button
              onClick={() => {
                setIncomeToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Hasil Baharu</span>
            </button>
          )}
        </div>
      </div>

      {/* Special Analytical Dashboard: GAME & SEWAAN ADC FOCUS (1 JAN - 14/4/2026) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Filter Period Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Tempoh Analisis Prestasi Hasil:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectPreset('JAN_14APR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                periodPreset === 'JAN_14APR'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-1 ring-emerald-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1 Jan – 14/4/2026 (Tempoh Rasmi)</span>
            </button>

            <button
              onClick={() => handleSelectPreset('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                periodPreset === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-1 ring-emerald-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Sepanjang Tahun {selectedYear}
            </button>
          </div>
        </div>

        {/* 4 Analytical Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {/* 1. Hasil Game / Pertandingan */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                Hasil Game / Pertandingan
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {stats.countGame} Sesi
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono-num">
              {formatMYR(stats.totalGame)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Sumbangan terhadap hasil:</span>
              <span className="text-emerald-400 font-bold font-mono-num">
                {stats.percentGame.toFixed(1)}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, stats.percentGame)}%` }}
              />
            </div>
          </div>

          {/* 2. Hasil Sewaan ADC */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-teal-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Hasil Sewaan Papan / Premis
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold">
                {stats.countSewaan} Sewaan
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono-num">
              {formatMYR(stats.totalSewaan)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Sumbangan terhadap hasil:</span>
              <span className="text-teal-400 font-bold font-mono-num">
                {stats.percentSewaan.toFixed(1)}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full"
                style={{ width: `${Math.min(100, stats.percentSewaan)}%` }}
              />
            </div>
          </div>

          {/* 3. Hasil Yuran Ahli */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-blue-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Kutipan Yuran Bulanan
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono-num">
              {formatMYR(stats.totalYuran)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Yuran ahli aktif kelab Jan - {periodPreset === 'JAN_14APR' ? '14/4/2026' : 'Dis 2026'}
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${stats.totalAll > 0 ? (stats.totalYuran / stats.totalAll) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* 4. Jumlah Hasil Keseluruhan Tempoh Terpilih */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Jumlah Hasil Tempoh Ini
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {filteredIncome.length} Transaksi
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono-num">
              {formatMYR(stats.totalAll)}
            </div>
            <div className="text-[11px] text-emerald-400/90 mt-1">
              {periodPreset === 'JAN_14APR'
                ? 'Prestasi Rasmi 1 Jan – 14 April 2026'
                : `Prestasi Keseluruhan Tahun ${selectedYear}`}
            </div>
          </div>
        </div>

        {/* Combined Game + Sewaan Highlight Summary */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300">
              Gabungan Hasil <strong>Game Dart + Sewaan ADC</strong> ({periodPreset === 'JAN_14APR' ? '1 Jan - 14/4/2026' : `Tahun ${selectedYear}`}):
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-emerald-300 font-mono-num">
              {formatMYR(stats.totalGame + stats.totalSewaan)}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
              {stats.totalAll > 0
                ? (((stats.totalGame + stats.totalSewaan) / stats.totalAll) * 100).toFixed(1)
                : 0}
              % daripada Keseluruhan Hasil
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari butiran hasil, game, sewaan, no. resit, ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPeriodPreset('ALL');
            }}
            className="w-1/2 px-2 py-1.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white"
            title="Tarikh Mula"
          />
          <span className="text-slate-500">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPeriodPreset('ALL');
            }}
            className="w-1/2 px-2 py-1.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white"
            title="Tarikh Akhir"
          />
        </div>
      </div>

      {/* Income Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-3">Tarikh</th>
                <th className="py-3 px-3">ID Transaksi</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Butiran Sumber Hasil</th>
                <th className="py-3 px-3 text-right text-emerald-400">Jumlah (RM)</th>
                <th className="py-3 px-3">Kaedah Bayaran</th>
                <th className="py-3 px-3">Pegawai / Perekod</th>
                <th className="py-3 px-3 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredIncome.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tiada rekod hasil dijumpai bagi tapisan yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredIncome.map((item) => {
                  const isGame = item.category === 'GAME / PERLAWANAN' || item.category === 'PERTANDINGAN';
                  const isSewaan = item.category === 'SEWAAN';

                  return (
                    <tr key={item.id} className="hover:bg-slate-700/40 transition">
                      <td className="py-3 px-3 text-slate-300 font-mono-num whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400 font-semibold">
                        {item.trxId}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isGame
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : isSewaan
                              ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                              : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{item.description}</div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-400 italic">{item.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num font-bold text-emerald-400 text-sm whitespace-nowrap">
                        +{formatMYR(item.amount)}
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-[11px] whitespace-nowrap">
                        {item.paymentMethod}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">{item.officer}</td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {canEditFinance && (
                            <button
                              onClick={() => {
                                setIncomeToEdit(item);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white transition"
                              title="Kemaskini Hasil"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canDeleteFinance && (
                            <button
                              onClick={() => setIncomeToDelete(item)}
                              className="p-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white transition"
                              title="Padam Hasil (Admin Sahaja)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-slate-900/80 border-t border-slate-700 text-slate-300 font-bold">
              <tr>
                <td colSpan={4} className="py-3 px-3 text-right uppercase text-[11px] text-slate-400">
                  Jumlah Hasil Dipaparkan ({filteredIncome.length} Rekod):
                </td>
                <td className="py-3 px-3 text-right font-mono-num text-emerald-400 font-extrabold text-sm">
                  {formatMYR(stats.totalAll)}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <IncomeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIncomeToEdit(null);
        }}
        incomeToEdit={incomeToEdit}
      />

      {/* Delete Confirmation */}
      {incomeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Sahkan Padam Rekod Hasil</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Adakah anda pasti ingin memadam rekod hasil{' '}
              <strong className="text-white">[{incomeToDelete.trxId}]</strong> bernilai{' '}
              {formatMYR(incomeToDelete.amount)}? Tindakan ini akan mengurangkan baki semasa ADC.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setIncomeToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Ya, Padam Hasil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
