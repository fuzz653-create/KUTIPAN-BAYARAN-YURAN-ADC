export type UserRole = 'ADMIN' | 'BENDAHARI' | 'AJK';

export type PaymentStatus = 'SELESAI' | 'SEBAHAGIAN' | 'TERTUNGGAK' | 'BELUM BAYAR';

export type MemberStatus = 'AKTIF' | 'TIDAK_AKTIF';

export interface Member {
  id: string;
  name: string;
  nickname?: string;
  phone: string;
  icNumber?: string;
  email?: string;
  position?: string;
  jerseySize?: string;
  registeredDate: string; // YYYY-MM-DD
  status: MemberStatus;
  monthlyFee: number; // e.g. RM20
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string; // memberId_year
  memberId: string;
  memberName: string;
  year: number;
  monthlyAmounts: Record<number, number>; // month 1-12 -> amount paid
  totalPaid: number;
  totalDue: number;
  arrears: number;
  status: PaymentStatus;
  updatedAt: string;
  updatedBy: string;
}

export type IncomeCategory =
  | 'YURAN AHLI'
  | 'GAME / PERLAWANAN'
  | 'PERTANDINGAN'
  | 'SEWAAN'
  | 'SUMBANGAN'
  | 'SPONSOR'
  | 'JUALAN'
  | 'LAIN-LAIN';

export interface Income {
  id: string;
  trxId: string; // e.g. ADC-INC-0001
  date: string; // YYYY-MM-DD
  category: IncomeCategory;
  description: string;
  amount: number;
  paymentMethod: 'TUNAI' | 'ONLINE TRANSFER' | 'DUITNOW QR' | 'CEK' | 'LAIN-LAIN';
  officer: string;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'SEWA'
  | 'ELEKTRIK / TNB'
  | 'AIR / SAINS'
  | 'PERALATAN DART'
  | 'PENYELENGGARAAN'
  | 'PROGRAM'
  | 'HADIAH'
  | 'MAKANAN / MINUMAN'
  | 'LOGISTIK'
  | 'PENGANGKUTAN'
  | 'LAIN-LAIN';

export interface Expense {
  id: string;
  trxId: string; // e.g. ADC-EXP-0001
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: 'TUNAI' | 'ONLINE TRANSFER' | 'DUITNOW QR' | 'CEK' | 'LAIN-LAIN';
  recipient: string;
  receiptNo?: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface ClubSettings {
  id: string;
  clubName: string;
  year: number;
  defaultMonthlyFee: number;
  openingBalance: number;
  yearlyOpeningBalances?: Record<number, number>;
  yearlyDefaultFees?: Record<number, number>;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  previousData?: string;
  newData?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface LedgerItem {
  id: string;
  date: string;
  trxId: string;
  type: 'HASIL' | 'PERBELANJAAN';
  category: string;
  description: string;
  incomeAmount: number;
  expenseAmount: number;
  runningBalance: number;
  paymentMethod: string;
  recipientOrOfficer: string;
  notes?: string;
}

export interface MonthlySummary {
  month: number;
  monthName: string;
  feeCollection: number;
  otherIncome: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  payingMembersCount: number;
  arrearsMembersCount: number;
}
