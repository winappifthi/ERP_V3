// src/features/transactions/fieldConfig.js
import {
  selectCustomersForCompany,
  selectVendorsForCompany,
  selectWarehousesForBranch,
} from '../../store/selectors/contextSelectors';

// ---- Shared dropdown option sets ----
export const ORDER_TYPE_OPTIONS = [
  { value: 'sales-order', label: 'Sales Order' },
  { value: 'purchase-order', label: 'Purchase Order' },
];

export const INVOICE_TYPE_OPTIONS = [
  { value: 'sales-invoice', label: 'Sales Invoice' },
  { value: 'purchase-invoice', label: 'Purchase Invoice' },
];

export const RETURN_TYPE_OPTIONS = [
  { value: 'sales-return', label: 'Sales Return' },
  { value: 'purchase-return', label: 'Purchase Return' },
];

export const PAYMENT_TYPE_OPTIONS = [
  { value: 'receipt', label: 'Customer Receipt' },
  { value: 'payment', label: 'Vendor Payment' },
];

export const GRN_TYPE_OPTIONS = [
  { value: 'grn', label: 'Goods Receipt' },
  { value: 'gdn', label: 'Goods Delivery' },
];

export const LEDGER_TYPE_OPTIONS = [
  { value: 'customer', label: 'Customer Ledger' },
  { value: 'vendor', label: 'Vendor Ledger' },
];

// ---- Party selector resolution ----
const partySelectorFor = (type) =>
  ['sales-order', 'sales-invoice', 'sales-return', 'receipt', 'gdn'].includes(type)
    ? selectCustomersForCompany
    : selectVendorsForCompany;

const partyLabelFor = (type) =>
  ['sales-order', 'sales-invoice', 'sales-return', 'receipt', 'gdn'].includes(type)
    ? 'Customer'
    : 'Vendor';

const partyFieldFor = (type) =>
  ['sales-order', 'sales-invoice', 'sales-return', 'receipt', 'gdn'].includes(type)
    ? 'customerId'
    : 'vendorId';

// ============================================================
// ORDERS FORM
// ============================================================
export const orderFields = [
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    size: 1,
    required: true,
    options: ORDER_TYPE_OPTIONS,
    defaultValue: 'sales-order',
    disabled: (values, { isEdit }) => isEdit,
  },
  {
    name: 'orderNumber',
    label: 'Order #',
    type: 'readonly',
    size: 1,
  },
  {
    name: 'orderDate',
    label: 'Order Date',
    type: 'date',
    size: 1,
    required: true,
  },
  {
    name: 'expectedDate',
    label: 'Expected Date',
    type: 'date',
    size: 1,
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    size: 1, // 👈 moved into grid (near the top)
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'high', label: 'High' },
    ],
    defaultValue: 'normal',
  },
  {
    name: 'customerId',
    label: 'Customer',
    type: 'autocomplete',
    size: 1,
    required: true,
    selector: selectCustomersForCompany,
    getOptionLabel: (o) => `${o.code} — ${o.name}`,
    showIf: (v) => v.type === 'sales-order',
  },
  {
    name: 'vendorId',
    label: 'Vendor',
    type: 'autocomplete',
    size: 1,
    required: true,
    selector: selectVendorsForCompany,
    getOptionLabel: (o) => `${o.code} — ${o.name}`,
    showIf: (v) => v.type === 'purchase-order',
  },
  {
    name: 'taxTreatment',
    label: 'Tax Treatment',
    type: 'select',
    size: 1,
    required: true,
    options: [
      { value: 'intra', label: 'Intra-state (CGST + SGST)' },
      { value: 'inter', label: 'Inter-state (IGST)' },
    ],
    defaultValue: 'intra',
  },
  {
    name: 'charges.freightRupees',
    label: 'Freight (₹)',
    type: 'currency',
    size: 1,
    defaultValue: 0,
  },
  {
    name: 'charges.packingRupees',
    label: 'Packing (₹)',
    type: 'currency',
    size: 1,
    defaultValue: 0,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    size: 3,
  },
];

// ============================================================
// INVOICES FORM
// ============================================================
export const invoiceFields = [
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    size: 1,
    required: true,
    options: INVOICE_TYPE_OPTIONS,
    defaultValue: 'sales-invoice',
    disabled: (values, { isEdit }) => isEdit,
  },
  {
    name: 'invoiceNumber',
    label: 'Invoice #',
    type: 'readonly',
    size: 1,
  },
  {
    name: 'invoiceDate',
    label: 'Invoice Date',
    type: 'date',
    size: 1,
    required: true,
  },
  {
    name: 'dueDate',
    label: 'Due Date',
    type: 'date',
    size: 1,
  },
  {
    name: 'vendorInvoiceNumber',
    label: 'Vendor Invoice #',
    type: 'text',
    size: 1,
    showIf: (v) => v.type === 'purchase-invoice',
  },
  {
    name: 'customerId',
    label: 'Customer',
    type: 'autocomplete',
    size: 1,
    required: true,
    selector: selectCustomersForCompany,
    getOptionLabel: (o) => `${o.code} — ${o.name}`,
    showIf: (v) => v.type === 'sales-invoice',
  },
  {
    name: 'vendorId',
    label: 'Vendor',
    type: 'autocomplete',
    size: 1,
    required: true,
    selector: selectVendorsForCompany,
    getOptionLabel: (o) => `${o.code} — ${o.name}`,
    showIf: (v) => v.type === 'purchase-invoice',
  },
  {
    name: 'taxTreatment',
    label: 'Tax Treatment',
    type: 'select',
    size: 1,
    required: true,
    options: [
      { value: 'intra', label: 'Intra-state (CGST + SGST)' },
      { value: 'inter', label: 'Inter-state (IGST)' },
    ],
    defaultValue: 'intra',
  },
  {
    name: 'charges.freightRupees',
    label: 'Freight (₹)',
    type: 'currency',
    size: 1,
    defaultValue: 0,
  },
  {
    name: 'amountPaid',
    label: 'Amount Paid (₹)',
    type: 'currency',
    size: 1,
    defaultValue: 0,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    size: 3,
  },
];

// ============================================================
// RETURNS FORM
// ============================================================
export const returnFields = [
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    size: 1,
    required: true,
    options: RETURN_TYPE_OPTIONS,
    defaultValue: 'sales-return',
    disabled: (values, { isEdit }) => isEdit,
  },
  {
    name: 'returnNumber',
    label: 'Return #',
    type: 'readonly',
    size: 1,
  },
  {
    name: 'returnDate',
    label: 'Return Date',
    type: 'date',
    size: 1,
    required: true,
  },
  {
    name: 'customerId',
    label: 'Customer',
    type: 'autocomplete',
    size: 1,
    required: true,
    selector: selectCustomersForCompany,
    getOptionLabel: (o) => `${o.code} — ${o.name}`,
    showIf: (v) => v.type === 'sales-return',
  },
  {
    name: 'vendorId',
    label: 'Vendor',
    type: 'autocomplete',
    size: 1,
    required: true,
    selector: selectVendorsForCompany,
    getOptionLabel: (o) => `${o.code} — ${o.name}`,
    showIf: (v) => v.type === 'purchase-return',
  },
  {
    name: 'sourceInvoiceId',
    label: 'Source Invoice',
    type: 'text',
    size: 2,
  },
  {
    name: 'restock',
    label: 'Restock returned goods',
    type: 'checkbox',
    size: 1,
    defaultValue: true,
    showIf: (v) => v.type === 'sales-return',
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    size: 3,
  },
];

// ============================================================
// RECEIPTS & PAYMENTS FORM
// ============================================================
export const paymentFields = [
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    size: 1,
    required: true,
    options: PAYMENT_TYPE_OPTIONS,
    defaultValue: 'receipt',
    disabled: (values, { isEdit }) => isEdit,
  },
  {
    name: 'number', // 👈 renamed from paymentNumber to match form state
    label: 'Number',
    type: 'readonly',
    size: 1,
  },
  {
    name: 'date',
    label: 'Date',
    type: 'date',
    size: 1,
    required: true,
  },
  {
    name: 'customerId',
    label: 'Customer',
    type: 'autocomplete',
    size: 1,
    required: true,
    selector: selectCustomersForCompany,
    getOptionLabel: (o) => `${o.code} — ${o.name}`,
    showIf: (v) => v.type === 'receipt',
  },
  {
    name: 'vendorId',
    label: 'Vendor',
    type: 'autocomplete',
    size: 1,
    required: true,
    selector: selectVendorsForCompany,
    getOptionLabel: (o) => `${o.code} — ${o.name}`,
    showIf: (v) => v.type === 'payment',
  },
  {
    name: 'mode',
    label: 'Mode',
    type: 'select',
    size: 1,
    options: [
      { value: 'cash', label: 'Cash' },
      { value: 'bank', label: 'Bank' },
      { value: 'upi', label: 'UPI' },
      { value: 'cheque', label: 'Cheque' },
    ],
    defaultValue: 'bank',
  },
  {
    name: 'referenceNumber',
    label: 'Reference #',
    type: 'text',
    size: 1,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    size: 3,
  },
];

// ============================================================
// GRN / GDN FORM
// ============================================================
export const grnFields = [
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    size: 1,
    required: true,
    options: GRN_TYPE_OPTIONS,
    defaultValue: 'grn',
    disabled: (values, { isEdit }) => isEdit,
  },
  {
    name: 'number', // 👈 renamed for consistency (was 'number' — kept)
    label: 'Number',
    type: 'readonly',
    size: 1,
  },
  {
    name: 'date',
    label: 'Date',
    type: 'date',
    size: 1,
    required: true,
  },
  {
    name: 'vendorId',
    label: 'Vendor',
    type: 'autocomplete',
    size: 1,
    required: true,
    selector: selectVendorsForCompany,
    getOptionLabel: (o) => `${o.code} — ${o.name}`,
    showIf: (v) => v.type === 'grn',
  },
  {
    name: 'customerId',
    label: 'Customer',
    type: 'autocomplete',
    size: 1,
    required: true,
    selector: selectCustomersForCompany,
    getOptionLabel: (o) => `${o.code} — ${o.name}`,
    showIf: (v) => v.type === 'gdn',
  },
  {
    name: 'sourceOrderId',
    label: 'Source Order',
    type: 'text',
    size: 2,
  },
  {
    name: 'warehouseId',
    label: 'Warehouse',
    type: 'autocomplete',
    size: 1,
    required: true,
    selector: selectWarehousesForBranch,
    getOptionLabel: (o) => o.name,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    size: 3,
  },
];

// ============================================================
// LEDGER FILTERS (reference only — the Ledger page handles
// its own dropdowns since it's not a form submission)
// ============================================================
export const ledgerFilters = [];

// ---- Helper: party resolution per type (used by pages) ----
export { partySelectorFor, partyLabelFor, partyFieldFor };