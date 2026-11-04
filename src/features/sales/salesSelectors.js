import { createSelector } from '@reduxjs/toolkit';
import { calculateDocument } from '../../domain/calculations/documentCalculator';

const selectSalesState = (s) => s.sales;
const selectApp = (s) => s.app;

/** Orders filtered to current company + branch context. */
export const selectOrdersInContext = createSelector(
  [selectSalesState, selectApp],
  (sales, app) =>
    sales.orders.filter(
      (o) => o.companyId === app.companyId && o.branchId === app.branchId
    )
);

/** All orders for the current company (any branch) — used for order numbers. */
export const selectOrdersForCompany = createSelector(
  [selectSalesState, selectApp],
  (sales, app) => sales.orders.filter((o) => o.companyId === app.companyId)
);

export const selectOrderById = (id) =>
  createSelector([selectSalesState], (sales) =>
    sales.orders.find((o) => o.id === id) || null
  );

/**
 * Computed totals for an order — always derived from the calculation engine.
 * Returns { order, totals, lines }.
 */
export const selectOrderWithTotals = (id) =>
  createSelector([selectSalesState], (sales) => {
    const order = sales.orders.find((o) => o.id === id);
    if (!order) return null;
    const calc = calculateDocument({
      lines: order.lines,
      headerDiscountRupees: order.headerDiscountRupees,
      charges: order.charges,
      applyRoundOff: order.applyRoundOff,
      advancePaidRupees: 0,
    });
    return { order, totals: calc.totals, lines: calc.lines };
  });

/** Aggregated stats for list page. */
export const selectSalesSummary = createSelector(
  [selectOrdersInContext],
  (orders) => {
    let totalValue = 0;
    let pending = 0;
    let approved = 0;
    let completed = 0;

    for (const o of orders) {
      const calc = calculateDocument({
        lines: o.lines,
        headerDiscountRupees: o.headerDiscountRupees,
        charges: o.charges,
        applyRoundOff: o.applyRoundOff,
      });
      totalValue += calc.totals.finalTotalPaise;
      if (o.status === 'pending') pending += 1;
      if (o.status === 'approved') approved += 1;
      if (o.status === 'completed') completed += 1;
    }

    return {
      count: orders.length,
      totalValuePaise: totalValue,
      pending,
      approved,
      completed,
    };
  }
);