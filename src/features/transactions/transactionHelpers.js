import { useSearchParams } from 'react-router-dom';

/**
 * Resolve the transaction type from URL query param.
 * Falls back to the provided default.
 */
export const useTransactionType = (defaultType, allowedTypes) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || defaultType;
  const safeType = allowedTypes.includes(type) ? type : defaultType;
  const setType = (newType) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('type', newType);
      return next;
    });
  return { type: safeType, setType };
};

/** Map transaction type to the right slice. */
export const sliceForType = (type) => {
  switch (type) {
    case 'sales-order':
    case 'sales-invoice':
    case 'sales-return':
    case 'receipt':
      return 'sales';
    case 'purchase-order':
    case 'purchase-invoice':
    case 'purchase-return':
    case 'payment':
      return 'purchases';
    case 'goods-receipt':
      return 'purchases';
    default:
      return null;
  }
};

/** Map transaction type to the party role (customer vs vendor). */
export const partyRoleForType = (type) =>
  ['sales-order', 'sales-invoice', 'sales-return', 'receipt'].includes(type)
    ? 'customer'
    : 'vendor';

/** Human-readable labels per type — used for tabs, buttons, column headers. */
export const TYPE_META = {
  'sales-order': {
    label: 'Sales Order',
    plural: 'Sales Orders',
    partyLabel: 'Customer',
    partyField: 'customerId',
    idPrefix: 'SO',
    routeBase: '/app/transactions/orders',
    slice: 'sales',
    listKey: 'orders',
    partyRole: 'customer',
    numberPrefix: 'SO',
  },
  'purchase-order': {
    label: 'Purchase Order',
    plural: 'Purchase Orders',
    partyLabel: 'Vendor',
    partyField: 'vendorId',
    idPrefix: 'PO',
    routeBase: '/app/transactions/orders',
    slice: 'purchases',
    listKey: 'orders',
    partyRole: 'vendor',
    numberPrefix: 'PO',
  },
  'sales-invoice': {
    label: 'Sales Invoice',
    plural: 'Sales Invoices',
    partyLabel: 'Customer',
    partyField: 'customerId',
    routeBase: '/app/transactions/invoices',
    slice: 'sales',
    listKey: 'invoices',
    partyRole: 'customer',
  },
  'purchase-invoice': {
    label: 'Purchase Invoice',
    plural: 'Purchase Invoices',
    partyLabel: 'Vendor',
    partyField: 'vendorId',
    routeBase: '/app/transactions/invoices',
    slice: 'purchases',
    listKey: 'invoices',
    partyRole: 'vendor',
  },
  'sales-return': {
    label: 'Sales Return',
    plural: 'Sales Returns',
    partyLabel: 'Customer',
    partyField: 'customerId',
    routeBase: '/app/transactions/returns',
    slice: 'sales',
    listKey: 'returns',
    partyRole: 'customer',
  },
  'purchase-return': {
    label: 'Purchase Return',
    plural: 'Purchase Returns',
    partyLabel: 'Vendor',
    partyField: 'vendorId',
    routeBase: '/app/transactions/returns',
    slice: 'purchases',
    listKey: 'returns',
    partyRole: 'vendor',
  },
  'receipt': {
    label: 'Customer Receipt',
    plural: 'Customer Receipts',
    partyLabel: 'Customer',
    partyField: 'customerId',
    routeBase: '/app/transactions/payments',
    slice: 'sales',
    listKey: 'receipts',
    partyRole: 'customer',
  },
  'payment': {
    label: 'Vendor Payment',
    plural: 'Vendor Payments',
    partyLabel: 'Vendor',
    partyField: 'vendorId',
    routeBase: '/app/transactions/payments',
    slice: 'purchases',
    listKey: 'payments',
    partyRole: 'vendor',
  },
  'goods-receipt': {
    label: 'Goods Receipt',
    plural: 'Goods Receipts',
    partyLabel: 'Vendor',
    partyField: 'vendorId',
    routeBase: '/app/transactions/grn',
    slice: 'purchases',
    listKey: 'grns',
    partyRole: 'vendor',
  },
};