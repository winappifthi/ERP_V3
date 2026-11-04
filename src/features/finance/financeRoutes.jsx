import { lazy } from 'react';

const ChartOfAccounts = lazy(() => import('./pages/ChartOfAccounts'));
const AccountLedgerDetail = lazy(() => import('./pages/AccountLedgerDetail'));
const JournalList = lazy(() => import('./pages/JournalList'));
const JournalCreate = lazy(() => import('./pages/JournalCreate'));
const GeneralLedger = lazy(() => import('./pages/GeneralLedger'));
const TrialBalance = lazy(() => import('./pages/TrialBalance'));
const ProfitAndLoss = lazy(() => import('./pages/ProfitAndLoss'));
const BalanceSheet = lazy(() => import('./pages/BalanceSheet'));
const CashFlow = lazy(() => import('./pages/CashFlow'));
const JournalPrint = lazy(() => import('./pages/JournalPrint'));
const JournalEdit = lazy(() => import('./pages/JournalEdit'));

export const financeRoutes = [
  { path: '/app/finance/coa', element: ChartOfAccounts, title: 'Chart of Accounts', breadcrumb: ['Home', 'Finance', 'Chart of Accounts'] },
  { path: '/app/finance/accounts/:accountCode', element: AccountLedgerDetail, title: 'Account Ledger', breadcrumb: ['Home', 'Finance', 'Account Ledger'] },
  { path: '/app/finance/journals', element: JournalList, title: 'Journal Entries', breadcrumb: ['Home', 'Finance', 'Journals'] },
  { path: '/app/finance/journals/new', element: JournalCreate, title: 'New Journal', breadcrumb: ['Home', 'Finance', 'Journals', 'New'] },
  { path: '/app/finance/journals/:id/edit', element: JournalEdit, title: 'Edit Journal', breadcrumb: ['Home', 'Finance', 'Journals', 'Edit'] },
  { path: '/app/finance/general-ledger', element: GeneralLedger, title: 'General Ledger', breadcrumb: ['Home', 'Finance', 'General Ledger'] },
  { path: '/app/finance/trial-balance', element: TrialBalance, title: 'Trial Balance', breadcrumb: ['Home', 'Finance', 'Trial Balance'] },
  { path: '/app/finance/profit-loss', element: ProfitAndLoss, title: 'Profit & Loss', breadcrumb: ['Home', 'Finance', 'P&L'] },
  { path: '/app/finance/balance-sheet', element: BalanceSheet, title: 'Balance Sheet', breadcrumb: ['Home', 'Finance', 'Balance Sheet'] },
  { path: '/app/finance/cash-flow', element: CashFlow, title: 'Cash Flow', breadcrumb: ['Home', 'Finance', 'Cash Flow'] },
  { path: '/app/finance/journals/:id/print', element: JournalPrint, title: 'Print Journal', breadcrumb: ['Home', 'Finance', 'Journals', 'Print'] },
];