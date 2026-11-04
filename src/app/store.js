import { configureStore } from '@reduxjs/toolkit';
import appReducer from '../store/slices/appSlice';
import mastersReducer from '../store/slices/mastersSlice';
import salesReducer from '../features/sales/salesSlice';
import purchasesReducer from '../features/purchases/purchasesSlice';
import inventoryReducer from '../features/inventory/inventorySlice';
import manufacturingReducer from '../features/manufacturing/manufacturingSlice';
import financeReducer from '../features/finance/financeSlice';
import taxReducer from '../features/tax/taxSlice';
import approvalsReducer from '../features/approvals/approvalSlice';
import productivityReducer from '../features/productivity/productivitySlice';
import { installConsistencyCheck } from '../utils/devTools/consistencyCheck';

export const store = configureStore({
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

if (import.meta.env?.DEV) {
  installConsistencyCheck(store);
}