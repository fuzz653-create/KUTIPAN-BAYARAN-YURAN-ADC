import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Database,
  Shield,
  Key,
  FileSpreadsheet,
  Play,
  CloudUpload,
  Globe,
  UserPlus,
  Save,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      title: 'Cara Setup Firebase',
      icon: Database,
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-300">
            Aplikasi ini telah disediakan secara automatik dengan <strong>Google Firebase Enterprise Cloud</strong> melalui Google AI Studio.
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
            <li>Pangkalan data Firebase telah diselaraskan dengan fail <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">firebase-applet-config.json</code>.</li>
            <li>Anda tidak perlu memasang sebarang kunci API tambahan secara manual di dalam kod.</li>
            <li>Semua sambungan menggunakan SDK rasmi Firebase Web v11 yang beroperasi secara real-time.</li>
          </ol>
        </div>
      ),
    },
    {
      num: 2,
      title: 'Cara Setup Firestore',
      icon: Database,
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-300">
            Koleksi Firestore yang digunakan dalam aplikasi ini terdiri daripada:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded bg-slate-800 border border-slate-700 text-emerald-300">/members (Profil Ahli)</div>
            <div className="p-2 rounded bg-slate-800 border border-slate-700 text-emerald-300">/payments (Bayaran Jan-Dis)</div>
            <div className="p-2 rounded bg-slate-800 border border-slate-700 text-teal-300">/income (Hasil ADC)</div>
            <div className="p-2 rounded bg-slate-800 border border-slate-700 text-rose-300">/expenses (Perbelanjaan)</div>
            <div className="p-2 rounded bg-slate-800 border border-slate-700 text-purple-300">/settings (Tetapan Kelab)</div>
            <div className="p-2 rounded bg-slate-800 border border-slate-700 text-amber-300">/audit_logs (Jejak Audit)</div>
          </div>
          <p className="text-xs text-slate-400">
            Peraturan keselamatan ketat (<code className="text-emerald-400">firestore.rules</code>) telah dikerahkan untuk melindungi rekod kewangan ADC daripada akses tanpa kebenaran.
          </p>
        </div>
      ),
    },
    {
      num: 3,
      title: 'Cara Setup Authentication',
      icon: Key,
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-300">
            Sistem pengesahan menyokong Google Login dan Role-Based Access Control (RBAC):
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li><strong className="text-purple-300">ADMIN:</strong> Kuasa mutlak untuk mendaftar, mengedit, memadam transaksi dan mengubah tetapan kelab. Emel admin utama (<code className="text-emerald-400">fuzz653@gmail.com</code>) diberikan hak pentadbir penuh automatik.</li>
            <li><strong className="text-emerald-300">BENDAHARI:</strong> Boleh merekod bayaran yuran ahli, menambah hasil dan perbelanjaan, tetapi tidak boleh memadam rekod tanpa kebenaran.</li>
            <li><strong className="text-blue-300">AJK / AHLI:</strong> Mod pantauan untuk melihat dashboard, lejar transaksi dan laporan AGM tanpa mengubah data.</li>
          </ul>
        </div>
      ),
    },
    {
      num: 4,
      title: 'Cara Memasukkan Data Excel “YURAN 2026.xlsx”',
      icon: FileSpreadsheet,
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-300">
            Untuk memasukkan fail Excel sebenar ADC:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
            <li>Klik butang hijau <strong className="text-emerald-400">“Import YURAN 2026.xlsx”</strong> di bahagian atas skrin atau navigasi ke menu <strong>Import / Export & Backup</strong>.</li>
            <li>Seret dan lepaskan fail <code className="bg-slate-800 px-1 py-0.5 rounded text-white">YURAN 2026.xlsx</code> ke dalam kotak import (atau klik untuk memilih fail dari telefon / PC).</li>
            <li>Sistem akan membaca helaian secara automatik, mengekstrak nama ahli, bayaran bulanan Jan hingga Dis, hasil dan perbelanjaan.</li>
            <li>Semak pratonton rekod yang dikesan dan klik <strong>“Sahkan & Muatkan Data”</strong>.</li>
            <li>Semua kad statistik, tunggakan dan graf akan dikira semula secara automatik!</li>
          </ol>
        </div>
      ),
    },
    {
      num: 5,
      title: 'Cara Menjalankan Aplikasi',
      icon: Play,
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            Aplikasi dijalankan menggunakan Node.js dan Vite dev server:
          </p>
          <div className="p-3 rounded bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800">
            npm run dev
          </div>
          <p>
            Pelayan akan beroperasi pada port 3000 dan boleh diakses secara langsung melalui penyemak imbas (Chrome, Safari, Firefox, Edge).
          </p>
        </div>
      ),
    },
    {
      num: 6,
      title: 'Cara Publish / Deploy Aplikasi',
      icon: CloudUpload,
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            Untuk membina versi pengeluaran (production build):
          </p>
          <div className="p-3 rounded bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800">
            npm run build
          </div>
          <p>
            Fail binaan sedia untuk dihoskan di Firebase Hosting, Google Cloud Run, Vercel, Netlify atau mana-mana pelayan web pilihan anda.
          </p>
        </div>
      ),
    },
    {
      num: 7,
      title: 'Cara Mendapatkan URL / Link Aplikasi',
      icon: Globe,
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            Aplikasi ini dihoskan dengan link pantas yang boleh dikongsi terus kepada AJK dan ahli ADC melalui WhatsApp:
          </p>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 break-all font-mono text-[11px] text-emerald-400">
            https://ais-pre-4x7jojehs4rb75q3npucok-487028103074.asia-east1.run.app
          </div>
          <p className="text-[11px] text-slate-400">
            Link ini responsif sepenuhnya untuk dibuka pada telefon pintar Android, iPhone, iPad, laptop mahupun PC kelab.
          </p>
        </div>
      ),
    },
    {
      num: 8,
      title: 'Cara Menambah Pengguna / Ahli Baharu',
      icon: UserPlus,
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <ol className="list-decimal list-inside space-y-1.5">
            <li>Buka menu <strong>“Pengurusan Ahli”</strong> di sidebar.</li>
            <li>Klik butang hijau <strong>“Tambah Ahli Baharu”</strong>.</li>
            <li>Masukkan Nama Penuh, No. Telefon / WhatsApp, Tarikh Daftar dan Kadar Yuran Bulanan (default RM20).</li>
            <li>Klik <strong>“Daftar Ahli”</strong>. Sistem terus menyediakan matriks bayaran 12 bulan dan ID ahli unik secara automatik.</li>
          </ol>
        </div>
      ),
    },
    {
      num: 9,
      title: 'Cara Backup & Simpan Salinan Database',
      icon: Save,
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <ol className="list-decimal list-inside space-y-1.5">
            <li>Buka menu <strong>“Import / Export & Backup”</strong>.</li>
            <li>Pilih tab <strong>“Backup & Restore Database”</strong>.</li>
            <li>Klik butang <strong>“DOWNLOAD BACKUP SEKARANG (JSON)”</strong>.</li>
            <li>Satu fail sandaran lengkap mengandungi semua rekod ahli, lejar yuran, hasil dan perbelanjaan akan dimuat turun ke peranti anda. Simpan fail ini secara berkala setiap bulan!</li>
          </ol>
        </div>
      ),
    },
    {
      num: 10,
      title: 'Cara Mengemaskini Data Setiap Bulan',
      icon: Calendar,
      content: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            Aliran kerja bulanan yang sangat mudah untuk bendahari:
          </p>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span>Langkah 1:</span>
              <span className="text-white">Rekod Yuran Masuk</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Buka menu <em>“Bayaran Yuran Bulanan”</em>, cari nama ahli, klik pada kotak bulan (contoh: Mac), klik <em>“Set Penuh (RM20)”</em> dan simpan.
            </p>

            <div className="flex items-center gap-2 text-emerald-400 font-bold mt-2">
              <span>Langkah 2:</span>
              <span className="text-white">Rekod Perbelanjaan Bulanan</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Buka menu <em>“Perbelanjaan ADC”</em>, klik <em>“+ Tambah Perbelanjaan”</em>, masukkan tarikh, kategori (contoh: SEWA, BIL TNB), amaun dan penerima.
            </p>

            <div className="flex items-center gap-2 text-emerald-400 font-bold mt-2">
              <span>Langkah 3:</span>
              <span className="text-white">Cetak Penyata Laporan</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Buka menu <em>“Laporan Bulanan”</em>, pilih bulan berkenaan, dan klik <em>“Cetak Laporan / PDF”</em> untuk diedarkan kepada AJK.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Panduan Lengkap Pengguna & Pentadbir ADC 2026
              </h3>
              <p className="text-xs text-slate-400">
                10 Langkah Demi Langkah Pengurusan Sistem Kewangan & Pangkalan Data
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

        {/* Layout: Left Sidebar of Steps + Right Detailed Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Steps List */}
          <div className="p-3 max-h-[65vh] overflow-y-auto space-y-1">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = activeStep === s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => setActiveStep(s.num)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive ? 'bg-white text-emerald-800' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {s.num}
                  </span>
                  <span className="truncate">{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Content */}
          <div className="md:col-span-2 p-5 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {(() => {
              const current = steps.find((s) => s.num === activeStep) || steps[0];
              const Icon = current.icon;
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        Langkah {current.num} daripada 10
                      </span>
                      <h4 className="text-base font-bold text-white">{current.title}</h4>
                    </div>
                  </div>

                  <div>{current.content}</div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      disabled={activeStep <= 1}
                      onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                    >
                      ← Langkah Sebelum
                    </button>
                    <button
                      disabled={activeStep >= 10}
                      onClick={() => setActiveStep((prev) => Math.min(10, prev + 1))}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 disabled:opacity-40 text-xs font-semibold text-white hover:bg-emerald-500"
                    >
                      Langkah Seterusnya →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
