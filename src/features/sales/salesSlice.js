import { createSlice, nanoid } from '@reduxjs/toolkit';
import { salesOrders as seedOrders } from '../../data/seed/salesOrders';
import { salesInvoices as seedInvoices } from '../../data/seed/salesInvoices';
import { salesReturns as seedReturns } from '../../data/seed/salesReturns';
import { customerReceipts as seedReceipts } from '../../data/seed/customerReceipts';
import { goodsDeliveries as seedGdns } from '../../data/seed/goodsDeliveries'; // 👈 New GDN import
import { customers as seedCustomers } from '../../data/seed/customers';

const initialState = {
  orders: seedOrders,
  invoices: seedInvoices,
  returns: seedReturns,
  receipts: seedReceipts,
  gdns: seedGdns, // 👈 Added GDNs
  customerOutstanding: Object.fromEntries(seedCustomers.map((c) => [c.id, c.outstanding || 0])),
};

const salesSlice = createSlice({
  name: 'sales',
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

    // ---- Invoices ----
    createInvoice(state, action) {
      const inv = action.payload;
      state.invoices.unshift(inv);
      if (inv.status === 'posted') {
        const total = inv._computedTotalPaise || 0;
        const paid = Math.round((inv.amountPaid || 0) * 100);
        const due = (total - paid) / 100;
        if (due > 0) {
          state.customerOutstanding[inv.customerId] = (state.customerOutstanding[inv.customerId] || 0) + due;
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
          state.customerOutstanding[inv.customerId] = (state.customerOutstanding[inv.customerId] || 0) + due;
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

    // ---- Receipts ----
    createReceipt(state, action) { state.receipts.unshift(action.payload); },
    updateReceipt(state, action) {
      const idx = state.receipts.findIndex((r) => r.id === action.payload.id);
      if (idx >= 0) state.receipts[idx] = { ...state.receipts[idx], ...action.payload };
    },
    setReceiptStatus(state, action) {
      const rcp = state.receipts.find((r) => r.id === action.payload.id);
      if (rcp) rcp.status = action.payload.status;
    },

    // ---- Deliveries (GDN) ----
    createDelivery(state, action) { state.gdns.unshift(action.payload); },
    updateDelivery(state, action) {
      const idx = state.gdns.findIndex((d) => d.id === action.payload.id);
      if (idx >= 0) state.gdns[idx] = { ...state.gdns[idx], ...action.payload };
    },
    setDeliveryStatus(state, action) {
      const gdn = state.gdns.find((d) => d.id === action.payload.id);
      if (gdn) gdn.status = action.payload.status;
    },
  },
});

export const {
  createOrder, updateOrder, setOrderStatus,
  createInvoice, updateInvoice, postInvoice,
  createReturn, updateReturn, setReturnStatus,
  createReceipt, updateReceipt, setReceiptStatus,
  createDelivery, updateDelivery, setDeliveryStatus,
} = salesSlice.actions;

// ---- ID and number generators ----
export const generateOrderId = () => `SO-${nanoid(6)}`;
export const generateInvoiceId = () => `INV-${nanoid(6)}`;
export const generateReturnId = () => `SR-${nanoid(6)}`;
export const generateReceiptId = () => `RCP-${nanoid(6)}`;
export const generateDeliveryId = () => `GDN-${nanoid(6)}`;

const nextNumber = (list, prefixFn, key) => {
  const prefix = prefixFn();
  const matching = list.filter((o) => o[key]?.startsWith(prefix));
  const maxSeq = matching.reduce((max, o) => {
    const seq = parseInt(o[key].split('/').pop(), 10) || 0;
    return Math.max(max, seq);
  }, 0);
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
};

export const generateOrderNumber = (orders, company, branch) => nextNumber(orders, () => `SO/${branch?.code || 'XX'}/2425/`, 'orderNumber');
export const generateInvoiceNumber = (invoices, company, branch) => nextNumber(invoices, () => `INV/${branch?.code || 'XX'}/2425/`, 'invoiceNumber');
export const generateReturnNumber = (returns, company, branch) => nextNumber(returns, () => `SR/${branch?.code || 'XX'}/2425/`, 'returnNumber');
export const generateReceiptNumber = (receipts, company, branch) => nextNumber(receipts, () => `RCP/${branch?.code || 'XX'}/2425/`, 'receiptNumber');
export const generateDeliveryNumber = (gdns, company, branch) => nextNumber(gdns, () => `GDN/${branch?.code || 'XX'}/2425/`, 'deliveryNumber');

export default salesSlice.reducer;