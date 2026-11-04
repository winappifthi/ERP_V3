import { createSelector } from '@reduxjs/toolkit';
import { calculateDocument } from '../../domain/calculations/documentCalculator';
import { monthKey } from './reportsUtils';

const selectApp = (s) => s.app;
const selectMasters = (s) => s.masters;
const selectSales = (s) => s.sales;
const selectPurchases = (s) => s.purchases;
const selectInventory = (s) => s.inventory;

const inRange = (date, from, to) => (!from || date >= from) && (!to || date <= to);

/**
 * Sales invoices with computed totals, filtered by date range for the current company.
 */
export const selectSalesInvoicesEnriched = (fromDate, toDate) =>
  createSelector([selectSales, selectApp, selectMasters], (sales, app, masters) => {
    const customerById = Object.fromEntries(masters.customers.map((c) => [c.id, c]));
    return sales.invoices
      .filter((i) => i.companyId === app.companyId && i.status === 'posted')
      .filter((i) => inRange(i.invoiceDate, fromDate, toDate))
      .map((i) => {
        const calc = calculateDocument({
          lines: i.lines,
          headerDiscountRupees: i.headerDiscountRupees || 0,
          charges: i.charges,
          applyRoundOff: i.applyRoundOff,
        });
        const customer = customerById[i.customerId];
        return {
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          invoiceDate: i.invoiceDate,
          month: monthKey(i.invoiceDate),
          customerId: i.customerId,
          customerName: customer?.name || '—',
          branchId: i.branchId,
          taxablePaise: calc.totals.taxableValuePaise,
          totalPaise: calc.totals.finalTotalPaise,
          taxPaise: calc.totals.totalTaxPaise,
          lines: calc.lines,
          sourceInvoice: i,
        };
      });
  });

/**
 * Purchase invoices with computed totals.
 */
export const selectPurchaseInvoicesEnriched = (fromDate, toDate) =>
  createSelector([selectPurchases, selectApp, selectMasters], (purchases, app, masters) => {
    const vendorById = Object.fromEntries(masters.vendors.map((v) => [v.id, v]));
    return purchases.invoices
      .filter((i) => i.companyId === app.companyId && i.status === 'posted')
      .filter((i) => inRange(i.invoiceDate, fromDate, toDate))
      .map((i) => {
        const calc = calculateDocument({
          lines: i.lines,
          headerDiscountRupees: i.headerDiscountRupees || 0,
          charges: i.charges,
          applyRoundOff: true,
        });
        return {
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          invoiceDate: i.invoiceDate,
          month: monthKey(i.invoiceDate),
          vendorId: i.vendorId,
          vendorName: vendorById[i.vendorId]?.name || '—',
          branchId: i.branchId,
          taxablePaise: calc.totals.taxableValuePaise,
          totalPaise: calc.totals.finalTotalPaise,
          lines: calc.lines,
        };
      });
  });

/**
 * Monthly sales vs purchase comparison.
 */
export const selectSalesVsPurchaseMonthly = (fromDate, toDate) =>
  createSelector(
    [selectSalesInvoicesEnriched(fromDate, toDate), selectPurchaseInvoicesEnriched(fromDate, toDate)],
    (sales, purchases) => {
      const months = new Map();
      for (const s of sales) {
        const m = months.get(s.month) || { month: s.month, salesPaise: 0, purchasePaise: 0 };
        m.salesPaise += s.totalPaise;
        months.set(s.month, m);
      }
      for (const p of purchases) {
        const m = months.get(p.month) || { month: p.month, salesPaise: 0, purchasePaise: 0 };
        m.purchasePaise += p.totalPaise;
        months.set(p.month, m);
      }
      return Array.from(months.values())
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((m) => ({
          month: m.month,
          salesRupees: m.salesPaise / 100,
          purchaseRupees: m.purchasePaise / 100,
        }));
    }
  );

/**
 * Product profitability: for each product, revenue − estimated cost.
 * Cost estimate: use product.purchasePrice × qty sold (proxy for COGS).
 */
export const selectProductProfitability = (fromDate, toDate) =>
  createSelector(
    [selectSalesInvoicesEnriched(fromDate, toDate), selectMasters],
    (sales, masters) => {
      const productById = Object.fromEntries(masters.products.map((p) => [p.id, p]));
      const map = new Map();
      for (const inv of sales) {
        for (let i = 0; i < inv.lines.length; i++) {
          const line = inv.lines[i];
          const lineProduct = inv.sourceInvoice.lines[i];
          const product = productById[lineProduct.productId];
          if (!product) continue;
          const costPaise = Math.round(product.purchasePrice * line.quantity * 100);
          const key = product.id;
          const existing = map.get(key) || {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            quantitySold: 0,
            revenuePaise: 0,
            costPaise: 0,
            marginPaise: 0,
          };
          existing.quantitySold += line.quantity;
          existing.revenuePaise += line.taxablePaise;
          existing.costPaise += costPaise;
          existing.marginPaise = existing.revenuePaise - existing.costPaise;
          map.set(key, existing);
        }
      }
      return Array.from(map.values())
        .map((r) => ({ ...r, marginPercent: r.revenuePaise > 0 ? Math.round((r.marginPaise / r.revenuePaise) * 100) : 0 }))
        .sort((a, b) => b.marginPaise - a.marginPaise);
    }
  );

/**
 * Customer profitability: revenue − estimated cost per customer.
 */
export const selectCustomerProfitability = (fromDate, toDate) =>
  createSelector(
    [selectSalesInvoicesEnriched(fromDate, toDate), selectMasters],
    (sales, masters) => {
      const productById = Object.fromEntries(masters.products.map((p) => [p.id, p]));
      const map = new Map();
      for (const inv of sales) {
        let invCostPaise = 0;
        for (let i = 0; i < inv.lines.length; i++) {
          const line = inv.lines[i];
          const product = productById[inv.sourceInvoice.lines[i].productId];
          if (product) invCostPaise += Math.round(product.purchasePrice * line.quantity * 100);
        }
        const existing = map.get(inv.customerId) || {
          customerId: inv.customerId,
          customerName: inv.customerName,
          invoiceCount: 0,
          revenuePaise: 0,
          costPaise: 0,
          marginPaise: 0,
        };
        existing.invoiceCount += 1;
        existing.revenuePaise += inv.taxablePaise;
        existing.costPaise += invCostPaise;
        existing.marginPaise = existing.revenuePaise - existing.costPaise;
        map.set(inv.customerId, existing);
      }
      return Array.from(map.values())
        .map((r) => ({ ...r, marginPercent: r.revenuePaise > 0 ? Math.round((r.marginPaise / r.revenuePaise) * 100) : 0 }))
        .sort((a, b) => b.revenuePaise - a.revenuePaise);
    }
  );

/**
 * Vendor performance: purchase volume, invoice count, outstanding.
 */
export const selectVendorPerformance = (fromDate, toDate) =>
  createSelector(
    [selectPurchaseInvoicesEnriched(fromDate, toDate), selectPurchases, selectMasters],
    (purchases, purchasesState, masters) => {
      const vendorById = Object.fromEntries(masters.vendors.map((v) => [v.id, v]));
      const map = new Map();
      for (const p of purchases) {
        const existing = map.get(p.vendorId) || {
          vendorId: p.vendorId,
          vendorName: p.vendorName,
          invoiceCount: 0,
          purchasePaise: 0,
          returnsCount: 0,
          returnsPaise: 0,
        };
        existing.invoiceCount += 1;
        existing.purchasePaise += p.totalPaise;
        map.set(p.vendorId, existing);
      }
      for (const ret of purchasesState.returns) {
        if (ret.companyId !== purchases[0]?.companyId) continue; // approximate
        if (ret.status !== 'posted') continue;
        if (!inRange(ret.returnDate, fromDate, toDate)) continue;
        const calc = calculateDocument({ lines: ret.lines, headerDiscountRupees: 0, charges: { freightRupees: 0, packingRupees: 0, otherRupees: 0 }, applyRoundOff: true });
        const existing = map.get(ret.vendorId);
        if (existing) {
          existing.returnsCount += 1;
          existing.returnsPaise += calc.totals.finalTotalPaise;
        }
      }
      return Array.from(map.values())
        .map((r) => ({
          ...r,
          outstandingRupees: purchasesState.vendorOutstanding[r.vendorId] || 0,
          returnRate: r.purchasePaise > 0 ? Math.round((r.returnsPaise / r.purchasePaise) * 100) : 0,
        }))
        .sort((a, b) => b.purchasePaise - a.purchasePaise);
    }
  );

/**
 * Branch performance — across all branches of the current company.
 */
export const selectBranchPerformance = (fromDate, toDate) =>
  createSelector(
    [selectSales, selectPurchases, selectMasters, selectApp],
    (sales, purchases, masters, app) => {
      const branchById = Object.fromEntries(masters.branches.map((b) => [b.id, b]));
      const map = new Map();
      for (const inv of sales.invoices) {
        if (inv.companyId !== app.companyId || inv.status !== 'posted') continue;
        if (!inRange(inv.invoiceDate, fromDate, toDate)) continue;
        const calc = calculateDocument({ lines: inv.lines, headerDiscountRupees: inv.headerDiscountRupees || 0, charges: inv.charges, applyRoundOff: inv.applyRoundOff });
        const b = branchById[inv.branchId];
        if (!b) continue;
        const existing = map.get(b.id) || { branchId: b.id, branchName: b.name, salesPaise: 0, purchasePaise: 0, invoiceCount: 0 };
        existing.salesPaise += calc.totals.finalTotalPaise;
        existing.invoiceCount += 1;
        map.set(b.id, existing);
      }
      for (const inv of purchases.invoices) {
        if (inv.companyId !== app.companyId || inv.status !== 'posted') continue;
        if (!inRange(inv.invoiceDate, fromDate, toDate)) continue;
        const calc = calculateDocument({ lines: inv.lines, headerDiscountRupees: inv.headerDiscountRupees || 0, charges: inv.charges, applyRoundOff: true });
        const b = branchById[inv.branchId];
        if (!b) continue;
        const existing = map.get(b.id) || { branchId: b.id, branchName: b.name, salesPaise: 0, purchasePaise: 0, invoiceCount: 0 };
        existing.purchasePaise += calc.totals.finalTotalPaise;
        map.set(b.id, existing);
      }
      return Array.from(map.values())
        .map((r) => ({ ...r, grossMarginPaise: r.salesPaise - r.purchasePaise }))
        .sort((a, b) => b.salesPaise - a.salesPaise);
    }
  );

/**
 * Top selling products (by quantity and revenue).
 */
export const selectTopProducts = (fromDate, toDate) =>
  createSelector([selectProductProfitability(fromDate, toDate)], (rows) =>
    [...rows].sort((a, b) => b.revenuePaise - a.revenuePaise).slice(0, 10)
  );

/**
 * Sales trend over months (count + value) — for the Sales Analytics page.
 */
export const selectSalesTrend = (fromDate, toDate) =>
  createSelector([selectSalesInvoicesEnriched(fromDate, toDate)], (sales) => {
    const map = new Map();
    for (const s of sales) {
      const existing = map.get(s.month) || { month: s.month, count: 0, valuePaise: 0 };
      existing.count += 1;
      existing.valuePaise += s.totalPaise;
      map.set(s.month, existing);
    }
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  });