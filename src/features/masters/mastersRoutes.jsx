import { lazy } from 'react';

const ProductsList = lazy(() => import('./pages/ProductsList'));
const ProductCreate = lazy(() => import('./pages/ProductCreate'));
const ProductEdit = lazy(() => import('./pages/ProductEdit'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));

const PartiesList = lazy(() => import('./pages/PartiesList'));
const PartyCreate = lazy(() => import('./pages/PartyCreate'));
const PartyEdit = lazy(() => import('./pages/PartyEdit'));
const PartyDetails = lazy(() => import('./pages/PartyDetails'));

const WarehousesList = lazy(() => import('./pages/WarehousesList'));
const WarehouseCreate = lazy(() => import('./pages/WarehouseCreate'));
const WarehouseEdit = lazy(() => import('./pages/WarehouseEdit'));
const WarehouseDetails = lazy(() => import('./pages/WarehouseDetails'));

export const mastersRoutes = [
  // ---- Products ----
  { path: '/app/masters/products', element: ProductsList, title: 'Products', breadcrumb: ['Home', 'Masters', 'Products'] },
  { path: '/app/masters/products/new', element: ProductCreate, title: 'New Product', breadcrumb: ['Home', 'Masters', 'Products', 'New'] },
  { path: '/app/masters/products/:id', element: ProductDetails, title: 'Product', breadcrumb: ['Home', 'Masters', 'Products', 'Details'] },
  { path: '/app/masters/products/:id/edit', element: ProductEdit, title: 'Edit Product', breadcrumb: ['Home', 'Masters', 'Products', 'Edit'] },

  // ---- Parties (customers + vendors + leads unified) ----
  { path: '/app/masters/parties', element: PartiesList, title: 'Parties', breadcrumb: ['Home', 'Masters', 'Parties'] },
  { path: '/app/masters/parties/new', element: PartyCreate, title: 'New Party', breadcrumb: ['Home', 'Masters', 'Parties', 'New'] },
  { path: '/app/masters/parties/:id', element: PartyDetails, title: 'Party', breadcrumb: ['Home', 'Masters', 'Parties', 'Details'] },
  { path: '/app/masters/parties/:id/edit', element: PartyEdit, title: 'Edit Party', breadcrumb: ['Home', 'Masters', 'Parties', 'Edit'] },

  // ---- Warehouses ----
  { path: '/app/masters/warehouses', element: WarehousesList, title: 'Warehouses', breadcrumb: ['Home', 'Masters', 'Warehouses'] },
  { path: '/app/masters/warehouses/new', element: WarehouseCreate, title: 'New Warehouse', breadcrumb: ['Home', 'Masters', 'Warehouses', 'New'] },
  { path: '/app/masters/warehouses/:id', element: WarehouseDetails, title: 'Warehouse', breadcrumb: ['Home', 'Masters', 'Warehouses', 'Details'] },
  { path: '/app/masters/warehouses/:id/edit', element: WarehouseEdit, title: 'Edit Warehouse', breadcrumb: ['Home', 'Masters', 'Warehouses', 'Edit'] },
];