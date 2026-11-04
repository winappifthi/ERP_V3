/**
 * Deterministic test fixtures. These are the seeded arrays loaded directly
 * from the data folder, so tests operate on the same values the app sees.
 */
export { companies } from '../../data/seed/companies';
export { branches } from '../../data/seed/branches';
export { warehouses } from '../../data/seed/warehouses';
export { taxCategories } from '../../data/seed/taxCategories';
export { products } from '../../data/seed/products';
export { customers } from '../../data/seed/customers';
export { vendors } from '../../data/seed/vendors';
export { salesOrders } from '../../data/seed/salesOrders';
export { salesInvoices } from '../../data/seed/salesInvoices';
export { salesReturns } from '../../data/seed/salesReturns';
export { customerReceipts } from '../../data/seed/customerReceipts';
export { purchaseOrders } from '../../data/seed/purchaseOrders';
export { goodsReceipts } from '../../data/seed/goodsReceipts';
export { purchaseInvoices } from '../../data/seed/purchaseInvoices';
export { purchaseReturns } from '../../data/seed/purchaseReturns';
export { vendorPayments } from '../../data/seed/vendorPayments';
export { stockMovements } from '../../data/seed/stockMovements';
export { stockTransfers } from '../../data/seed/stockTransfers';
export { stockAdjustments } from '../../data/seed/stockAdjustments';
export { boms } from '../../data/seed/boms';
export { workCenters } from '../../data/seed/workCenters';
export { productionOrders } from '../../data/seed/productionOrders';
export { chartOfAccounts } from '../../data/seed/chartOfAccounts';
export { glPostings } from '../../data/seed/glPostings';
export { journalEntries } from '../../data/seed/journalEntries';
export { taxSettings } from '../../data/seed/taxSettings';
export { approvalRules } from '../../data/seed/approvalRules';
export { activityLog } from '../../data/seed/activityLog';

/** Build a complete seed snapshot for diagnostics/tests. */
import * as seed from '../../data/seed';
export const buildSeedState = () => ({
  app: {
    companyId: seed.companies[0].id,
    branchId: seed.branches.find((b) => b.companyId === seed.companies[0].id).id,
    financialYear: 'FY2425',
    user: seed.users?.[0] || { id: 'USR-001', name: 'Test User', role: 'admin' },
    sidebarCollapsed: false,
    mobileNavOpen: false,
  },
  masters: {
    companies: seed.companies,
    branches: seed.branches,
    warehouses: seed.warehouses,
    taxCategories: seed.taxCategories,
    products: seed.products,
    customers: seed.customers,
    vendors: seed.vendors,
  },
  sales: {
    orders: seed.salesOrders,
    invoices: seed.salesInvoices,
    returns: seed.salesReturns,
    receipts: seed.customerReceipts,
    customerOutstanding: Object.fromEntries(seed.customers.map((c) => [c.id, c.outstanding || 0])),
  },
  purchases: {
    orders: seed.purchaseOrders,
    grns: seed.goodsReceipts,
    invoices: seed.purchaseInvoices,
    returns: seed.purchaseReturns,
    payments: seed.vendorPayments,
    vendorOutstanding: Object.fromEntries(seed.vendors.map((v) => [v.id, v.outstanding || 0])),
  },
  inventory: {
    movements: seed.stockMovements,
    transfers: seed.stockTransfers,
    adjustments: seed.stockAdjustments,
  },
  manufacturing: {
    boms: seed.boms,
    workCenters: seed.workCenters,
    productionOrders: seed.productionOrders,
  },
  finance: {
    accounts: seed.chartOfAccounts,
    postings: seed.glPostings,
    journals: seed.journalEntries,
  },
  tax: {
    settings: seed.taxSettings,
    rates: seed.taxCategories,
  },
  approvals: {
    rules: seed.approvalRules,
    activityLog: seed.activityLog,
    notifications: [],
  },
  productivity: {
    favorites: [],
    recentPages: [],
    paletteOpen: false,
    shortcutsHelpOpen: false,
  },
});