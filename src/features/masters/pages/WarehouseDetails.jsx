import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import { selectWarehouses } from '../../../store/selectors/contextSelectors';
import { deleteWarehouse } from '../../../store/slices/mastersSlice';

const TYPE_LABEL = {
  'retail': 'Retail',
  'distribution': 'Distribution',
  'raw-material': 'Raw Material',
  'finished-goods': 'Finished Goods',
};

export default function WarehouseDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const warehouses = useSelector(selectWarehouses);
  const warehouse = warehouses.find((w) => w.id === id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!warehouse) {
    return (
      <div>
        <PageHeader title="Warehouse not found" />
        <Button variant="outlined" onClick={() => navigate('/app/masters/warehouses')}>Back</Button>
      </div>
    );
  }

  const handleDelete = () => {
    dispatch(deleteWarehouse(warehouse.id));
    navigate('/app/masters/warehouses');
  };

  return (
    <div>
      <PageHeader
        title={warehouse.name}
        description={`Code: ${warehouse.code}`}
        actions={
          <>
            <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/app/masters/warehouses/${warehouse.id}/edit`)}>Edit</Button>
            <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => setConfirmDelete(true)}>Delete</Button>
          </>
        }
      />

      <div className="bg-white border border-gray-200 rounded p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold">Warehouse Info</h2>
          <StatusBadge status={warehouse.active ? 'active' : 'inactive'} />
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><dt className="text-xs text-gray-500">Code</dt><dd className="font-mono">{warehouse.code}</dd></div>
          <div><dt className="text-xs text-gray-500">Type</dt><dd>{TYPE_LABEL[warehouse.type] || warehouse.type}</dd></div>
          <div><dt className="text-xs text-gray-500">Branch</dt><dd className="font-mono text-xs">{warehouse.branchId}</dd></div>
          <div><dt className="text-xs text-gray-500">Company</dt><dd className="font-mono text-xs">{warehouse.companyId}</dd></div>
        </dl>
      </div>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete warehouse?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {warehouse.name} will be removed from the master. Existing stock movements and transactions reference it by ID and will not be affected, but new documents will not be able to select it.
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