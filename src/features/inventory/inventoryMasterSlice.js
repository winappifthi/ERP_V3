import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  categories: [
    { id: 'CAT-IND', name: 'Industrial', description: 'Heavy machinery and parts' },
    { id: 'CAT-ELEC', name: 'Electrical', description: 'Motors, wires, and panels' },
    { id: 'CAT-FMCG', name: 'FMCG', description: 'Fast-moving consumer goods' },
  ],
  uoms: [
    { id: 'PCS', name: 'Pieces', type: 'Count' },
    { id: 'KG', name: 'Kilograms', type: 'Weight' },
    { id: 'MTR', name: 'Meters', type: 'Length' },
  ],
};

const inventoryMasterSlice = createSlice({
  name: 'inventoryMaster',
  initialState,
  reducers: {
    // Categories
    addCategory(state, action) { state.categories.unshift(action.payload); },
    updateCategory(state, action) {
      const idx = state.categories.findIndex((c) => c.id === action.payload.id);
      if (idx >= 0) state.categories[idx] = { ...state.categories[idx], ...action.payload };
    },
    deleteCategory(state, action) {
      state.categories = state.categories.filter((c) => c.id !== action.payload);
    },
    // UOMs
    addUom(state, action) { state.uoms.unshift(action.payload); },
    updateUom(state, action) {
      const idx = state.uoms.findIndex((u) => u.id === action.payload.id);
      if (idx >= 0) state.uoms[idx] = { ...state.uoms[idx], ...action.payload };
    },
    deleteUom(state, action) {
      state.uoms = state.uoms.filter((u) => u.id !== action.payload);
    },
  },
});

export const { addCategory, updateCategory, deleteCategory, addUom, updateUom, deleteUom } = inventoryMasterSlice.actions;
export const generateCategoryId = () => `CAT-${nanoid(4)}`;
export const generateUomId = () => `UOM-${nanoid(4)}`;
export default inventoryMasterSlice.reducer;