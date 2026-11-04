// src/navigation/menuConfig.js
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory2';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export const menu = [
  {
    type: 'item',
    label: 'Dashboard',
    path: '/app/dashboard',
    icon: DashboardIcon,
  },
  {
    type: 'group',
    label: 'Transactions',
    icon: ShoppingCartIcon,
    children: [
      { label: 'Orders', path: '/app/transactions/orders' },
      { label: 'Invoices', path: '/app/transactions/invoices' },
      { label: 'Returns', path: '/app/transactions/returns' },
      { label: 'Receipts & Payments', path: '/app/transactions/payments' },
      { label: 'Goods Receipts & Deliveries', path: '/app/transactions/grn' },
      { label: 'Ledger', path: '/app/transactions/ledger' },
    ],
  },
  {
    type: 'group',
    label: 'Inventory',
    icon: InventoryIcon,
    children: [
      { label: 'Stock Movements', path: '/app/inventory/movements' },
      { label: 'Damage / Issue', path: '/app/inventory/damage' },
      { label: 'Low Stock Alerts', path: '/app/inventory/low-stock' },
      { label: 'Inventory Valuation', path: '/app/inventory/valuation' },
      { label: 'Stock History', path: '/app/inventory/history' },
    ],
  },
  {
    type: 'group',
    label: 'Manufacturing',
    icon: PrecisionManufacturingIcon,
    children: [
      { label: 'BOM', path: '/app/manufacturing/bom' },
      { label: 'Production Orders', path: '/app/manufacturing/production-orders' },
      { label: 'MRP Preview', path: '/app/manufacturing/mrp' },
    ],
  },
  {
    type: 'group',
    label: 'Finance',
    icon: AccountBalanceIcon,
    children: [
      { label: 'Chart of Accounts', path: '/app/finance/coa' },
      { label: 'Journal Entries', path: '/app/finance/journals' },
      { label: 'General Ledger', path: '/app/finance/general-ledger' },
      { label: 'Trial Balance', path: '/app/finance/trial-balance' },
      { label: 'Profit & Loss', path: '/app/finance/profit-loss' },
      { label: 'Balance Sheet', path: '/app/finance/balance-sheet' },
    ],
  },
  {
    type: 'group',
    label: 'Tax',
    icon: ReceiptLongIcon,
    children: [
      { label: 'GSTR-1', path: '/app/tax/gstr1' },
      { label: 'GSTR-3B', path: '/app/tax/gstr3b' },
      { label: 'HSN Summary', path: '/app/tax/hsn-summary' },
      { label: 'Reconciliation', path: '/app/tax/reconciliation' },
    ],
  },
  {
    type: 'item',
    label: 'Reports',
    path: '/app/reports',
    icon: AssessmentIcon,
  },
  {
    type: 'group',
    label: 'Masters',
    icon: StorefrontIcon,
    children: [
      { label: 'Parties', path: '/app/masters/parties' },
      { label: 'Items', path: '/app/masters/items' },
      { label: 'Categories', path: '/app/masters/categories' },
      { label: 'Units (UOM)', path: '/app/masters/uom' },
      { label: 'Barcodes', path: '/app/masters/barcodes' },
      { label: 'Warehouses', path: '/app/masters/warehouses' },
      { label: 'Bins', path: '/app/masters/bins' },
    ],
  },
  {
    type: 'item',
    label: 'Approvals',
    path: '/app/approvals',
    icon: PeopleIcon,
  },
  {
    type: 'item',
    label: 'Settings',
    path: '/app/settings/general',
    icon: SettingsIcon,
  },
];

/**
 * Finds the group whose children best match the current pathname.
 * Returns the matching group, or null if the pathname belongs to a top-level item.
 */
export const findActiveGroup = (pathname) => {
  if (!pathname) return null;

  // Normalize trailing slash
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  return (
    menu.find(
      (item) =>
        item.type === 'group' &&
        Array.isArray(item.children) &&
        item.children.some(
          (child) =>
            normalized === child.path ||
            normalized.startsWith(`${child.path}/`)
        )
    ) || null
  );
};

/**
 * Checks if any child of a group is active (for sidebar highlighting).
 */
export const isGroupActive = (group, pathname) => {
  if (!group?.children) return false;
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  return group.children.some(
    (child) =>
      normalized === child.path ||
      normalized.startsWith(`${child.path}/`)
  );
};