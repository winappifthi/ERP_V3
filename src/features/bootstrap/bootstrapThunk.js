// src/features/bootstrap/bootstrapThunk.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api/client';

export const loadInitialData = createAsyncThunk('app/loadInitialData', async () => {
  const [companies, branches, warehouses, products, customers, vendors] = await Promise.all([
    api.get('/companies'),
    api.get('/branches'),
    api.get('/warehouses'),
    api.get('/products'),
    api.get('/customers'),
    api.get('/vendors'),
  ]);
  return { companies, branches, warehouses, products, customers, vendors };
});