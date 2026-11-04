import { createSelector } from '@reduxjs/toolkit';
import { buildSearchIndex } from './searchIndex';

export const selectFavorites = (s) => s.productivity.favorites;
export const selectRecentPages = (s) => s.productivity.recentPages;
export const selectPaletteOpen = (s) => s.productivity.paletteOpen;
export const selectShortcutsHelpOpen = (s) => s.productivity.shortcutsHelpOpen;

export const selectSearchableEntries = createSelector(
  [
    (s) => s.masters.products,
    (s) => s.masters.parties,
    (s) => s.sales.orders,
    (s) => s.sales.invoices,
    (s) => s.purchases.orders,
    (s) => s.purchases.invoices,
    (s) => s.finance.journals,
    (s) => s.manufacturing.productionOrders,
    (s) => s.app.companyId,
  ],
  (
    products,
    parties,
    salesOrders,
    salesInvoices,
    purchaseOrders,
    purchaseInvoices,
    journals,
    productionOrders,
    companyId
  ) =>
    buildSearchIndex({
      app: { companyId },
      masters: { products, parties },
      sales: { orders: salesOrders, invoices: salesInvoices },
      purchases: { orders: purchaseOrders, invoices: purchaseInvoices },
      finance: { journals },
      manufacturing: { productionOrders },
    })
);