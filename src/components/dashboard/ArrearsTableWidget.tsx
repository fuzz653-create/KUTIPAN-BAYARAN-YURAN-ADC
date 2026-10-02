import React from 'react';
import { AlertCircle, Eye, Edit3, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentRecord } from '../../types';

interface ArrearsTableWidgetProps {
  onViewMemberProfile: (memberId: string) => void;
  onEditPayment: (memberId: string) => void;
  onGoToMatrix: () => void;
}

export const ArrearsTableWidget: React.FC<ArrearsTableWidgetProps> = ({
  onViewMemberProfile,
  onEditPayment,
  onGoToMatrix,
}) => {
  const { arrearsMembers, formatMYR } = useApp();

  const monthNamesShort = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

  // Helper to list unpaid months
  const getUnpaidMonths = (p: PaymentRecord) => {
    const currentMonthNum = new Date().getMonth() + 1;
    const unpaid: string[] = [];
    for (let m = 1; m <= currentMonthNum; m++) {
      if ((p.monthlyAmounts[m] || 0) === 0) {
        unpaid.push(monthNamesShort[m - 1]);
      }
    }
    return unpaid.length > 0 ? unpaid.join(', ') : 'Bulan Semasa';
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Ahli Mempunyai Tunggakan
            </h3>
            <p className="text-xs text-slate-400">
              Disusun mengikut jumlah tunggakan tertinggi
            </p>
          </div>
        </div>

        <button
          onClick={onGoToMatrix}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
        >
          <span>Semua Ahli</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {arrearsMembers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
            ✓
          </div>
          <p className="text-xs font-bold text-emerald-300">Tahniah! Tiada Tunggakan</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semua ahli telah menyelesaikan bayaran yuran ADC.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-2">Nama Ahli</th>
                <th className="py-2.5 px-2">Sepatutnya</th>
                <th className="py-2.5 px-2">Bayaran</th>
                <th className="py-2.5 px-2 text-rose-400">Tunggakan</th>
                <th className="py-2.5 px-2">Bulan Tertunggak</th>
                <th className="py-2.5 px-2">Status</th>
                <th className="py-2.5 px-2 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {arrearsMembers.slice(0, 7).map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/40 transition">
                  <td className="py-2.5 px-2 font-semibold text-white truncate max-w-[130px]">
                    {p.memberName}
                  </td>
                  <td className="py-2.5 px-2 text-slate-300 font-mono-num">
                    {formatMYR(p.totalDue)}
                  </td>
                  <td className="py-2.5 px-2 text-emerald-400 font-mono-num font-semibold">
                    {formatMYR(p.totalPaid)}
                  </td>
                  <td className="py-2.5 px-2 text-rose-400 font-mono-num font-bold">
                    {formatMYR(p.arrears)}
                  </td>
                  <td className="py-2.5 px-2 text-slate-400 text-[11px] max-w-[120px] truncate" title={getUnpaidMonths(p)}>
                    {getUnpaidMonths(p)}
                  </td>
                  <td className="py-2.5 px-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        p.status === 'BELUM BAYAR'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onViewMemberProfile(p.memberId)}
                        className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition"
                        title="Lihat Profil Ahli"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditPayment(p.memberId)}
                        className="px-2 py-1 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/40 text-[11px] font-semibold transition flex items-center gap-1"
                        title="Edit Bayaran"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
