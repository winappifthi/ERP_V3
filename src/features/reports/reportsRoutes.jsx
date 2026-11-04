import { lazy } from 'react';

const ReportsHub = lazy(() => import('./pages/ReportsHub'));
const SalesAnalytics = lazy(() => import('./pages/SalesAnalytics'));
const PurchaseAnalytics = lazy(() => import('./pages/PurchaseAnalytics'));
const ProfitabilityReport = lazy(() => import('./pages/ProfitabilityReport'));
const CustomerProfitability = lazy(() => import('./pages/CustomerProfitability'));
const VendorPerformance = lazy(() => import('./pages/VendorPerformance'));
const BranchPerformance = lazy(() => import('./pages/BranchPerformance'));
const CashFlowChart = lazy(() => import('./pages/CashFlowChart'));
const InventoryAnalytics = lazy(() => import('./pages/InventoryAnalytics'));

export const reportsRoutes = [
  { path: '/app/reports', element: ReportsHub, title: 'Reports', breadcrumb: ['Home', 'Reports'] },
  { path: '/app/reports/sales', element: SalesAnalytics, title: 'Sales Analytics', breadcrumb: ['Home', 'Reports', 'Sales'] },
  { path: '/app/reports/purchases', element: PurchaseAnalytics, title: 'Purchase Analytics', breadcrumb: ['Home', 'Reports', 'Purchases'] },
  { path: '/app/reports/profitability', element: ProfitabilityReport, title: 'Product Profitability', breadcrumb: ['Home', 'Reports', 'Profitability'] },
  { path: '/app/reports/customer-profitability', element: CustomerProfitability, title: 'Customer Profitability', breadcrumb: ['Home', 'Reports', 'Customer Profitability'] },
  { path: '/app/reports/vendor-performance', element: VendorPerformance, title: 'Vendor Performance', breadcrumb: ['Home', 'Reports', 'Vendors'] },
  { path: '/app/reports/branch-performance', element: BranchPerformance, title: 'Branch Performance', breadcrumb: ['Home', 'Reports', 'Branches'] },
  { path: '/app/reports/cash-flow', element: CashFlowChart, title: 'Cash Flow', breadcrumb: ['Home', 'Reports', 'Cash Flow'] },
  { path: '/app/reports/inventory', element: InventoryAnalytics, title: 'Inventory Analytics', breadcrumb: ['Home', 'Reports', 'Inventory'] },
];