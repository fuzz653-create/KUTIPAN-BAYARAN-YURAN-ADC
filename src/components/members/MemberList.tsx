import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Download,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Member, MemberStatus, PaymentStatus } from '../../types';

interface MemberListProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (member: Member) => void;
  onOpenProfileModal: (member: Member) => void;
  onOpenPaymentModal: (memberId: string) => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  onOpenAddModal,
  onOpenEditModal,
  onOpenProfileModal,
  onOpenPaymentModal,
}) => {
  const { members, payments, deleteMember, formatMYR, formatDate, selectedYear } = useApp();
  const { canEditFinance, canDeleteFinance } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | MemberStatus>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;

      const p = payments.find((pay) => pay.memberId === m.id && pay.year === selectedYear);
      const paymentStatus = p ? p.status : 'BELUM BAYAR';
      const matchPayment = paymentFilter === 'ALL' || paymentStatus === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [members, payments, searchQuery, statusFilter, paymentFilter, selectedYear]);

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    await deleteMember(memberToDelete.id);
    setMemberToDelete(null);
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
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-xl backdrop-blur-sm">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Pengurusan Ahli ADC {selectedYear}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Senarai {members.length} ahli berdaftar kelab dart berserta status yuran semasa.
          </p>
        </div>

        {canEditFinance && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/30"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Ahli Baharu</span>
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama ahli, no telefon atau ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Member Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Status Ahli</option>
            <option value="AKTIF">Hanya Aktif</option>
            <option value="TIDAK_AKTIF">Tidak Aktif</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Status Bayaran</option>
            <option value="SELESAI">SELESAI</option>
            <option value="SEBAHAGIAN">SEBAHAGIAN</option>
            <option value="TERTUNGGAK">TERTUNGGAK</option>
            <option value="BELUM BAYAR">BELUM BAYAR</option>
          </select>
        </div>
      </div>

      {/* Members Data Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-3 text-center">Bil</th>
                <th className="py-3 px-3">Nama Ahli</th>
                <th className="py-3 px-3">No. Telefon</th>
                <th className="py-3 px-3">Tarikh Daftar</th>
                <th className="py-3 px-3">Status Ahli</th>
                <th className="py-3 px-3 text-right">Yuran Bulanan</th>
                <th className="py-3 px-3 text-right text-emerald-400">Jumlah Bayaran</th>
                <th className="py-3 px-3 text-right text-rose-400">Jumlah Tunggakan</th>
                <th className="py-3 px-3 text-center">Status Bayaran</th>
                <th className="py-3 px-3 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Tiada ahli dijumpai mengikut carian dan tapisan yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m, idx) => {
                  const payment = payments.find((p) => p.memberId === m.id && p.year === selectedYear);
                  const totalPaid = payment ? payment.totalPaid : 0;
                  const arrears = payment ? payment.arrears : m.monthlyFee * 12;
                  const pStatus: PaymentStatus = payment ? payment.status : 'BELUM BAYAR';

                  return (
                    <tr key={m.id} className="hover:bg-slate-700/40 transition">
                      <td className="py-3 px-3 text-center text-slate-500 font-mono-num font-semibold">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-xs">{m.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{m.id}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono-num">{m.phone || '-'}</td>
                      <td className="py-3 px-3 text-slate-400 font-mono-num">
                        {formatDate(m.registeredDate)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            m.status === 'AKTIF'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-600/20 text-slate-400 border-slate-600/40'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num text-slate-300">
                        {formatMYR(m.monthlyFee)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num font-bold text-emerald-400">
                        {formatMYR(totalPaid)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num font-bold text-rose-400">
                        {formatMYR(arrears)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            pStatus
                          )}`}
                        >
                          {pStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {canEditFinance && (
                            <button
                              onClick={() => onOpenPaymentModal(m.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-md shadow-emerald-900/30 flex items-center gap-1"
                              title="Kemaskini Bayaran Yuran Ahli Ini"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Bayar</span>
                            </button>
                          )}

                          <button
                            onClick={() => onOpenProfileModal(m)}
                            className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition"
                            title="Lihat Profil Ahli"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {canEditFinance && (
                            <button
                              onClick={() => onOpenEditModal(m)}
                              className="p-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white transition"
                              title="Kemaskini Ahli"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canDeleteFinance && (
                            <button
                              onClick={() => setMemberToDelete(m)}
                              className="p-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white transition"
                              title="Padam Ahli (Admin Sahaja)"
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
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Sahkan Pemadaman Ahli</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Adakah anda pasti ingin memadam ahli <strong className="text-white">{memberToDelete.name}</strong> ({memberToDelete.id})? Tindakan ini juga akan memadam rekod bayaran berkaitan.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Ya, Padam Ahli
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
