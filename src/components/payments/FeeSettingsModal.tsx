import React, { useState, useEffect } from 'react';
import { X, Settings, Save, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FeeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeeSettingsModal: React.FC<FeeSettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, showToast, formatMYR, ensureYearInitialized, setSelectedYear, selectedYear } = useApp();

  const [clubName, setClubName] = useState(settings.clubName);
  const [defaultMonthlyFee, setDefaultMonthlyFee] = useState(settings.defaultMonthlyFee);
  const [openingBalance, setOpeningBalance] = useState(settings.openingBalance);
  const [year, setYear] = useState(selectedYear || settings.year);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setClubName(settings.clubName);
      const activeYear = selectedYear || settings.year;
      setYear(activeYear);
      const yearFee = settings.yearlyDefaultFees?.[activeYear] || settings.defaultMonthlyFee;
      setDefaultMonthlyFee(yearFee);
      const yearBal = settings.yearlyOpeningBalances?.[activeYear] ?? (activeYear === 2026 ? settings.openingBalance : 0);
      setOpeningBalance(yearBal);
      setErrorMsg('');
    }
  }, [isOpen, settings, selectedYear]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clubName.trim()) {
      setErrorMsg('Nama kelab tidak boleh kosong.');
      return;
    }

    if (isNaN(defaultMonthlyFee) || defaultMonthlyFee <= 0) {
      setErrorMsg('Kadar yuran bulanan mestilah nombor positif.');
      return;
    }

    try {
      const numYear = Number(year);
      const updatedYearlyOpening = {
        ...(settings.yearlyOpeningBalances || {}),
        [numYear]: Number(openingBalance),
      };
      const updatedYearlyFees = {
        ...(settings.yearlyDefaultFees || {}),
        [numYear]: Number(defaultMonthlyFee),
      };

      await updateSettings({
        clubName: clubName.trim(),
        defaultMonthlyFee: Number(defaultMonthlyFee),
        openingBalance: Number(openingBalance),
        year: numYear,
        yearlyOpeningBalances: updatedYearlyOpening,
        yearlyDefaultFees: updatedYearlyFees,
      });

      await ensureYearInitialized(numYear);
      setSelectedYear(numYear);
      onClose();
    } catch (err: any) {
      setErrorMsg('Ralat semasa mengemaskini tetapan kelab.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <Settings className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tetapan Kewangan & Yuran Kelab</h3>
              <p className="text-xs text-slate-400">Konfigurasi kadar default tanpa ubah kod</p>
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Kelab Dart
            </label>
            <input
              type="text"
              required
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tahun Operasi
              </label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white font-mono-num focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kadar Yuran Default (RM)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={defaultMonthlyFee}
                onChange={(e) => setDefaultMonthlyFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white font-mono-num font-bold focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Baki Awal Bawa Ke Hadapan (RM)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={openingBalance}
              onChange={(e) => setOpeningBalance(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white font-mono-num focus:outline-none focus:border-purple-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Baki tunai/bank pada 1 Januari {year}.
            </p>
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
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Tetapan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
