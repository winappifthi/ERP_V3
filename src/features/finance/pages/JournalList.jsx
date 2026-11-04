import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { selectJournalsInContext } from '../financeSelectors';
import {
  selectCurrentCompany,
  selectCurrentBranch,
} from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';
import { Print } from '@mui/icons-material';

export default function JournalList() {
  const navigate = useNavigate();
  const journals = useSelector(selectJournalsInContext);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);

  const columns = [
    {
      key: 'voucherNumber',
      label: 'Voucher #',
      render: (r) => (
        <span className="font-mono text-xs">{r.voucherNumber}</span>
      ),
    },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'narration', label: 'Narration' },
    {
      key: 'lines',
      label: 'Lines',
      align: 'right',
      render: (r) => r.lines.length,
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (r) =>
        formatINR(r.lines.reduce((s, l) => s + (l.debitPaise || 0), 0)),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      sortable: false,
      render: (r) => (
        <div className="flex gap-1 justify-end">
          {r.status === 'draft' && (
            <Button
              size="small"
              onClick={() => navigate(`/app/finance/journals/${r.id}/edit`)}
            >
              Edit
            </Button>
          )}
          <Button
            size="small"
            onClick={() => navigate(`/app/finance/journals/${r.id}/print`)}
          >
            Print
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Journal Entries"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/app/finance/journals/new')}
          >
            New Journal
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={journals}
        pageSize={15}
        emptyMessage="Post a journal entry to begin your general ledger."
        emptyAction={{
          label: 'New Journal',
          onClick: () => navigate('/app/finance/journals/new'),
        }}
      />
    </div>
  );
}
