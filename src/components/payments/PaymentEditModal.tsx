import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, AlertCircle, Save, Coins, CheckCircle2, User, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member, PaymentRecord } from '../../types';

interface PaymentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string | null;
  initialMonth?: number;
}

export const PaymentEditModal: React.FC<PaymentEditModalProps> = ({
  isOpen,
  onClose,
  memberId,
  initialMonth = 1,
}) => {
  const { members, payments, updateMonthlyPayment, formatMYR, selectedYear, showToast } = useApp();

  const [activeMemberId, setActiveMemberId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [amount, setAmount] = useState<number>(20);
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (memberId) {
      setActiveMemberId(memberId);
    } else if (members.length > 0 && !activeMemberId) {
      setActiveMemberId(members[0].id);
    }
  }, [memberId, members]);

  const member = members.find((m) => m.id === activeMemberId);
  const payment = payments.find((p) => p.memberId === activeMemberId && p.year === selectedYear);

  useEffect(() => {
    setSelectedMonth(initialMonth || 1);
  }, [initialMonth]);

  useEffect(() => {
    if (member && payment) {
      const currentAmt = payment.monthlyAmounts[selectedMonth] || 0;
      setAmount(currentAmt > 0 ? currentAmt : member.monthlyFee);
      setNote('');
      setErrorMsg('');
    }
  }, [member, payment, selectedMonth]);

  if (!isOpen) return null;

  const monthNames = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) {
      setErrorMsg('Sila pilih ahli terlebih dahulu.');
      return;
    }

    if (isNaN(amount) || amount < 0) {
      setErrorMsg('Jumlah bayaran tidak sah. Sila masukkan nilai positif dalam Ringgit Malaysia.');
      return;
    }

    try {
      await updateMonthlyPayment(member.id, selectedMonth, Number(amount), note);
      onClose();
    } catch (err: any) {
      setErrorMsg('Ralat semasa mengemaskini bayaran. Sila cuba lagi.');
    }
  };

  // Quick Action: Bayar Penuh Semua Bulan 1 hingga 12
  const handlePayFullYear = async () => {
    if (!member) return;
    try {
      for (let m = 1; m <= 12; m++) {
        await updateMonthlyPayment(member.id, m, member.monthlyFee, 'Bayaran Penuh Setahun');
      }
      showToast(`Semua yuran 12 bulan untuk ${member.name} telah disetkan penuh (RM ${member.monthlyFee * 12}).`);
      onClose();
    } catch (err) {
      setErrorMsg('Ralat semasa mengemaskini semua bulan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Kemaskini Bayaran Yuran Ahli</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {selectedYear}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pilih ahli dan bulan untuk merekodkan kutipan yuran dengan mudah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Member Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pilih Ahli ADC</span>
            </label>
            <select
              value={activeMemberId}
              onChange={(e) => setActiveMemberId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:outline-none focus:border-emerald-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id}) • RM {m.monthlyFee}/bln
                </option>
              ))}
            </select>
          </div>

          {/* Member Status Overview Banner */}
          {member && payment && (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400">Kadar Bulanan</span>
                <div className="font-bold text-white font-mono-num">{formatMYR(member.monthlyFee)}</div>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400">Telah Dibayar</span>
                <div className="font-bold text-emerald-400 font-mono-num">{formatMYR(payment.totalPaid)}</div>
              </div>
              <div>
                <span className="text-[10px] text-rose-400">Tunggakan</span>
                <div className="font-bold text-rose-400 font-mono-num">{formatMYR(payment.arrears)}</div>
              </div>
            </div>
          )}

          {/* Month Selector Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pilih Bulan Bayaran</span>
              </label>
              <button
                type="button"
                onClick={handlePayFullYear}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Bayar Penuh Setahun (RM {member ? member.monthlyFee * 12 : 240})</span>
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {monthNames.map((mName, idx) => {
                const monthNum = idx + 1;
                const isSelected = selectedMonth === monthNum;
                const paidAmt = payment?.monthlyAmounts[monthNum] || 0;
                const isPaid = member ? paidAmt >= member.monthlyFee : false;

                return (
                  <button
                    type="button"
                    key={monthNum}
                    onClick={() => setSelectedMonth(monthNum)}
                    className={`p-2 rounded-xl text-xs font-semibold border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/40'
                        : isPaid
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/40'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span className="truncate">{mName}</span>
                    <span className="text-[10px] font-mono-num opacity-90 mt-0.5 font-bold">
                      {paidAmt > 0 ? `RM ${paidAmt}` : 'RM 0'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount input & Quick presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>Jumlah Bayaran Bulan {monthNames[selectedMonth - 1]} (RM)</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAmount(member ? member.monthlyFee : 20)}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 font-bold border border-emerald-500/40 transition"
                >
                  Set Penuh ({formatMYR(member ? member.monthlyFee : 20)})
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(0)}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-rose-600/30 text-rose-300 hover:bg-rose-600/50 font-bold border border-rose-500/40 transition"
                >
                  Set RM 0
                </button>
              </div>
            </div>

            <input
              type="number"
              min="0"
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="20"
              className="w-full px-3 py-2.5 text-base rounded-xl bg-slate-800 border border-slate-700 text-white font-mono-num font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan Bayaran / No. Resit (Pilihan)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: DuitNow Ref 887766, Bayaran Tunai di kelab"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Bayaran Bulan {monthNames[selectedMonth - 1]}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
