import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Printer,
  Download,
  FileSpreadsheet,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportADCWorkbook } from '../../services/excelService';

export const MonthlyReport: React.FC = () => {
  const {
    monthlySummaries,
    payments,
    income,
    expenses,
    settings,
    members,
    formatMYR,
    selectedYear,
    setSelectedYear,
    availableYears,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  const monthNames = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
  ];

  const currentSummary = useMemo(() => {
    return (
      monthlySummaries.find((m) => m.month === selectedMonth) || {
        month: selectedMonth,
        monthName: monthNames[selectedMonth - 1],
        feeCollection: 0,
        otherIncome: 0,
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        payingMembersCount: 0,
        arrearsMembersCount: 0,
      }
    );
  }, [monthlySummaries, selectedMonth, monthNames]);

  // Breakdown of income in this month
  const monthIncomeList = useMemo(() => {
    return income.filter((i) => {
      const d = new Date(i.date);
      return d.getMonth() + 1 === selectedMonth;
    });
  }, [income, selectedMonth]);

  // Breakdown of expenses in this month
  const monthExpenseList = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === selectedMonth;
    });
  }, [expenses, selectedMonth]);

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Export CSV for this month
  const handleExportCSV = () => {
    const lines = [
      `LAPORAN KEWANGAN BULANAN - ${monthNames[selectedMonth - 1].toUpperCase()} ${selectedYear}`,
      `KELAB: ${settings.clubName}`,
      '',
      `Jumlah Kutipan Yuran Bulanan,${currentSummary.feeCollection.toFixed(2)}`,
      `Jumlah Hasil Lain-Lain,${currentSummary.otherIncome.toFixed(2)}`,
      `JUMLAH HASIL KESELURUHAN,${currentSummary.totalIncome.toFixed(2)}`,
      `JUMLAH PERBELANJAAN,${currentSummary.totalExpense.toFixed(2)}`,
      `BAKI BERSIH BULANAN,${currentSummary.netBalance.toFixed(2)}`,
      `Bilangan Ahli Membayar,${currentSummary.payingMembersCount}`,
      `Bilangan Ahli Tertunggak,${currentSummary.arrearsMembersCount}`,
      '',
      'SENARAI HASIL BULAN INI',
      'Tarikh,ID,Kategori,Butiran,Amaun (RM)',
      ...monthIncomeList.map(
        (i) => `${i.date},${i.trxId},${i.category},"${i.description.replace(/"/g, '""')}",${i.amount.toFixed(2)}`
      ),
      '',
      'SENARAI PERBELANJAAN BULAN INI',
      'Tarikh,ID,Kategori,Butiran,Amaun (RM),Penerima',
      ...monthExpenseList.map(
        (e) => `${e.date},${e.trxId},${e.category},"${e.description.replace(/"/g, '""')}",${e.amount.toFixed(2)},"${e.recipient}"`
      ),
    ];

    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LAPORAN_ADC_${monthNames[selectedMonth - 1]}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 print:bg-white print:text-black print:p-0">
      {/* Header Card (Hide on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-xl backdrop-blur-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-400" />
              Laporan Kewangan Bulanan ADC {selectedYear}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Penyata hasil, perbelanjaan, kutipan yuran dan baki bersih mengikut bulan.
          </p>
        </div>

        {/* Action Export Buttons */}
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
            <span>Cetak Laporan / PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportADCWorkbook(settings, members, payments, income, expenses)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md shadow-emerald-900/30"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Month Selection Tabs (Hide on print) */}
      <div className="bg-slate-800/60 p-2 rounded-2xl border border-slate-700/60 overflow-x-auto print:hidden">
        <div className="flex items-center gap-1.5 min-w-max">
          {monthNames.map((name, idx) => {
            const mNum = idx + 1;
            const isSelected = selectedMonth === mNum;
            return (
              <button
                key={mNum}
                onClick={() => setSelectedMonth(mNum)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Printable Report Sheet Layout */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Report Official Header */}
        <div className="text-center pb-4 border-b border-slate-700 print:border-black">
          <h1 className="text-xl sm:text-2xl font-black text-white print:text-black uppercase tracking-wider">
            {settings.clubName}
          </h1>
          <h2 className="text-sm font-bold text-emerald-400 print:text-black mt-1 uppercase tracking-wide">
            LAPORAN PENYATA KEWANGAN BULAN {monthNames[selectedMonth - 1]} {selectedYear}
          </h2>
          <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
            Tarikh Dijana: {new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* 6 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] font-bold text-slate-400 print:text-gray-600 uppercase">Kutipan Yuran</span>
            <div className="text-base font-extrabold text-emerald-400 print:text-black font-mono-num mt-1">
              {formatMYR(currentSummary.feeCollection)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] font-bold text-slate-400 print:text-gray-600 uppercase">Hasil Lain</span>
            <div className="text-base font-extrabold text-teal-400 print:text-black font-mono-num mt-1">
              {formatMYR(currentSummary.otherIncome)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] font-bold text-emerald-400 print:text-black uppercase">Jumlah Hasil</span>
            <div className="text-base font-black text-emerald-300 print:text-black font-mono-num mt-1">
              {formatMYR(currentSummary.totalIncome)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] font-bold text-rose-400 print:text-black uppercase">Perbelanjaan</span>
            <div className="text-base font-black text-rose-300 print:text-black font-mono-num mt-1">
              {formatMYR(currentSummary.totalExpense)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] font-bold text-slate-400 print:text-gray-600 uppercase">Baki Bersih Bulan</span>
            <div
              className={`text-base font-black font-mono-num mt-1 ${
                currentSummary.netBalance >= 0 ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-red-600'
              }`}
            >
              {currentSummary.netBalance >= 0 ? '+' : ''}
              {formatMYR(currentSummary.netBalance)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] font-bold text-slate-400 print:text-gray-600 uppercase">Status Bayaran</span>
            <div className="text-xs font-bold text-slate-200 print:text-black mt-1">
              <span className="text-emerald-400 print:text-black">{currentSummary.payingMembersCount} Bayar</span> •{' '}
              <span className="text-rose-400 print:text-black">{currentSummary.arrearsMembersCount} Tunggak</span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown for Month */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Income Details */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-emerald-400 print:text-black uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Pecahan Terimaan / Hasil Bulan {monthNames[selectedMonth - 1]}
            </h3>
            <div className="border border-slate-700 rounded-xl overflow-hidden print:border-black">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-700 print:bg-gray-100 print:text-black">
                  <tr>
                    <th className="py-2 px-3">Butiran</th>
                    <th className="py-2 px-3">Kategori</th>
                    <th className="py-2 px-3 text-right">Amaun (RM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-black">
                      Kutipan Yuran Ahli ({currentSummary.payingMembersCount} Orang)
                    </td>
                    <td className="py-2 px-3 text-slate-400 print:text-black">YURAN AHLI</td>
                    <td className="py-2 px-3 text-right font-mono-num font-bold text-emerald-400 print:text-black">
                      {formatMYR(currentSummary.feeCollection)}
                    </td>
                  </tr>
                  {monthIncomeList.map((inc) => (
                    <tr key={inc.id}>
                      <td className="py-2 px-3 text-slate-200 print:text-black">{inc.description}</td>
                      <td className="py-2 px-3 text-slate-400 print:text-black">{inc.category}</td>
                      <td className="py-2 px-3 text-right font-mono-num font-bold text-emerald-400 print:text-black">
                        {formatMYR(inc.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expense Details */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-rose-400 print:text-black uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              Pecahan Perbelanjaan Bulan {monthNames[selectedMonth - 1]}
            </h3>
            <div className="border border-slate-700 rounded-xl overflow-hidden print:border-black">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-700 print:bg-gray-100 print:text-black">
                  <tr>
                    <th className="py-2 px-3">Butiran</th>
                    <th className="py-2 px-3">Penerima</th>
                    <th className="py-2 px-3 text-right">Amaun (RM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                  {monthExpenseList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400 print:text-gray-500">
                        Tiada perbelanjaan direkodkan untuk bulan ini.
                      </td>
                    </tr>
                  ) : (
                    monthExpenseList.map((exp) => (
                      <tr key={exp.id}>
                        <td className="py-2 px-3 text-slate-200 print:text-black">{exp.description}</td>
                        <td className="py-2 px-3 text-slate-400 print:text-black">{exp.recipient}</td>
                        <td className="py-2 px-3 text-right font-mono-num font-bold text-rose-400 print:text-black">
                          {formatMYR(exp.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Signature lines for official print */}
        <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs text-slate-400 print:text-black">
          <div>
            <div className="border-b border-slate-600 print:border-black pb-8 mb-2"></div>
            <p className="font-bold text-white print:text-black">Disediakan Oleh:</p>
            <p className="text-[11px]">Bendahari Kehormat ADC</p>
          </div>
          <div>
            <div className="border-b border-slate-600 print:border-black pb-8 mb-2"></div>
            <p className="font-bold text-white print:text-black">Disahkan Oleh:</p>
            <p className="text-[11px]">Setiausaha Kehormat ADC</p>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-slate-600 print:border-black pb-8 mb-2"></div>
            <p className="font-bold text-white print:text-black">Diluluskan Oleh:</p>
            <p className="text-[11px]">Presiden ADC</p>
          </div>
        </div>
      </div>
    </div>
  );
};
