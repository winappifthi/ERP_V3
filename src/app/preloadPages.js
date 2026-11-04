// src/app/preloadPages.js
//
// Preloads every route's JS chunk after the app loads.
// This makes sidebar navigation instant (no spinner, no blank screen),
// while keeping the initial app bundle small.

export const preloadAllPages = () => {
  // Fire all dynamic imports in parallel.
  // Vite will split these into separate chunks, and calling them
  // here forces the browser to fetch them in the background.
  Promise.all([
    // Dashboard
    import('../features/dashboard/pages/Dashboard'),

    // Transactions
    import('../features/transactions/pages/UnifiedOrdersList'),
    import('../features/transactions/pages/UnifiedOrderForm'),
    import('../features/transactions/pages/UnifiedOrderDetails'),
    import('../features/transactions/pages/UnifiedInvoicesList'),
    import('../features/transactions/pages/UnifiedInvoiceForm'),
    import('../features/transactions/pages/UnifiedInvoiceDetails'),
    import('../features/transactions/pages/UnifiedInvoicePrint'),
    import('../features/transactions/pages/UnifiedReturnsList'),
    import('../features/transactions/pages/UnifiedReturnForm'),
    import('../features/transactions/pages/UnifiedReturnDetails'),
    import('../features/transactions/pages/UnifiedPaymentsList'),
    import('../features/transactions/pages/UnifiedPaymentForm'),
    import('../features/transactions/pages/UnifiedPaymentDetails'),
    import('../features/transactions/pages/UnifiedGrnList'),
    import('../features/transactions/pages/UnifiedGrnForm'),
    import('../features/transactions/pages/UnifiedGrnDetails'),
    import('../features/transactions/pages/UnifiedLedger'),

    // Inventory
    import('../features/inventory/pages/DynamicInventoryPage'),
    import('../features/inventory/pages/DynamicInventoryForm'),

    // Masters
    import('../features/masters/pages/ProductsList'),
    import('../features/masters/pages/ProductCreate'),
    import('../features/masters/pages/ProductEdit'),
    import('../features/masters/pages/ProductDetails'),
    import('../features/masters/pages/PartiesList'),
    import('../features/masters/pages/PartyCreate'),
    import('../features/masters/pages/PartyEdit'),
    import('../features/masters/pages/PartyDetails'),

    // Finance
    import('../features/finance/pages/ChartOfAccounts'),
    import('../features/finance/pages/JournalList'),
    import('../features/finance/pages/JournalCreate'),
    import('../features/finance/pages/GeneralLedger'),
    import('../features/finance/pages/TrialBalance'),
    import('../features/finance/pages/ProfitAndLoss'),
    import('../features/finance/pages/BalanceSheet'),
    import('../features/finance/pages/CashFlow'),

    // Reports
    import('../features/reports/pages/ReportsHub'),
    import('../features/reports/pages/SalesAnalytics'),
    import('../features/reports/pages/PurchaseAnalytics'),

    // Manufacturing
    import('../features/manufacturing/pages/BomList'),
    import('../features/manufacturing/pages/ProductionOrderList'),

    // Tax
    import('../features/tax/pages/Gstr1Preview'),
    import('../features/tax/pages/Gstr3bPreview'),

    // Approvals
    import('../features/approvals/pages/ApprovalInbox'),

    // Errors
    import('../features/errors/pages/NotFound'),
    import('../features/errors/pages/AccessDenied'),
  ]).catch((err) => {
    // Preload failures are non-fatal — the lazy loader will retry on click
    console.debug('Preload failed for one or more pages:', err);
  });
};