import { Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setOrderStatus } from '../salesSlice';

export default function SalesStatusActions({ order }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const change = (status) => dispatch(setOrderStatus({ id: order.id, status }));

  return (
    <div className="flex gap-2 flex-wrap">
      {order.status === 'draft' && (
        <>
          <Button variant="outlined" size="small" onClick={() => navigate(`/app/sales/orders/${order.id}/edit`)}>
            Edit
          </Button>
          <Button variant="contained" size="small" onClick={() => change('pending')}>
            Submit for Approval
          </Button>
        </>
      )}
      {order.status === 'pending' && (
        <>
          <Button variant="contained" color="success" size="small" onClick={() => change('approved')}>
            Approve
          </Button>
          <Button variant="outlined" color="error" size="small" onClick={() => change('rejected')}>
            Reject
          </Button>
        </>
      )}
      {order.status === 'approved' && (
        <Button variant="contained" size="small" onClick={() => change('completed')}>
          Mark Completed
        </Button>
      )}
      {(order.status === 'approved' || order.status === 'pending' || order.status === 'draft') && (
        <Button variant="outlined" color="warning" size="small" onClick={() => change('cancelled')}>
          Cancel
        </Button>
      )}
    </div>
  );
}