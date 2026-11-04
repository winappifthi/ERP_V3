import { createSlice, nanoid } from '@reduxjs/toolkit';
import { purchaseOrders as seedOrders } from '../../data/seed/purchaseOrders';
import { goodsReceipts as seedGrns } from '../../data/seed/goodsReceipts';
import { purchaseInvoices as seedInvoices } from '../../data/seed/purchaseInvoices';
import { purchaseReturns as seedReturns } from '../../data/seed/purchaseReturns';
import { vendorPayments as seedPayments } from '../../data/seed/vendorPayments';
import { vendors as seedVendors } from '../../data/seed/vendors';

const initialState = {
  orders: seedOrders,
  grns: seedGrns,
  invoices: seedInvoices,
  returns: seedReturns,
  payments: seedPayments,
  vendorOutstanding: Object.fromEntries(seedVendors.map((v) => [v.id, v.outstanding || 0])),
};

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    // ---- Orders ----
    createOrder(state, action) { state.orders.unshift(action.payload); },
    updateOrder(state, action) {
      const idx = state.orders.findIndex((o) => o.id === action.payload.id);
      if (idx >= 0) state.orders[idx] = { ...state.orders[idx], ...action.payload };
    },
    setOrderStatus(state, action) {
      const order = state.orders.find((o) => o.id === action.payload.id);
      if (order) order.status = action.payload.status;
    },

    // ---- GRN ----
    createGrn(state, action) { state.grns.unshift(action.payload); },
    updateGrn(state, action) {
      const idx = state.grns.findIndex((g) => g.id === action.payload.id);
      if (idx >= 0) state.grns[idx] = { ...state.grns[idx], ...action.payload };
    },
    setGrnStatus(state, action) {
      const grn = state.grns.find((g) => g.id === action.payload.id);
      if (grn) grn.status = action.payload.status;
    },

    // ---- Invoices ----
    createInvoice(state, action) {
      const inv = action.payload;
      state.invoices.unshift(inv);
      if (inv.status === 'posted') {
        const total = inv._computedTotalPaise || 0;
        const paid = Math.round((inv.amountPaid || 0) * 100);
        const due = (total - paid) / 100;
        if (due > 0) {
          state.vendorOutstanding[inv.vendorId] = (state.vendorOutstanding[inv.vendorId] || 0) + due;
        }
      }
    },
    updateInvoice(state, action) {
      const idx = state.invoices.findIndex((i) => i.id === action.payload.id);
      if (idx >= 0) state.invoices[idx] = { ...state.invoices[idx], ...action.payload };
    },
    postInvoice(state, action) {
      const inv = state.invoices.find((i) => i.id === action.payload);
      if (inv && inv.status === 'draft') {
        inv.status = 'posted';
        const total = inv._computedTotalPaise || 0;
        const paid = Math.round((inv.amountPaid || 0) * 100);
        const due = (total - paid) / 100;
        if (due > 0) {
          state.vendorOutstanding[inv.vendorId] = (state.vendorOutstanding[inv.vendorId] || 0) + due;
        }
      }
    },

    // ---- Returns ----
    createReturn(state, action) { state.returns.unshift(action.payload); },
    updateReturn(state, action) {
      const idx = state.returns.findIndex((r) => r.id === action.payload.id);
      if (idx >= 0) state.returns[idx] = { ...state.returns[idx], ...action.payload };
    },
    setReturnStatus(state, action) {
      const ret = state.returns.find((r) => r.id === action.payload.id);
      if (ret) ret.status = action.payload.status;
    },

    // ---- Payments ----
    createPayment(state, action) { state.payments.unshift(action.payload); },
    updatePayment(state, action) {
      const idx = state.payments.findIndex((p) => p.id === action.payload.id);
      if (idx >= 0) state.payments[idx] = { ...state.payments[idx], ...action.payload };
    },
    setPaymentStatus(state, action) {
      const p = state.payments.find((x) => x.id === action.payload.id);
      if (p) p.status = action.payload.status;
    },
  },
});

export const {
  createOrder, updateOrder, setOrderStatus,
  createGrn, updateGrn, setGrnStatus,
  createInvoice, updateInvoice, postInvoice,
  createReturn, updateReturn, setReturnStatus,
  createPayment, updatePayment, setPaymentStatus,
} = purchasesSlice.actions;

// ---- ID and number generators ----
export const generateOrderId = () => `PO-${nanoid(6)}`;
export const generateGrnId = () => `GRN-${nanoid(6)}`;
export const generatePurchaseInvoiceId = () => `PINV-${nanoid(6)}`;
export const generatePurchaseReturnId = () => `PRET-${nanoid(6)}`;
export const generatePaymentId = () => `VPAY-${nanoid(6)}`;

const nextNumber = (list, prefixFn, key) => {
  const prefix = prefixFn();
  const matching = list.filter((o) => o[key]?.startsWith(prefix));
  const maxSeq = matching.reduce((max, o) => {
    const seq = parseInt(o[key].split('/').pop(), 10) || 0;
    return Math.max(max, seq);
  }, 0);
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
};

export const generateOrderNumber = (orders, company, branch) => nextNumber(orders, () => `PO/${branch?.code || 'XX'}/2425/`, 'orderNumber');
export const generateGrnNumber = (grns, company, branch) => nextNumber(grns, () => `GRN/${branch?.code || 'XX'}/2425/`, 'receiptNumber');
export const generatePurchaseInvoiceNumber = (invoices, company, branch) => nextNumber(invoices, () => `PI/${branch?.code || 'XX'}/2425/`, 'invoiceNumber');
export const generatePurchaseReturnNumber = (returns, company, branch) => nextNumber(returns, () => `PRET/${branch?.code || 'XX'}/2425/`, 'returnNumber');
export const generatePaymentNumber = (payments, company, branch) => nextNumber(payments, () => `VPAY/${branch?.code || 'XX'}/2425/`, 'paymentNumber');

export default purchasesSlice.reducer;