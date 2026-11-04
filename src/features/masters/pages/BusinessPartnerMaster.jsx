import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Divider,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  FirstPage as FirstPageIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  LastPage as LastPageIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  LocalShipping as SupplierIcon,
  TrendingUp as LeadIcon,
} from '@mui/icons-material';

import {
  selectCustomers,
  selectVendors,
  selectLeads,
  selectCurrentCompany,
  selectCurrentBranch,
} from '../../../store/selectors/contextSelectors';
import {
  addCustomer,
  updateCustomer,
  deleteCustomer,
  addVendor,
  updateVendor,
  deleteVendor,
  addLead,
  updateLead,
  deleteLead,
} from '../../../store/slices/mastersSlice';
import { formatINR } from '../../../lib/currency';

const INDIAN_STATES = [
  { code: '33', name: 'Tamil Nadu' },
  { code: '29', name: 'Karnataka' },
  { code: '27', name: 'Maharashtra' },
  { code: '07', name: 'Delhi' },
  { code: '36', name: 'Telangana' },
  { code: '32', name: 'Kerala' },
  { code: '24', name: 'Gujarat' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '19', name: 'West Bengal' },
];

export default function BusinessPartnerMaster() {
  const dispatch = useDispatch();
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);

  const rawCustomers = useSelector(selectCustomers);
  const rawVendors = useSelector(selectVendors);
  const rawLeads = useSelector(selectLeads);

  // Filter entities by active company
  const customers = useMemo(
    () => rawCustomers.filter((c) => c.companyId === company?.id),
    [rawCustomers, company]
  );
  const vendors = useMemo(
    () => rawVendors.filter((v) => v.companyId === company?.id),
    [rawVendors, company]
  );
  const leads = useMemo(
    () => rawLeads.filter((l) => l.companyId === company?.id),
    [rawLeads, company]
  );

  // BP Type: 'customer' | 'vendor' | 'lead'
  const [bpType, setBpType] = useState('customer');

  // Active dataset
  const currentList = useMemo(() => {
    if (bpType === 'customer') return customers;
    if (bpType === 'vendor') return vendors;
    return leads;
  }, [bpType, customers, vendors, leads]);

  // Selected item index
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Form Mode: 'view' | 'edit' | 'new'
  const [mode, setMode] = useState('view');

  // Form State (SAP B1 style model)
  const [formData, setFormData] = useState({
    id: '',
    code: '',
    name: '',
    type: 'wholesale', // or retail
    gstin: '',
    phone: '',
    email: '',
    contactPerson: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    stateCode: '33',
    creditLimit: 0,
    outstanding: 0,
    active: true,
    leadStatus: 'open',
    paymentTerms: 'Net 30',
  });

  // Search keyword in header
  const [searchFilter, setSearchFilter] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Filtered list based on search
  const filteredList = useMemo(() => {
    if (!searchFilter.trim()) return currentList;
    const q = searchFilter.toLowerCase();
    return currentList.filter(
      (item) =>
        (item.name || '').toLowerCase().includes(q) ||
        (item.code || '').toLowerCase().includes(q) ||
        (item.gstin || '').toLowerCase().includes(q)
    );
  }, [currentList, searchFilter]);

  // Sync formData when selected item or list changes
  useEffect(() => {
    if (mode === 'new') return;
    if (filteredList.length > 0) {
      const safeIdx = Math.min(selectedIndex, filteredList.length - 1);
      const active = filteredList[safeIdx];
      if (active) {
        setFormData({
          id: active.id || '',
          code: active.code || '',
          name: active.name || '',
          type: active.type || 'wholesale',
          gstin: active.gstin || '',
          phone: active.phone || '',
          email: active.email || '',
          contactPerson: active.contactPerson || '',
          address: active.address || '',
          city: active.city || '',
          state: active.state || 'Tamil Nadu',
          stateCode: active.stateCode || '33',
          creditLimit: active.creditLimit || 0,
          outstanding: active.outstanding || 0,
          active: active.active !== false,
          leadStatus: active.leadStatus || 'open',
          paymentTerms: active.paymentTerms || 'Net 30',
        });
        setMode('view');
      }
    } else {
      // Empty
      setFormData({
        id: '',
        code: '',
        name: '',
        type: 'wholesale',
        gstin: '',
        phone: '',
        email: '',
        contactPerson: '',
        address: '',
        city: '',
        state: 'Tamil Nadu',
        stateCode: '33',
        creditLimit: 0,
        outstanding: 0,
        active: true,
        leadStatus: 'open',
        paymentTerms: 'Net 30',
      });
      setMode('view');
    }
  }, [selectedIndex, filteredList, bpType]);

  // Tab switch (Customer / Supplier / Lead)
  const handleTabChange = (_, newType) => {
    setBpType(newType);
    setSelectedIndex(0);
    setSearchFilter('');
    setMode('view');
  };

  // Nav actions (SAP B1 VCR buttons)
  const goFirst = () => { setSelectedIndex(0); setMode('view'); };
  const goPrev = () => { setSelectedIndex((prev) => Math.max(0, prev - 1)); setMode('view'); };
  const goNext = () => { setSelectedIndex((prev) => Math.min(filteredList.length - 1, prev + 1)); setMode('view'); };
  const goLast = () => { setSelectedIndex(Math.max(0, filteredList.length - 1)); setMode('view'); };

  // New Record
  const handleAddNew = () => {
    const prefix = bpType === 'customer' ? 'C' : bpType === 'vendor' ? 'V' : 'L';
    const nextNum = String(currentList.length + 1).padStart(3, '0');
    setFormData({
      id: '',
      code: `${prefix}${nextNum}`,
      name: '',
      type: bpType === 'customer' ? 'wholesale' : 'vendor',
      gstin: '',
      phone: '',
      email: '',
      contactPerson: '',
      address: '',
      city: '',
      state: 'Tamil Nadu',
      stateCode: '33',
      creditLimit: bpType === 'customer' ? 50000 : 0,
      outstanding: 0,
      active: true,
      leadStatus: 'open',
      paymentTerms: 'Net 30',
    });
    setMode('new');
  };

  // Change field in form
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (mode === 'view') {
      setMode('edit');
    }
  };

  // State selection handler
  const handleStateChange = (code) => {
    const found = INDIAN_STATES.find((s) => s.code === code);
    setFormData((prev) => ({
      ...prev,
      stateCode: code,
      state: found ? found.name : prev.state,
    }));
    if (mode === 'view') setMode('edit');
  };

  // Save / Update Record
  const handleSave = () => {
    if (!formData.code.trim()) {
      setSnackbar({ open: true, message: 'BP Code is required', severity: 'error' });
      return;
    }
    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: 'BP Name is required', severity: 'error' });
      return;
    }

    if (mode === 'new') {
      const generatedId =
        bpType === 'customer'
          ? `CUST-${Date.now().toString(36).toUpperCase()}`
          : bpType === 'vendor'
          ? `VND-${Date.now().toString(36).toUpperCase()}`
          : `LEAD-${Date.now().toString(36).toUpperCase()}`;

      const newRecord = {
        ...formData,
        id: generatedId,
        companyId: company?.id,
        branchId: branch?.id,
      };

      if (bpType === 'customer') dispatch(addCustomer(newRecord));
      else if (bpType === 'vendor') dispatch(addVendor(newRecord));
      else dispatch(addLead(newRecord));

      setSnackbar({ open: true, message: `${bpType.toUpperCase()} created successfully!`, severity: 'success' });
      setSelectedIndex(0);
      setMode('view');
    } else {
      // Update
      const updated = {
        ...formData,
        companyId: company?.id,
      };

      if (bpType === 'customer') dispatch(updateCustomer(updated));
      else if (bpType === 'vendor') dispatch(updateVendor(updated));
      else dispatch(updateLead(updated));

      setSnackbar({ open: true, message: `${bpType.toUpperCase()} updated successfully!`, severity: 'success' });
      setMode('view');
    }
  };

  // Delete
  const handleDeleteConfirm = () => {
    if (!formData.id) return;
    if (bpType === 'customer') dispatch(deleteCustomer(formData.id));
    else if (bpType === 'vendor') dispatch(deleteVendor(formData.id));
    else dispatch(deleteLead(formData.id));

    setDeleteConfirmOpen(false);
    setSnackbar({ open: true, message: `${bpType.toUpperCase()} deleted!`, severity: 'info' });
    setSelectedIndex((prev) => Math.max(0, prev - 1));
    setMode('view');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1, md: 2 } }}>
      {/* Top Banner: SAP B1 Business Partner Master Data Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: '1px solid #cbd5e1',
          borderRadius: 2,
          bgcolor: '#ffffff',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          {/* Title & Type selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                bgcolor: bpType === 'customer' ? '#2563eb' : bpType === 'vendor' ? '#059669' : '#d97706',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {bpType === 'customer' ? <PersonIcon /> : bpType === 'vendor' ? <SupplierIcon /> : <LeadIcon />}
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a' }}>
                  Business Partner Master Data
                </Typography>
                <Chip
                  label={mode === 'new' ? 'NEW' : mode === 'edit' ? 'MODIFIED' : 'OK'}
                  size="small"
                  color={mode === 'new' ? 'primary' : mode === 'edit' ? 'warning' : 'default'}
                  sx={{ fontWeight: 600, fontSize: '0.7rem', height: 20 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                SAP B1 HANA Single Screen: Customer, Supplier & Lead Central Master
              </Typography>
            </Box>
          </Box>

          {/* VCR Navigation toolbar & Search */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search code/name…"
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setSelectedIndex(0);
              }}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: '#94a3b8' }} />,
              }}
              sx={{ width: 190, '& input': { py: 0.75, fontSize: '0.8rem' } }}
            />

            {/* VCR Buttons */}
            <Box sx={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: 1, bgcolor: '#f8fafc' }}>
              <Tooltip title="First Record">
                <span>
                  <IconButton size="small" onClick={goFirst} disabled={mode === 'new' || selectedIndex <= 0}>
                    <FirstPageIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Previous Record">
                <span>
                  <IconButton size="small" onClick={goPrev} disabled={mode === 'new' || selectedIndex <= 0}>
                    <PrevIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Box sx={{ display: 'flex', alignItems: 'center', px: 1, fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                {filteredList.length === 0 ? '0/0' : `${selectedIndex + 1} / ${filteredList.length}`}
              </Box>
              <Tooltip title="Next Record">
                <span>
                  <IconButton size="small" onClick={goNext} disabled={mode === 'new' || selectedIndex >= filteredList.length - 1}>
                    <NextIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Last Record">
                <span>
                  <IconButton size="small" onClick={goLast} disabled={mode === 'new' || selectedIndex >= filteredList.length - 1}>
                    <LastPageIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            {/* Action buttons */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#0f172a', borderColor: '#cbd5e1' }}
            >
              Add New
            </Button>
            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {mode === 'new' ? 'Add' : 'Update'}
            </Button>
            {mode !== 'new' && formData.id && (
              <IconButton size="small" color="error" onClick={() => setDeleteConfirmOpen(true)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* BP Type selector tabs: Customer | Supplier | Lead */}
        <Box sx={{ mt: 2, borderBottom: 1, borderColor: '#e2e8f0' }}>
          <Tabs
            value={bpType}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 1, textTransform: 'none', fontWeight: 600 } }}
          >
            <Tab value="customer" icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Customers (${customers.length})`} />
            <Tab value="vendor" icon={<SupplierIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Suppliers / Vendors (${vendors.length})`} />
            <Tab value="lead" icon={<LeadIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Leads (${leads.length})`} />
          </Tabs>
        </Box>
      </Paper>

      {/* Main SAP B1 Hana Two-Column Master Form */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '1px solid #cbd5e1',
          borderRadius: 2,
          bgcolor: '#ffffff',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
        }}
      >
        {/* Header Fields (Code, Name, Group, Currency) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2.5,
            pb: 3,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          {/* Left Column Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Code *"
                size="small"
                value={formData.code}
                onChange={(e) => handleFieldChange('code', e.target.value)}
                sx={{ width: '45%' }}
                inputProps={{ style: { fontFamily: 'monospace', fontWeight: 600 } }}
              />
              <FormControl size="small" sx={{ width: '55%' }}>
                <InputLabel>Partner Type</InputLabel>
                <Select
                  label="Partner Type"
                  value={bpType}
                  onChange={(e) => handleTabChange(null, e.target.value)}
                >
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="vendor">Supplier / Vendor</MenuItem>
                  <MenuItem value="lead">Lead</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Partner Name *"
              size="small"
              fullWidth
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              inputProps={{ style: { fontWeight: 600 } }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Category / Type</InputLabel>
                <Select
                  label="Category / Type"
                  value={formData.type}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                >
                  <MenuItem value="wholesale">Wholesale</MenuItem>
                  <MenuItem value="retail">Retail</MenuItem>
                  <MenuItem value="corporate">Corporate</MenuItem>
                </Select>
              </FormControl>

              {bpType === 'lead' && (
                <FormControl size="small" fullWidth>
                  <InputLabel>Lead Stage</InputLabel>
                  <Select
                    label="Lead Stage"
                    value={formData.leadStatus}
                    onChange={(e) => handleFieldChange('leadStatus', e.target.value)}
                  >
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="qualified">Qualified</MenuItem>
                    <MenuItem value="proposal">Proposal Sent</MenuItem>
                    <MenuItem value="lost">Lost</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>

          {/* Right Column Header (Financial Highlights) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Currency"
                size="small"
                value={company?.currency || 'INR'}
                disabled
                sx={{ width: '35%' }}
              />
              <TextField
                label="GSTIN / VAT #"
                size="small"
                value={formData.gstin}
                onChange={(e) => handleFieldChange('gstin', e.target.value.toUpperCase())}
                sx={{ width: '65%' }}
                inputProps={{ style: { fontFamily: 'monospace' } }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={bpType === 'vendor' ? 'Payables (Outstanding)' : 'Receivables (Outstanding)'}
                size="small"
                fullWidth
                value={formatINR(formData.outstanding * 100)}
                disabled
                inputProps={{ style: { color: formData.outstanding > 0 ? '#b91c1c' : '#047857', fontWeight: 700 } }}
              />
              {bpType !== 'lead' && (
                <TextField
                  label="Credit Limit (₹)"
                  type="number"
                  size="small"
                  fullWidth
                  value={formData.creditLimit}
                  onChange={(e) => handleFieldChange('creditLimit', Number(e.target.value))}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, mt: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                Status:
              </Typography>
              <Chip
                label={formData.active ? 'Active' : 'Inactive'}
                color={formData.active ? 'success' : 'default'}
                size="small"
                onClick={() => handleFieldChange('active', !formData.active)}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Detailed Sections (General, Addresses, Contact Person, Financial Terms) */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 3, mb: 2, color: '#334155' }}>
          Details & Contact Information
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* General & Contacts */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Contact Person"
              size="small"
              fullWidth
              value={formData.contactPerson}
              onChange={(e) => handleFieldChange('contactPerson', e.target.value)}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Telephone / Mobile"
                size="small"
                fullWidth
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              />
              <TextField
                label="E-Mail"
                type="email"
                size="small"
                fullWidth
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
              />
            </Box>

            <FormControl size="small" fullWidth>
              <InputLabel>Payment Terms</InputLabel>
              <Select
                label="Payment Terms"
                value={formData.paymentTerms}
                onChange={(e) => handleFieldChange('paymentTerms', e.target.value)}
              >
                <MenuItem value="Immediate">Immediate Cash</MenuItem>
                <MenuItem value="Net 15">Net 15 Days</MenuItem>
                <MenuItem value="Net 30">Net 30 Days</MenuItem>
                <MenuItem value="Net 60">Net 60 Days</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Address & Tax Jurisdiction */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Street Address / Bill-To"
              size="small"
              fullWidth
              value={formData.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="City"
                size="small"
                fullWidth
                value={formData.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
              />
              <FormControl size="small" fullWidth>
                <InputLabel>State / Tax Code</InputLabel>
                <Select
                  label="State / Tax Code"
                  value={formData.stateCode}
                  onChange={(e) => handleStateChange(e.target.value)}
                >
                  {INDIAN_STATES.map((s) => (
                    <MenuItem key={s.code} value={s.code}>
                      {s.code} — {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="State Name"
              size="small"
              fullWidth
              value={formData.state}
              disabled
            />
          </Box>
        </Box>

        {/* Footer info bar */}
        <Box
          sx={{
            mt: 4,
            pt: 2,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <span>Branch: {branch?.name || 'Main Office'}</span>
          <span>Record ID: {formData.id || 'New BP'}</span>
        </Box>
      </Paper>

      {/* Delete Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Business Partner?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {formData.name} ({formData.code})? This will remove this partner from your master list.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
