import { createSelector } from '@reduxjs/toolkit';
import { calculateDocument } from '../../domain/calculations/documentCalculator';

const selectApprovals = (s) => s.approvals;
const selectApp = (s) => s.app;
const selectSales = (s) => s.sales;
const selectPurchases = (s) => s.purchases;
const selectFinance = (s) => s.finance;

// ---- Basic selectors ----
export const selectActivityLog = (s) => s.approvals.activityLog;
export const selectNotifications = (s) => s.approvals.notifications;
export const selectApprovalRules = (s) => s.approvals.rules;

export const selectUnreadCount = createSelector(
  [selectNotifications],
  (notes) => notes.filter((n) => !n.read).length
);

// ---- Activity for a specific document ----
export const selectDocumentActivity = (docType, docId) =>
  createSelector([selectActivityLog], (log) =>
    log
      .filter((a) => a.documentType === docType && a.documentId === docId)
      .sort((a, b) => b.at.localeCompare(a.at))
  );

// ---- Pending approvals across all document types ----
const resolveRuleRole = (rules, documentType, amountPaise) => {
  const amountRupees = amountPaise / 100;
  const rule = rules
    .filter((r) => r.active && r.documentType === documentType)
    .filter(
      (r) =>
        amountRupees >= r.minRupees &&
        (r.maxRupees == null || amountRupees <= r.maxRupees)
    )[0];
  return rule?.approverRole || 'manager';
};

export const selectPendingApprovals = createSelector(
  [selectSales, selectPurchases, selectFinance, selectApp, selectApprovalRules],
  (sales, purchases, finance, app, rules) => {
    const rows = [];

    // Sales orders
    for (const so of sales.orders) {
      if (so.companyId !== app.companyId) continue;
      if (so.status !== 'pending') continue;
      const calc = calculateDocument({
        lines: so.lines,
        headerDiscountRupees: so.headerDiscountRupees || 0,
        charges: so.charges,
        applyRoundOff: so.applyRoundOff,
      });
      rows.push({
        id: so.id,
        documentType: 'sales-order',
        documentNumber: so.orderNumber,
        documentDate: so.orderDate,
        amountPaise: calc.totals.finalTotalPaise,
        partyName: so.customerId,
        status: so.status,
        submittedAt: so.createdAt,
      });
    }

    // Purchase orders
    for (const po of purchases.orders) {
      if (po.companyId !== app.companyId) continue;
      if (po.status !== 'pending' && po.status !== 'draft') continue;
      const calc = calculateDocument({
        lines: po.lines,
        headerDiscountRupees: 0,
        charges: po.charges,
        applyRoundOff: true,
      });
      rows.push({
        id: po.id,
        documentType: 'purchase-order',
        documentNumber: po.orderNumber,
        documentDate: po.orderDate,
        amountPaise: calc.totals.finalTotalPaise,
        partyName: po.vendorId,
        status: po.status,
        submittedAt: po.createdAt,
      });
    }

    // Purchase invoices
    for (const pi of purchases.invoices) {
      if (pi.companyId !== app.companyId) continue;
      if (pi.status !== 'draft' && pi.status !== 'pending') continue;
      const calc = calculateDocument({
        lines: pi.lines,
        headerDiscountRupees: pi.headerDiscountRupees || 0,
        charges: pi.charges,
        applyRoundOff: true,
      });
      rows.push({
        id: pi.id,
        documentType: 'purchase-invoice',
        documentNumber: pi.invoiceNumber,
        documentDate: pi.invoiceDate,
        amountPaise: calc.totals.finalTotalPaise,
        partyName: pi.vendorId,
        status: pi.status,
        submittedAt: pi.createdAt,
      });
    }

    // Journals
    for (const jv of finance.journals) {
      if (jv.companyId !== app.companyId) continue;
      if (jv.status !== 'draft' && jv.status !== 'pending') continue;
      const amt = jv.lines.reduce((s, l) => s + (l.debitPaise || 0), 0);
      rows.push({
        id: jv.id,
        documentType: 'journal',
        documentNumber: jv.voucherNumber,
        documentDate: jv.date,
        amountPaise: amt,
        partyName: jv.narration,
        status: jv.status,
        submittedAt: jv.createdAt,
      });
    }

    return rows
      .map((r) => ({
        ...r,
        requiredRole: resolveRuleRole(rules, r.documentType, r.amountPaise),
      }))
      .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
  }
);

// ---- Filtered to current user's role ----
export const selectMyApprovals = createSelector(
  [selectPendingApprovals, (s) => s.app.user],
  (pending, user) => {
    if (user.role === 'admin') return pending;
    return pending.filter((r) => r.requiredRole === user.role);
  }
);