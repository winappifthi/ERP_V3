import { lazy } from 'react';

const GstSettings = lazy(() => import('./pages/GstSettings'));
const TaxRatesList = lazy(() => import('./pages/TaxRatesList'));
const Gstr1Preview = lazy(() => import('./pages/Gstr1Preview'));
const Gstr3bPreview = lazy(() => import('./pages/Gstr3bPreview'));
const HsnSummary = lazy(() => import('./pages/HsnSummary'));
const TaxReconciliation = lazy(() => import('./pages/TaxReconciliation'));
const PlaceOfSupply = lazy(() => import('./pages/PlaceOfSupply'));
const TaxLedger = lazy(() => import('./pages/TaxLedger'));

export const taxRoutes = [
  { path: '/app/tax/settings', element: GstSettings, title: 'GST Settings', breadcrumb: ['Home', 'Tax', 'GST Settings'] },
  { path: '/app/tax/rates', element: TaxRatesList, title: 'Tax Rates', breadcrumb: ['Home', 'Tax', 'Rates'] },
  { path: '/app/tax/gstr1', element: Gstr1Preview, title: 'GSTR-1 Preview', breadcrumb: ['Home', 'Tax', 'GSTR-1'] },
  { path: '/app/tax/gstr3b', element: Gstr3bPreview, title: 'GSTR-3B Preview', breadcrumb: ['Home', 'Tax', 'GSTR-3B'] },
  { path: '/app/tax/hsn-summary', element: HsnSummary, title: 'HSN Summary', breadcrumb: ['Home', 'Tax', 'HSN Summary'] },
  { path: '/app/tax/reconciliation', element: TaxReconciliation, title: 'GST Reconciliation', breadcrumb: ['Home', 'Tax', 'Reconciliation'] },
  { path: '/app/tax/place-of-supply', element: PlaceOfSupply, title: 'Place of Supply', breadcrumb: ['Home', 'Tax', 'Place of Supply'] },
  { path: '/app/tax/ledger', element: TaxLedger, title: 'GST Ledger', breadcrumb: ['Home', 'Tax', 'Ledger'] },
];