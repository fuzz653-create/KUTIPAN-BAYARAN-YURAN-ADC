import React, { useState, useEffect } from 'react';
import { X, CalendarPlus, CheckCircle, AlertCircle, ArrowRight, Wallet, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AddYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedYear?: number;
}

export const AddYearModal: React.FC<AddYearModalProps> = ({
  isOpen,
  onClose,
  suggestedYear,
}) => {
  const {
    availableYears,
    addNewYear,
    currentBalance,
    settings,
    members,
    selectedYear,
    formatMYR,
  } = useApp();

  const nextDefault = suggestedYear || (Math.max(...availableYears, 2026) + 1);
  const [targetYear, setTargetYear] = useState<number>(nextDefault);
  const [defaultFee, setDefaultFee] = useState<number>(settings.defaultMonthlyFee || 20);
  const [carryForwardBalance, setCarryForwardBalance] = useState<boolean>(true);
  const [openingBalance, setOpeningBalance] = useState<number>(Math.max(0, currentBalance));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const next = suggestedYear || (Math.max(...availableYears, 2026) + 1);
      setTargetYear(next);
      setDefaultFee(settings.defaultMonthlyFee || 20);
      setCarryForwardBalance(true);
      setOpeningBalance(Math.max(0, Math.round(currentBalance * 100) / 100));
      setErrorMsg('');
      setIsLoading(false);
    }
  }, [isOpen, suggestedYear, availableYears, settings.defaultMonthlyFee, currentBalance]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetYear || isNaN(targetYear) || targetYear < 2020 || targetYear > 2100) {
      setErrorMsg('Sila masukkan tahun yang sah (antara 2020 hingga 2100).');
      return;
    }

    if (isNaN(defaultFee) || defaultFee <= 0) {
      setErrorMsg('Kadar yuran bulanan mestilah lebih daripada RM 0.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const finalOpeningBal = carryForwardBalance ? openingBalance : 0;
      await addNewYear(targetYear, {
        defaultMonthlyFee: defaultFee,
        openingBalance: finalOpeningBal,
      });
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Ralat semasa menjana tahun baharu.');
    }
  };

  const isExisting = availableYears.includes(targetYear);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-emerald-950/40 to-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Buka Tahun Operasi Baharu</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Automatik
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Penyediaan pangkalan data & matriks yuran ahli untuk tahun berikutnya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
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

          {/* Target Year Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tahun Operasi Baharu
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="2024"
                max="2099"
                required
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-base font-mono-num font-bold rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setTargetYear(nextDefault)}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 shrink-0"
              >
                Cadangan ({nextDefault})
              </button>
            </div>
            {isExisting ? (
              <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 inline" />
                Tahun {targetYear} sudah wujud. Sistem akan menyelaraskan rekod ahli yang belum lengkap secara automatik.
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Tahun ini akan ditambah secara automatik ke dalam senarai penapis dan dashboard.
              </p>
            )}
          </div>

          {/* Automatic Member Rollover Notice */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Penjanaan Rekod Automatik:</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Sistem akan menjana jadual 12 bulan (Januari – Disember {targetYear}) secara automatik untuk kesemua{' '}
              <strong className="text-white">{members.length} ahli berdaftar</strong> ADC dengan kadar yuran yang ditetapkan.
            </p>
          </div>

          {/* Default Fee */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Kadar Yuran Bulanan Default Tahun {targetYear} (RM)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              required
              value={defaultFee}
              onChange={(e) => setDefaultFee(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm font-mono-num font-bold rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Kadar yuran boleh diubah suai bagi setiap ahli mengikut keperluan.
            </p>
          </div>

          {/* Balance Carry Forward */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={carryForwardBalance}
                onChange={(e) => setCarryForwardBalance(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  Bawa Ke Hadapan Baki Semasa (B/F dari Tahun {selectedYear})
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Gunakan baki akhir tahun semasa ({formatMYR(currentBalance)}) sebagai Baki Awal permulaan 1 Januari {targetYear}.
                </p>
              </div>
            </label>

            {carryForwardBalance && (
              <div className="pt-2 pl-6">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Jumlah Baki Awal (RM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono-num font-bold rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isLoading ? 'Sedang Menjana...' : `Aktifkan Tahun ${targetYear}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
