// src/features/users/usersSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchUsers, createUser, updateUserAsync, deleteUserAsync } from './usersThunks';

const initialState = {
  list: [],
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── Fetch ──
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ── Create ──
      .addCase(createUser.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      // ── Update ──
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        const idx = state.list.findIndex((u) => u.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      // ── Delete ──
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u.id !== action.payload);
      });
  },
});

export default usersSlice.reducer;