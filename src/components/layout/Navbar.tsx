import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  LogIn,
  LogOut,
  Menu,
  X,
  FileSpreadsheet,
  HelpCircle,
  History,
  Target,
  Bell,
  RefreshCw,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenImport: () => void;
  onOpenGuide: () => void;
  onOpenAudit: () => void;
  onOpenQuickPayment: () => void;
  onOpenAddYear?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenImport,
  onOpenGuide,
  onOpenAudit,
  onOpenQuickPayment,
  onOpenAddYear,
}) => {
  const { currentUser, userProfile, role, setDemoRole, signInWithGoogle, logOut, canEditFinance } = useAuth();
  const { isRealDataLoaded, dynamicAlerts, selectedYear, setSelectedYear, availableYears } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);

  const getRoleBadgeColor = (r: UserRole) => {
    switch (r) {
      case 'ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'BENDAHARI':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'AJK':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Club Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-white text-base sm:text-lg">
                  ADC
                </span>
                <button
                  type="button"
                  onClick={onOpenAddYear}
                  className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center gap-1 transition cursor-pointer"
                  title="Tukar Tahun atau Tambah Tahun Baharu"
                >
                  <span>{selectedYear}</span>
                  <span className="text-[10px] text-emerald-400">▾</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block font-medium">
                ASSOCIATION DARTS CLUB • FINANCIAL SYSTEM
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Year Switcher for tablet/desktop */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => {
                if (e.target.value === 'NEW') {
                  onOpenAddYear?.();
                } else {
                  setSelectedYear(Number(e.target.value));
                }
              }}
              className="bg-transparent text-xs font-bold text-emerald-400 focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-slate-900 text-white">
                  {yr}
                </option>
              ))}
              <option value="NEW" className="bg-slate-900 text-emerald-400 font-bold">
                + Tambah Tahun...
              </option>
            </select>
          </div>

          {/* Quick Pay / Kutipan Yuran Button */}
          {canEditFinance && (
            <button
              onClick={onOpenQuickPayment}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-900/30 border border-emerald-400/40"
              title="Kemaskini Bayaran Kutipan Ahli (Kutipan Yuran)"
            >
              <CreditCard className="w-4 h-4 text-white" />
              <span>Kutipan Yuran</span>
            </button>
          )}

          {/* Data status badge */}
          <button
            onClick={onOpenImport}
            className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition font-medium ${
              isRealDataLoaded
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-amber-950/60 border-amber-700/60 text-amber-300 hover:bg-amber-900/40'
            }`}
            title="Klik untuk muat naik YURAN 2026.xlsx"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{isRealDataLoaded ? 'Data Excel Dimuatkan' : 'Import YURAN 2026.xlsx'}</span>
          </button>

          {/* Dynamic Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAlertMenu(!showAlertMenu)}
              className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Notifikasi & Amaran"
            >
              <Bell className="w-4 h-4" />
              {dynamicAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {dynamicAlerts.length}
                </span>
              )}
            </button>

            {showAlertMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Amaran & Notifikasi Semasa ({dynamicAlerts.length})
                  </span>
                  <button
                    onClick={() => setShowAlertMenu(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {dynamicAlerts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">
                      Tiada amaran kewangan aktif. Kedudukan yuran berada dalam keadaan terkawal.
                    </p>
                  ) : (
                    dynamicAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-2"
                      >
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{alert}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Audit trail quick button */}
          <button
            onClick={onOpenAudit}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Audit Trail Log"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Panduan Pengguna */}
          <button
            onClick={onOpenGuide}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Panduan Langkah Demi Langkah"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Role selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${getRoleBadgeColor(
                role
              )}`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{role}</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in">
                <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
                  Tukar Peranan Pengguna:
                </div>
                {(['ADMIN', 'BENDAHARI', 'AJK'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setDemoRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                      role === r
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{r}</span>
                    {role === r && <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
                <div className="border-t border-slate-700 mt-2 pt-2 text-[11px] text-slate-400 px-2 leading-relaxed">
                  <span className="font-semibold text-slate-300">Admin:</span> Kuasa penuh
                  <br />
                  <span className="font-semibold text-slate-300">Bendahari:</span> Urus yuran & rekod
                  <br />
                  <span className="font-semibold text-slate-300">AJK:</span> Lihat & pantau sahaja
                </div>
              </div>
            )}
          </div>

          {/* Google Sign in / Current User */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-300 hidden xl:inline">
                {currentUser.displayName || currentUser.email}
              </span>
              <button
                onClick={logOut}
                className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition"
                title="Log Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
              title="Log Masuk Google / Firebase"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
