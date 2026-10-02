# Security Specification: ADC Management & Financial Dashboard 2026

## 1. Data Invariants
1. Member document must contain valid string name, phone, status ('AKTIF' | 'TIDAK_AKTIF'), and positive monthlyFee.
2. Payment record belongs to a registered member, with non-negative monthlyAmounts and correctly calculated totalPaid and arrears.
3. Income and Expense transactions must have positive amounts, valid dates, categories, and unique sequential transaction IDs (ADC-INC-XXXX, ADC-EXP-XXXX).
4. Deletion of financial records (Income, Expense, Payments) is strictly prohibited for non-Admin users.
5. All users must be authenticated to read or write data.
6. The runtime admin user (fuzz653@gmail.com) has full Admin privileges.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Read/Write**: Attempting to read `/members` or write `/expenses` without auth token -> Denied.
2. **Ghost Field Injection**: Adding `isSuperAdmin: true` or `bypassed: true` into a member document -> Denied.
3. **Negative Amount in Expense**: Submitting `{ amount: -500 }` to `/expenses` -> Denied.
4. **Invalid Transaction ID**: Using random string instead of compliant ID pattern -> Denied.
5. **AJK Deleting Expense**: AJK role attempting `DELETE` on `/expenses/ADC-EXP-001` -> Denied.
6. **Self-Promotion to Admin**: Non-admin user updating their own role in `/users/{uid}` to `ADMIN` -> Denied.
7. **Tampering with Audit Logs**: Client trying to overwrite or delete historical records in `/audit_logs` -> Denied.
8. **Corrupted Status Value**: Submitting `{ status: "UNKNOWN_STATUS" }` to `/members` -> Denied.
9. **Junk Character Document ID**: Using 2KB string as document ID -> Denied.
10. **Overwriting immutable createdAt**: Updating a transaction's original creation date -> Denied.
11. **Altering Member ID in Payments**: Updating `memberId` to point to a different member -> Denied.
12. **Bypassing Category Allowlist**: Submitting arbitrary malicious text as financial category -> Denied.
