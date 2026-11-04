import { createSlice, nanoid } from '@reduxjs/toolkit';
import { boms as seedBoms } from '../../data/seed/boms';
import { workCenters as seedWorkCenters } from '../../data/seed/workCenters';
import { productionOrders as seedOrders } from '../../data/seed/productionOrders';

const initialState = {
  boms: seedBoms,
  workCenters: seedWorkCenters,
  productionOrders: seedOrders,
};

const manufacturingSlice = createSlice({
  name: 'manufacturing',
  initialState,
  reducers: {
    createBom(state, action) { state.boms.unshift(action.payload); },
    updateBom(state, action) {
      const idx = state.boms.findIndex((b) => b.id === action.payload.id);
      if (idx >= 0) state.boms[idx] = { ...state.boms[idx], ...action.payload };
    },
    archiveBom(state, action) {
      const b = state.boms.find((x) => x.id === action.payload);
      if (b) b.status = 'archived';
    },

    createWorkCenter(state, action) { state.workCenters.unshift(action.payload); },

    createProductionOrder(state, action) { state.productionOrders.unshift(action.payload); },
    updateProductionOrder(state, action) {
      const idx = state.productionOrders.findIndex((o) => o.id === action.payload.id);
      if (idx >= 0) state.productionOrders[idx] = { ...state.productionOrders[idx], ...action.payload };
    },
    addMaterialIssue(state, action) {
      const { orderId, issue } = action.payload;
      const order = state.productionOrders.find((o) => o.id === orderId);
      if (order) {
        if (!order.materialIssues) order.materialIssues = [];
        order.materialIssues.push(issue);
        order.status = 'material-issued';
      }
    },
    addCompletion(state, action) {
      const { orderId, completion } = action.payload;
      const order = state.productionOrders.find((o) => o.id === orderId);
      if (order) {
        if (!order.completions) order.completions = [];
        order.completions.push(completion);
        order.completedQuantity = (order.completedQuantity || 0) + completion.completedQuantity;
        if (order.completedQuantity >= order.plannedQuantity) order.status = 'completed';
        else order.status = 'in-progress';
      }
    },
    setOrderStatus(state, action) {
      const order = state.productionOrders.find((o) => o.id === action.payload.id);
      if (order) order.status = action.payload.status;
    },
  },
});

export const {
  createBom, updateBom, archiveBom, createWorkCenter,
  createProductionOrder, updateProductionOrder,
  addMaterialIssue, addCompletion, setOrderStatus,
} = manufacturingSlice.actions;

export const generateBomId = () => `BOM-${nanoid(6)}`;
export const generateWorkCenterId = () => `WC-${nanoid(6)}`;
export const generateProductionOrderId = () => `PO-MFG-${nanoid(6)}`;
export const generateMaterialIssueId = () => `MI-${nanoid(6)}`;
export const generateCompletionId = () => `PC-${nanoid(6)}`;

const nextNumber = (list, prefixFn, key) => {
  const prefix = prefixFn();
  const matching = list.filter((o) => o[key]?.startsWith(prefix));
  const maxSeq = matching.reduce((max, o) => {
    const seq = parseInt(o[key].split('/').pop(), 10) || 0;
    return Math.max(max, seq);
  }, 0);
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
};

export const generateOrderNumber = (orders, branch) =>
  nextNumber(orders, () => `PRD/${branch?.code || 'XX'}/2425/`, 'orderNumber');

export default manufacturingSlice.reducer;