import React, { useState, useMemo } from 'react';
import { TrendingDown, PlusCircle, Search, Filter, Edit2, Trash2, ArrowDownRight, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Expense, ExpenseCategory } from '../../types';
import { ExpenseModal } from './ExpenseModal';

export const ExpenseList: React.FC = () => {
  const { expenses, deleteExpense, formatMYR, formatDate, totalExpenses, selectedYear, setSelectedYear, availableYears } = useApp();
  const { canEditFinance, canDeleteFinance } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ExpenseCategory>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

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

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchSearch =
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.trxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.receiptNo && item.receiptNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [expenses, searchQuery, selectedCategory]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  const handleDelete = async () => {
    if (!expenseToDelete) return;
    await deleteExpense(expenseToDelete.id);
    setExpenseToDelete(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              Perbelanjaan ADC {selectedYear}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              Jumlah: {formatMYR(totalExpenses)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Rekod perbelanjaan operasi kelab, utiliti, sewaan, hadiah kejohanan dan peralatan dart.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-rose-400 focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-slate-900 text-white">
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {canEditFinance && (
            <button
              onClick={() => {
                setExpenseToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-900/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Perbelanjaan</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari butiran, ID transaksi, penerima atau no resit..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">Semua Kategori Perbelanjaan</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-3">Tarikh</th>
                <th className="py-3 px-3">ID Transaksi</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Butiran Perbelanjaan</th>
                <th className="py-3 px-3 text-right text-rose-400">Jumlah (RM)</th>
                <th className="py-3 px-3">Penerima</th>
                <th className="py-3 px-3">No. Resit</th>
                <th className="py-3 px-3 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tiada rekod perbelanjaan dijumpai.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/40 transition">
                    <td className="py-3 px-3 text-slate-300 font-mono-num whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300 font-semibold">
                      {item.trxId}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{item.description}</div>
                      {item.notes && (
                        <div className="text-[11px] text-slate-400 italic">{item.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num font-bold text-rose-400 text-sm whitespace-nowrap">
                      -{formatMYR(item.amount)}
                    </td>
                    <td className="py-3 px-3 text-slate-200 font-medium">
                      {item.recipient}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {item.receiptNo || '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canEditFinance && (
                          <button
                            onClick={() => {
                              setExpenseToEdit(item);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white transition"
                            title="Kemaskini Perbelanjaan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canDeleteFinance && (
                          <button
                            onClick={() => setExpenseToDelete(item)}
                            className="p-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white transition"
                            title="Padam Perbelanjaan (Admin Sahaja)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-900/80 border-t border-slate-700 text-slate-300 font-bold">
              <tr>
                <td colSpan={4} className="py-3 px-3 text-right uppercase text-[11px] text-slate-400">
                  Jumlah Perbelanjaan Dipaparkan ({filteredExpenses.length} Rekod):
                </td>
                <td className="py-3 px-3 text-right font-mono-num text-rose-400 font-extrabold text-sm">
                  {formatMYR(totalFilteredAmount)}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
      />

      {/* Delete Confirmation */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Sahkan Padam Perbelanjaan</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Adakah anda pasti ingin memadam rekod perbelanjaan <strong className="text-white">[{expenseToDelete.trxId}]</strong> bernilai {formatMYR(expenseToDelete.amount)} kepada {expenseToDelete.recipient}?
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setExpenseToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Ya, Padam Rekod
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
