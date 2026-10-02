import * as XLSX from 'xlsx';
import { Member, PaymentRecord, Income, Expense, ClubSettings } from '../types';
import { calculatePaymentMetrics } from './sampleData';

export interface ExcelImportResult {
  members: Member[];
  payments: PaymentRecord[];
  income: Income[];
  expenses: Expense[];
  sheetNames: string[];
  warnings: string[];
  totalRowsProcessed: number;
}

export function parseExcelWorkbook(fileData: ArrayBuffer, currentSettings: ClubSettings): ExcelImportResult {
  const workbook = XLSX.read(fileData, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  
  const members: Member[] = [];
  const payments: PaymentRecord[] = [];
  const income: Income[] = [];
  const expenses: Expense[] = [];
  const warnings: string[] = [];
  let totalRowsProcessed = 0;

  const monthKeys: { [key: string]: number } = {
    'jan': 1, 'januari': 1, 'january': 1, '1': 1,
    'feb': 2, 'februari': 2, 'february': 2, '2': 2,
    'mac': 3, 'mac/mar': 3, 'mar': 3, 'march': 3, '3': 3,
    'apr': 4, 'april': 4, '4': 4,
    'mei': 5, 'may': 5, '5': 5,
    'jun': 6, 'june': 6, '6': 6,
    'jul': 7, 'julai': 7, 'july': 7, '7': 7,
    'ogo': 8, 'ogos': 8, 'aug': 8, 'august': 8, '8': 8,
    'sep': 9, 'sept': 9, 'september': 9, '9': 9,
    'okt': 10, 'oktober': 10, 'oct': 10, 'october': 10, '10': 10,
    'nov': 11, 'november': 11, '11': 11,
    'dis': 12, 'disember': 12, 'dec': 12, 'december': 12, '12': 12,
  };

  // Inspect each sheet
  sheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return;

    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rows || rows.length === 0) return;

    // Find header row (the first row containing keywords like 'nama', 'ahli', 'tarikh', 'butiran', etc.)
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const rowStr = rows[i].map(c => String(c).toLowerCase().trim()).join(' ');
      if (rowStr.includes('nama') || rowStr.includes('member') || rowStr.includes('tarikh') || rowStr.includes('butiran')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      // Default to row 0 if no clear header
      headerRowIndex = 0;
    }

    const headers = rows[headerRowIndex].map(h => String(h).trim().toLowerCase());
    const dataRows = rows.slice(headerRowIndex + 1);

    // Identify if this sheet is Fee/Members Matrix
    const hasName = headers.some(h => h.includes('nama') || h.includes('ahli') || h.includes('name'));
    const monthCols: { colIndex: number; month: number }[] = [];

    headers.forEach((h, idx) => {
      const cleanH = h.replace(/[^a-z0-9]/g, '');
      if (monthKeys[cleanH]) {
        monthCols.push({ colIndex: idx, month: monthKeys[cleanH] });
      }
    });

    const isFeeMatrix = hasName && monthCols.length >= 3;
    const isExpenseSheet = sheetName.toLowerCase().includes('perbelanjaan') || sheetName.toLowerCase().includes('belanja') || headers.some(h => h.includes('penerima') || h.includes('perbelanjaan'));
    const isIncomeSheet = !isFeeMatrix && (sheetName.toLowerCase().includes('hasil') || sheetName.toLowerCase().includes('terimaan') || sheetName.toLowerCase().includes('income'));

    if (isFeeMatrix) {
      const nameColIdx = headers.findIndex(h => h.includes('nama') || h.includes('ahli') || h.includes('name'));
      const phoneColIdx = headers.findIndex(h => h.includes('telefon') || h.includes('tel') || h.includes('phone') || h.includes('hp'));
      const feeColIdx = headers.findIndex(h => h.includes('kadar') || h.includes('yuran bulanan') || h.includes('rate'));

      dataRows.forEach((r, idx) => {
        if (!r || r.length === 0) return;
        const rawName = String(r[nameColIdx] || '').trim();
        if (!rawName || rawName.toLowerCase().includes('jumlah') || rawName.toLowerCase().includes('total')) return;

        totalRowsProcessed++;
        const memberId = `ADC-M${String(members.length + 1).padStart(2, '0')}`;
        const phone = phoneColIdx >= 0 && r[phoneColIdx] ? String(r[phoneColIdx]).trim() : '-';
        const monthlyFee = feeColIdx >= 0 && !isNaN(Number(r[feeColIdx])) && Number(r[feeColIdx]) > 0
          ? Number(r[feeColIdx])
          : currentSettings.defaultMonthlyFee;

        // Collect month payments
        const monthlyAmounts: Record<number, number> = {};
        for (let m = 1; m <= 12; m++) {
          monthlyAmounts[m] = 0;
        }

        monthCols.forEach(({ colIndex, month }) => {
          const val = r[colIndex];
          if (typeof val === 'number') {
            monthlyAmounts[month] = val;
          } else if (typeof val === 'string') {
            const cleanNum = Number(val.replace(/[^0-9.-]/g, ''));
            if (!isNaN(cleanNum) && cleanNum >= 0) {
              monthlyAmounts[month] = cleanNum;
            }
          }
        });

        const metrics = calculatePaymentMetrics(monthlyAmounts, monthlyFee, 10);

        members.push({
          id: memberId,
          name: rawName,
          phone: phone,
          registeredDate: `${currentSettings.year}-01-01`,
          status: 'AKTIF',
          monthlyFee: monthlyFee,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        payments.push({
          id: `${memberId}_${currentSettings.year}`,
          memberId,
          memberName: rawName,
          year: currentSettings.year,
          monthlyAmounts,
          totalPaid: metrics.totalPaid,
          totalDue: metrics.totalDue,
          arrears: metrics.arrears,
          status: metrics.status,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Import Excel',
        });
      });
    } else if (isExpenseSheet) {
      const dateColIdx = headers.findIndex(h => h.includes('tarikh') || h.includes('date'));
      const catColIdx = headers.findIndex(h => h.includes('kategori') || h.includes('category'));
      const descColIdx = headers.findIndex(h => h.includes('butiran') || h.includes('keterangan') || h.includes('item'));
      const amountColIdx = headers.findIndex(h => h.includes('jumlah') || h.includes('amaun') || h.includes('amount') || h.includes('rm'));
      const recipientColIdx = headers.findIndex(h => h.includes('penerima') || h.includes('kepada') || h.includes('payee'));

      dataRows.forEach((r) => {
        if (!r || r.length === 0) return;
        const desc = descColIdx >= 0 ? String(r[descColIdx] || '').trim() : '';
        if (!desc || desc.toLowerCase().includes('jumlah')) return;

        const amountRaw = amountColIdx >= 0 ? r[amountColIdx] : 0;
        const amount = typeof amountRaw === 'number' ? amountRaw : Number(String(amountRaw).replace(/[^0-9.-]/g, '')) || 0;
        if (amount <= 0) return;

        totalRowsProcessed++;
        const expId = `ADC-EXP-${String(expenses.length + 1).padStart(4, '0')}`;
        expenses.push({
          id: `exp-${Date.now()}-${expenses.length}`,
          trxId: expId,
          date: dateColIdx >= 0 && r[dateColIdx] ? String(r[dateColIdx]).trim() : `${currentSettings.year}-01-15`,
          category: (catColIdx >= 0 && r[catColIdx] ? String(r[catColIdx]).trim() : 'LAIN-LAIN') as any,
          description: desc,
          amount: Math.abs(amount),
          paymentMethod: 'ONLINE TRANSFER',
          recipient: recipientColIdx >= 0 && r[recipientColIdx] ? String(r[recipientColIdx]).trim() : 'Pihak Berkenaan',
          notes: 'Diimport daripada Excel',
          createdAt: new Date().toISOString(),
        });
      });
    } else if (isIncomeSheet) {
      const dateColIdx = headers.findIndex(h => h.includes('tarikh') || h.includes('date'));
      const catColIdx = headers.findIndex(h => h.includes('kategori') || h.includes('category'));
      const descColIdx = headers.findIndex(h => h.includes('butiran') || h.includes('keterangan') || h.includes('item'));
      const amountColIdx = headers.findIndex(h => h.includes('jumlah') || h.includes('amaun') || h.includes('amount') || h.includes('rm'));

      dataRows.forEach((r) => {
        if (!r || r.length === 0) return;
        const desc = descColIdx >= 0 ? String(r[descColIdx] || '').trim() : '';
        if (!desc || desc.toLowerCase().includes('jumlah')) return;

        const amountRaw = amountColIdx >= 0 ? r[amountColIdx] : 0;
        const amount = typeof amountRaw === 'number' ? amountRaw : Number(String(amountRaw).replace(/[^0-9.-]/g, '')) || 0;
        if (amount <= 0) return;

        totalRowsProcessed++;
        const incId = `ADC-INC-${String(income.length + 1).padStart(4, '0')}`;
        income.push({
          id: `inc-${Date.now()}-${income.length}`,
          trxId: incId,
          date: dateColIdx >= 0 && r[dateColIdx] ? String(r[dateColIdx]).trim() : `${currentSettings.year}-01-15`,
          category: (catColIdx >= 0 && r[catColIdx] ? String(r[catColIdx]).trim() : 'LAIN-LAIN') as any,
          description: desc,
          amount: Math.abs(amount),
          paymentMethod: 'ONLINE TRANSFER',
          officer: 'Bendahari ADC',
          notes: 'Diimport daripada Excel',
          createdAt: new Date().toISOString(),
        });
      });
    }
  });

  if (members.length === 0 && expenses.length === 0 && income.length === 0) {
    warnings.push('Format fail tidak dapat dikesan secara automatik. Sila pastikan helaian mengandungi tajuk lajur seperti "Nama", "Jan", "Feb" atau "Butiran" & "Jumlah".');
  }

  return { members, payments, income, expenses, sheetNames, warnings, totalRowsProcessed };
}

// Generate complete formatted ADC Workbook for export
export function exportADCWorkbook(
  settings: ClubSettings,
  members: Member[],
  payments: PaymentRecord[],
  income: Income[],
  expenses: Expense[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Ringkasan Kewangan Sheet
  const totalYuran = payments.reduce((acc, p) => acc + p.totalPaid, 0);
  const otherIncome = income.filter(i => i.category !== 'YURAN AHLI').reduce((acc, i) => acc + i.amount, 0);
  const totalIncome = totalYuran + otherIncome;
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalArrears = payments.reduce((acc, p) => acc + p.arrears, 0);
  const currentBalance = settings.openingBalance + totalIncome - totalExpenses;

  const summaryData = [
    [settings.clubName],
    [`LAPORAN KEWANGAN KELAB TAHUN ${settings.year}`],
    ['Tarikh Dijana', new Date().toLocaleString('ms-MY')],
    [],
    ['PERKARA', 'JUMLAH (RM)'],
    ['Baki Awal', settings.openingBalance],
    ['Kutipan Yuran Bulanan Ahli', totalYuran],
    ['Hasil-Hasil Lain ADC', otherIncome],
    ['JUMLAH HASIL KESELURUHAN', totalIncome],
    ['JUMLAH PERBELANJAAN KESELURUHAN', totalExpenses],
    ['BAKI KEWANGAN SEMASA', currentBalance],
    ['JUMLAH TUNGGAKAN YURAN AHLI', totalArrears],
    ['JUMLAH AHLI BERDAFTAR', members.length],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'RINGKASAN KEWANGAN');

  // 2. Matriks Yuran Bulanan Sheet
  const matrixHeaders = [
    'Bil', 'ID Ahli', 'Nama Ahli', 'No Telefon',
    'Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis',
    'Jumlah Bayaran (RM)', 'Tunggakan (RM)', 'Status'
  ];

  const matrixRows = members.map((m, idx) => {
    const pay = payments.find(p => p.memberId === m.id);
    const amounts = pay ? pay.monthlyAmounts : {};
    return [
      idx + 1,
      m.id,
      m.name,
      m.phone,
      amounts[1] || 0,
      amounts[2] || 0,
      amounts[3] || 0,
      amounts[4] || 0,
      amounts[5] || 0,
      amounts[6] || 0,
      amounts[7] || 0,
      amounts[8] || 0,
      amounts[9] || 0,
      amounts[10] || 0,
      amounts[11] || 0,
      amounts[12] || 0,
      pay ? pay.totalPaid : 0,
      pay ? pay.arrears : (m.monthlyFee * 12),
      pay ? pay.status : 'BELUM BAYAR',
    ];
  });

  const wsMatrix = XLSX.utils.aoa_to_sheet([matrixHeaders, ...matrixRows]);
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'YURAN BULANAN 2026');

  // 3. Senarai Ahli Sheet
  const memberHeaders = ['Bil', 'ID Ahli', 'Nama', 'No Telefon', 'Tarikh Daftar', 'Status', 'Kadar Yuran (RM)'];
  const memberRows = members.map((m, idx) => [
    idx + 1,
    m.id,
    m.name,
    m.phone,
    m.registeredDate,
    m.status,
    m.monthlyFee
  ]);
  const wsMembers = XLSX.utils.aoa_to_sheet([memberHeaders, ...memberRows]);
  XLSX.utils.book_append_sheet(wb, wsMembers, 'SENARAI AHLI');

  // 4. Hasil Sheet
  const incomeHeaders = ['Bil', 'ID Transaksi', 'Tarikh', 'Kategori', 'Butiran', 'Amaun (RM)', 'Kaedah Bayaran', 'Pegawai', 'Catatan'];
  const incomeRows = income.map((inc, idx) => [
    idx + 1,
    inc.trxId,
    inc.date,
    inc.category,
    inc.description,
    inc.amount,
    inc.paymentMethod,
    inc.officer,
    inc.notes || ''
  ]);
  const wsIncome = XLSX.utils.aoa_to_sheet([incomeHeaders, ...incomeRows]);
  XLSX.utils.book_append_sheet(wb, wsIncome, 'HASIL ADC');

  // 5. Perbelanjaan Sheet
  const expHeaders = ['Bil', 'ID Transaksi', 'Tarikh', 'Kategori', 'Butiran', 'Amaun (RM)', 'Kaedah Bayaran', 'Penerima', 'No Resit', 'Catatan'];
  const expRows = expenses.map((exp, idx) => [
    idx + 1,
    exp.trxId,
    exp.date,
    exp.category,
    exp.description,
    exp.amount,
    exp.paymentMethod,
    exp.recipient,
    exp.receiptNo || '',
    exp.notes || ''
  ]);
  const wsExpenses = XLSX.utils.aoa_to_sheet([expHeaders, ...expRows]);
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'PERBELANJAAN ADC');

  // Generate and download
  XLSX.writeFile(wb, `ADC_KEWANGAN_${settings.year}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Generate blank starter template for the user
export function generateBlankTemplate() {
  const wb = XLSX.utils.book_new();
  const matrixHeaders = [
    'Bil', 'Nama Ahli', 'No Telefon',
    'Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ogos', 'Sep', 'Okt', 'Nov', 'Dis'
  ];

  const sampleRows = [
    [1, 'Contoh: Muhammad Azlan', '012-3456789', 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 0, 0],
    [2, 'Contoh: Khairul Nizam', '013-8877665', 20, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  const ws = XLSX.utils.aoa_to_sheet([matrixHeaders, ...sampleRows]);
  XLSX.utils.book_append_sheet(wb, ws, 'YURAN 2026');
  XLSX.writeFile(wb, 'Templat_YURAN_2026.xlsx');
}
