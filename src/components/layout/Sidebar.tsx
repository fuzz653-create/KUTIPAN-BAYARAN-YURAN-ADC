import React from 'react';
import {
  LayoutDashboard,
  Users,
  Grid3X3,
  TrendingUp,
  TrendingDown,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  Settings,
  Wallet,
  X,
  PlusCircle,
  HelpCircle,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export type ActiveTab =
  | 'dashboard'
  | 'members'
  | 'matrix'
  | 'income'
  | 'expenses'
  | 'ledger'
  | 'monthly-report'
  | 'annual-report'
  | 'import-export'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  onQuickAddMember: () => void;
  onQuickAddIncome: () => void;
  onQuickAddExpense: () => void;
  onOpenGuide: () => void;
  onQuickPayment: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onQuickAddMember,
  onQuickAddIncome,
  onQuickAddExpense,
  onOpenGuide,
  onQuickPayment,
}) => {
  const { totalMembers, currentBalance, formatMYR, totalArrears, selectedYear } = useApp();
  const { canEditFinance } = useAuth();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string | number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'members', label: 'Pengurusan Ahli', icon: Users, badge: totalMembers, badgeColor: 'bg-slate-700 text-slate-300' },
    { id: 'matrix', label: 'Bayaran Yuran Bulanan', icon: Grid3X3 },
    { id: 'income', label: 'Hasil ADC', icon: TrendingUp },
    { id: 'expenses', label: 'Perbelanjaan ADC', icon: TrendingDown },
    { id: 'ledger', label: 'Rekod Lejar Transaksi', icon: BookOpen },
    { id: 'monthly-report', label: 'Laporan Bulanan', icon: CalendarCheck },
    { id: 'annual-report', label: `Laporan Tahunan ${selectedYear}`, icon: FileSpreadsheet },
    { id: 'import-export', label: 'Import / Export & Backup', icon: FileSpreadsheet },
    { id: 'settings', label: 'Tetapan Kelab', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header for Mobile */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-base">ADC {selectedYear}</span>
            <span className="text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
              Menu Navigasi
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="p-4 border-b border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Tindakan Pantas
          </div>

          {canEditFinance && (
            <button
              onClick={() => {
                onQuickPayment();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 mb-2.5 transition border border-emerald-400/30"
              title="Kemaskini Bayaran Yuran Ahli"
            >
              <CreditCard className="w-4 h-4 text-white" />
              <span>+ Kemaskini Yuran Ahli</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onQuickAddIncome();
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Hasil</span>
            </button>
            <button
              onClick={() => {
                onQuickAddExpense();
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>+ Belanja</span>
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
            Modul Sistem
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Balance Widget */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                Baki Kewangan Semasa
              </span>
            </div>
            <div className="text-base font-extrabold text-emerald-400 font-mono-num">
              {formatMYR(currentBalance)}
            </div>
            {totalArrears > 0 && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-700 flex items-center justify-between text-[11px]">
                <span className="text-rose-300 font-medium">Tunggakan Ahli:</span>
                <span className="text-rose-400 font-bold font-mono-num">
                  {formatMYR(totalArrears)}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onOpenGuide}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Panduan & Cara Guna</span>
          </button>
        </div>
      </aside>
    </>
  );
};
