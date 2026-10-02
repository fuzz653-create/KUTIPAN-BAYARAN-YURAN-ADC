import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Save, AlertCircle } from 'lucide-react';
import { Income, IncomeCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomeToEdit?: Income | null;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({ isOpen, onClose, incomeToEdit }) => {
  const { addIncome, updateIncome, settings, showToast } = useApp();
  const { userProfile } = useAuth();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<IncomeCategory>('PERTANDINGAN');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'TUNAI' | 'ONLINE TRANSFER' | 'DUITNOW QR' | 'CEK' | 'LAIN-LAIN'>('ONLINE TRANSFER');
  const [officer, setOfficer] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categories: IncomeCategory[] = [
    'GAME / PERLAWANAN',
    'SEWAAN',
    'YURAN AHLI',
    'PERTANDINGAN',
    'SUMBANGAN',
    'SPONSOR',
    'JUALAN',
    'LAIN-LAIN',
  ];

  useEffect(() => {
    if (incomeToEdit) {
      setDate(incomeToEdit.date);
      setCategory(incomeToEdit.category);
      setDescription(incomeToEdit.description);
      setAmount(incomeToEdit.amount);
      setPaymentMethod(incomeToEdit.paymentMethod);
      setOfficer(incomeToEdit.officer);
      setNotes(incomeToEdit.notes || '');
    } else {
      setDate(new Date().toISOString().slice(0, 10));
      setCategory('PERTANDINGAN');
      setDescription('');
      setAmount('');
      setPaymentMethod('ONLINE TRANSFER');
      setOfficer(userProfile.displayName || 'Bendahari ADC');
      setNotes('');
    }
    setErrorMsg('');
  }, [incomeToEdit, isOpen, userProfile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setErrorMsg('Butiran hasil tidak boleh kosong.');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setErrorMsg('Jumlah bayaran tidak sah. Sila masukkan nilai positif dalam Ringgit Malaysia.');
      return;
    }

    if (!date) {
      setErrorMsg('Tarikh transaksi mesti sah.');
      return;
    }

    try {
      if (incomeToEdit) {
        await updateIncome(incomeToEdit.id, {
          date,
          category,
          description: description.trim(),
          amount: Number(amount),
          paymentMethod,
          officer: officer.trim() || 'Bendahari ADC',
          notes: notes.trim(),
        });
      } else {
        await addIncome({
          date,
          category,
          description: description.trim(),
          amount: Number(amount),
          paymentMethod,
          officer: officer.trim() || 'Bendahari ADC',
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err) {
      setErrorMsg('Ralat semasa merekod hasil ADC. Sila cuba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {incomeToEdit ? 'Kemaskini Rekod Hasil ADC' : 'Tambah Rekod Hasil ADC'}
              </h3>
              <p className="text-xs text-slate-400">
                {incomeToEdit ? `ID: ${incomeToEdit.trxId}` : 'ID Transaksi akan dijana automatik (cth: ADC-INC-0001)'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tarikh Hasil <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kategori Hasil <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncomeCategory)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Butiran / Keterangan Hasil <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Yuran Pendaftaran Pertandingan Dart Siri 2"
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Jumlah Amaun (RM) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white font-mono-num font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kaedah Bayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ONLINE TRANSFER">ONLINE TRANSFER</option>
                <option value="DUITNOW QR">DUITNOW QR</option>
                <option value="TUNAI">TUNAI</option>
                <option value="CEK">CEK</option>
                <option value="LAIN-LAIN">LAIN-LAIN</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pegawai Yang Memasukkan Rekod
            </label>
            <input
              type="text"
              value={officer}
              onChange={(e) => setOfficer(e.target.value)}
              placeholder="Nama Bendahari / Pegawai ADC"
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan Tambahan
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="No. Rujukan bank, nama penaja, tujuan sumbangan, dll."
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>{incomeToEdit ? 'Simpan Perubahan' : 'Rekod Hasil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
