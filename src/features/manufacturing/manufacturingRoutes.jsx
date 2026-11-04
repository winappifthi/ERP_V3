import { lazy } from 'react';

const BomList = lazy(() => import('./pages/BomList'));
const BomCreate = lazy(() => import('./pages/BomCreate'));
const BomDetails = lazy(() => import('./pages/BomDetails'));
const WorkCenterList = lazy(() => import('./pages/WorkCenterList'));
const WorkCenterCreate = lazy(() => import('./pages/WorkCenterCreate'));
const ProductionOrderList = lazy(() => import('./pages/ProductionOrderList'));
const ProductionOrderCreate = lazy(() => import('./pages/ProductionOrderCreate'));
const ProductionOrderDetails = lazy(() => import('./pages/ProductionOrderDetails'));
const MaterialIssueCreate = lazy(() => import('./pages/MaterialIssueCreate'));
const ProductionCompletionCreate = lazy(() => import('./pages/ProductionCompletionCreate'));
const MRPPreview = lazy(() => import('./pages/MRPPreview'));
const ProductionEfficiency = lazy(() => import('./pages/ProductionEfficiency'));
const BomEdit = lazy(() => import('./pages/BomEdit'));

export const manufacturingRoutes = [
  { path: '/app/manufacturing/bom', element: BomList, title: 'Bills of Materials', breadcrumb: ['Home', 'Manufacturing', 'BOM'] },
  { path: '/app/manufacturing/bom/new', element: BomCreate, title: 'New BOM', breadcrumb: ['Home', 'Manufacturing', 'BOM', 'New'] },
  { path: '/app/manufacturing/bom/:id', element: BomDetails, title: 'BOM Details', breadcrumb: ['Home', 'Manufacturing', 'BOM', 'Details'] },
  { path: '/app/manufacturing/bom/:id/edit', element: BomEdit, title: 'Edit BOM', breadcrumb: ['Home', 'Manufacturing', 'BOM', 'Edit'] },
  { path: '/app/manufacturing/work-centers', element: WorkCenterList, title: 'Work Centers', breadcrumb: ['Home', 'Manufacturing', 'Work Centers'] },
  { path: '/app/manufacturing/work-centers/new', element: WorkCenterCreate, title: 'New Work Center', breadcrumb: ['Home', 'Manufacturing', 'Work Centers', 'New'] },
  { path: '/app/manufacturing/production-orders', element: ProductionOrderList, title: 'Production Orders', breadcrumb: ['Home', 'Manufacturing', 'Production'] },
  { path: '/app/manufacturing/production-orders/new', element: ProductionOrderCreate, title: 'New Production Order', breadcrumb: ['Home', 'Manufacturing', 'Production', 'New'] },
  { path: '/app/manufacturing/production-orders/:id', element: ProductionOrderDetails, title: 'Production Order', breadcrumb: ['Home', 'Manufacturing', 'Production', 'Details'] },
  { path: '/app/manufacturing/production-orders/:id/issue', element: MaterialIssueCreate, title: 'Material Issue', breadcrumb: ['Home', 'Manufacturing', 'Production', 'Issue'] },
  { path: '/app/manufacturing/production-orders/:id/complete', element: ProductionCompletionCreate, title: 'Completion', breadcrumb: ['Home', 'Manufacturing', 'Production', 'Complete'] },
  { path: '/app/manufacturing/mrp', element: MRPPreview, title: 'MRP Preview', breadcrumb: ['Home', 'Manufacturing', 'MRP'] },
  { path: '/app/manufacturing/efficiency', element: ProductionEfficiency, title: 'Efficiency', breadcrumb: ['Home', 'Manufacturing', 'Efficiency'] },
];