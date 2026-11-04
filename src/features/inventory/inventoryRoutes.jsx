import { lazy } from 'react';

const DynamicInventoryPage = lazy(() => import('./pages/DynamicInventoryPage'));
const DynamicInventoryForm = lazy(() => import('./pages/DynamicInventoryForm'));

export const inventoryRoutes = [
  // List Page
  { path: '/app/inventory/:pageType', element: DynamicInventoryPage, title: 'Inventory', breadcrumb: ['Home', 'Inventory'] },
  // Create Page
  { path: '/app/inventory/:pageType/new', element: DynamicInventoryForm, title: 'New', breadcrumb: ['Home', 'Inventory', 'New'] },
  // Edit Page
  { path: '/app/inventory/:pageType/:id/edit', element: DynamicInventoryForm, title: 'Edit', breadcrumb: ['Home', 'Inventory', 'Edit'] },
];