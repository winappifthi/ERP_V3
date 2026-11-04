import { createSlice } from '@reduxjs/toolkit';
import { companies } from '../../data/seed/companies';
import { branches } from '../../data/seed/branches';
import { warehouses } from '../../data/seed/warehouses';
import { taxCategories } from '../../data/seed/taxCategories';
import { products } from '../../data/seed/products';
import { customers as seedCustomers } from '../../data/seed/customers';
import { vendors as seedVendors } from '../../data/seed/vendors';

// ---- Migrate seed customers + vendors into unified `parties` array ----
const migratedParties = [
  ...seedCustomers.map((c) => ({
    id: c.id,
    type: 'customer',
    companyId: c.companyId,
    branchId: c.branchId,
    code: c.code,
    name: c.name,
    gstin: c.gstin || '',
    state: c.state || 'Tamil Nadu',
    stateCode: c.stateCode || '33',
    phone: '',
    email: '',
    notes: '',
    creditLimit: c.creditLimit || 0,
    outstanding: c.outstanding || 0,
    active: c.active ?? true,
  })),
  ...seedVendors.map((v) => ({
    id: v.id,
    type: 'vendor',
    companyId: v.companyId,
    branchId: v.branchId,
    code: v.code,
    name: v.name,
    gstin: v.gstin || '',
    state: v.state || 'Tamil Nadu',
    stateCode: v.stateCode || '33',
    phone: '',
    email: '',
    notes: '',
    outstanding: v.outstanding || 0,
    active: v.active ?? true,
  })),
];

// Example seed leads (new concept — no existing records to migrate)
const seedLeads = [
  {
    id: 'LEAD-0001',
    type: 'lead',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    code: 'L001',
    name: 'Sunrise Electricals',
    gstin: '',
    state: 'Tamil Nadu',
    stateCode: '33',
    phone: '+91-9876543210',
    email: 'contact@sunriseelec.example',
    notes: 'Interested in bulk LED panel order.',
    stage: 'qualified',
    active: true,
  },
  {
    id: 'LEAD-0002',
    type: 'lead',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    code: 'L002',
    name: 'Rajesh Kumar',
    gstin: '',
    state: 'Tamil Nadu',
    stateCode: '33',
    phone: '+91-9123456789',
    email: 'rajesh.k@example.com',
    notes: 'Walk-in enquiry, needs pricing.',
    stage: 'new',
    active: true,
  },
];

const initialState = {
  companies,
  branches,
  warehouses,
  taxCategories,
  products,
  parties: [...migratedParties, ...seedLeads],
};

// ---- Derive customers and vendors from parties (backward compat) ----
// These are NOT stored — they're computed on read via selectors.
// See `contextSelectors.js` for the derived selectors.

const mastersSlice = createSlice({
  name: 'masters',
  initialState,
  reducers: {
    // ---- Products ----
    addProduct(state, action) {
      state.products.unshift(action.payload);
    },
    updateProduct(state, action) {
      const idx = state.products.findIndex((p) => p.id === action.payload.id);
      if (idx >= 0) state.products[idx] = { ...state.products[idx], ...action.payload };
    },
    deleteProduct(state, action) {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },

    // ---- Parties (customers + vendors + leads) ----
    addParty(state, action) {
      state.parties.unshift(action.payload);
    },
    updateParty(state, action) {
      const idx = state.parties.findIndex((p) => p.id === action.payload.id);
      if (idx >= 0) state.parties[idx] = { ...state.parties[idx], ...action.payload };
    },
    deleteParty(state, action) {
      state.parties = state.parties.filter((p) => p.id !== action.payload);
    },

    // ---- Warehouses ----
    addWarehouse(state, action) {
      state.warehouses.unshift(action.payload);
    },
    updateWarehouse(state, action) {
      const idx = state.warehouses.findIndex((w) => w.id === action.payload.id);
      if (idx >= 0) state.warehouses[idx] = { ...state.warehouses[idx], ...action.payload };
    },
    deleteWarehouse(state, action) {
      state.warehouses = state.warehouses.filter((w) => w.id !== action.payload);
    },
  },
});

export const {
  addProduct, updateProduct, deleteProduct,
  addParty, updateParty, deleteParty,
  addWarehouse, updateWarehouse, deleteWarehouse,
} = mastersSlice.actions;

export default mastersSlice.reducer;