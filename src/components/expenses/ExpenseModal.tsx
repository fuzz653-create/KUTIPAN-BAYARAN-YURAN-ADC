import React, { useState, useEffect } from 'react';
import { X, TrendingDown, Save, AlertCircle } from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types';
import { useApp } from '../../context/AppContext';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, expenseToEdit }) => {
  const { addExpense, updateExpense } = useApp();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory>('SEWA');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'TUNAI' | 'ONLINE TRANSFER' | 'DUITNOW QR' | 'CEK' | 'LAIN-LAIN'>('ONLINE TRANSFER');
  const [recipient, setRecipient] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categories: ExpenseCategory[] = [
    'SEWA',
    'ELEKTRIK / TNB',
    'AIR / SAINS',
    'PERALATAN DART',
    'PENYELENGGARAAN',
    'PROGRAM',
    'HADIAH',
    'MAKANAN / MINUMAN',
    'LOGISTIK',
    'PENGANGKUTAN',
    'LAIN-LAIN',
  ];

  useEffect(() => {
    if (expenseToEdit) {
      setDate(expenseToEdit.date);
      setCategory(expenseToEdit.category);
      setDescription(expenseToEdit.description);
      setAmount(expenseToEdit.amount);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setRecipient(expenseToEdit.recipient);
      setReceiptNo(expenseToEdit.receiptNo || '');
      setNotes(expenseToEdit.notes || '');
    } else {
      setDate(new Date().toISOString().slice(0, 10));
      setCategory('SEWA');
      setDescription('');
      setAmount('');
      setPaymentMethod('ONLINE TRANSFER');
      setRecipient('');
      setReceiptNo('');
      setNotes('');
    }
    setErrorMsg('');
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setErrorMsg('Butiran perbelanjaan tidak boleh kosong.');
      return;
    }

    if (!recipient.trim()) {
      setErrorMsg('Penerima bayaran tidak boleh kosong.');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setErrorMsg('Jumlah perbelanjaan tidak sah. Sila masukkan nilai positif dalam Ringgit Malaysia.');
      return;
    }

    if (!date) {
      setErrorMsg('Tarikh transaksi mesti sah.');
      return;
    }

    try {
      if (expenseToEdit) {
        await updateExpense(expenseToEdit.id, {
          date,
          category,
          description: description.trim(),
          amount: Number(amount),
          paymentMethod,
          recipient: recipient.trim(),
          receiptNo: receiptNo.trim(),
          notes: notes.trim(),
        });
      } else {
        await addExpense({
          date,
          category,
          description: description.trim(),
          amount: Number(amount),
          paymentMethod,
          recipient: recipient.trim(),
          receiptNo: receiptNo.trim(),
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err) {
      setErrorMsg('Ralat semasa menyimpan rekod perbelanjaan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {expenseToEdit ? 'Kemaskini Perbelanjaan ADC' : 'Rekod Perbelanjaan Baharu ADC'}
              </h3>
              <p className="text-xs text-slate-400">
                {expenseToEdit ? `ID: ${expenseToEdit.trxId}` : 'ID Transaksi akan dijana automatik (cth: ADC-EXP-0001)'}
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

        {/* Form */}
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
                Tarikh Transaksi <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kategori Perbelanjaan <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Butiran Perbelanjaan <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Bayaran Sewa Premis Latihan ADC Bulan Mei"
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
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
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white font-mono-num font-bold focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Penerima / Pembekal <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Contoh: Tenaga Nasional Berhad / En. Razak"
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kaedah Bayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
              >
                <option value="ONLINE TRANSFER">ONLINE TRANSFER</option>
                <option value="TUNAI">TUNAI</option>
                <option value="DUITNOW QR">DUITNOW QR</option>
                <option value="CEK">CEK</option>
                <option value="LAIN-LAIN">LAIN-LAIN</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                No. Resit / Baucar / Rujukan
              </label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="Contoh: REC-2026-05, TNB-998822"
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan / Keterangan Lanjut
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan mengenai kelulusan AJK, pautan resit dll."
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
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
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>{expenseToEdit ? 'Simpan Perubahan' : 'Rekod Perbelanjaan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
