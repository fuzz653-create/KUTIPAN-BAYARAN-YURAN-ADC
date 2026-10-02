import React, { useState, useMemo } from 'react';
import {
  Grid3X3,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Settings,
  HelpCircle,
  CreditCard,
  CalendarPlus,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PaymentEditModal } from './PaymentEditModal';
import { FeeSettingsModal } from './FeeSettingsModal';
import { AddYearModal } from './AddYearModal';
import { MemberModal } from '../members/MemberModal';
import { Member, PaymentStatus } from '../../types';

export const PaymentMatrix: React.FC = () => {
  const {
    members,
    payments,
    settings,
    formatMYR,
    selectedYear,
    setSelectedYear,
    availableYears,
    totalFeeCollected,
    totalArrears,
  } = useApp();
  const { canEditFinance } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | PaymentStatus>('ALL');

  // Modal states
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMonth, setEditingMonth] = useState<number>(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddYearOpen, setIsAddYearOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const monthNames = [
    'Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis',
  ];

  // Filtered rows
  const filteredList = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase());

      const payment = payments.find((p) => p.memberId === m.id && p.year === selectedYear);
      const status: PaymentStatus = payment ? payment.status : 'BELUM BAYAR';
      const matchStatus = filterStatus === 'ALL' || status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [members, payments, searchQuery, filterStatus, selectedYear]);

  // Compute monthly totals for the footer row
  const monthlyTotals = useMemo(() => {
    const totals: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) {
      totals[m] = 0;
    }
    payments.forEach((p) => {
      if (p.year === selectedYear) {
        for (let m = 1; m <= 12; m++) {
          totals[m] += p.monthlyAmounts[m] || 0;
        }
      }
    });
    return totals;
  }, [payments, selectedYear]);

  const handleCellClick = (memberId: string, month: number) => {
    if (!canEditFinance) return;
    setEditingMemberId(memberId);
    setEditingMonth(month);
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'SELESAI':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'SEBAHAGIAN':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'TERTUNGGAK':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'BELUM BAYAR':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-emerald-400" />
              Matriks Bayaran Yuran Bulanan ADC {selectedYear}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              Kadar: RM {settings.defaultMonthlyFee}/bln
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Klik pada mana-mana kotak bulan untuk mengemaskini bayaran ahli serta-merta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year Switcher Pills */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/80">
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  selectedYear === yr
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{yr}</span>
                {selectedYear === yr && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>}
              </button>
            ))}

            {canEditFinance && (
              <button
                onClick={() => setIsAddYearOpen(true)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition flex items-center gap-1"
                title="Buka & Tambah Tahun Baharu Operasi ADC"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>+ Tahun</span>
              </button>
            )}
          </div>

          {canEditFinance && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <Settings className="w-3.5 h-3.5 text-purple-400" />
              <span>Tetapan Kadar Yuran</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ahli dalam matriks..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Status Yuran</option>
            <option value="SELESAI">SELESAI</option>
            <option value="SEBAHAGIAN">SEBAHAGIAN</option>
            <option value="TERTUNGGAK">TERTUNGGAK</option>
            <option value="BELUM BAYAR">BELUM BAYAR</option>
          </select>
        </div>
      </div>

      {/* Interactive Matrix Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/90 text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-700 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 text-center w-12 sticky left-0 bg-slate-900 z-20">Bil</th>
                <th className="py-3 px-3 min-w-[170px] sticky left-12 bg-slate-900 z-20">Nama Ahli</th>
                {monthNames.map((m, idx) => (
                  <th key={idx} className="py-3 px-2 text-center min-w-[55px]">
                    {m}
                  </th>
                ))}
                <th className="py-3 px-3 text-right min-w-[90px] text-emerald-400">Jumlah</th>
                <th className="py-3 px-3 text-right min-w-[90px] text-rose-400">Tunggakan</th>
                <th className="py-3 px-3 text-center min-w-[100px]">Status</th>
                <th className="py-3 px-3 text-center min-w-[80px]">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-8 text-center text-slate-400">
                    Tiada rekod bayaran ditemui mengikut tapisan.
                  </td>
                </tr>
              ) : (
                filteredList.map((m, idx) => {
                  const payment = payments.find((p) => p.memberId === m.id && p.year === selectedYear);
                  const amounts = payment ? payment.monthlyAmounts : {};
                  const totalPaid = payment ? payment.totalPaid : 0;
                  const arrears = payment ? payment.arrears : m.monthlyFee * 12;
                  const pStatus: PaymentStatus = payment ? payment.status : 'BELUM BAYAR';

                  return (
                    <tr key={m.id} className="hover:bg-slate-700/30 transition group">
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono-num font-semibold sticky left-0 bg-slate-800 group-hover:bg-slate-700/60 z-10">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white sticky left-12 bg-slate-800 group-hover:bg-slate-700/60 z-10 min-w-[190px]">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="truncate">
                            <button
                              type="button"
                              onClick={() => {
                                setMemberToEdit(m);
                                setIsMemberModalOpen(true);
                              }}
                              className="font-bold text-white hover:text-emerald-400 transition text-left truncate block text-xs"
                              title={`Klik untuk kemaskini nama & profil ahli: ${m.name}`}
                            >
                              <span className="truncate">{m.name}</span>
                              {m.nickname && (
                                <span className="text-[10px] text-emerald-400 ml-1 font-normal">
                                  ({m.nickname})
                                </span>
                              )}
                            </button>
                            <div className="text-[10px] font-mono text-slate-400 font-normal flex items-center gap-1">
                              <span>{m.id}</span>
                              <span>•</span>
                              <span>RM {m.monthlyFee}/bln</span>
                              {m.position && m.position !== 'Ahli Biasa' && (
                                <span className="text-purple-300 font-medium truncate">• {m.position}</span>
                              )}
                            </div>
                          </div>

                          {canEditFinance && (
                            <button
                              type="button"
                              onClick={() => {
                                setMemberToEdit(m);
                                setIsMemberModalOpen(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-slate-700/80 hover:bg-emerald-600 text-slate-300 hover:text-white transition shrink-0"
                              title={`Kemaskini maklumat ${m.name}`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 12 Months Cells */}
                      {monthNames.map((_, mIdx) => {
                        const monthNum = mIdx + 1;
                        const amt = amounts[monthNum] || 0;
                        const isFull = amt >= m.monthlyFee;
                        const isPartial = amt > 0 && amt < m.monthlyFee;

                        return (
                          <td
                            key={monthNum}
                            onClick={() => handleCellClick(m.id, monthNum)}
                            className="py-1 px-1 text-center"
                          >
                            <button
                              type="button"
                              className={`w-full py-1.5 px-1 rounded-lg text-[11px] font-mono-num font-bold transition text-center ${
                                isFull
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                  : isPartial
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                                  : 'bg-slate-900/40 text-slate-500 border border-slate-800 hover:border-slate-600 hover:text-slate-300'
                              } ${canEditFinance ? 'cursor-pointer' : 'cursor-default'}`}
                              title={`${m.name} - ${monthNames[mIdx]}: RM ${amt} (Klik untuk edit)`}
                            >
                              {amt > 0 ? amt : '-'}
                            </button>
                          </td>
                        );
                      })}

                      {/* Totals & Status */}
                      <td className="py-2.5 px-3 text-right font-mono-num font-bold text-emerald-400">
                        {formatMYR(totalPaid)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-num font-bold text-rose-400">
                        {formatMYR(arrears)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            pStatus
                          )}`}
                        >
                          {pStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {canEditFinance && (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleCellClick(m.id, 10)}
                              className="p-1.5 px-2 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/40 font-bold text-[11px] transition flex items-center justify-center gap-1 shadow-sm"
                              title={`Kemaskini bayaran yuran untuk ${m.name}`}
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Bayar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setMemberToEdit(m);
                                setIsMemberModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600 text-[11px] transition flex items-center justify-center shadow-sm"
                              title={`Kemaskini nama & maklumat ahli ${m.name}`}
                            >
                              <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Total Footer Row */}
            <tfoot className="bg-slate-900/90 text-slate-300 font-bold border-t-2 border-slate-700">
              <tr>
                <td colSpan={2} className="py-3 px-3 text-right uppercase text-[11px] tracking-wider text-slate-400 sticky left-0 bg-slate-900 z-10">
                  Jumlah Kutipan Bulanan:
                </td>
                {monthNames.map((_, mIdx) => {
                  const monthNum = mIdx + 1;
                  const monthTotal = monthlyTotals[monthNum] || 0;
                  return (
                    <td key={monthNum} className="py-3 px-1 text-center font-mono-num text-[11px] text-emerald-400 font-bold">
                      {monthTotal > 0 ? `RM ${monthTotal}` : '-'}
                    </td>
                  );
                })}
                <td className="py-3 px-3 text-right font-mono-num text-emerald-400 font-extrabold text-xs">
                  {formatMYR(totalFeeCollected)}
                </td>
                <td className="py-3 px-3 text-right font-mono-num text-rose-400 font-extrabold text-xs">
                  {formatMYR(totalArrears)}
                </td>
                <td className="py-3 px-3 text-center text-[10px] text-slate-400">
                  {filteredList.length} Ahli
                </td>
                <td className="py-3 px-3 text-center"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modals */}
      <PaymentEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        memberId={editingMemberId}
        initialMonth={editingMonth}
      />

      <FeeSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AddYearModal
        isOpen={isAddYearOpen}
        onClose={() => setIsAddYearOpen(false)}
      />
    </div>
  );
};
