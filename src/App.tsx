import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { StatCards } from './components/dashboard/StatCards';
import { InteractiveCharts } from './components/dashboard/InteractiveCharts';
import { ArrearsTableWidget } from './components/dashboard/ArrearsTableWidget';
import { RecentTransactionsWidget } from './components/dashboard/RecentTransactionsWidget';
import { FinancialSummaryWidget } from './components/dashboard/FinancialSummaryWidget';

// Modules
import { MemberList } from './components/members/MemberList';
import { MemberModal } from './components/members/MemberModal';
import { MemberProfileModal } from './components/members/MemberProfileModal';
import { PaymentMatrix } from './components/payments/PaymentMatrix';
import { PaymentEditModal } from './components/payments/PaymentEditModal';
import { FeeSettingsModal } from './components/payments/FeeSettingsModal';
import { IncomeList } from './components/income/IncomeList';
import { IncomeModal } from './components/income/IncomeModal';
import { ExpenseList } from './components/expenses/ExpenseList';
import { ExpenseModal } from './components/expenses/ExpenseModal';
import { TransactionLedger } from './components/ledger/TransactionLedger';
import { MonthlyReport } from './components/reports/MonthlyReport';
import { AnnualReport } from './components/reports/AnnualReport';
import { ImportExportModal } from './components/importExport/ImportExportModal';
import { AuditTrailModal } from './components/audit/AuditTrailModal';
import { UserGuideModal } from './components/guide/UserGuideModal';
import { AddYearModal } from './components/payments/AddYearModal';

import {
  FileSpreadsheet,
  AlertTriangle,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Member } from './types';

const MainDashboardView: React.FC<{
  onOpenImport: () => void;
  onViewMemberProfile: (memberId: string) => void;
  onEditPayment: (memberId: string) => void;
  onGoToMatrix: () => void;
  onGoToLedger: () => void;
  onOpenAddYear: () => void;
}> = ({
  onOpenImport,
  onViewMemberProfile,
  onEditPayment,
  onGoToMatrix,
  onGoToLedger,
  onOpenAddYear,
}) => {
  const {
    selectedYear,
    setSelectedYear,
    availableYears,
    selectedMonthFilter,
    setSelectedMonthFilter,
    isRealDataLoaded,
  } = useApp();

  const monthNames = [
    'Semua Bulan',
    'Januari',
    'Februari',
    'Mac',
    'April',
    'Mei',
    'Jun',
    'Julai',
    'Ogos',
    'September',
    'Oktober',
    'November',
    'Disember',
  ];

  return (
    <div className="space-y-5">
      {/* Excel Data Status Notice Banner */}
      {!isRealDataLoaded && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/40 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold text-white block sm:inline mr-1">
                [DATA STARTER ADC 2026]
              </span>
              <span>
                Pangkalan data sedang menggunakan set data contoh ADC 2026. Anda boleh terus memasukkan fail{' '}
                <strong className="text-amber-300">YURAN 2026.xlsx</strong> sebenar anda pada bila-bila masa.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenImport}
            className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Muat Naik YURAN 2026.xlsx</span>
          </button>
        </div>
      )}

      {/* Filter Year / Month Bar (Section 22) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-3.5 sm:p-4 rounded-2xl border border-slate-700/80 shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Penapis Paparan:
          </span>
          <span className="text-xs text-slate-400">
            Tahun {selectedYear} • {monthNames[selectedMonthFilter]}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => {
              if (e.target.value === 'NEW') {
                onOpenAddYear();
              } else {
                setSelectedYear(Number(e.target.value));
              }
            }}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                Tahun {yr}
              </option>
            ))}
            <option value="NEW">+ Tambah Tahun Baharu...</option>
          </select>

          <button
            onClick={onOpenAddYear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm border border-emerald-500/50 shrink-0"
            title="Buka / Tambah Tahun Baharu Operasi ADC Secara Automatik"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Tahun</span>
          </button>

          <select
            value={selectedMonthFilter}
            onChange={(e) => setSelectedMonthFilter(Number(e.target.value))}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {monthNames.map((name, idx) => (
              <option key={idx} value={idx}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Stat Cards: JUMLAH AHLI | KUTIPAN YURAN | TUNGGAKAN | HASIL | PERBELANJAAN | BAKI */}
      <StatCards />

      {/* 2. Interactive Charts: GRAF KUTIPAN YURAN & HASIL VS PERBELANJAAN */}
      <InteractiveCharts />

      {/* 3. Middle Section: PRESTASI BAYARAN AHLI & SENARAI TUNGGAKAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-12">
          <ArrearsTableWidget
            onViewMemberProfile={onViewMemberProfile}
            onEditPayment={onEditPayment}
            onGoToMatrix={onGoToMatrix}
          />
        </div>
      </div>

      {/* 4. Transaksi Terkini */}
      <RecentTransactionsWidget onGoToLedger={onGoToLedger} />

      {/* 5. Ringkasan Kewangan (Financial Summary) */}
      <FinancialSummaryWidget />
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isFeeSettingsOpen, setIsFeeSettingsOpen] = useState(false);
  const [isAddYearOpen, setIsAddYearOpen] = useState(false);

  // Quick Action Modals
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [memberToView, setMemberToView] = useState<Member | null>(null);

  const [isPaymentEditOpen, setIsPaymentEditOpen] = useState(false);
  const [paymentEditMemberId, setPaymentEditMemberId] = useState<string | null>(null);

  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const { members, toastMessage } = useApp();

  const handleViewMemberProfile = (memberId: string) => {
    const m = members.find((item) => item.id === memberId);
    if (m) {
      setMemberToView(m);
    }
  };

  const handleEditPayment = (memberId: string) => {
    setPaymentEditMemberId(memberId);
    setIsPaymentEditOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onOpenQuickPayment={() => {
          setPaymentEditMemberId(null);
          setIsPaymentEditOpen(true);
        }}
        onOpenAddYear={() => setIsAddYearOpen(true)}
      />

      {/* App Body with Sidebar & Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onQuickAddMember={() => {
            setMemberToEdit(null);
            setIsAddMemberOpen(true);
          }}
          onQuickAddIncome={() => setIsAddIncomeOpen(true)}
          onQuickAddExpense={() => setIsAddExpenseOpen(true)}
          onOpenGuide={() => setIsGuideModalOpen(true)}
          onQuickPayment={() => {
            setPaymentEditMemberId(null);
            setIsPaymentEditOpen(true);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'dashboard' && (
            <MainDashboardView
              onOpenImport={() => setIsImportModalOpen(true)}
              onViewMemberProfile={handleViewMemberProfile}
              onEditPayment={handleEditPayment}
              onGoToMatrix={() => setActiveTab('matrix')}
              onGoToLedger={() => setActiveTab('ledger')}
              onOpenAddYear={() => setIsAddYearOpen(true)}
            />
          )}

          {activeTab === 'members' && (
            <MemberList
              onOpenAddModal={() => {
                setMemberToEdit(null);
                setIsAddMemberOpen(true);
              }}
              onOpenEditModal={(m) => {
                setMemberToEdit(m);
                setIsAddMemberOpen(true);
              }}
              onOpenProfileModal={(m) => setMemberToView(m)}
              onOpenPaymentModal={handleEditPayment}
            />
          )}

          {activeTab === 'matrix' && <PaymentMatrix />}

          {activeTab === 'income' && <IncomeList />}

          {activeTab === 'expenses' && <ExpenseList />}

          {activeTab === 'ledger' && <TransactionLedger />}

          {activeTab === 'monthly-report' && <MonthlyReport />}

          {activeTab === 'annual-report' && <AnnualReport />}

          {activeTab === 'import-export' && (
            <div className="space-y-4">
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
                <h2 className="text-base font-bold text-white mb-1">
                  Pusat Import, Export & Sandaran Pangkalan Data ADC
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Klik butang di bawah untuk mengurus fail Excel atau membuat salinan sandaran (Backup).
                </p>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Buka Dialog Pengurusan Import / Export / Backup</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-xl">
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
                <h2 className="text-base font-bold text-white">Tetapan Kelab & Sistem</h2>
                <p className="text-xs text-slate-400">
                  Konfigurasikan maklumat persatuan dart, kadar yuran bulanan dan baki pembukaan.
                </p>
                <button
                  onClick={() => setIsFeeSettingsOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition"
                >
                  Ubah Tetapan Kelab & Kadar Yuran
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-700 text-rose-200'
                : toastMessage.type === 'warning'
                ? 'bg-amber-950/90 border-amber-700 text-amber-200'
                : 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : toastMessage.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Shared Modals */}
      <MemberModal
        isOpen={isAddMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false);
          setMemberToEdit(null);
        }}
        memberToEdit={memberToEdit}
      />

      <MemberProfileModal
        isOpen={Boolean(memberToView)}
        onClose={() => setMemberToView(null)}
        member={memberToView}
        onEditPayment={handleEditPayment}
      />

      <PaymentEditModal
        isOpen={isPaymentEditOpen}
        onClose={() => {
          setIsPaymentEditOpen(false);
          setPaymentEditMemberId(null);
        }}
        memberId={paymentEditMemberId}
      />

      <IncomeModal
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
      />

      <ExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />

      <FeeSettingsModal
        isOpen={isFeeSettingsOpen}
        onClose={() => setIsFeeSettingsOpen(false)}
      />

      <ImportExportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      <UserGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <AddYearModal
        isOpen={isAddYearOpen}
        onClose={() => setIsAddYearOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
}
