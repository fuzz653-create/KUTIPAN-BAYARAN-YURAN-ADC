import React from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Wallet,
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { useApp } from '../../context/AppContext';
import { exportADCWorkbook } from '../../services/excelService';

export const AnnualReport: React.FC = () => {
  const {
    settings,
    members,
    payments,
    income,
    expenses,
    monthlySummaries,
    totalMembers,
    totalFeeCollected,
    totalIncome,
    totalExpenses,
    totalArrears,
    currentBalance,
    formatMYR,
    selectedYear,
    setSelectedYear,
    availableYears,
  } = useApp();

  const netAnnualSavings = totalIncome - totalExpenses;

  const monthLabels = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

  const annualChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Jumlah Hasil Bulanan (RM)',
        data: monthlySummaries.map((m) => m.totalIncome),
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderWidth: 1.5,
        borderRadius: 4,
      },
      {
        label: 'Jumlah Perbelanjaan Bulanan (RM)',
        data: monthlySummaries.map((m) => m.totalExpense),
        backgroundColor: 'rgba(244, 63, 94, 0.75)',
        borderColor: '#f43f5e',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' } },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#94a3b8' } },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', callback: (v: any) => `RM ${v}` },
      },
    },
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 print:bg-white print:text-black">
      {/* Action Header Card (Hide on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-xl backdrop-blur-sm print:hidden">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Laporan Kewangan Tahunan ADC {selectedYear}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Penyata kewangan tahunan rasmi untuk mesyuarat agung tahunan (AGM) & audit kelab.
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

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Cetak Penyata AGM</span>
          </button>
          <button
            onClick={() => exportADCWorkbook(settings, members, payments, income, expenses)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/30"
          >
            <Download className="w-4 h-4" />
            <span>Muat Turun Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Main Annual Report Container */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Title */}
        <div className="text-center pb-4 border-b border-slate-700 print:border-black">
          <h1 className="text-2xl font-black text-white print:text-black uppercase tracking-wider">
            {settings.clubName}
          </h1>
          <h2 className="text-sm font-bold text-emerald-400 print:text-black mt-1 uppercase tracking-wide">
            LAPORAN KEWANGAN TAHUNAN & PENYATA PENERIMAAN / PEMBAYARAN {selectedYear}
          </h2>
          <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
            Bagi Tahun Berakhir 31 Disember {selectedYear}
          </p>
        </div>

        {/* 6 Key Financial Stats Required */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] font-bold text-slate-400 print:text-gray-600 uppercase">Jumlah Ahli</span>
            <div className="text-lg font-black text-blue-400 print:text-black font-mono-num mt-1">
              {totalMembers} Orang
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] font-bold text-slate-400 print:text-gray-600 uppercase">Jumlah Yuran</span>
            <div className="text-lg font-black text-emerald-400 print:text-black font-mono-num mt-1">
              {formatMYR(totalFeeCollected)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] font-bold text-emerald-400 print:text-black uppercase">Jumlah Hasil</span>
            <div className="text-lg font-black text-emerald-300 print:text-black font-mono-num mt-1">
              {formatMYR(totalIncome)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] font-bold text-rose-400 print:text-black uppercase">Perbelanjaan</span>
            <div className="text-lg font-black text-rose-300 print:text-black font-mono-num mt-1">
              {formatMYR(totalExpenses)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] font-bold text-rose-400 print:text-red-600 uppercase">Jumlah Tunggakan</span>
            <div className="text-lg font-black text-rose-400 print:text-red-600 font-mono-num mt-1">
              {formatMYR(totalArrears)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-800/40 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] font-bold text-teal-300 print:text-black uppercase">Baki Bersih</span>
            <div
              className={`text-lg font-black font-mono-num mt-1 ${
                netAnnualSavings >= 0 ? 'text-teal-300 print:text-black' : 'text-rose-400 print:text-red-600'
              }`}
            >
              {netAnnualSavings >= 0 ? '+' : ''}
              {formatMYR(netAnnualSavings)}
            </div>
          </div>
        </div>

        {/* Annual Chart: Hasil vs Perbelanjaan setiap bulan */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 print:border-gray-300">
          <h3 className="text-xs font-bold text-white print:text-black uppercase tracking-wider mb-3">
            Graf Tahunan: Hasil vs Perbelanjaan Setiap Bulan ({selectedYear})
          </h3>
          <div className="h-64 w-full">
            <Bar data={annualChartData} options={chartOptions} />
          </div>
        </div>

        {/* 12-Month Table Breakdown */}
        <div>
          <h3 className="text-xs font-bold text-white print:text-black uppercase tracking-wider mb-2">
            Penyata Aliran Tunai & Lebihan/Kurangan Bulanan
          </h3>
          <div className="border border-slate-700 rounded-xl overflow-hidden print:border-black">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-300 font-bold border-b border-slate-700 print:bg-gray-100 print:text-black">
                <tr>
                  <th className="py-2.5 px-3">Bulan</th>
                  <th className="py-2.5 px-3 text-right">Kutipan Yuran (RM)</th>
                  <th className="py-2.5 px-3 text-right">Hasil Lain (RM)</th>
                  <th className="py-2.5 px-3 text-right text-emerald-400 print:text-black">Jumlah Hasil (RM)</th>
                  <th className="py-2.5 px-3 text-right text-rose-400 print:text-black">Perbelanjaan (RM)</th>
                  <th className="py-2.5 px-3 text-right">Lebihan / (Kurangan)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                {monthlySummaries.map((m) => (
                  <tr key={m.month} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-semibold text-white print:text-black">{m.monthName}</td>
                    <td className="py-2 px-3 text-right font-mono-num text-slate-300 print:text-black">
                      {formatMYR(m.feeCollection)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-num text-slate-300 print:text-black">
                      {formatMYR(m.otherIncome)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-num font-semibold text-emerald-400 print:text-black">
                      {formatMYR(m.totalIncome)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-num font-semibold text-rose-400 print:text-black">
                      {formatMYR(m.totalExpense)}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-mono-num font-bold ${
                        m.netBalance >= 0 ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-red-600'
                      }`}
                    >
                      {m.netBalance >= 0 ? '+' : ''}
                      {formatMYR(m.netBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900/90 font-extrabold border-t-2 border-slate-700 print:bg-gray-100 print:text-black">
                <tr>
                  <td className="py-3 px-3 uppercase text-slate-200 print:text-black">JUMLAH KESELURUHAN:</td>
                  <td className="py-3 px-3 text-right font-mono-num text-emerald-400 print:text-black">
                    {formatMYR(totalFeeCollected)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-num text-slate-200 print:text-black">
                    {formatMYR(totalIncome - totalFeeCollected)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-num text-emerald-400 print:text-black">
                    {formatMYR(totalIncome)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-num text-rose-400 print:text-black">
                    {formatMYR(totalExpenses)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono-num text-sm ${
                      netAnnualSavings >= 0 ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-red-600'
                    }`}
                  >
                    {netAnnualSavings >= 0 ? '+' : ''}
                    {formatMYR(netAnnualSavings)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Verification Signatures */}
        <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs text-slate-400 print:text-black">
          <div>
            <div className="border-b border-slate-600 print:border-black pb-8 mb-2"></div>
            <p className="font-bold text-white print:text-black">Bendahari Kehormat</p>
            <p className="text-[11px]">{settings.clubName}</p>
          </div>
          <div>
            <div className="border-b border-slate-600 print:border-black pb-8 mb-2"></div>
            <p className="font-bold text-white print:text-black">Juruaudit Dalaman 1</p>
            <p className="text-[11px]">Dilantik pada AGM {selectedYear - 1}</p>
          </div>
          <div>
            <div className="border-b border-slate-600 print:border-black pb-8 mb-2"></div>
            <p className="font-bold text-white print:text-black">Juruaudit Dalaman 2</p>
            <p className="text-[11px]">Dilantik pada AGM {selectedYear - 1}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
