// src/store/slices/appSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
  companyId: null,
  branchId: null,
  financialYear: null,
  sidebarCollapsed: false,
  mobileNavOpen: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // ── Auth ──
    login(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.companyId = action.payload.companyId;
      state.branchId = action.payload.branchId;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.companyId = null;
      state.branchId = null;
    },

    // ── Context ──
    setCompany(state, action) {
      state.companyId = action.payload;
    },
    setBranch(state, action) {
      state.branchId = action.payload;
    },
    setFinancialYear(state, action) {
      state.financialYear = action.payload;
    },

    // ── UI ──
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileNav(state) {
      state.mobileNavOpen = !state.mobileNavOpen;
    },
    setMobileNavOpen(state, action) {
      state.mobileNavOpen = action.payload;
    },
  },
});

// 👇 These exports are what Login.jsx and Header.jsx are importing
export const {
  login,
  logout,
  setCompany,
  setBranch,
  setFinancialYear,
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileNav,
  setMobileNavOpen,
} = appSlice.actions;

export default appSlice.reducer;