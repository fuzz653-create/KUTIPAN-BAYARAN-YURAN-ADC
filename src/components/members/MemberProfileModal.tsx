import React from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Award,
  Shirt,
  Mail,
  FileText,
  Edit2,
  ShieldCheck,
} from 'lucide-react';
import { Member, PaymentRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onEditPayment: (memberId: string) => void;
  onEditMember?: (member: Member) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  isOpen,
  onClose,
  member,
  onEditPayment,
  onEditMember,
}) => {
  const { payments, formatMYR, formatDate, selectedYear } = useApp();
  const { canEditFinance } = useAuth();

  if (!isOpen || !member) return null;

  const payment = payments.find((p) => p.memberId === member.id && p.year === selectedYear);
  const monthlyAmounts = payment ? payment.monthlyAmounts : {};

  const monthNames = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg text-white font-black text-xl border border-emerald-400/30">
              {member.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">{member.name}</h3>
                {member.nickname && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    "{member.nickname}"
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    member.status === 'AKTIF'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                  }`}
                >
                  {member.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="font-mono text-slate-300 font-bold">{member.id}</span>
                <span>•</span>
                <span className="text-purple-300 font-medium">{member.position || 'Ahli Biasa'}</span>
                {member.jerseySize && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300">Jersi {member.jerseySize}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {canEditFinance && onEditMember && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditMember(member);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Kemaskini maklumat profil ahli ini"
              >
                <Edit2 className="w-4 h-4 text-emerald-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Member Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                <Phone className="w-3 h-3 text-slate-400" />
                Telefon
              </div>
              <div className="text-xs font-semibold text-white font-mono-num truncate">
                {member.phone || '-'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Tarikh Daftar
              </div>
              <div className="text-xs font-semibold text-white">
                {formatDate(member.registeredDate)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                <CreditCard className="w-3 h-3 text-emerald-400" />
                Kadar Yuran
              </div>
              <div className="text-xs font-bold text-emerald-400 font-mono-num">
                {formatMYR(member.monthlyFee)}/bln
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                <Shirt className="w-3 h-3 text-purple-400" />
                Saiz Jersi
              </div>
              <div className="text-xs font-bold text-purple-300">
                {member.jerseySize ? `Saiz ${member.jerseySize}` : '-'}
              </div>
            </div>
          </div>

          {/* Additional info: Email & IC if provided */}
          {(member.email || member.icNumber) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
              {member.email && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-400">Emel:</span>
                  <span className="font-semibold truncate">{member.email}</span>
                </div>
              )}
              {member.icNumber && (
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-400">No. KP:</span>
                  <span className="font-semibold font-mono-num">{member.icNumber}</span>
                </div>
              )}
            </div>
          )}

          {/* Dues Summary Cards */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Sepatutnya ({selectedYear})</div>
              <div className="text-sm sm:text-base font-bold text-slate-200 font-mono-num mt-0.5">
                {payment ? formatMYR(payment.totalDue) : formatMYR(member.monthlyFee * 12)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-400 uppercase">Jumlah Bayaran</div>
              <div className="text-sm sm:text-base font-bold text-emerald-400 font-mono-num mt-0.5">
                {payment ? formatMYR(payment.totalPaid) : 'RM 0.00'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-rose-400 uppercase">Jumlah Tunggakan</div>
              <div className="text-sm sm:text-base font-bold text-rose-400 font-mono-num mt-0.5">
                {payment ? formatMYR(payment.arrears) : formatMYR(member.monthlyFee * 12)}
              </div>
            </div>
          </div>

          {/* 12-Month Payment Matrix Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Rekod Bayaran Bulanan Tahun {selectedYear}
              </span>
              <button
                onClick={() => {
                  onClose();
                  onEditPayment(member.id);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Kemaskini Bayaran</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {monthNames.map((mName, idx) => {
                const monthNum = idx + 1;
                const amt = monthlyAmounts[monthNum] || 0;
                const isPaid = amt >= member.monthlyFee;
                const isPartial = amt > 0 && amt < member.monthlyFee;

                return (
                  <div
                    key={monthNum}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${
                      isPaid
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : isPartial
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white text-[11px]">{mName}</div>
                      <div className="font-mono-num font-bold text-xs mt-0.5">
                        {amt > 0 ? formatMYR(amt) : 'RM 0.00'}
                      </div>
                    </div>
                    {isPaid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {member.notes && (
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
              <span className="font-bold text-slate-300">Catatan Ahli: </span>
              <span className="text-slate-400 leading-relaxed">{member.notes}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Tutup
            </button>

            <div className="flex items-center gap-2">
              {canEditFinance && onEditMember && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditMember(member);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kemaskini Maklumat Ahli</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditPayment(member.id);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Kutipan Yuran</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
