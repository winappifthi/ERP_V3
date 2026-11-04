import { createSelector } from '@reduxjs/toolkit';

const selectApp = (s) => s.app;
const selectMasters = (s) => s.masters;

export const selectCompanyId = (s) => s.app.companyId;
export const selectBranchId = (s) => s.app.branchId;
export const selectCurrentUser = (s) => s.app.user;

export const selectCompanies = (s) => s.masters.companies;
export const selectBranches = (s) => s.masters.branches;
export const selectProducts = (s) => s.masters.products;
export const selectTaxCategories = (s) => s.masters.taxCategories;
export const selectWarehouses = (s) => s.masters.warehouses;

// ---- New unified selector ----
export const selectParties = (s) => s.masters.parties;

// ---- Derived selectors (backward-compatible) ----
// Old sales/purchase modules import these. They now return parties filtered by type.
export const selectCustomers = createSelector(
  [selectParties],
  (parties) => parties.filter((p) => p.type === 'customer')
);

export const selectVendors = createSelector(
  [selectParties],
  (parties) => parties.filter((p) => p.type === 'vendor')
);

export const selectLeads = createSelector(
  [selectParties],
  (parties) => parties.filter((p) => p.type === 'lead')
);

// ---- Context-scoped (existing behavior preserved) ----
export const selectCurrentCompany = createSelector(
  [selectCompanies, selectCompanyId],
  (companies, id) => companies.find((c) => c.id === id) || null
);

export const selectBranchesForCompany = createSelector(
  [selectBranches, selectCompanyId],
  (branches, companyId) => branches.filter((b) => b.companyId === companyId)
);

export const selectCurrentBranch = createSelector(
  [selectBranches, selectBranchId],
  (branches, id) => branches.find((b) => b.id === id) || null
);

export const selectWarehousesForBranch = createSelector(
  [selectWarehouses, selectBranchId],
  (wh, branchId) => wh.filter((w) => w.branchId === branchId)
);

export const selectProductsForCompany = createSelector(
  [selectProducts],
  (products) => products.filter((p) => p.active)
);

// ---- Party selectors (context-scoped) ----
export const selectPartiesForCompany = createSelector(
  [selectParties, selectCompanyId],
  (parties, companyId) => parties.filter((p) => p.companyId === companyId)
);

export const selectCustomersForCompany = createSelector(
  [selectPartiesForCompany],
  (parties) => parties.filter((p) => p.type === 'customer')
);

export const selectVendorsForCompany = createSelector(
  [selectPartiesForCompany],
  (parties) => parties.filter((p) => p.type === 'vendor')
);

export const selectLeadsForCompany = createSelector(
  [selectPartiesForCompany],
  (parties) => parties.filter((p) => p.type === 'lead')
);