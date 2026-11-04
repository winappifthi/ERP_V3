import { useSelector } from 'react-redux';
import ConfigList from '../components/ConfigList';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  selectCustomersForCompany,
  selectVendorsForCompany,
  selectCurrentCompany,
  selectCurrentBranch,
} from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';
import { PAYMENT_TYPE_OPTIONS } from '../fieldConfig';

export default function UnifiedPaymentsList() {
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);

  const salesReceipts = useSelector((s) => s.sales.receipts);
  const purchasePayments = useSelector((s) => s.purchases.payments);
  const customers = useSelector(selectCustomersForCompany);
  const vendors = useSelector(selectVendorsForCompany);
  const customerById = Object.fromEntries(customers.map((c) => [c.id, c]));
  const vendorById = Object.fromEntries(vendors.map((v) => [v.id, v]));

  const getRows = (type) => {
    const records = type === 'receipt' ? salesReceipts : purchasePayments;
    return records
      .filter((r) => r.companyId === company?.id && r.branchId === branch?.id)
      .map((r) => ({
        ...r,
        totalRupees: (r.allocations || []).reduce((s, a) => s + (a.amountRupees || 0), 0),
      }));
  };

  const baseColumns = [
    {
      key: 'number',
      label: 'Number',
      render: (r) => (
        <span className="font-mono text-xs">
          {r.receiptNumber || r.paymentNumber || '—'}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (r) => formatDate(r.receiptDate || r.paymentDate),
    },
    {
      key: 'totalRupees',
      label: 'Amount',
      align: 'right',
      render: (r) => <span className="tabular-nums">{formatINR(r.totalRupees * 100)}</span>,
    },
    {
      key: 'mode',
      label: 'Mode',
      hideOnMobile: true,
      render: (r) => <span className="capitalize">{r.mode}</span>,
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const columnConfig = {
    receipt: [
      ...baseColumns,
      {
        key: 'customerId',
        label: 'Customer',
        render: (r) => customerById[r.customerId]?.name || '—',
      },
    ],
    payment: [
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
      title="Receipts & Payments"
      description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      typeOptions={PAYMENT_TYPE_OPTIONS}
      defaultType="receipt"
      columnConfig={columnConfig}
      getRows={getRows}
      getNewPath={() => '/app/transactions/payments/new'}
      partyField="customerId"
      partySelector={selectCustomersForCompany}
      searchableFields={['receiptNumber', 'paymentNumber']}
    />
  );
}