import { createSelector } from '@reduxjs/toolkit';

const selectFinance = (s) => s.finance;
const selectApp = (s) => s.app;

export const selectAccounts = (s) => s.finance.accounts;
export const selectAccountByCode = (code) =>
  createSelector([selectFinance], (f) => f.accounts.find((a) => a.code === code) || null);
export const selectLeafAccounts = createSelector([selectFinance], (f) => f.accounts.filter((a) => !a.isGroup));

export const selectPostingsInContext = createSelector([selectFinance, selectApp], (f, app) =>
  f.postings.filter((p) => p.companyId === app.companyId && p.branchId === app.branchId)
);

export const selectJournalsInContext = createSelector([selectFinance, selectApp], (f, app) =>
  f.journals.filter((j) => j.companyId === app.companyId && j.branchId === app.branchId)
);
export const selectJournalsForCompany = createSelector([selectFinance, selectApp], (f, app) =>
  f.journals.filter((j) => j.companyId === app.companyId)
);

/** All postings filtered by a date range (optional). */
export const selectPostingsInRange = (fromDate, toDate) =>
  createSelector([selectPostingsInContext], (postings) =>
    postings.filter((p) => (!fromDate || p.date >= fromDate) && (!toDate || p.date <= toDate))
  );

/**
 * Trial balance as of a date. Returns rows for every leaf account with
 * opening, debit, credit, and closing balance, plus totals.
 */
export const selectTrialBalance = (fromDate, toDate) =>
  createSelector([selectFinance, selectPostingsInContext], (finance, postings) => {
    const accounts = finance.accounts.filter((a) => !a.isGroup);
    const map = new Map();
    for (const a of accounts) {
      map.set(a.code, { account: a, openingDebitPaise: 0, openingCreditPaise: 0, debitPaise: 0, creditPaise: 0 });
    }

    for (const p of postings) {
      const row = map.get(p.accountCode);
      if (!row) continue;
      if (fromDate && p.date < fromDate) {
        row.openingDebitPaise += p.debitPaise;
        row.openingCreditPaise += p.creditPaise;
      } else if ((!toDate || p.date <= toDate)) {
        row.debitPaise += p.debitPaise;
        row.creditPaise += p.creditPaise;
      }
    }

    const rows = [];
    let totalDebit = 0, totalCredit = 0, totalOpeningDebit = 0, totalOpeningCredit = 0;
    for (const [code, r] of map.entries()) {
      const openingNet = r.openingDebitPaise - r.openingCreditPaise;
      const periodNet = r.debitPaise - r.creditPaise;
      const closingNet = openingNet + periodNet;
      if (openingNet === 0 && periodNet === 0) continue;
      rows.push({
        account: r.account,
        openingDebitPaise: openingNet > 0 ? openingNet : 0,
        openingCreditPaise: openingNet < 0 ? -openingNet : 0,
        debitPaise: r.debitPaise,
        creditPaise: r.creditPaise,
        closingDebitPaise: closingNet > 0 ? closingNet : 0,
        closingCreditPaise: closingNet < 0 ? -closingNet : 0,
      });
      totalOpeningDebit += openingNet > 0 ? openingNet : 0;
      totalOpeningCredit += openingNet < 0 ? -openingNet : 0;
      totalDebit += r.debitPaise;
      totalCredit += r.creditPaise;
    }
    rows.sort((a, b) => a.account.code.localeCompare(b.account.code));

    return { rows, totalDebit, totalCredit, totalOpeningDebit, totalOpeningCredit };
  });

/**
 * Account ledger: all postings for a given account, with running balance.
 */
export const selectAccountLedger = (accountCode, fromDate, toDate) =>
  createSelector([selectPostingsInContext, selectFinance], (postings, finance) => {
    const account = finance.accounts.find((a) => a.code === accountCode);
    if (!account) return null;

    const filtered = postings
      .filter((p) => p.accountCode === accountCode)
      .filter((p) => (!fromDate || p.date >= fromDate) && (!toDate || p.date <= toDate))
      .sort((a, b) => a.date.localeCompare(b.date));

    let running = 0;
    const rows = filtered.map((p) => {
      running += p.debitPaise - p.creditPaise;
      return { ...p, runningBalancePaise: running };
    });
    const openingRows = postings
      .filter((p) => p.accountCode === accountCode && fromDate && p.date < fromDate)
      .reduce((s, p) => s + p.debitPaise - p.creditPaise, 0);

    return { account, openingBalancePaise: openingRows, rows, closingBalancePaise: openingRows + running };
  });

/** Profit & Loss — sum income minus expense over a period. */
export const selectProfitAndLoss = (fromDate, toDate) =>
  createSelector([selectFinance, selectPostingsInContext], (finance, postings) => {
    const filtered = postings.filter((p) => (!fromDate || p.date >= fromDate) && (!toDate || p.date <= toDate));
    const accountByCode = Object.fromEntries(finance.accounts.map((a) => [a.code, a]));

    const income = {};
    const expense = {};
    for (const p of filtered) {
      const acc = accountByCode[p.accountCode];
      if (!acc) continue;
      const net = p.debitPaise - p.creditPaise;
      if (acc.accountType === 'income') {
        income[p.accountCode] = (income[p.accountCode] || 0) - net; // income is credit-normal
      } else if (acc.accountType === 'expense') {
        expense[p.accountCode] = (expense[p.accountCode] || 0) + net;
      }
    }

    const totalIncome = Object.values(income).reduce((s, v) => s + v, 0);
    const totalExpense = Object.values(expense).reduce((s, v) => s + v, 0);
    const netProfit = totalIncome - totalExpense;

    return {
      incomeRows: Object.entries(income).map(([code, amount]) => ({ account: accountByCode[code], amount })).filter((r) => r.amount !== 0),
      expenseRows: Object.entries(expense).map(([code, amount]) => ({ account: accountByCode[code], amount })).filter((r) => r.amount !== 0),
      totalIncome,
      totalExpense,
      netProfit,
    };
  });

/** Balance Sheet as of a date. */
export const selectBalanceSheet = (asOfDate) =>
  createSelector([selectFinance, selectPostingsInContext], (finance, postings) => {
    const filtered = postings.filter((p) => !asOfDate || p.date <= asOfDate);
    const accountByCode = Object.fromEntries(finance.accounts.map((a) => [a.code, a]));
    const totals = {};
    for (const p of filtered) {
      const acc = accountByCode[p.accountCode];
      if (!acc) continue;
      totals[p.accountCode] = (totals[p.accountCode] || 0) + (p.debitPaise - p.creditPaise);
    }

    const assets = [];
    const liabilities = [];
    const equity = [];
    for (const [code, net] of Object.entries(totals)) {
      const acc = accountByCode[code];
      if (!acc) continue;
      const absVal = Math.abs(net);
      if (absVal === 0) continue;
      const row = { account: acc, amount: absVal, isDebit: net > 0 };
      if (acc.accountType === 'asset') assets.push(row);
      else if (acc.accountType === 'liability') liabilities.push(row);
      else if (acc.accountType === 'equity') equity.push(row);
    }

    // P&L for current FY → add net profit to equity
    const totalAssets = assets.reduce((s, r) => s + r.amount, 0);
    const totalLiabilities = liabilities.reduce((s, r) => s + r.amount, 0);
    const totalEquityBase = equity.reduce((s, r) => s + r.amount, 0);

    // Net profit since the beginning (since we don't track FY opens separately here)
    let income = 0, expense = 0;
    for (const [code, net] of Object.entries(totals)) {
      const acc = accountByCode[code];
      if (!acc) continue;
      if (acc.accountType === 'income') income += -net;
      else if (acc.accountType === 'expense') expense += net;
    }
    const netProfit = income - expense;
    const totalEquity = totalEquityBase + netProfit;

    return {
      assets, liabilities, equity,
      totalAssets, totalLiabilities, totalEquity,
      netProfit,
      difference: totalAssets - (totalLiabilities + totalEquity),
    };
  });

/**
 * Cash Flow: tracks movements in cash (1110) and bank (1120) accounts.
 * Simplified direct-method view: list of cash/bank postings, grouped by reference type.
 */
export const selectCashFlow = (fromDate, toDate) =>
  createSelector([selectPostingsInContext, selectFinance], (postings, finance) => {
    const cashCodes = ['1110', '1120'];
    const accountByCode = Object.fromEntries(finance.accounts.map((a) => [a.code, a]));
    const filtered = postings
      .filter((p) => cashCodes.includes(p.accountCode))
      .filter((p) => (!fromDate || p.date >= fromDate) && (!toDate || p.date <= toDate))
      .sort((a, b) => a.date.localeCompare(b.date));

    let inflow = 0, outflow = 0;
    const rows = filtered.map((p) => {
      const net = p.debitPaise - p.creditPaise;
      if (net > 0) inflow += net;
      else outflow += -net;
      return { ...p, netPaise: net, account: accountByCode[p.accountCode] };
    });

    return { rows, inflow, outflow, netChange: inflow - outflow };
  });