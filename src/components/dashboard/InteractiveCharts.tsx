import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useApp } from '../../context/AppContext';
import { TrendingUp, BarChart3, PieChart, DollarSign } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const InteractiveCharts: React.FC = () => {
  const { monthlySummaries, paymentStatusCounts, income, expenses, settings, formatMYR, selectedYear } = useApp();
  const [activeChartTab, setActiveChartTab] = useState<'comparison' | 'fees' | 'cashflow' | 'composition' | 'games_rentals'>('games_rentals');

  const monthLabels = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

  // Data for Game & Sewaan breakdown for selectedYear
  const gameMonthly = monthLabels.map((_, idx) => {
    const mNum = idx + 1;
    return income
      .filter((i) => {
        if (!i.date) return false;
        const d = new Date(i.date);
        return (
          d.getFullYear() === selectedYear &&
          d.getMonth() + 1 === mNum &&
          (i.category === 'GAME / PERLAWANAN' || i.category === 'PERTANDINGAN')
        );
      })
      .reduce((sum, i) => sum + i.amount, 0);
  });

  const sewaanMonthly = monthLabels.map((_, idx) => {
    const mNum = idx + 1;
    return income
      .filter((i) => {
        if (!i.date) return false;
        const d = new Date(i.date);
        return d.getFullYear() === selectedYear && d.getMonth() + 1 === mNum && i.category === 'SEWAAN';
      })
      .reduce((sum, i) => sum + i.amount, 0);
  });

  const q1GameTotal = income
    .filter((i) => {
      if (!i.date) return false;
      const d = new Date(i.date);
      if (d.getFullYear() !== selectedYear) return false;
      if (selectedYear === 2026) {
        return (
          (i.category === 'GAME / PERLAWANAN' || i.category === 'PERTANDINGAN') &&
          i.date <= '2026-04-14' &&
          i.date >= '2026-01-01'
        );
      }
      return i.category === 'GAME / PERLAWANAN' || i.category === 'PERTANDINGAN';
    })
    .reduce((sum, i) => sum + i.amount, 0);

  const q1SewaanTotal = income
    .filter((i) => {
      if (!i.date) return false;
      const d = new Date(i.date);
      if (d.getFullYear() !== selectedYear) return false;
      if (selectedYear === 2026) {
        return i.category === 'SEWAAN' && i.date <= '2026-04-14' && i.date >= '2026-01-01';
      }
      return i.category === 'SEWAAN';
    })
    .reduce((sum, i) => sum + i.amount, 0);

  const gamesRentalsData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Hasil Game / Pertandingan (RM)',
        data: gameMonthly,
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderColor: '#10b981',
        borderWidth: 1.5,
        borderRadius: 4,
      },
      {
        label: 'Hasil Sewaan Papan & Premis (RM)',
        data: sewaanMonthly,
        backgroundColor: 'rgba(45, 212, 191, 0.85)',
        borderColor: '#2dd4bf',
        borderWidth: 1.5,
        borderRadius: 4,
      },
      {
        label: 'Kutipan Yuran Bulanan (RM)',
        data: monthlySummaries.map((m) => m.feeCollection),
        backgroundColor: 'rgba(59, 130, 246, 0.75)',
        borderColor: '#3b82f6',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  // Data for Hasil vs Perbelanjaan
  const comparisonData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Hasil ADC (RM)',
        data: monthlySummaries.map((m) => m.totalIncome),
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Perbelanjaan (RM)',
        data: monthlySummaries.map((m) => m.totalExpense),
        backgroundColor: 'rgba(244, 63, 94, 0.75)',
        borderColor: '#f43f5e',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  // Data for Kutipan Yuran Bulanan
  const feeCollectionData = {
    labels: monthLabels,
    datasets: [
      {
        type: 'line' as const,
        label: 'Kutipan Yuran Bulanan (RM)',
        data: monthlySummaries.map((m) => m.feeCollection),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#0891b2',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
      },
      {
        type: 'bar' as const,
        label: 'Bilangan Ahli Membayar',
        data: monthlySummaries.map((m) => m.payingMembersCount * 20), // Scaled visual
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 4,
      },
    ],
  };

  // Data for Cash Flow & Net Balance
  let cumBalance = settings.openingBalance;
  const cumulativeBalances = monthlySummaries.map((m) => {
    cumBalance += m.netBalance;
    return cumBalance;
  });

  const cashFlowData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Baki Terkumpul (RM)',
        data: cumulativeBalances,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true,
        borderWidth: 2.5,
      },
      {
        label: 'Baki Bersih Bulanan (RM)',
        data: monthlySummaries.map((m) => m.netBalance),
        borderColor: '#f59e0b',
        backgroundColor: monthlySummaries.map((m) =>
          m.netBalance >= 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'
        ),
        type: 'bar' as const,
        borderRadius: 4,
      },
    ],
  };

  // Doughnut: Prestasi Bayaran Ahli
  const paymentPerformanceData = {
    labels: ['Selesai', 'Sebahagian', 'Tertunggak', 'Belum Bayar'],
    datasets: [
      {
        data: [
          paymentStatusCounts.selesai,
          paymentStatusCounts.sebahagian,
          paymentStatusCounts.tertunggak,
          paymentStatusCounts.belumBayar,
        ],
        backgroundColor: [
          '#10b981', // green
          '#3b82f6', // blue
          '#f59e0b', // orange
          '#ef4444', // red
        ],
        borderWidth: 0,
      },
    ],
  };

  // Doughnut: Komposisi Perbelanjaan mengikut Kategori
  const expenseCategoriesMap: Record<string, number> = {};
  expenses.forEach((e) => {
    expenseCategoriesMap[e.category] = (expenseCategoriesMap[e.category] || 0) + e.amount;
  });

  const expenseCategoryLabels = Object.keys(expenseCategoriesMap);
  const expenseCategoryValues = Object.values(expenseCategoriesMap);

  const expenseCompositionData = {
    labels: expenseCategoryLabels.length ? expenseCategoryLabels : ['Tiada Data'],
    datasets: [
      {
        data: expenseCategoryValues.length ? expenseCategoryValues : [1],
        backgroundColor: [
          '#f43f5e',
          '#fb923c',
          '#facc15',
          '#4ade80',
          '#2dd4bf',
          '#38bdf8',
          '#818cf8',
          '#c084fc',
          '#f472b6',
          '#94a3b8',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
          font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
          boxWidth: 12,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        padding: 10,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const val = context.raw || 0;
            return `${label}: RM ${val.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono', size: 10 },
          callback: (value: any) => `RM ${value}`,
        },
      },
    },
  };

  const doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#cbd5e1',
          font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
          padding: 12,
          boxWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    cutout: '70%',
  };

  return (
    <div className="space-y-4">
      {/* Top Chart Section with Switcher */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/60">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Graf Interaktif Kewangan ADC {selectedYear}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Analisis aliran tunai bulanan, kutipan yuran dan perbelanjaan kelab secara dinamik.
            </p>
          </div>

          {/* Chart View Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto">
            <button
              onClick={() => setActiveChartTab('games_rentals')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeChartTab === 'games_rentals'
                  ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎯 Game & Sewaan ADC</span>
            </button>
            <button
              onClick={() => setActiveChartTab('comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                activeChartTab === 'comparison'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hasil vs Belanja
            </button>
            <button
              onClick={() => setActiveChartTab('fees')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                activeChartTab === 'fees'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kutipan Yuran Bulanan
            </button>
            <button
              onClick={() => setActiveChartTab('cashflow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                activeChartTab === 'cashflow'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cash Flow ADC
            </button>
            <button
              onClick={() => setActiveChartTab('composition')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                activeChartTab === 'composition'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Komposisi & Pecahan
            </button>
          </div>
        </div>

        {/* Dynamic Chart Canvas Area */}
        <div className="h-72 sm:h-80 w-full relative">
          {activeChartTab === 'games_rentals' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/80 mb-2 gap-2">
                <span className="text-slate-300">
                  <strong className="text-emerald-400">Prestasi 1 Jan – 14/4/2026:</strong> Game/Kejohanan:{' '}
                  <strong className="text-white font-mono-num">{formatMYR(q1GameTotal)}</strong> • Sewaan Papan:{' '}
                  <strong className="text-white font-mono-num">{formatMYR(q1SewaanTotal)}</strong>
                </span>
                <span className="text-teal-300 font-bold px-2 py-0.5 rounded bg-teal-500/20 border border-teal-500/30">
                  Gabungan Game & Sewaan: {formatMYR(q1GameTotal + q1SewaanTotal)}
                </span>
              </div>
              <div className="h-56 sm:h-64 w-full">
                <Bar data={gamesRentalsData} options={chartOptions} />
              </div>
            </div>
          )}
          {activeChartTab === 'comparison' && (
            <Bar data={comparisonData} options={chartOptions} />
          )}
          {activeChartTab === 'fees' && (
            <Line data={feeCollectionData as any} options={chartOptions} />
          )}
          {activeChartTab === 'cashflow' && (
            <Line data={cashFlowData as any} options={chartOptions} />
          )}
          {activeChartTab === 'composition' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <div className="flex flex-col items-center justify-center p-2">
                <span className="text-xs font-bold text-slate-300 mb-2">
                  Prestasi Status Bayaran Ahli
                </span>
                <div className="h-52 w-full relative">
                  <Doughnut data={paymentPerformanceData} options={doughnutOptions} />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <span className="text-xs font-bold text-slate-300 mb-2">
                  Komposisi Kategori Perbelanjaan
                </span>
                <div className="h-52 w-full relative">
                  <Doughnut data={expenseCompositionData} options={doughnutOptions} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
