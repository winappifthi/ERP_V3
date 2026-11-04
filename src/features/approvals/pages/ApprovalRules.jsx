import { useSelector, useDispatch } from 'react-redux';
import { Switch } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { selectApprovalRules } from '../approvalSelectors';
import { toggleRuleActive } from '../approvalSlice';
import { formatINR } from '../../../lib/currency';

export default function ApprovalRules() {
  const dispatch = useDispatch();
  const rules = useSelector(selectApprovalRules);

  const columns = [
    { key: 'documentType', label: 'Document Type', render: (r) => <span className="text-xs capitalize">{r.documentType.replace('-', ' ')}</span> },
    { key: 'minRupees', label: 'From', align: 'right', render: (r) => formatINR(r.minRupees * 100) },
    { key: 'maxRupees', label: 'To', align: 'right', render: (r) => r.maxRupees == null ? 'No limit' : formatINR(r.maxRupees * 100) },
    { key: 'approverRole', label: 'Approver Role', render: (r) => <span className="capitalize text-xs">{r.approverRole}</span> },
    { key: 'description', label: 'Description', render: (r) => <span className="text-xs text-gray-600">{r.description}</span> },
    {
      key: 'active',
      label: 'Active',
      align: 'center',
      render: (r) => (
        <Switch
          size="small"
          checked={r.active}
          onChange={() => dispatch(toggleRuleActive(r.id))}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Approval Rules"
        description="Rules determine which documents require approval and by which role"
      />
      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3 text-xs text-blue-900">
        <strong>How it works:</strong> When a document is submitted, the first matching rule (by document type and amount) determines the required approver role. Admin users can approve anything; managers can approve within their rule. Rules can be toggled inactive without deleting them.
      </div>
      <DataTable columns={columns} rows={rules} pageSize={20} emptyMessage="No rules configured." />
    </div>
  );
}