import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  favorites: [],       // array of route paths
  recentPages: [],     // [{ path, title, visitedAt }] max 20, most recent first
  paletteOpen: false,
  shortcutsHelpOpen: false,
};

const MAX_RECENT = 20;

const productivitySlice = createSlice({
  name: 'productivity',
  initialState,
  reducers: {
    toggleFavorite(state, action) {
      const path = action.payload;
      const idx = state.favorites.indexOf(path);
      if (idx >= 0) state.favorites.splice(idx, 1);
      else state.favorites.push(path);
    },
    trackVisit(state, action) {
      const { path, title } = action.payload;
      state.recentPages = [
        { path, title, visitedAt: new Date().toISOString() },
        ...state.recentPages.filter((p) => p.path !== path),
      ].slice(0, MAX_RECENT);
    },
    clearRecentPages(state) {
      state.recentPages = [];
    },
    setPaletteOpen(state, action) {
      state.paletteOpen = action.payload;
    },
    togglePalette(state) {
      state.paletteOpen = !state.paletteOpen;
    },
    setShortcutsHelpOpen(state, action) {
      state.shortcutsHelpOpen = action.payload;
    },
  },
});

export const {
  toggleFavorite, trackVisit, clearRecentPages,
  setPaletteOpen, togglePalette, setShortcutsHelpOpen,
} = productivitySlice.actions;

export default productivitySlice.reducer;