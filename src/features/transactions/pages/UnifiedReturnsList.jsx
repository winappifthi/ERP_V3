import { useSelector } from 'react-redux';
import ConfigList from '../components/ConfigList';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  selectCustomersForCompany,
  selectVendorsForCompany,
  selectCurrentCompany,
  selectCurrentBranch,
} from '../../../store/selectors/contextSelectors';
import { calculateDocument } from '../../../domain/calculations/documentCalculator';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';
import { RETURN_TYPE_OPTIONS } from '../fieldConfig';

export default function UnifiedReturnsList() {
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);

  const salesReturns = useSelector((s) => s.sales.returns);
  const purchaseReturns = useSelector((s) => s.purchases.returns);
  const customers = useSelector(selectCustomersForCompany);
  const vendors = useSelector(selectVendorsForCompany);
  const customerById = Object.fromEntries(customers.map((c) => [c.id, c]));
  const vendorById = Object.fromEntries(vendors.map((v) => [v.id, v]));

  const getRows = (type) => {
    const records = type === 'sales-return' ? salesReturns : purchaseReturns;
    return records
      .filter((r) => r.companyId === company?.id && r.branchId === branch?.id)
      .map((r) => {
        const calc = calculateDocument({
          lines: r.lines,
          headerDiscountRupees: 0,
          charges: { freightRupees: 0, packingRupees: 0, otherRupees: 0 },
          applyRoundOff: true,
        });
        return { ...r, totalPaise: calc.totals.finalTotalPaise };
      });
  };

  const baseColumns = [
    {
      key: 'returnNumber',
      label: 'Return #',
      render: (r) => <span className="font-mono text-xs">{r.returnNumber}</span>,
    },
    { key: 'returnDate', label: 'Date', render: (r) => formatDate(r.returnDate) },
    {
      key: 'totalPaise',
      label: 'Amount',
      align: 'right',
      render: (r) => <span className="tabular-nums">{formatINR(r.totalPaise)}</span>,
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const columnConfig = {
    'sales-return': [
      ...baseColumns,
      {
        key: 'customerId',
        label: 'Customer',
        render: (r) => customerById[r.customerId]?.name || '—',
      },
    ],
    'purchase-return': [
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
      title="Returns"
      description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      typeOptions={RETURN_TYPE_OPTIONS}
      defaultType="sales-return"
      columnConfig={columnConfig}
      getRows={getRows}
      getNewPath={() => '/app/transactions/returns/new'}
      partyField="customerId"
      partySelector={selectCustomersForCompany}
      searchableFields={['returnNumber']}
    />
  );
}