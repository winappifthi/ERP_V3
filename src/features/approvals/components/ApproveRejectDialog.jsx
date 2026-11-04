import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, RadioGroup, FormControlLabel, Radio } from '@mui/material';

export default function ApproveRejectDialog({ open, onClose, onConfirm, documentNumber }) {
  const [action, setAction] = useState('approve');
  const [comment, setComment] = useState('');

  useEffect(() => { if (!open) { setAction('approve'); setComment(''); } }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{action === 'approve' ? 'Approve' : 'Reject'} {documentNumber}</DialogTitle>
      <DialogContent>
        <RadioGroup row value={action} onChange={(e) => setAction(e.target.value)}>
          <FormControlLabel value="approve" control={<Radio size="small" />} label="Approve" />
          <FormControlLabel value="reject" control={<Radio size="small" />} label="Reject" />
        </RadioGroup>
        <TextField
          label={action === 'reject' ? 'Reason (required)' : 'Comment (optional)'}
          fullWidth
          multiline
          minRows={3}
          sx={{ mt: 2 }}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color={action === 'reject' ? 'error' : 'primary'}
          onClick={() => onConfirm(action, comment)}
          disabled={action === 'reject' && !comment.trim()}
        >
          {action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}