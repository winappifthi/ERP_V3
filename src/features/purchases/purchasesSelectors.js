import { createSelector } from '@reduxjs/toolkit';
import { calculateDocument } from '../../domain/calculations/documentCalculator';

const selectPurchases = (s) => s.purchases;
const selectApp = (s) => s.app;

const inContext = (app, rec) => rec.companyId === app.companyId && rec.branchId === app.branchId;

export const selectPOsInContext = createSelector([selectPurchases, selectApp], (p, app) => p.orders.filter((o) => inContext(app, o)));
export const selectPOsForCompany = createSelector([selectPurchases, selectApp], (p, app) => p.orders.filter((o) => o.companyId === app.companyId));
export const selectPOById = (id) => createSelector([selectPurchases], (p) => p.orders.find((o) => o.id === id) || null);

export const selectGrnsInContext = createSelector([selectPurchases, selectApp], (p, app) => p.grns.filter((g) => inContext(app, g)));
export const selectGrnsForCompany = createSelector([selectPurchases, selectApp], (p, app) => p.grns.filter((g) => g.companyId === app.companyId));

export const selectPInvoicesInContext = createSelector([selectPurchases, selectApp], (p, app) => p.invoices.filter((i) => inContext(app, i)));
export const selectPInvoicesForCompany = createSelector([selectPurchases, selectApp], (p, app) => p.invoices.filter((i) => i.companyId === app.companyId));
export const selectPInvoiceWithTotals = (id) =>
  createSelector([selectPurchases], (p) => {
    const inv = p.invoices.find((i) => i.id === id);
    if (!inv) return null;
    const calc = calculateDocument({
      lines: inv.lines,
      headerDiscountRupees: inv.headerDiscountRupees || 0,
      charges: inv.charges,
      applyRoundOff: true,
    });
    const paidPaise = Math.round((inv.amountPaid || 0) * 100);
    return { invoice: inv, totals: calc.totals, lines: calc.lines, duePaise: calc.totals.finalTotalPaise - paidPaise };
  });

export const selectPReturnsInContext = createSelector([selectPurchases, selectApp], (p, app) => p.returns.filter((r) => inContext(app, r)));
export const selectVendorPaymentsInContext = createSelector([selectPurchases, selectApp], (p, app) => p.payments.filter((v) => inContext(app, v)));
export const selectVendorPaymentsForCompany = createSelector([selectPurchases, selectApp], (p, app) => p.payments.filter((v) => v.companyId === app.companyId));

export const selectVendorOutstanding = createSelector([selectPurchases], (p) => p.vendorOutstanding);

/** Lines remaining to receive for a given PO — used by GRN creation. */
export const selectReceivableLinesFromPO = (poId) =>
  createSelector([selectPurchases], (p) => {
    const po = p.orders.find((o) => o.id === poId);
    if (!po) return null;
    const receipts = p.grns.filter((g) => g.sourceOrderId === poId && g.status === 'posted');
    return po.lines
      .map((l) => {
        const received = receipts.reduce((s, g) => {
          const r = g.lines.find((x) => x.productId === l.productId);
          return s + (r?.quantity || 0);
        }, 0);
        const remaining = l.quantity - received;
        return { ...l, receivedQuantity: received, remainingQuantity: remaining };
      })
      .filter((l) => l.remainingQuantity > 0);
  });

/** Lines remaining to invoice for a given GRN (i.e. not yet fully invoiced). */
export const selectInvoiceableLinesFromGRN = (grnId) =>
  createSelector([selectPurchases], (p) => {
    const grn = p.grns.find((g) => g.id === grnId);
    if (!grn) return null;
    const invoices = p.invoices.filter((i) => i.sourceReceiptId === grnId && i.status !== 'cancelled');
    return grn.lines
      .map((l) => {
        const invoiced = invoices.reduce((s, inv) => {
          const r = inv.lines.find((x) => x.productId === l.productId);
          return s + (r?.quantity || 0);
        }, 0);
        return { ...l, remainingQuantity: l.quantity - invoiced };
      })
      .filter((l) => l.remainingQuantity > 0);
  });

/** Vendor unpaid invoices — for payment allocation. */
export const selectUnpaidPurchaseInvoicesForVendor = (vendorId) =>
  createSelector([selectPurchases], (p) =>
    p.invoices
      .filter((i) => i.vendorId === vendorId && i.status === 'posted')
      .map((i) => {
        const calc = calculateDocument({ lines: i.lines, headerDiscountRupees: i.headerDiscountRupees || 0, charges: i.charges, applyRoundOff: true });
        const paidPaise = Math.round((i.amountPaid || 0) * 100);
        return { ...i, totalPaise: calc.totals.finalTotalPaise, duePaise: Math.max(0, calc.totals.finalTotalPaise - paidPaise) };
      })
      .filter((i) => i.duePaise > 0)
  );