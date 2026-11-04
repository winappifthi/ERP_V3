import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import { selectPartiesForCompany } from '../../../store/selectors/contextSelectors';
import { deleteParty } from '../../../store/slices/mastersSlice';
import { formatINR } from '../../../lib/currency';
import { typeLabel, LEAD_STAGES } from '../partyHelpers';

export default function PartyDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const parties = useSelector(selectPartiesForCompany);
  const party = parties.find((p) => p.id === id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!party) {
    return <div><PageHeader title="Party not found" /><Button variant="outlined" onClick={() => navigate('/app/masters/parties')}>Back</Button></div>;
  }

  const handleDelete = () => {
    dispatch(deleteParty(party.id));
    navigate(`/app/masters/parties?type=${party.type}`);
  };

  const stage = LEAD_STAGES.find((s) => s.value === party.stage);

  return (
    <div>
      <PageHeader
        title={party.name}
        description={`${typeLabel(party.type)} · ${party.code}`}
        actions={
          <>
            <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/app/masters/parties/${party.id}/edit`)}>Edit</Button>
            <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => setConfirmDelete(true)}>Delete</Button>
          </>
        }
      />

      <div className="bg-white border border-gray-200 rounded p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold">{typeLabel(party.type)} Info</h2>
          <StatusBadge status={party.active ? 'active' : 'inactive'} />
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><dt className="text-xs text-gray-500">Code</dt><dd className="font-mono">{party.code}</dd></div>
          <div><dt className="text-xs text-gray-500">Phone</dt><dd>{party.phone || '—'}</dd></div>
          <div><dt className="text-xs text-gray-500">Email</dt><dd>{party.email || '—'}</dd></div>

          {(party.type === 'customer' || party.type === 'vendor') && (
            <>
              <div><dt className="text-xs text-gray-500">GSTIN</dt><dd className="font-mono text-xs">{party.gstin || 'Unregistered'}</dd></div>
              <div><dt className="text-xs text-gray-500">State</dt><dd>{party.state} ({party.stateCode})</dd></div>
              <div><dt className="text-xs text-gray-500">Outstanding</dt><dd className="tabular-nums">{formatINR((party.outstanding || 0) * 100)}</dd></div>
            </>
          )}

          {party.type === 'customer' && (
            <div><dt className="text-xs text-gray-500">Credit Limit</dt><dd className="tabular-nums">{formatINR((party.creditLimit || 0) * 100)}</dd></div>
          )}

          {party.type === 'lead' && (
            <div>
              <dt className="text-xs text-gray-500">Stage</dt>
              <dd>
                {stage ? (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${stage.color}`}>{stage.label}</span>
                ) : '—'}
              </dd>
            </div>
          )}

          {party.notes && (
            <div className="md:col-span-4"><dt className="text-xs text-gray-500">Notes</dt><dd>{party.notes}</dd></div>
          )}
        </dl>
      </div>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete {typeLabel(party.type).toLowerCase()}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {party.name} will be removed. Existing transactions reference it by ID and will not be affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}