import { lazy } from 'react';
import { salesRoutes } from '../features/sales/salesRoutes';
import { purchasesRoutes } from '../features/purchases/purchasesRoutes';
import { transactionsRoutes } from '../features/transactions/transactionsRoutes';
import { inventoryRoutes } from '../features/inventory/inventoryRoutes';
import { manufacturingRoutes } from '../features/manufacturing/manufacturingRoutes';
import { financeRoutes } from '../features/finance/financeRoutes';
import { taxRoutes } from '../features/tax/taxRoutes';
import { reportsRoutes } from '../features/reports/reportsRoutes';
import { approvalRoutes } from '../features/approvals/approvalRoutes';
import { productivityRoutes } from '../features/productivity/productivityRoutes';
import { mastersRoutes } from '../features/masters/mastersRoutes';

const Dashboard = lazy(() => import('../features/dashboard/pages/Dashboard'));
const NotFound = lazy(() => import('../features/errors/pages/NotFound'));
const AccessDenied = lazy(() => import('../features/errors/pages/AccessDenied'));

export const routes = [
  { path: '/app/dashboard', element: Dashboard, title: 'Dashboard', breadcrumb: ['Home', 'Dashboard'] },
  ...transactionsRoutes,   // ← unified pages first
  ...salesRoutes,          // ← remaining sales pages (POS, GRN-linked, etc.)
  ...purchasesRoutes,      // ← remaining purchase pages (GRN only)
  ...inventoryRoutes,
  ...manufacturingRoutes,
  ...financeRoutes,
  ...taxRoutes,
  ...reportsRoutes,
  ...approvalRoutes,
  ...productivityRoutes,
  ...mastersRoutes,
  { path: '/app/access-denied', element: AccessDenied, title: 'Access Denied', breadcrumb: ['Home', 'Access Denied'] },
  { path: '*', element: NotFound, title: 'Not Found', breadcrumb: ['Home', 'Not Found'] },
];

export const routeByPath = Object.fromEntries(routes.map((r) => [r.path, r]));

export const matchRoute = (pathname) => {
  for (const route of routes) {
    if (route.path === pathname) return route;
    if (route.path.includes(':')) {
      const pattern = new RegExp('^' + route.path.replace(/:[^/]+/g, '[^/]+') + '$');
      if (pattern.test(pathname)) return route;
    }
  }
  return null;
};