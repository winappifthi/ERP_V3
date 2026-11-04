/**
 * Runtime diagnostic: inspects current Redux state and reports any consistency issues.
 * Exposed on `window` in development for manual inspection.
 *
 * Usage (in browser console):
 *   window.ezyConsistencyCheck()
 */
export const runConsistencyCheck = (state) => {
  const issues = [];

  // ---- 1. Reference integrity ----
  const companyIds = new Set(state.masters.companies.map((c) => c.id));
  const productIds = new Set(state.masters.products.map((p) => p.id));
  const customerIds = new Set(state.masters.customers.map((c) => c.id));
  const vendorIds = new Set(state.masters.vendors.map((v) => v.id));
  const warehouseIds = new Set(state.masters.warehouses.map((w) => w.id));
  const accountCodes = new Set(state.finance.accounts.map((a) => a.code));

  for (const i of state.sales.invoices) {
    if (!companyIds.has(i.companyId)) issues.push(`Sales invoice ${i.id} has invalid companyId ${i.companyId}`);
    if (!customerIds.has(i.customerId)) issues.push(`Sales invoice ${i.id} has invalid customerId ${i.customerId}`);
    for (const l of i.lines) {
      if (!productIds.has(l.productId)) issues.push(`Sales invoice ${i.id} line has invalid productId ${l.productId}`);
    }
  }

  for (const i of state.purchases.invoices) {
    if (!vendorIds.has(i.vendorId)) issues.push(`Purchase invoice ${i.id} has invalid vendorId ${i.vendorId}`);
    for (const l of i.lines) {
      if (!productIds.has(l.productId)) issues.push(`Purchase invoice ${i.id} line has invalid productId ${l.productId}`);
    }
  }

  for (const m of state.inventory.movements) {
    if (!productIds.has(m.productId)) issues.push(`Movement ${m.id} has invalid productId ${m.productId}`);
    if (!warehouseIds.has(m.warehouseId)) issues.push(`Movement ${m.id} has invalid warehouseId ${m.warehouseId}`);
  }

  // ---- 2. Duplicate document numbers ----
  const dupCheck = (items, key) => {
    const seen = new Set();
    for (const i of items) {
      if (seen.has(i[key])) issues.push(`Duplicate ${key}: ${i[key]}`);
      seen.add(i[key]);
    }
  };
  dupCheck(state.sales.orders, 'orderNumber');
  dupCheck(state.sales.invoices, 'invoiceNumber');
  dupCheck(state.purchases.orders, 'orderNumber');
  dupCheck(state.purchases.invoices, 'invoiceNumber');

  // ---- 3. GL balance ----
  const totalDebit = state.finance.postings.reduce((s, p) => s + (p.debitPaise || 0), 0);
  const totalCredit = state.finance.postings.reduce((s, p) => s + (p.creditPaise || 0), 0);
  if (totalDebit !== totalCredit) {
    issues.push(`Trial balance out of balance: Dr ${totalDebit} vs Cr ${totalCredit}`);
  }

  // ---- 4. Per-reference balance ----
  const groups = new Map();
  for (const p of state.finance.postings) {
    const key = `${p.referenceType}::${p.referenceId}`;
    const g = groups.get(key) || { debit: 0, credit: 0 };
    g.debit += p.debitPaise || 0;
    g.credit += p.creditPaise || 0;
    groups.set(key, g);
  }
  for (const [key, g] of groups.entries()) {
    if (g.debit !== g.credit) {
      issues.push(`GL reference group ${key} out of balance: Dr ${g.debit} vs Cr ${g.credit}`);
    }
  }

  // ---- 5. GL account codes ----
  for (const p of state.finance.postings) {
    if (!accountCodes.has(p.accountCode)) {
      issues.push(`Posting ${p.id} has invalid accountCode ${p.accountCode}`);
    }
  }

  return {
    passed: issues.length === 0,
    count: issues.length,
    issues,
  };
};

/** Browser entry point — call window.ezyConsistencyCheck() in dev. */
export const installConsistencyCheck = (store) => {
  if (typeof window === 'undefined') return;
  window.ezyConsistencyCheck = () => {
    const result = runConsistencyCheck(store.getState());
    if (result.passed) {
      console.log('%c✓ Consistency check passed', 'color: green; font-weight: bold');
    } else {
      console.error(`✗ ${result.count} consistency issue(s):`);
      result.issues.forEach((i) => console.error('  ·', i));
    }
    return result;
  };
  console.log('%cEZY ERP · consistency check available: window.ezyConsistencyCheck()', 'color: #2563eb');
};