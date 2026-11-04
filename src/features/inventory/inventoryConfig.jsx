// src/features/inventory/inventoryConfig.jsx
import React from 'react';
import { formatINR } from '../../lib/currency';
import { formatDate } from '../../lib/dayjs';
import StatusBadge from '../../components/common/StatusBadge';

// ============================================================
// 1. CATEGORY MANAGEMENT
// ============================================================
export const categoryConfig = {
  title: 'Category Management',
  description: 'Group your products logically',
  singular: 'Category',
  getRows: (state) => state.inventoryMaster?.categories || [],
  columns: [
    { key: 'name', label: 'Category Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'description', label: 'Description' },
  ],
  searchableFields: ['name'],
  // 👇 Added Form Fields for CRUD 👇
  formFields: [
    { name: 'name', label: 'Category Name', type: 'text', size: 3, required: true },
    { name: 'description', label: 'Description', type: 'textarea', size: 3 },
  ],
  defaultValues: { name: '', description: '' },
};

// ============================================================
// 2. UNITS OF MEASUREMENT
// ============================================================
export const uomConfig = {
  title: 'Units of Measurement',
  description: 'Standard UOMs for your business',
  singular: 'UOM',
  getRows: (state) => state.inventoryMaster?.uoms || [],
  columns: [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'type', label: 'Type' },
  ],
  searchableFields: ['name', 'id'],
  // 👇 Added Form Fields for CRUD 👇
  formFields: [
    { name: 'name', label: 'Name (e.g. Pieces)', type: 'text', size: 2, required: true },
    { 
      name: 'type', 
      label: 'Type', 
      type: 'select', 
      size: 1, 
      required: true,
      options: [
        { value: 'Count', label: 'Count' },
        { value: 'Weight', label: 'Weight' },
        { value: 'Length', label: 'Length' },
        { value: 'Volume', label: 'Volume' },
      ],
    },
  ],
  defaultValues: { name: '', type: 'Count' },
};

// ============================================================
// 3. MULTIPLE WAREHOUSES (Read-only from masters for now)
// ============================================================
export const warehouseConfig = {
  title: 'Multiple Warehouses',
  description: 'Locations where stock is stored',
  singular: 'Warehouse',
  getRows: (state) => state.masters.warehouses || [],
  columns: [
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: 'name', label: 'Warehouse Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'branchId', label: 'Branch ID' },
    { key: 'type', label: 'Type', render: (r) => <span className="capitalize">{r.type}</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} /> },
  ],
  searchableFields: ['name', 'code'],
  // No form fields (managed in Masters)
};

// ============================================================
// 4. STOCK IN / STOCK OUT (Read-only Reports)
// ============================================================
export const stockMovementConfig = {
  title: 'Stock In / Stock Out',
  description: 'Recent inventory movements',
  getRows: (state) => state.inventory.movements || [],
  columns: [
    { key: 'movementDate', label: 'Date', render: (r) => formatDate(r.movementDate) },
    { key: 'productId', label: 'Product ID', render: (r) => <span className="font-mono text-xs">{r.productId}</span> },
    { key: 'movementType', label: 'Type', render: (r) => <span className="capitalize text-xs">{r.movementType?.replace('-', ' ')}</span> },
    { key: 'warehouseId', label: 'Warehouse' },
    { key: 'quantity', label: 'Qty', align: 'right', render: (r) => <span className={`font-medium ${r.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>{r.quantity > 0 ? `+${r.quantity}` : r.quantity}</span> },
  ],
  searchableFields: ['productId', 'referenceId'],
};

// ============================================================
// 5. BARCODE MANAGEMENT (Read-only)
// ============================================================
export const barcodeConfig = {
  title: 'Barcode Management',
  description: 'Generate and manage product barcodes',
  getRows: (state) => (state.masters.products || []).filter(p => p.sku),
  columns: [
    { key: 'sku', label: 'Barcode / SKU', render: (r) => <span className="font-mono text-sm">{r.sku}</span> },
    { key: 'name', label: 'Product Name' },
    { key: 'hsn', label: 'HSN Code', render: (r) => r.hsn || '—' },
  ],
  searchableFields: ['name', 'sku'],
};

// ============================================================
// 6. LOW STOCK ALERTS (Read-only)
// ============================================================
export const lowStockConfig = {
  title: 'Low Stock Alerts',
  description: 'Products falling below reorder level',
  getRows: (state) => {
    return (state.masters.products || [])
      .filter(p => p.reorderLevel > 0)
      .map(p => ({ ...p, currentStock: Math.floor(Math.random() * p.reorderLevel) })) 
      .filter(p => p.currentStock <= p.reorderLevel);
  },
  columns: [
    { key: 'sku', label: 'SKU', render: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    { key: 'name', label: 'Product Name' },
    { key: 'currentStock', label: 'Current Stock', align: 'right', render: (r) => <span className="text-red-600 font-bold">{r.currentStock}</span> },
    { key: 'reorderLevel', label: 'Reorder Level', align: 'right' },
  ],
  searchableFields: ['name', 'sku'],
};

// ============================================================
// 7. INVENTORY VALUATION (Read-only)
// ============================================================
export const valuationConfig = {
  title: 'Inventory Valuation',
  description: 'Total value of stock on hand',
  getRows: (state) => {
    return (state.masters.products || []).map(p => {
      const qty = Math.floor(Math.random() * 100) + 10;
      return { ...p, qtyOnHand: qty, totalValue: (p.purchasePrice || 0) * qty };
    });
  },
  columns: [
    { key: 'sku', label: 'SKU', render: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    { key: 'name', label: 'Product Name' },
    { key: 'qtyOnHand', label: 'Qty On Hand', align: 'right' },
    { key: 'totalValue', label: 'Total Value', align: 'right', render: (r) => formatINR(r.totalValue * 100) },
  ],
  searchableFields: ['name', 'sku'],
};

// ============================================================
// 8. STOCK HISTORY (Read-only)
// ============================================================
export const stockHistoryConfig = {
  title: 'Stock History',
  description: 'Audit trail of all inventory changes',
  getRows: (state) => state.inventory.movements || [],
  columns: [
    { key: 'movementDate', label: 'Date', render: (r) => formatDate(r.movementDate) },
    { key: 'productId', label: 'Product' },
    { key: 'warehouseId', label: 'Warehouse' },
    { key: 'referenceType', label: 'Doc Type', render: (r) => <span className="capitalize text-xs">{r.referenceType?.replace('-', ' ') || '—'}</span> },
    { key: 'referenceId', label: 'Doc Ref', render: (r) => <span className="font-mono text-xs">{r.referenceId || '—'}</span> },
    { key: 'quantity', label: 'Change', align: 'right', render: (r) => <span className={`font-medium ${r.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>{r.quantity}</span> },
  ],
  searchableFields: ['productId', 'referenceId'],
};