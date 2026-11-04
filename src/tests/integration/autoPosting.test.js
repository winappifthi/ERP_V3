import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import appReducer from '../../store/slices/appSlice';
import mastersReducer from '../../store/slices/mastersSlice';
import salesReducer from '../../features/sales/salesSlice';
import purchasesReducer from '../../features/purchases/purchasesSlice';
import inventoryReducer from '../../features/inventory/inventorySlice';
import manufacturingReducer from '../../features/manufacturing/manufacturingSlice';
import financeReducer from '../../features/finance/financeSlice';
import taxReducer from '../../features/tax/taxSlice';
import approvalsReducer from '../../features/approvals/approvalSlice';
import productivityReducer from '../../features/productivity/productivitySlice';
import { postSalesInvoiceWithGL } from '../../features/finance/postingThunks';

const makeStore = () => configureStore({
  reducer: {
    app: appReducer,
    masters: mastersReducer,
    sales: salesReducer,
    purchases: purchasesReducer,
    inventory: inventoryReducer,
    manufacturing: manufacturingReducer,
    finance: financeReducer,
    tax: taxReducer,
    approvals: approvalsReducer,
    productivity: productivityReducer,
  },
});

describe('Auto GL Posting — Thunks', () => {
  it('posting a draft sales invoice creates balanced GL postings', async () => {
    const store = makeStore();

    // Find an existing draft invoice (seed may not have any; create one)
    store.dispatch({
      type: 'sales/createInvoice',
      payload: {
        id: 'TEST-INV-AUTOPOST-1',
        companyId: 'COM-RETAIL',
        branchId: 'BR-RET-CHN',
        invoiceNumber: 'INV/TEST/0001',
        invoiceDate: '2024-06-01',
        dueDate: '2024-07-01',
        customerId: 'CUST-0001',
        sourceOrderId: null,
        status: 'draft',
        taxTreatment: 'intra',
        lines: [
          { productId: 'PRD-0001', quantity: 1, unitPriceRupees: 10000, discountPercent: 0, taxRatePercent: 18, taxTreatment: 'intra', taxInclusive: false, warehouseId: 'WH-RET-CHN-A' },
        ],
        headerDiscountRupees: 0,
        charges: { freightRupees: 0, packingRupees: 0, otherRupees: 0 },
        applyRoundOff: true,
        amountPaid: 0,
        notes: 'Test',
        createdAt: new Date().toISOString(),
        _computedTotalPaise: 1180000,
      },
    });

    const before = store.getState().finance.postings.length;

    await store.dispatch(postSalesInvoiceWithGL('TEST-INV-AUTOPOST-1'));

    const after = store.getState().finance.postings;
    const added = after.length - before;
    expect(added).toBeGreaterThan(0);

    // Find all postings for this reference and verify balance
    const refPostings = after.filter(
      (p) => p.referenceType === 'sales-invoice' && p.referenceId === 'TEST-INV-AUTOPOST-1'
    );
    const debit = refPostings.reduce((s, p) => s + (p.debitPaise || 0), 0);
    const credit = refPostings.reduce((s, p) => s + (p.creditPaise || 0), 0);
    expect(debit).toBe(credit);

    // Verify document is now posted
    const inv = store.getState().sales.invoices.find((i) => i.id === 'TEST-INV-AUTOPOST-1');
    expect(inv.status).toBe('posted');
  });

  it('posting is idempotent — re-posting does not duplicate GL', async () => {
    const store = makeStore();

    store.dispatch({
      type: 'sales/createInvoice',
      payload: {
        id: 'TEST-INV-AUTOPOST-2',
        companyId: 'COM-RETAIL',
        branchId: 'BR-RET-CHN',
        invoiceNumber: 'INV/TEST/0002',
        invoiceDate: '2024-06-01',
        dueDate: '2024-07-01',
        customerId: 'CUST-0001',
        sourceOrderId: null,
        status: 'draft',
        taxTreatment: 'intra',
        lines: [
          { productId: 'PRD-0001', quantity: 1, unitPriceRupees: 5000, discountPercent: 0, taxRatePercent: 18, taxTreatment: 'intra', taxInclusive: false, warehouseId: 'WH-RET-CHN-A' },
        ],
        headerDiscountRupees: 0,
        charges: { freightRupees: 0, packingRupees: 0, otherRupees: 0 },
        applyRoundOff: true,
        amountPaid: 0,
        notes: 'Test',
        createdAt: new Date().toISOString(),
        _computedTotalPaise: 590000,
      },
    });

    await store.dispatch(postSalesInvoiceWithGL('TEST-INV-AUTOPOST-2'));
    const count1 = store.getState().finance.postings.filter(
      (p) => p.referenceType === 'sales-invoice' && p.referenceId === 'TEST-INV-AUTOPOST-2'
    ).length;

    await store.dispatch(postSalesInvoiceWithGL('TEST-INV-AUTOPOST-2'));
    const count2 = store.getState().finance.postings.filter(
      (p) => p.referenceType === 'sales-invoice' && p.referenceId === 'TEST-INV-AUTOPOST-2'
    ).length;

    expect(count1).toBe(count2);
  });

  it('every seeded posted invoice already has balanced GL', () => {
    const store = makeStore();
    const state = store.getState();

    for (const inv of state.sales.invoices.filter((i) => i.status === 'posted')) {
      const refPostings = state.finance.postings.filter(
        (p) => p.referenceType === 'sales-invoice' && p.referenceId === inv.id
      );
      if (refPostings.length === 0) continue; // seeded without GL — acceptable per fixture
      const debit = refPostings.reduce((s, p) => s + (p.debitPaise || 0), 0);
      const credit = refPostings.reduce((s, p) => s + (p.creditPaise || 0), 0);
      expect(debit, `Invoice ${inv.id} GL imbalance`).toBe(credit);
    }
  });
});