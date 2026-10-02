import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import {
  Member,
  PaymentRecord,
  Income,
  Expense,
  ClubSettings,
  AuditLog,
  LedgerItem,
  MonthlySummary,
} from '../types';
import {
  INITIAL_MEMBERS,
  INITIAL_PAYMENTS,
  INITIAL_INCOME,
  INITIAL_EXPENSES,
  INITIAL_SETTINGS,
  calculatePaymentMetrics,
} from '../services/sampleData';
import { useAuth } from './AuthContext';

interface AppContextType {
  // Data
  members: Member[];
  payments: PaymentRecord[];
  income: Income[];
  expenses: Expense[];
  settings: ClubSettings;
  auditLogs: AuditLog[];
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  availableYears: number[];
  addNewYear: (
    targetYear?: number,
    options?: { defaultMonthlyFee?: number; openingBalance?: number }
  ) => Promise<number>;
  ensureYearInitialized: (targetYear: number) => Promise<void>;
  activeYearOpeningBalance: number;
  selectedMonthFilter: number; // 0 for all, 1-12
  setSelectedMonthFilter: (m: number) => void;
  isRealDataLoaded: boolean;
  setIsRealDataLoaded: (val: boolean) => void;

  // Real-time Calculated Statistics
  totalMembers: number;
  totalFeeCollected: number;
  totalArrears: number;
  totalOtherIncome: number;
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  arrearsMembers: PaymentRecord[];
  recentTransactions: LedgerItem[];
  ledgerItems: LedgerItem[];
  monthlySummaries: MonthlySummary[];
  paymentStatusCounts: {
    selesai: number;
    sebahagian: number;
    tertunggak: number;
    belumBayar: number;
  };
  dynamicAlerts: string[];

  // CRUD Actions
  addMember: (memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;

  updateMonthlyPayment: (
    memberId: string,
    month: number,
    amount: number,
    note?: string
  ) => Promise<void>;

  addIncome: (incomeData: Omit<Income, 'id' | 'trxId' | 'createdAt'>) => Promise<void>;
  updateIncome: (id: string, updates: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  addExpense: (expenseData: Omit<Expense, 'id' | 'trxId' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  updateSettings: (newSettings: Partial<ClubSettings>) => Promise<void>;
  logAuditAction: (action: string, details: string, prev?: string, next?: string) => Promise<void>;

  // Data management
  importParsedData: (
    newMembers: Member[],
    newPayments: PaymentRecord[],
    newIncome: Income[],
    newExpenses: Expense[],
    sourceName: string
  ) => Promise<void>;
  resetToSampleData: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // Formatting helpers
  formatMYR: (amount: number) => string;
  formatDate: (dateStr: string) => string;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, role } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [customYears, setCustomYears] = useState<number[]>(() => {
    const saved = localStorage.getItem('adc_custom_years');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number>(0);
  const [isRealDataLoaded, setIsRealDataLoaded] = useState<boolean>(() => {
    return localStorage.getItem('adc_real_data_imported') === 'true';
  });

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Local state with localStorage fallback
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('adc_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('adc_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [income, setIncome] = useState<Income[]>(() => {
    const saved = localStorage.getItem('adc_income');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((i: any) => i.category === 'GAME / PERLAWANAN')) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_INCOME;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('adc_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [settings, setSettings] = useState<ClubSettings>(() => {
    const saved = localStorage.getItem('adc_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('adc_audit_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'log-01',
        timestamp: new Date().toISOString(),
        userName: 'Sistem ADC',
        userRole: 'ADMIN',
        action: 'Permulaan Sistem',
        details: 'Sistem Kewangan ADC 2026 sedia digunakan',
      }
    ];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('adc_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('adc_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('adc_income', JSON.stringify(income));
  }, [income]);

  useEffect(() => {
    localStorage.setItem('adc_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('adc_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('adc_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('adc_custom_years', JSON.stringify(customYears));
  }, [customYears]);

  // Firestore Listeners
  useEffect(() => {
    let unsubs: (() => void)[] = [];
    try {
      const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Member[] = [];
          snapshot.forEach((d) => list.push(d.data() as Member));
          setMembers(list);
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'members'));

      const unsubPayments = onSnapshot(collection(db, 'payments'), (snapshot) => {
        if (!snapshot.empty) {
          const list: PaymentRecord[] = [];
          snapshot.forEach((d) => list.push(d.data() as PaymentRecord));
          setPayments(list);
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'payments'));

      const unsubIncome = onSnapshot(collection(db, 'income'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Income[] = [];
          snapshot.forEach((d) => list.push(d.data() as Income));
          setIncome(list);
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'income'));

      const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Expense[] = [];
          snapshot.forEach((d) => list.push(d.data() as Expense));
          setExpenses(list);
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'expenses'));

      const unsubSettings = onSnapshot(collection(db, 'settings'), (snapshot) => {
        if (!snapshot.empty) {
          snapshot.forEach((d) => {
            if (d.id === 'club_settings') {
              setSettings(d.data() as ClubSettings);
            }
          });
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'settings'));

      const unsubAudit = onSnapshot(collection(db, 'audit_logs'), (snapshot) => {
        if (!snapshot.empty) {
          const list: AuditLog[] = [];
          snapshot.forEach((d) => list.push(d.data() as AuditLog));
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setAuditLogs(list);
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'audit_logs'));

      unsubs = [unsubMembers, unsubPayments, unsubIncome, unsubExpenses, unsubSettings, unsubAudit];
    } catch (e) {
      console.warn('Firestore offline or connecting:', e);
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, []);

  // Format Helpers
  const formatMYR = (val: number): string => {
    const num = isNaN(val) ? 0 : val;
    return `RM ${num.toLocaleString('en-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Log Audit Action
  const logAuditAction = async (action: string, details: string, prev?: string, next?: string) => {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      userName: userProfile.displayName || 'Pengguna ADC',
      userRole: role,
      action,
      details,
      previousData: prev,
      newData: next,
    };

    setAuditLogs((prevLogs) => [log, ...prevLogs]);

    try {
      await setDoc(doc(db, 'audit_logs', log.id), log);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `audit_logs/${log.id}`);
    }
  };

  // Dynamic Available Years List (Automatically including 2025, 2026, calendar year, next year, custom years)
  const availableYears = useMemo<number[]>(() => {
    const yearSet = new Set<number>();
    yearSet.add(2025);
    yearSet.add(2026);

    const nowYear = new Date().getFullYear();
    yearSet.add(nowYear);
    yearSet.add(nowYear + 1); // Automatically include subsequent year (e.g. 2027)

    if (settings.year) yearSet.add(settings.year);

    payments.forEach((p) => {
      if (p.year) yearSet.add(p.year);
    });

    income.forEach((i) => {
      if (i.date) {
        const y = new Date(i.date).getFullYear();
        if (!isNaN(y) && y >= 2020 && y <= 2100) yearSet.add(y);
      }
    });

    expenses.forEach((e) => {
      if (e.date) {
        const y = new Date(e.date).getFullYear();
        if (!isNaN(y) && y >= 2020 && y <= 2100) yearSet.add(y);
      }
    });

    customYears.forEach((y) => {
      if (y >= 2020 && y <= 2100) yearSet.add(y);
    });

    return Array.from(yearSet).sort((a, b) => b - a);
  }, [settings.year, payments, income, expenses, customYears]);

  // Ensure year is initialized with payment records for all active members
  const ensureYearInitialized = async (targetYear: number) => {
    if (!members || members.length === 0) return;

    const existingMemberIdsForYear = new Set(
      payments.filter((p) => p.year === targetYear).map((p) => p.memberId)
    );

    const missingMembers = members.filter((m) => !existingMemberIdsForYear.has(m.id));
    if (missingMembers.length === 0) return;

    const defaultFeeForYear =
      settings.yearlyDefaultFees?.[targetYear] || settings.defaultMonthlyFee || 20;

    const currentCalendarYear = new Date().getFullYear();
    const currentMonthNum =
      targetYear < currentCalendarYear
        ? 12
        : targetYear === currentCalendarYear
        ? new Date().getMonth() + 1
        : 1;

    const now = new Date().toISOString();
    const newRecords: PaymentRecord[] = missingMembers.map((m) => {
      const fee = m.monthlyFee || defaultFeeForYear;
      const emptyMonthly: Record<number, number> = {};
      for (let month = 1; month <= 12; month++) {
        emptyMonthly[month] = 0;
      }
      const metrics = calculatePaymentMetrics(emptyMonthly, fee, currentMonthNum);

      return {
        id: `${m.id}_${targetYear}`,
        memberId: m.id,
        memberName: m.name,
        year: targetYear,
        monthlyAmounts: emptyMonthly,
        totalPaid: 0,
        totalDue: metrics.totalDue,
        arrears: metrics.arrears,
        status: metrics.status,
        updatedAt: now,
        updatedBy: 'Sistem Automatik ADC',
      };
    });

    setPayments((prev) => [...prev, ...newRecords]);

    try {
      newRecords.forEach((rec) => {
        setDoc(doc(db, 'payments', rec.id), rec);
      });
    } catch (err) {
      console.warn('Notice: Firestore sync for year initialization:', err);
    }
  };

  // Add new year automatically with members rollover
  const addNewYear = async (
    targetYear?: number,
    options?: { defaultMonthlyFee?: number; openingBalance?: number }
  ) => {
    const nextYear = targetYear || Math.max(...availableYears, 2026) + 1;

    if (!customYears.includes(nextYear)) {
      setCustomYears((prev) => [...prev, nextYear]);
    }

    if (options) {
      const updatedYearlyFees = {
        ...(settings.yearlyDefaultFees || {}),
        ...(options.defaultMonthlyFee !== undefined ? { [nextYear]: options.defaultMonthlyFee } : {}),
      };
      const updatedYearlyOpening = {
        ...(settings.yearlyOpeningBalances || {}),
        ...(options.openingBalance !== undefined ? { [nextYear]: options.openingBalance } : {}),
      };

      await updateSettings({
        yearlyDefaultFees: updatedYearlyFees,
        yearlyOpeningBalances: updatedYearlyOpening,
      });
    }

    await ensureYearInitialized(nextYear);
    setSelectedYear(nextYear);

    await logAuditAction(
      'TAMBAH TAHUN OPERASI',
      `Tahun operasi ${nextYear} telah diaktifkan secara automatik. Rekod yuran 12 bulan telah dijana untuk semua ${members.length} ahli kelab.`
    );

    showToast(`Tahun ${nextYear} berjaya dibuka! Rekod kutipan ahli sedia digunakan.`, 'success');
    return nextYear;
  };

  // Auto-initialize records when switching selectedYear or when members change
  useEffect(() => {
    if (members.length > 0) {
      ensureYearInitialized(selectedYear);
    }
  }, [selectedYear, members.length]);

  // Real-time Calculations
  const totalMembers = members.length;

  const activeYearOpeningBalance = useMemo(() => {
    if (settings.yearlyOpeningBalances && settings.yearlyOpeningBalances[selectedYear] !== undefined) {
      return settings.yearlyOpeningBalances[selectedYear];
    }
    if (selectedYear === 2026) {
      return settings.openingBalance;
    }
    return 0;
  }, [settings.yearlyOpeningBalances, settings.openingBalance, selectedYear]);

  const totalFeeCollected = useMemo(() => {
    return payments
      .filter((p) => p.year === selectedYear)
      .reduce((sum, p) => sum + (p.totalPaid || 0), 0);
  }, [payments, selectedYear]);

  const totalArrears = useMemo(() => {
    return payments
      .filter((p) => p.year === selectedYear)
      .reduce((sum, p) => sum + (p.arrears || 0), 0);
  }, [payments, selectedYear]);

  const totalOtherIncome = useMemo(() => {
    return income
      .filter((i) => {
        if (i.category === 'YURAN AHLI') return false;
        if (!i.date) return false;
        const d = new Date(i.date);
        return d.getFullYear() === selectedYear;
      })
      .reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [income, selectedYear]);

  // JUMLAH HASIL = Yuran Ahli + Semua Hasil Lain
  const totalIncome = useMemo(() => {
    return totalFeeCollected + totalOtherIncome;
  }, [totalFeeCollected, totalOtherIncome]);

  const totalExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getFullYear() === selectedYear;
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses, selectedYear]);

  // BAKI = Baki Awal (Bagi Tahun Dipilih) + Jumlah Hasil - Jumlah Perbelanjaan
  const currentBalance = useMemo(() => {
    return activeYearOpeningBalance + totalIncome - totalExpenses;
  }, [activeYearOpeningBalance, totalIncome, totalExpenses]);

  // Arrears Members sorted by highest arrears for selectedYear
  const arrearsMembers = useMemo(() => {
    return payments
      .filter((p) => p.year === selectedYear && p.arrears > 0)
      .sort((a, b) => b.arrears - a.arrears);
  }, [payments, selectedYear]);

  // Payment Status Counts for selectedYear
  const paymentStatusCounts = useMemo(() => {
    const counts = { selesai: 0, sebahagian: 0, tertunggak: 0, belumBayar: 0 };
    payments
      .filter((p) => p.year === selectedYear)
      .forEach((p) => {
        if (p.status === 'SELESAI') counts.selesai++;
        else if (p.status === 'SEBAHAGIAN') counts.sebahagian++;
        else if (p.status === 'TERTUNGGAK') counts.tertunggak++;
        else counts.belumBayar++;
      });
    return counts;
  }, [payments, selectedYear]);

  // Monthly Summaries & Cash Flow for selectedYear
  const monthlySummaries = useMemo<MonthlySummary[]>(() => {
    const monthNames = [
      'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
      'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
    ];

    const currentYearPayments = payments.filter((p) => p.year === selectedYear);

    return monthNames.map((name, idx) => {
      const monthNum = idx + 1;

      // Fees collected in this month for selectedYear
      let feeCol = 0;
      let payingCount = 0;
      let arrearsCount = 0;

      currentYearPayments.forEach((p) => {
        const amt = p.monthlyAmounts[monthNum] || 0;
        if (amt > 0) {
          feeCol += amt;
          payingCount++;
        } else {
          arrearsCount++;
        }
      });

      // Other income in this month for selectedYear
      const otherInc = income
        .filter((i) => {
          if (i.category === 'YURAN AHLI') return false;
          if (!i.date) return false;
          const d = new Date(i.date);
          return d.getFullYear() === selectedYear && d.getMonth() + 1 === monthNum;
        })
        .reduce((sum, i) => sum + i.amount, 0);

      // Expenses in this month for selectedYear
      const exp = expenses
        .filter((e) => {
          if (!e.date) return false;
          const d = new Date(e.date);
          return d.getFullYear() === selectedYear && d.getMonth() + 1 === monthNum;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      const totInc = feeCol + otherInc;
      const net = totInc - exp;

      return {
        month: monthNum,
        monthName: name,
        feeCollection: feeCol,
        otherIncome: otherInc,
        totalIncome: totInc,
        totalExpense: exp,
        netBalance: net,
        payingMembersCount: payingCount,
        arrearsMembersCount: arrearsCount,
      };
    });
  }, [payments, income, expenses, selectedYear]);

  // Integrated Ledger Items
  const ledgerItems = useMemo<LedgerItem[]>(() => {
    const rawList: {
      id: string;
      date: string;
      trxId: string;
      type: 'HASIL' | 'PERBELANJAAN';
      category: string;
      description: string;
      incomeAmount: number;
      expenseAmount: number;
      paymentMethod: string;
      recipientOrOfficer: string;
      notes?: string;
    }[] = [];

    // Add Income
    income.forEach((inc) => {
      rawList.push({
        id: inc.id,
        date: inc.date,
        trxId: inc.trxId,
        type: 'HASIL',
        category: inc.category,
        description: inc.description,
        incomeAmount: inc.amount,
        expenseAmount: 0,
        paymentMethod: inc.paymentMethod,
        recipientOrOfficer: inc.officer,
        notes: inc.notes,
      });
    });

    // Add Expenses
    expenses.forEach((exp) => {
      rawList.push({
        id: exp.id,
        date: exp.date,
        trxId: exp.trxId,
        type: 'PERBELANJAAN',
        category: exp.category,
        description: exp.description,
        incomeAmount: 0,
        expenseAmount: exp.amount,
        paymentMethod: exp.paymentMethod,
        recipientOrOfficer: exp.recipient,
        notes: exp.notes,
      });
    });

    // Sort by Date Ascending to calculate running balance accurately
    rawList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let running = settings.openingBalance;
    const computed: LedgerItem[] = rawList.map((item) => {
      running += item.incomeAmount - item.expenseAmount;
      return {
        ...item,
        runningBalance: running,
      };
    });

    // Return descending for UI presentation (latest on top)
    return computed.reverse();
  }, [income, expenses, settings.openingBalance]);

  const recentTransactions = useMemo(() => {
    return ledgerItems.slice(0, 10);
  }, [ledgerItems]);

  // Dynamic Alerts & Warnings based on real data
  const dynamicAlerts = useMemo(() => {
    const alerts: string[] = [];
    const countArrears = arrearsMembers.length;
    const currentMonthNum = new Date().getMonth() + 1;

    if (countArrears > 0) {
      alerts.push(`${countArrears} orang ahli masih mempunyai tunggakan yuran kelab.`);
    }

    if (totalArrears > 0) {
      alerts.push(`${formatMYR(totalArrears)} jumlah tunggakan semasa yang perlu dikutip.`);
    }

    // Unpaid this month
    const unpaidThisMonth = payments.filter((p) => (p.monthlyAmounts[currentMonthNum] || 0) === 0).length;
    if (unpaidThisMonth > 0) {
      alerts.push(`${unpaidThisMonth} ahli belum membuat sebarang bayaran untuk bulan ini.`);
    }

    // Expense trend check
    if (currentMonthNum > 1) {
      const thisMonthExp = monthlySummaries[currentMonthNum - 1]?.totalExpense || 0;
      const prevMonthExp = monthlySummaries[currentMonthNum - 2]?.totalExpense || 0;
      if (thisMonthExp > prevMonthExp && prevMonthExp > 0) {
        alerts.push(`Perbelanjaan bulan ini (RM ${thisMonthExp.toFixed(2)}) meningkat berbanding bulan sebelumnya.`);
      }
    }

    return alerts;
  }, [arrearsMembers, totalArrears, payments, monthlySummaries]);

  // CRUD Operations

  // Member CRUD
  const addMember = async (data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `ADC-M${String(members.length + 1).padStart(2, '0')}`;
    const newMember: Member = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const yearsToInit = Array.from(new Set([...availableYears, selectedYear]));
    const newPayments: PaymentRecord[] = yearsToInit.map((yr) => {
      const emptyMonthly: Record<number, number> = {};
      for (let m = 1; m <= 12; m++) emptyMonthly[m] = 0;
      const metrics = calculatePaymentMetrics(emptyMonthly, newMember.monthlyFee);
      return {
        id: `${newId}_${yr}`,
        memberId: newId,
        memberName: newMember.name,
        year: yr,
        monthlyAmounts: emptyMonthly,
        totalPaid: 0,
        totalDue: metrics.totalDue,
        arrears: metrics.arrears,
        status: 'BELUM BAYAR',
        updatedAt: new Date().toISOString(),
        updatedBy: userProfile.displayName,
      };
    });

    setMembers((prev) => [...prev, newMember]);
    setPayments((prev) => [...prev, ...newPayments]);

    try {
      await setDoc(doc(db, 'members', newId), newMember);
      for (const p of newPayments) {
        await setDoc(doc(db, 'payments', p.id), p);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `members/${newId}`);
    }

    await logAuditAction(
      'TAMBAH AHLI',
      `Menambah ahli baharu: ${newMember.name} (${newId}) dengan yuran RM ${newMember.monthlyFee}/bulan`
    );
    showToast(`Ahli baharu ${newMember.name} berjaya didaftarkan.`);
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    const oldMember = members.find((m) => m.id === id);
    if (!oldMember) return;

    const updatedMember = {
      ...oldMember,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setMembers((prev) => prev.map((m) => (m.id === id ? updatedMember : m)));

    // If name changed or fee changed, update payment records across all years
    const nameChanged = updates.name && updates.name !== oldMember.name;
    const feeChanged = updates.monthlyFee !== undefined && updates.monthlyFee !== oldMember.monthlyFee;

    if (nameChanged || feeChanged) {
      const updatedPayments: PaymentRecord[] = [];
      setPayments((prev) =>
        prev.map((p) => {
          if (p.memberId === id) {
            const fee = feeChanged ? updates.monthlyFee! : oldMember.monthlyFee;
            const metrics = calculatePaymentMetrics(p.monthlyAmounts, fee);
            const updatedP: PaymentRecord = {
              ...p,
              memberName: nameChanged ? updates.name! : p.memberName,
              totalDue: metrics.totalDue,
              arrears: metrics.arrears,
              status: metrics.status,
              updatedAt: new Date().toISOString(),
            };
            updatedPayments.push(updatedP);
            return updatedP;
          }
          return p;
        })
      );

      // Save updated payment records to Firestore
      try {
        for (const p of updatedPayments) {
          setDoc(doc(db, 'payments', p.id), p);
        }
      } catch (e) {
        console.warn('Notice: Firestore payment record sync after member update:', e);
      }
    }

    try {
      await setDoc(doc(db, 'members', id), updatedMember);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `members/${id}`);
    }

    await logAuditAction(
      'KEMASKINI AHLI',
      `Kemaskini maklumat ahli: ${updatedMember.name} (${id})`,
      JSON.stringify(oldMember),
      JSON.stringify(updatedMember)
    );
    showToast(`Maklumat ahli ${updatedMember.name} berjaya dikemaskini.`);
  };

  const deleteMember = async (id: string) => {
    const memberToDelete = members.find((m) => m.id === id);
    if (!memberToDelete) return;

    const memberPayments = payments.filter((p) => p.memberId === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setPayments((prev) => prev.filter((p) => p.memberId !== id));

    try {
      await deleteDoc(doc(db, 'members', id));
      for (const p of memberPayments) {
        await deleteDoc(doc(db, 'payments', p.id));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `members/${id}`);
    }

    await logAuditAction(
      'PADAM AHLI',
      `Memadam rekod ahli: ${memberToDelete.name} (${id})`
    );
    showToast(`Ahli ${memberToDelete.name} berjaya dipadamkan.`, 'warning');
  };

  // Monthly Payment Update
  const updateMonthlyPayment = async (
    memberId: string,
    month: number,
    amount: number,
    note?: string
  ) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const existingPayment = payments.find((p) => p.memberId === memberId && p.year === selectedYear);
    const prevAmounts = existingPayment ? { ...existingPayment.monthlyAmounts } : {};
    const oldAmount = prevAmounts[month] || 0;

    const newAmounts = {
      ...prevAmounts,
      [month]: Math.max(0, amount),
    };

    const metrics = calculatePaymentMetrics(newAmounts, member.monthlyFee, month);

    const updatedPayment: PaymentRecord = {
      id: `${memberId}_${selectedYear}`,
      memberId,
      memberName: member.name,
      year: selectedYear,
      monthlyAmounts: newAmounts,
      totalPaid: metrics.totalPaid,
      totalDue: metrics.totalDue,
      arrears: metrics.arrears,
      status: metrics.status,
      updatedAt: new Date().toISOString(),
      updatedBy: userProfile.displayName,
    };

    setPayments((prev) => {
      const idx = prev.findIndex((p) => p.id === updatedPayment.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedPayment;
        return copy;
      }
      return [...prev, updatedPayment];
    });

    try {
      await setDoc(doc(db, 'payments', updatedPayment.id), updatedPayment);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `payments/${updatedPayment.id}`);
    }

    const monthNames = [
      'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
      'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
    ];

    await logAuditAction(
      'KEMASKINI BAYARAN YURAN',
      `Mengemaskini bayaran ${member.name}: ${monthNames[month - 1]} RM${oldAmount} → RM${amount}${note ? ` (Catatan: ${note})` : ''}`,
      `RM ${oldAmount}`,
      `RM ${amount}`
    );

    showToast(`Bayaran yuran ${member.name} (${monthNames[month - 1]}) dikemaskini kepada RM ${amount}.`);
  };

  // Income CRUD
  const addIncome = async (data: Omit<Income, 'id' | 'trxId' | 'createdAt'>) => {
    const trxCount = income.length + 1;
    const trxId = `ADC-INC-${String(trxCount).padStart(4, '0')}`;
    const newInc: Income = {
      ...data,
      id: `inc-${Date.now()}`,
      trxId,
      createdAt: new Date().toISOString(),
    };

    setIncome((prev) => [newInc, ...prev]);

    try {
      await setDoc(doc(db, 'income', newInc.id), newInc);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `income/${newInc.id}`);
    }

    await logAuditAction(
      'TAMBAH HASIL',
      `Merekod hasil baharu [${trxId}]: ${newInc.description} (RM ${newInc.amount.toFixed(2)})`
    );
    showToast(`Hasil RM ${newInc.amount.toFixed(2)} [${trxId}] berjaya ditambah.`);
  };

  const updateIncome = async (id: string, updates: Partial<Income>) => {
    const old = income.find((i) => i.id === id);
    if (!old) return;

    const updated = { ...old, ...updates };
    setIncome((prev) => prev.map((i) => (i.id === id ? updated : i)));

    try {
      await setDoc(doc(db, 'income', id), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `income/${id}`);
    }

    await logAuditAction('KEMASKINI HASIL', `Mengemaskini hasil [${updated.trxId}]`);
    showToast(`Rekod hasil [${updated.trxId}] berjaya dikemaskini.`);
  };

  const deleteIncome = async (id: string) => {
    const old = income.find((i) => i.id === id);
    if (!old) return;

    setIncome((prev) => prev.filter((i) => i.id !== id));

    try {
      await deleteDoc(doc(db, 'income', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `income/${id}`);
    }

    await logAuditAction('PADAM HASIL', `Memadam rekod hasil [${old.trxId}]: RM ${old.amount}`);
    showToast(`Rekod hasil [${old.trxId}] dipadamkan.`, 'warning');
  };

  // Expense CRUD
  const addExpense = async (data: Omit<Expense, 'id' | 'trxId' | 'createdAt'>) => {
    const trxCount = expenses.length + 1;
    const trxId = `ADC-EXP-${String(trxCount).padStart(4, '0')}`;
    const newExp: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      trxId,
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExp, ...prev]);

    try {
      await setDoc(doc(db, 'expenses', newExp.id), newExp);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `expenses/${newExp.id}`);
    }

    await logAuditAction(
      'TAMBAH PERBELANJAAN',
      `Merekod perbelanjaan baharu [${trxId}]: ${newExp.description} kepada ${newExp.recipient} (RM ${newExp.amount.toFixed(2)})`
    );
    showToast(`Perbelanjaan RM ${newExp.amount.toFixed(2)} [${trxId}] berjaya direkodkan.`);
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const old = expenses.find((e) => e.id === id);
    if (!old) return;

    const updated = { ...old, ...updates };
    setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));

    try {
      await setDoc(doc(db, 'expenses', id), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `expenses/${id}`);
    }

    await logAuditAction('KEMASKINI PERBELANJAAN', `Mengemaskini perbelanjaan [${updated.trxId}]`);
    showToast(`Rekod perbelanjaan [${updated.trxId}] dikemaskini.`);
  };

  const deleteExpense = async (id: string) => {
    const old = expenses.find((e) => e.id === id);
    if (!old) return;

    setExpenses((prev) => prev.filter((e) => e.id !== id));

    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `expenses/${id}`);
    }

    await logAuditAction('PADAM PERBELANJAAN', `Memadam perbelanjaan [${old.trxId}]: RM ${old.amount}`);
    showToast(`Rekod perbelanjaan [${old.trxId}] dipadamkan.`, 'warning');
  };

  // Settings
  const updateSettings = async (newSettings: Partial<ClubSettings>) => {
    const updated = { ...settings, ...newSettings, updatedAt: new Date().toISOString() };
    setSettings(updated);

    try {
      await setDoc(doc(db, 'settings', 'club_settings'), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/club_settings');
    }

    await logAuditAction('KEMASKINI TETAPAN', `Mengemaskini tetapan kelab: Yuran RM ${updated.defaultMonthlyFee}`);
    showToast('Tetapan kelab berjaya dikemaskini.');
  };

  // Import parsed data from Excel
  const importParsedData = async (
    newMembers: Member[],
    newPayments: PaymentRecord[],
    newIncome: Income[],
    newExpenses: Expense[],
    sourceName: string
  ) => {
    if (newMembers.length > 0) setMembers(newMembers);
    if (newPayments.length > 0) setPayments(newPayments);
    if (newIncome.length > 0) setIncome(newIncome);
    if (newExpenses.length > 0) setExpenses(newExpenses);

    setIsRealDataLoaded(true);
    localStorage.setItem('adc_real_data_imported', 'true');

    // Save to Firestore in background
    try {
      newMembers.forEach((m) => setDoc(doc(db, 'members', m.id), m));
      newPayments.forEach((p) => setDoc(doc(db, 'payments', p.id), p));
      newIncome.forEach((i) => setDoc(doc(db, 'income', i.id), i));
      newExpenses.forEach((e) => setDoc(doc(db, 'expenses', e.id), e));
    } catch (e) {
      console.warn('Batch firestore save notice:', e);
    }

    await logAuditAction(
      'IMPORT FAIL EXCEL',
      `Import fail ${sourceName}: ${newMembers.length} ahli, ${newIncome.length} hasil, ${newExpenses.length} perbelanjaan`
    );
    showToast(`Data daripada fail ${sourceName} berjaya dimuatkan ke sistem!`);
  };

  // Reset to Sample Data
  const resetToSampleData = async () => {
    setMembers(INITIAL_MEMBERS);
    setPayments(INITIAL_PAYMENTS);
    setIncome(INITIAL_INCOME);
    setExpenses(INITIAL_EXPENSES);
    setSettings(INITIAL_SETTINGS);
    setIsRealDataLoaded(false);
    localStorage.removeItem('adc_real_data_imported');

    await logAuditAction('RESET DATA', 'Sistem disetkan semula kepada dataset permulaan ADC 2026.');
    showToast('Data telah disetkan kepada data asas permulaan.');
  };

  // Clear All
  const clearAllData = async () => {
    setMembers([]);
    setPayments([]);
    setIncome([]);
    setExpenses([]);
    setIsRealDataLoaded(true);
    localStorage.setItem('adc_real_data_imported', 'true');

    await logAuditAction('PADAM SEMUA DATA', 'Semua data ahli dan kewangan telah dikosongkan oleh pentadbir.');
    showToast('Semua data telah dikosongkan.', 'warning');
  };

  return (
    <AppContext.Provider
      value={{
        members,
        payments,
        income,
        expenses,
        settings,
        auditLogs,
        selectedYear,
        setSelectedYear,
        availableYears,
        addNewYear,
        ensureYearInitialized,
        activeYearOpeningBalance,
        selectedMonthFilter,
        setSelectedMonthFilter,
        isRealDataLoaded,
        setIsRealDataLoaded,

        totalMembers,
        totalFeeCollected,
        totalArrears,
        totalOtherIncome,
        totalIncome,
        totalExpenses,
        currentBalance,
        arrearsMembers,
        recentTransactions,
        ledgerItems,
        monthlySummaries,
        paymentStatusCounts,
        dynamicAlerts,

        addMember,
        updateMember,
        deleteMember,
        updateMonthlyPayment,
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        updateSettings,
        logAuditAction,

        importParsedData,
        resetToSampleData,
        clearAllData,

        formatMYR,
        formatDate,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
