import { createSlice } from '@reduxjs/toolkit';
import { taxSettings as seedSettings } from '../../data/seed/taxSettings';
import { taxCategories as seedRates } from '../../data/seed/taxCategories';

const initialState = {
  settings: seedSettings,
  rates: seedRates, // configurable GST rate master (mirrors masters.taxCategories but editable here)
};

const taxSlice = createSlice({
  name: 'tax',
  initialState,
  reducers: {
    updateSettings(state, action) {
      const idx = state.settings.findIndex((s) => s.companyId === action.payload.companyId);
      if (idx >= 0) state.settings[idx] = { ...state.settings[idx], ...action.payload };
      else state.settings.push(action.payload);
    },
    updateRate(state, action) {
      const idx = state.rates.findIndex((r) => r.id === action.payload.id);
      if (idx >= 0) state.rates[idx] = { ...state.rates[idx], ...action.payload };
    },
    addRate(state, action) {
      state.rates.push(action.payload);
    },
  },
});

export const { updateSettings, updateRate, addRate } = taxSlice.actions;
export default taxSlice.reducer;