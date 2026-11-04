// src/features/users/usersThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export const fetchUsers = createAsyncThunk('users/fetch', async (_, { rejectWithValue }) => {
  try {
    return await api.get('/users');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const createUser = createAsyncThunk('users/create', async (data, { rejectWithValue }) => {
  try {
    return await api.post('/users', data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateUserAsync = createAsyncThunk('users/update', async ({ id, ...data }, { rejectWithValue }) => {
  try {
    return await api.put(`/users/${id}`, data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const deleteUserAsync = createAsyncThunk('users/delete', async (id, { rejectWithValue }) => {
  try {
    await api.del(`/users/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});