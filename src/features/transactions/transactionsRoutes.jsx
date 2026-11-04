import { lazy } from 'react';

const UnifiedOrdersList = lazy(() => import('./pages/UnifiedOrdersList'));
const UnifiedOrderForm = lazy(() => import('./pages/UnifiedOrderForm'));
const UnifiedOrderDetails = lazy(() => import('./pages/UnifiedOrderDetails'));

const UnifiedInvoicesList = lazy(() => import('./pages/UnifiedInvoicesList'));
const UnifiedInvoiceForm = lazy(() => import('./pages/UnifiedInvoiceForm'));
const UnifiedInvoiceDetails = lazy(() => import('./pages/UnifiedInvoiceDetails'));
const UnifiedInvoicePrint = lazy(() => import('./pages/UnifiedInvoicePrint'));

const UnifiedReturnsList = lazy(() => import('./pages/UnifiedReturnsList'));
const UnifiedReturnForm = lazy(() => import('./pages/UnifiedReturnForm'));

const UnifiedPaymentsList = lazy(() => import('./pages/UnifiedPaymentsList'));
const UnifiedPaymentForm = lazy(() => import('./pages/UnifiedPaymentForm'));

const UnifiedGrnList = lazy(() => import('./pages/UnifiedGrnList'));
const UnifiedGrnForm = lazy(() => import('./pages/UnifiedGrnForm'));

const UnifiedLedger = lazy(() => import('./pages/UnifiedLedger'));

export const transactionsRoutes = [
  // Orders
  { path: '/app/transactions/orders', element: UnifiedOrdersList, title: 'Orders', breadcrumb: ['Home', 'Transactions', 'Orders'] },
  { path: '/app/transactions/orders/new', element: UnifiedOrderForm, title: 'New Order', breadcrumb: ['Home', 'Transactions', 'Orders', 'New'] },
  { path: '/app/transactions/orders/:id', element: UnifiedOrderDetails, title: 'Order', breadcrumb: ['Home', 'Transactions', 'Orders', 'Details'] },
  { path: '/app/transactions/orders/:id/edit', element: UnifiedOrderForm, title: 'Edit Order', breadcrumb: ['Home', 'Transactions', 'Orders', 'Edit'] },

  // Invoices
  { path: '/app/transactions/invoices', element: UnifiedInvoicesList, title: 'Invoices', breadcrumb: ['Home', 'Transactions', 'Invoices'] },
  { path: '/app/transactions/invoices/new', element: UnifiedInvoiceForm, title: 'New Invoice', breadcrumb: ['Home', 'Transactions', 'Invoices', 'New'] },
  { path: '/app/transactions/invoices/:id', element: UnifiedInvoiceDetails, title: 'Invoice', breadcrumb: ['Home', 'Transactions', 'Invoices', 'Details'] },
  { path: '/app/transactions/invoices/:id/edit', element: UnifiedInvoiceForm, title: 'Edit Invoice', breadcrumb: ['Home', 'Transactions', 'Invoices', 'Edit'] },
  { path: '/app/transactions/invoices/:id/print', element: UnifiedInvoicePrint, title: 'Print Invoice', breadcrumb: ['Home', 'Transactions', 'Invoices', 'Print'] },

  // Returns
  { path: '/app/transactions/returns', element: UnifiedReturnsList, title: 'Returns', breadcrumb: ['Home', 'Transactions', 'Returns'] },
  { path: '/app/transactions/returns/new', element: UnifiedReturnForm, title: 'New Return', breadcrumb: ['Home', 'Transactions', 'Returns', 'New'] },

  // Payments
  { path: '/app/transactions/payments', element: UnifiedPaymentsList, title: 'Receipts & Payments', breadcrumb: ['Home', 'Transactions', 'Receipts & Payments'] },
  { path: '/app/transactions/payments/new', element: UnifiedPaymentForm, title: 'New Receipt / Payment', breadcrumb: ['Home', 'Transactions', 'Receipts & Payments', 'New'] },

  // GRN / GDN
  { path: '/app/transactions/grn', element: UnifiedGrnList, title: 'Goods Receipts & Deliveries', breadcrumb: ['Home', 'Transactions', 'Goods Receipts'] },
  { path: '/app/transactions/grn/new', element: UnifiedGrnForm, title: 'New Goods Receipt', breadcrumb: ['Home', 'Transactions', 'Goods Receipts', 'New'] },

  // Ledger
  { path: '/app/transactions/ledger', element: UnifiedLedger, title: 'Ledger', breadcrumb: ['Home', 'Transactions', 'Ledger'] },

];