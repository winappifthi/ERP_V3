import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageHeader from '../../../components/common/PageHeader';
import {
  selectCurrentCompany,
  selectCurrentBranch,
} from '../../../store/selectors/contextSelectors';

const REPORTS = [
  {
    category: 'Sales',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    items: [
      { label: 'Orders', desc: 'Sales & purchase orders', path: '/app/transactions/orders' },
      { label: 'Invoices', desc: 'Sales & purchase invoices', path: '/app/transactions/invoices' },
      { label: 'Returns', desc: 'Sales & purchase returns', path: '/app/transactions/returns' },
      { label: 'Sales Analytics', desc: 'Monthly trend, top products', path: '/app/reports/sales' },
      { label: 'Customer Profitability', desc: 'Revenue and margin by customer', path: '/app/reports/customer-profitability' },
    ],
  },
  {
    category: 'Purchase',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    items: [
      { label: 'Receipts & Payments', desc: 'Customer receipts & vendor payments', path: '/app/transactions/payments' },
      { label: 'Goods Receipts & Deliveries', desc: 'GRN / GDN', path: '/app/transactions/grn' },
      { label: 'Ledger', desc: 'Customer & vendor statements', path: '/app/transactions/ledger' },
      { label: 'Purchase Analytics', desc: 'Monthly trend, top vendors', path: '/app/reports/purchases' },
      { label: 'Vendor Performance', desc: 'Spend, returns, outstanding', path: '/app/reports/vendor-performance' },
    ],
  },
  {
    category: 'Inventory',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    items: [
      { label: 'Stock Overview', desc: 'Product × warehouse on-hand', path: '/app/inventory/stock' },
      { label: 'Stock Valuation', desc: 'Inventory value by product', path: '/app/inventory/valuation' },
      { label: 'Stock Aging', desc: 'FIFO bucket analysis', path: '/app/inventory/aging' },
      { label: 'Reorder Report', desc: 'Below-reorder products', path: '/app/inventory/reorder' },
      { label: 'Inventory Analytics', desc: 'Category-level stock analysis', path: '/app/reports/inventory' },
    ],
  },
  {
    category: 'Finance',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    items: [
      { label: 'Profit & Loss', desc: 'Income vs expense for the period', path: '/app/finance/profit-loss' },
      { label: 'Balance Sheet', desc: 'Assets = Liabilities + Equity', path: '/app/finance/balance-sheet' },
      { label: 'Trial Balance', desc: 'All account balances', path: '/app/finance/trial-balance' },
      { label: 'Cash Flow', desc: 'Cash & bank movements', path: '/app/reports/cash-flow' },
      { label: 'Profitability', desc: 'Product and margin analysis', path: '/app/reports/profitability' },
    ],
  },
  {
    category: 'Tax',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    items: [
      { label: 'GSTR-1 Preview', desc: 'Outward supplies', path: '/app/tax/gstr1' },
      { label: 'GSTR-3B Preview', desc: 'Monthly summary', path: '/app/tax/gstr3b' },
      { label: 'HSN Summary', desc: 'HSN-wise outward', path: '/app/tax/hsn-summary' },
      { label: 'GST Reconciliation', desc: 'Register vs GL', path: '/app/tax/reconciliation' },
    ],
  },
  {
    category: 'Cross-cutting',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    items: [
      { label: 'Branch Performance', desc: 'Sales & purchase by branch', path: '/app/reports/branch-performance' },
      { label: 'Sales vs Purchase', desc: 'Monthly comparison', path: '/app/reports/sales' },
    ],
  },
];

export default function ReportsHub() {
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map((cat) => (
          <div key={cat.category} className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className={`px-3 py-2 text-sm font-semibold border-b ${cat.color}`}>
              {cat.category}
            </div>
            <div className="divide-y divide-gray-100">
              {cat.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}