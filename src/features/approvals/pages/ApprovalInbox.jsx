import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Tabs, Tab, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import ApprovalRow from '../components/ApprovalRow';
import ApproveRejectDialog from '../components/ApproveRejectDialog';
import { selectPendingApprovals, selectMyApprovals } from '../approvalSelectors';
import { appendActivity, pushNotification } from '../approvalSlice';
import { setOrderStatus as setSalesOrderStatus } from '../../sales/salesSlice';
import { setOrderStatus as setPurchaseOrderStatus, postInvoice as postPurchaseInvoice } from '../../purchases/purchasesSlice';
import { postJournal } from '../../finance/financeSlice';
import { formatINR } from '../../../lib/currency';

export default function ApprovalInbox() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.app.user);
  const all = useSelector(selectPendingApprovals);
  const mine = useSelector(selectMyApprovals);
  const [tab, setTab] = useState('mine');
  const [dialogRow, setDialogRow] = useState(null);
  const [snack, setSnack] = useState(null);

  const rows = tab === 'mine' ? mine : all;

  const canApproveRow = (row) => {
    if (user.role === 'admin') return true;
    return row.requiredRole === user.role;
  };

  const handleConfirm = (action, comment) => {
    if (!dialogRow) return;
    const { id, documentType, documentNumber, partyName } = dialogRow;

    // Apply the appropriate status change
    if (documentType === 'sales-order') {
      dispatch(setSalesOrderStatus({ id, status: action === 'approve' ? 'approved' : 'rejected' }));
    } else if (documentType === 'purchase-order') {
      dispatch(setPurchaseOrderStatus({ id, status: action === 'approve' ? 'approved' : 'cancelled' }));
    } else if (documentType === 'purchase-invoice') {
      if (action === 'approve') dispatch(postPurchaseInvoice(id));
    } else if (documentType === 'journal') {
      if (action === 'approve') dispatch(postJournal(id));
    }

    // Append to activity log
    dispatch(appendActivity({
      documentType,
      documentId: id,
      action: action === 'approve' ? 'approved' : 'rejected',
      userId: user.id,
      userName: user.name,
      at: new Date().toISOString(),
      comment,
    }));

    // Push a notification to the submitter (mock: notify ourselves for simplicity)
    dispatch(pushNotification({
      title: `${documentNumber} ${action === 'approve' ? 'approved' : 'rejected'}`,
      body: `${partyName} · ${action === 'approve' ? 'Approved' : `Rejected${comment ? ': ' + comment : ''}`}`,
      link: null,
    }));

    setDialogRow(null);
    setSnack({ severity: 'success', message: `${documentNumber} ${action === 'approve' ? 'approved' : 'rejected'}` });
  };

  return (
    <div>
      <PageHeader
        title="Approval Inbox"
        description={`${user.name} · ${user.role}`}
        actions={<Button variant="outlined" onClick={() => navigate('/app/settings/approval-rules')}>Approval Rules</Button>}
      />

      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="My Queue" value={mine.length} highlight />
        <Stat label="All Pending" value={all.length} />
        <Stat label="Total Value" value={formatINR(all.reduce((s, r) => s + r.amountPaise, 0))} />
      </div>

      <div className="bg-white border border-gray-200 rounded">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 40 }}>
          <Tab value="mine" label={`For Me (${mine.length})`} sx={{ minHeight: 40, fontSize: 13 }} />
          <Tab value="all" label={`All Pending (${all.length})`} sx={{ minHeight: 40, fontSize: 13 }} />
        </Tabs>
        <div className="px-3">
          {rows.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-500">
              {tab === 'mine' ? 'Nothing awaiting your approval. ' : 'No pending approvals.'}
            </div>
          )}
          {rows.map((row) => (
            <ApprovalRow key={`${row.documentType}-${row.id}`} row={row} onApproveClick={setDialogRow} canApprove={canApproveRow(row)} />
          ))}
        </div>
      </div>

      <ApproveRejectDialog
        open={!!dialogRow}
        onClose={() => setDialogRow(null)}
        onConfirm={handleConfirm}
        documentNumber={dialogRow?.documentNumber}
      />

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        {snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className={`bg-white border border-gray-200 rounded p-2.5 ${highlight ? 'border-blue-300 bg-blue-50' : ''}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-semibold text-sm tabular-nums ${highlight ? 'text-blue-700' : ''}`}>{value}</div>
    </div>
  );
}