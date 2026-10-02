import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Database,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCheck,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  parseExcelWorkbook,
  exportADCWorkbook,
  generateBlankTemplate,
  ExcelImportResult,
} from '../../services/excelService';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose }) => {
  const {
    members,
    payments,
    income,
    expenses,
    settings,
    importParsedData,
    resetToSampleData,
    clearAllData,
    showToast,
    formatMYR,
  } = useApp();
  const { canEditFinance, canDeleteFinance } = useAuth();

  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'backup'>('import');
  const [dragActive, setDragActive] = useState(false);
  const [parsedResult, setParsedResult] = useState<ExcelImportResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Excel File Drop/Pick
  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage('');
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelWorkbook(buffer, settings);

      if (result.members.length === 0 && result.expenses.length === 0 && result.income.length === 0) {
        setErrorMessage(
          'Tiada rekod ahli atau kewangan dapat diekstrak. Sila pastikan helaian mengandungi tajuk lajur seperti "Nama Ahli", bulan "Jan-Dis", atau muat turun Templat Excel ADC.'
        );
        setParsedResult(null);
      } else {
        setParsedResult(result);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Ralat semasa membaca fail: ${err?.message || 'Format fail tidak disokong'}`);
      setParsedResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedResult) return;
    await importParsedData(
      parsedResult.members,
      parsedResult.payments,
      parsedResult.income,
      parsedResult.expenses,
      fileName
    );
    setParsedResult(null);
    onClose();
  };

  // Full Database Backup as JSON
  const handleDownloadBackupJSON = () => {
    const backupData = {
      version: 'ADC_2026_V1',
      exportedAt: new Date().toISOString(),
      club: settings.clubName,
      settings,
      members,
      payments,
      income,
      expenses,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `ADC_BACKUP_DATABASE_${settings.year}_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Salinan sandaran (Backup Database JSON) berjaya dimuat turun!');
  };

  // Restore Database from JSON
  const handleRestoreBackupJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.members || !data.payments) {
        showToast('Fail sandaran tidak sah.', 'error');
        return;
      }

      await importParsedData(
        data.members || [],
        data.payments || [],
        data.income || [],
        data.expenses || [],
        file.name
      );

      showToast('Database berjaya dipulihkan (Restore Complete)!');
      onClose();
    } catch (err) {
      showToast('Ralat semasa membaca fail sandaran JSON.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Pusat Import, Export & Sandaran Data ADC
              </h3>
              <p className="text-xs text-slate-400">
                Urus fail Excel “YURAN 2026.xlsx”, sandaran pangkalan data dan laporan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'import'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Import Fail Excel / CSV
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'export'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Export Excel ADC 2026
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'backup'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Backup & Restore Database
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* TAB 1: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">
                    Import Fail “YURAN 2026.xlsx” atau Fail CSV
                  </strong>
                  Sistem menyokong helaian matriks yuran ahli (Jan - Dis), rekod terimaan hasil dan perbelanjaan. Tiada sekatan nama fail.
                </div>
              </div>

              {/* Drag & Drop Box */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-950/30'
                    : 'border-slate-700 bg-slate-800/40 hover:border-emerald-600/70 hover:bg-slate-800/70'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processExcelFile(e.target.files[0]);
                    }
                  }}
                />

                <Upload className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
                <p className="text-sm font-bold text-white">
                  Seret & Lepaskan fail <span className="text-emerald-400">YURAN 2026.xlsx</span> ke sini
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  atau klik untuk memilih fail daripada komputer atau telefon pintar anda
                </p>
                <span className="inline-block mt-3 text-[11px] font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Format disokong: .xlsx, .xls, .csv
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Parsed Result Preview */}
              {parsedResult && (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      Pratonton Data: {fileName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      Sedia Dimuatkan
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-900/60">
                      <div className="text-[10px] text-slate-400">Ahli Dikesan</div>
                      <div className="font-bold text-emerald-400 font-mono-num text-sm">
                        {parsedResult.members.length} Orang
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60">
                      <div className="text-[10px] text-slate-400">Rekod Hasil</div>
                      <div className="font-bold text-teal-400 font-mono-num text-sm">
                        {parsedResult.income.length}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60">
                      <div className="text-[10px] text-slate-400">Perbelanjaan</div>
                      <div className="font-bold text-rose-400 font-mono-num text-sm">
                        {parsedResult.expenses.length}
                      </div>
                    </div>
                  </div>

                  {parsedResult.warnings.length > 0 && (
                    <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
                      {parsedResult.warnings.join(' ')}
                    </div>
                  )}

                  <button
                    onClick={handleConfirmImport}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sahkan & Muatkan Data ke Pangkalan Data</span>
                  </button>
                </div>
              )}

              {/* Templat Download */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700 text-xs">
                <span className="text-slate-400">Perlukan templat Excel untuk diisi?</span>
                <button
                  onClick={generateBlankTemplate}
                  className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Muat Turun Templat YURAN 2026.xlsx</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Muat turun laporan buku kira-kira lengkap kelab ADC dalam format Microsoft Excel (.xlsx) dengan helaian berasingan:
              </p>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Helaian 1: Ringkasan Kewangan Rasmi 2026</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Helaian 2: Matriks Bayaran Yuran Bulanan (Jan – Dis)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Helaian 3: Senarai Ahli ADC & Maklumat Perhubungan</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Helaian 4: Buku Rekod Hasil & Terimaan</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Helaian 5: Buku Rekod Perbelanjaan ADC</span>
                </div>
              </div>

              <button
                onClick={() => exportADCWorkbook(settings, members, payments, income, expenses)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Eksport Semua Data ke Excel (.xlsx)</span>
              </button>
            </div>
          )}

          {/* TAB 3: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">Download Backup Database</h4>
                    <p className="text-[11px] text-slate-400">
                      Muat turun salinan lengkap pangkalan data dalam format JSON untuk simpanan selamat pentadbir.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadBackupJSON}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>DOWNLOAD BACKUP SEKARANG (JSON)</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">Restore Data daripada Backup</h4>
                    <p className="text-[11px] text-slate-400">
                      Pulihkan semua data kelab daripada fail sandaran JSON yang disimpan sebelum ini.
                    </p>
                  </div>
                </div>

                <input
                  ref={restoreInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleRestoreBackupJSON}
                />

                {canEditFinance && (
                  <button
                    onClick={() => restoreInputRef.current?.click()}
                    className="w-full py-2.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Pilih Fail Backup JSON untuk Restore</span>
                  </button>
                )}
              </div>

              {canDeleteFinance && (
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/30 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-rose-300">Set Semula / Kosongkan Data</h4>
                    <p className="text-[11px] text-slate-400">
                      Kembalikan kepada data contoh asal atau kosongkan semua data untuk permulaan baharu.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetToSampleData}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                    >
                      Reset Contoh
                    </button>
                    <button
                      onClick={clearAllData}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-semibold"
                    >
                      Kosongkan Semua
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
