import React from 'react';
import { BookOpen, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface RecentTransactionsWidgetProps {
  onGoToLedger: () => void;
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({ onGoToLedger }) => {
  const { recentTransactions, formatMYR, formatDate } = useApp();

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Transaksi Kewangan Terkini
            </h3>
            <p className="text-xs text-slate-400">
              Rekod kemasukan hasil dan perbelanjaan ADC
            </p>
          </div>
        </div>

        <button
          onClick={onGoToLedger}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
        >
          <span>Buka Lejar Penuh</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-2">Tarikh</th>
              <th className="py-2.5 px-2">ID Transaksi</th>
              <th className="py-2.5 px-2">Kategori</th>
              <th className="py-2.5 px-2">Butiran</th>
              <th className="py-2.5 px-2 text-right">Masuk / Keluar</th>
              <th className="py-2.5 px-2 text-right">Baki Berjalan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {recentTransactions.slice(0, 7).map((item) => {
              const isIncome = item.type === 'HASIL';
              return (
                <tr key={item.id} className="hover:bg-slate-700/40 transition">
                  <td className="py-2.5 px-2 text-slate-300 font-mono-num whitespace-nowrap">
                    {formatDate(item.date)}
                  </td>
                  <td className="py-2.5 px-2 font-mono text-[11px] text-slate-400 font-semibold">
                    {item.trxId}
                  </td>
                  <td className="py-2.5 px-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-slate-200 truncate max-w-[160px]" title={item.description}>
                    {item.description}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono-num font-bold">
                    {isIncome ? (
                      <span className="text-emerald-400 flex items-center justify-end gap-1">
                        +{formatMYR(item.incomeAmount)}
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center justify-end gap-1">
                        -{formatMYR(item.expenseAmount)}
                        <ArrowDownRight className="w-3 h-3" />
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono-num text-slate-300 font-medium">
                    {formatMYR(item.runningBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
