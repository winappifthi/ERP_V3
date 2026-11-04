import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ConfigList from '../components/ConfigList';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  selectCustomersForCompany,
  selectCurrentCompany,
  selectCurrentBranch,
} from '../../../store/selectors/contextSelectors';
import { calculateDocument } from '../../../domain/calculations/documentCalculator';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';
import { ORDER_TYPE_OPTIONS } from '../fieldConfig';

export default function UnifiedOrdersList() {
  const navigate = useNavigate();
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);

  const salesOrders = useSelector((s) => s.sales.orders);
  const purchaseOrders = useSelector((s) => s.purchases.orders);
  const customers = useSelector(selectCustomersForCompany);

  const getRows = (type) => {
    const records = type === 'sales-order' ? salesOrders : purchaseOrders;
    return records
      .filter((r) => r.companyId === company?.id && r.branchId === branch?.id)
      .map((r) => {
        const calc = calculateDocument({
          lines: r.lines,
          headerDiscountRupees: r.headerDiscountRupees || 0,
          charges: r.charges,
          applyRoundOff: r.applyRoundOff ?? true,
        });
        return { ...r, totalPaise: calc.totals.finalTotalPaise };
      });
  };

  const customerById = Object.fromEntries(customers.map((c) => [c.id, c]));
  const vendorState = useSelector((s) => s.masters.parties);
  const vendorById = Object.fromEntries(
    vendorState.filter((p) => p.type === 'vendor').map((v) => [v.id, v])
  );

  const baseColumns = [
    {
      key: 'orderNumber',
      label: 'Order #',
      render: (r) => (
        <button
          onClick={() => navigate(`/app/transactions/orders/${r.id}`)}
          className="text-blue-600 hover:underline font-mono text-xs"
        >
          {r.orderNumber}
        </button>
      ),
    },
    { key: 'orderDate', label: 'Date', render: (r) => formatDate(r.orderDate) },
    {
      key: 'totalPaise',
      label: 'Total',
      align: 'right',
      render: (r) => <span className="tabular-nums">{formatINR(r.totalPaise)}</span>,
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const columnConfig = {
    'sales-order': [
      ...baseColumns,
      {
        key: 'customerId',
        label: 'Customer',
        render: (r) => customerById[r.customerId]?.name || '—',
      },
    ],
    'purchase-order': [
      ...baseColumns,
      {
        key: 'vendorId',
        label: 'Vendor',
        render: (r) => vendorById[r.vendorId]?.name || '—',
      },
    ],
  };

  return (
    <ConfigList
      title="Orders"
      description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      typeOptions={ORDER_TYPE_OPTIONS}
      defaultType="sales-order"
      columnConfig={columnConfig}
      getRows={getRows}
      getNewPath={() => '/app/transactions/orders/new'}
      partyField="customerId"
      partySelector={selectCustomersForCompany}
      searchableFields={['orderNumber']}
    />
  );
}