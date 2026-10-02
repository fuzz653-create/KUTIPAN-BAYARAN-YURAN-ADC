import React from 'react';
import { Users, CreditCard, AlertCircle, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StatCards: React.FC = () => {
  const {
    totalMembers,
    totalFeeCollected,
    totalArrears,
    totalIncome,
    totalExpenses,
    currentBalance,
    formatMYR,
    selectedYear,
  } = useApp();

  const stats = [
    {
      title: 'JUMLAH AHLI',
      value: `${totalMembers} Orang`,
      subtitle: `Ahli Berdaftar ADC ${selectedYear}`,
      icon: Users,
      colorTheme: 'blue',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      iconBg: 'bg-blue-500/20 text-blue-300',
    },
    {
      title: 'JUMLAH YURAN DIKUTIP',
      value: formatMYR(totalFeeCollected),
      subtitle: `Kutipan Yuran Ahli Tahun ${selectedYear}`,
      icon: CreditCard,
      colorTheme: 'green',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      title: 'JUMLAH TUNGGAKAN',
      value: formatMYR(totalArrears),
      subtitle: 'Tunggakan Belum Dijelaskan',
      icon: AlertCircle,
      colorTheme: 'red',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      textColor: 'text-rose-400',
      iconBg: 'bg-rose-500/20 text-rose-300',
    },
    {
      title: 'JUMLAH HASIL ADC',
      value: formatMYR(totalIncome),
      subtitle: 'Yuran + Hasil Lain-Lain',
      icon: ArrowUpRight,
      colorTheme: 'green',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      title: 'JUMLAH PERBELANJAAN',
      value: formatMYR(totalExpenses),
      subtitle: 'Sewa, Utiliti, Peralatan Dart',
      icon: ArrowDownRight,
      colorTheme: 'red',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      textColor: 'text-rose-400',
      iconBg: 'bg-rose-500/20 text-rose-300',
    },
    {
      title: 'BAKI KEWANGAN SEMASA',
      value: formatMYR(currentBalance),
      subtitle: 'Baki Awal + Hasil - Belanja',
      icon: Wallet,
      colorTheme: currentBalance >= 0 ? 'green' : 'red',
      bgColor: currentBalance >= 0 ? 'bg-teal-500/10' : 'bg-rose-500/10',
      borderColor: currentBalance >= 0 ? 'border-teal-500/30' : 'border-rose-500/30',
      textColor: currentBalance >= 0 ? 'text-teal-300' : 'text-rose-400',
      iconBg: currentBalance >= 0 ? 'bg-teal-500/20 text-teal-300' : 'bg-rose-500/20 text-rose-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border ${s.borderColor} ${s.bgColor} backdrop-blur-sm relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                {s.title}
              </span>
              <div className={`p-2 rounded-xl ${s.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-xl sm:text-2xl font-black font-mono-num ${s.textColor} tracking-tight`}>
              {s.value}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium truncate">
              {s.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
};
