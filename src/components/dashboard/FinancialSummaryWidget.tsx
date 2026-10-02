import React from 'react';
import { DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FinancialSummaryWidget: React.FC = () => {
  const {
    settings,
    totalFeeCollected,
    totalOtherIncome,
    totalIncome,
    totalExpenses,
    currentBalance,
    monthlySummaries,
    formatMYR,
    selectedYear,
    activeYearOpeningBalance,
  } = useApp();

  const netSavings = totalIncome - totalExpenses;

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Ringkasan Kewangan ADC (Financial Summary {selectedYear})
            </h3>
            <p className="text-xs text-slate-400">
              Formula rasmi pengiraan baki tunai & aliran masuk/keluar bagi tahun {selectedYear}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Formula Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/70">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Baki Awal {selectedYear}</div>
          <div className="text-lg font-black text-slate-200 font-mono-num mt-1">
            {formatMYR(activeYearOpeningBalance)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Baki bawa ke hadapan</div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
          <div className="text-[11px] font-bold text-emerald-400 uppercase flex items-center justify-between">
            <span>Jumlah Hasil</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg font-black text-emerald-300 font-mono-num mt-1">
            {formatMYR(totalIncome)}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">
            Yuran ({formatMYR(totalFeeCollected)}) + Lain ({formatMYR(totalOtherIncome)})
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40">
          <div className="text-[11px] font-bold text-rose-400 uppercase flex items-center justify-between">
            <span>Jumlah Perbelanjaan</span>
            <ArrowDownRight className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg font-black text-rose-300 font-mono-num mt-1">
            {formatMYR(totalExpenses)}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-1">Semua perbelanjaan operasi ADC</div>
        </div>

        <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-700/50">
          <div className="text-[11px] font-bold text-teal-300 uppercase flex items-center justify-between">
            <span>Baki Bersih Semasa</span>
            <Wallet className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-lg font-black text-teal-300 font-mono-num mt-1">
            {formatMYR(currentBalance)}
          </div>
          <div className="text-[10px] text-teal-400/80 mt-1">
            Lebihan/Kurangan: {netSavings >= 0 ? '+' : ''}
            {formatMYR(netSavings)}
          </div>
        </div>
      </div>

      {/* Cash Flow Bulanan Table (as requested in Section 6) */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-400" />
          Jadual Aliran Tunai Bulanan (Cash Flow Bulanan {selectedYear})
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-700/80 rounded-xl overflow-hidden">
            <thead className="bg-slate-900/80 text-slate-300 font-bold border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Bulan</th>
                <th className="py-2.5 px-3 text-right">Kutipan Yuran (RM)</th>
                <th className="py-2.5 px-3 text-right">Hasil Lain (RM)</th>
                <th className="py-2.5 px-3 text-right text-emerald-400">Jumlah Hasil (RM)</th>
                <th className="py-2.5 px-3 text-right text-rose-400">Perbelanjaan (RM)</th>
                <th className="py-2.5 px-3 text-right">Baki Bersih (RM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {monthlySummaries.map((m) => (
                <tr key={m.month} className="hover:bg-slate-800/60 transition">
                  <td className="py-2 px-3 font-semibold text-white">{m.monthName}</td>
                  <td className="py-2 px-3 text-right font-mono-num text-slate-300">
                    {m.feeCollection > 0 ? formatMYR(m.feeCollection) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono-num text-slate-300">
                    {m.otherIncome > 0 ? formatMYR(m.otherIncome) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono-num font-semibold text-emerald-400">
                    {formatMYR(m.totalIncome)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono-num font-semibold text-rose-400">
                    {formatMYR(m.totalExpense)}
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-mono-num font-bold ${
                      m.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {m.netBalance >= 0 ? '+' : ''}
                    {formatMYR(m.netBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
