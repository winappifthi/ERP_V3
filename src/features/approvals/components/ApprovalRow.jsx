import { Button } from '@mui/material';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';

const TYPE_LABEL = {
  'sales-order': 'Sales Order',
  'purchase-order': 'Purchase Order',
  'purchase-invoice': 'Purchase Invoice',
  'journal': 'Journal',
};

const TYPE_LINK = {
  'sales-order': '/app/sales/orders',
  'purchase-order': '/app/purchases/orders',
  'purchase-invoice': '/app/purchases/invoices',
  'journal': '/app/finance/journals',
};

export default function ApprovalRow({ row, onApproveClick, canApprove }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{TYPE_LABEL[row.documentType]}</span>
          <span className="font-mono text-xs text-gray-900">{row.documentNumber}</span>
        </div>
        <div className="text-sm text-gray-900 mt-1 truncate">{row.partyName}</div>
        <div className="text-xs text-gray-500">
          {formatDate(row.documentDate)} · Submitted {formatDate(row.submittedAt, 'DD MMM HH:mm')}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-semibold tabular-nums text-sm">{formatINR(row.amountPaise)}</div>
        <div className="text-xs text-gray-500">Needs {row.requiredRole}</div>
      </div>
      <div className="flex-shrink-0">
        <Button
          size="small"
          variant="contained"
          onClick={() => onApproveClick(row)}
          disabled={!canApprove}
        >
          Review
        </Button>
      </div>
    </div>
  );
}