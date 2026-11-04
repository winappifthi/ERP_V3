import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Button, TextField, MenuItem, Select, FormControl, InputLabel, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Avatar,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { addUser, updateUser, deleteUser } from '../../../store/slices/usersSlice';

const ROLES = ['admin', 'manager', 'accountant', 'staff'];

const emptyForm = { id: null, name: '', email: '', role: 'staff', password: '', avatarColor: '#2563eb' };

export default function UsersList() {
  const dispatch = useDispatch();
  const users = useSelector((s) => s.users.list);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [snack, setSnack] = useState(null);

  const openCreate = () => {
    setForm(emptyForm);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (u) => {
    setForm({ ...u, password: u.password || '' });
    setError('');
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    const email = form.email.trim().toLowerCase();
    const dup = users.find((u) => u.email.toLowerCase() === email && u.id !== form.id);
    if (dup) {
      setError('Email already exists.');
      return;
    }
    if (!form.id) {
      if (!form.password) {
        setError('Password is required for a new user.');
        return;
      }
      const id = `USR-${Date.now().toString(36).slice(-4).toUpperCase()}`;
      dispatch(addUser({ ...form, id, email }));
      setSnack({ severity: 'success', message: 'User created' });
    } else {
      const payload = { ...form, email };
      if (!payload.password) delete payload.password; // keep existing password
      dispatch(updateUser(payload));
      setSnack({ severity: 'success', message: 'User updated' });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    dispatch(deleteUser(toDelete.id));
    setToDelete(null);
    setSnack({ severity: 'success', message: 'User deleted' });
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Avatar sx={{ width: 26, height: 26, fontSize: 11, bgcolor: r.avatarColor || '#2563eb' }}>
            {r.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </Avatar>
          <span>{r.name}</span>
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => <span className="capitalize">{r.role}</span> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      sortable: false,
      render: (r) => (
        <div className="flex gap-1 justify-end">
          <IconButton size="small" aria-label="Edit user" onClick={() => openEdit(r)}><Edit fontSize="small" /></IconButton>
          <IconButton size="small" aria-label="Delete user" color="error" onClick={() => setToDelete(r)}><Delete fontSize="small" /></IconButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description={`${users.length} user${users.length === 1 ? '' : 's'}`}
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            New User
          </Button>
        }
      />
      <DataTable columns={columns} rows={users} pageSize={10} emptyMessage="No users." />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{form.id ? 'Edit User' : 'New User'}</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-2 pt-1">
            <TextField label="Name *" size="small" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Email *" type="email" size="small" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <FormControl size="small">
              <InputLabel>Role</InputLabel>
              <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label={form.id ? 'Password (blank = keep)' : 'Password *'}
              size="small"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <TextField label="Avatar Color" size="small" value={form.avatarColor} onChange={(e) => setForm({ ...form, avatarColor: e.target.value })} />
            {error && <div className="text-xs text-red-600">{error}</div>}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
        <DialogTitle>Delete user?</DialogTitle>
        <DialogContent>
          <div className="text-sm text-gray-600">{toDelete?.name} will be removed.</div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        {snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </div>
  );
}
