/**
 * Standard ERP chart of accounts. Tree structure encoded via parentCode.
 * accountType: 'asset' | 'liability' | 'equity' | 'income' | 'expense'
 * normalBalance: 'debit' | 'credit' — used to interpret signs in ledgers.
 */
export const chartOfAccounts = [
  // ---- ASSETS ----
  { code: '1000', name: 'Assets', parentCode: null, accountType: 'asset', normalBalance: 'debit', isGroup: true },
  { code: '1100', name: 'Current Assets', parentCode: '1000', accountType: 'asset', normalBalance: 'debit', isGroup: true },
  { code: '1110', name: 'Cash', parentCode: '1100', accountType: 'asset', normalBalance: 'debit', isGroup: false },
  { code: '1120', name: 'Bank — HDFC Current A/c', parentCode: '1100', accountType: 'asset', normalBalance: 'debit', isGroup: false },
  { code: '1130', name: 'Accounts Receivable', parentCode: '1100', accountType: 'asset', normalBalance: 'debit', isGroup: false },
  { code: '1140', name: 'Inventory — Raw Materials', parentCode: '1100', accountType: 'asset', normalBalance: 'debit', isGroup: false },
  { code: '1150', name: 'Inventory — Finished Goods', parentCode: '1100', accountType: 'asset', normalBalance: 'debit', isGroup: false },
  { code: '1160', name: 'Input GST — CGST', parentCode: '1100', accountType: 'asset', normalBalance: 'debit', isGroup: false },
  { code: '1161', name: 'Input GST — SGST', parentCode: '1100', accountType: 'asset', normalBalance: 'debit', isGroup: false },
  { code: '1162', name: 'Input GST — IGST', parentCode: '1100', accountType: 'asset', normalBalance: 'debit', isGroup: false },
  { code: '1200', name: 'Fixed Assets', parentCode: '1000', accountType: 'asset', normalBalance: 'debit', isGroup: true },
  { code: '1210', name: 'Plant & Machinery', parentCode: '1200', accountType: 'asset', normalBalance: 'debit', isGroup: false },

  // ---- LIABILITIES ----
  { code: '2000', name: 'Liabilities', parentCode: null, accountType: 'liability', normalBalance: 'credit', isGroup: true },
  { code: '2100', name: 'Current Liabilities', parentCode: '2000', accountType: 'liability', normalBalance: 'credit', isGroup: true },
  { code: '2110', name: 'Accounts Payable', parentCode: '2100', accountType: 'liability', normalBalance: 'credit', isGroup: false },
  { code: '2120', name: 'Output GST — CGST', parentCode: '2100', accountType: 'liability', normalBalance: 'credit', isGroup: false },
  { code: '2121', name: 'Output GST — SGST', parentCode: '2100', accountType: 'liability', normalBalance: 'credit', isGroup: false },
  { code: '2122', name: 'Output GST — IGST', parentCode: '2100', accountType: 'liability', normalBalance: 'credit', isGroup: false },
  { code: '2130', name: 'Accrued Expenses', parentCode: '2100', accountType: 'liability', normalBalance: 'credit', isGroup: false },

  // ---- EQUITY ----
  { code: '3000', name: 'Equity', parentCode: null, accountType: 'equity', normalBalance: 'credit', isGroup: true },
  { code: '3100', name: "Owner's Capital", parentCode: '3000', accountType: 'equity', normalBalance: 'credit', isGroup: false },
  { code: '3200', name: 'Retained Earnings', parentCode: '3000', accountType: 'equity', normalBalance: 'credit', isGroup: false },

  // ---- INCOME ----
  { code: '4000', name: 'Income', parentCode: null, accountType: 'income', normalBalance: 'credit', isGroup: true },
  { code: '4100', name: 'Sales — Goods', parentCode: '4000', accountType: 'income', normalBalance: 'credit', isGroup: false },
  { code: '4200', name: 'Sales Returns', parentCode: '4000', accountType: 'income', normalBalance: 'debit', isGroup: false },
  { code: '4900', name: 'Other Income', parentCode: '4000', accountType: 'income', normalBalance: 'credit', isGroup: false },

  // ---- EXPENSES ----
  { code: '5000', name: 'Expenses', parentCode: null, accountType: 'expense', normalBalance: 'debit', isGroup: true },
  { code: '5100', name: 'Cost of Goods Sold', parentCode: '5000', accountType: 'expense', normalBalance: 'debit', isGroup: false },
  { code: '5200', name: 'Freight & Transport', parentCode: '5000', accountType: 'expense', normalBalance: 'debit', isGroup: false },
  { code: '5300', name: 'Salaries & Wages', parentCode: '5000', accountType: 'expense', normalBalance: 'debit', isGroup: false },
  { code: '5400', name: 'Rent', parentCode: '5000', accountType: 'expense', normalBalance: 'debit', isGroup: false },
  { code: '5500', name: 'Utilities', parentCode: '5000', accountType: 'expense', normalBalance: 'debit', isGroup: false },
  { code: '5600', name: 'Manufacturing Overhead', parentCode: '5000', accountType: 'expense', normalBalance: 'debit', isGroup: false },
  { code: '5900', name: 'Miscellaneous Expense', parentCode: '5000', accountType: 'expense', normalBalance: 'debit', isGroup: false },
];