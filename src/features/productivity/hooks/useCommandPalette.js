import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPaletteOpen } from '../productivitySlice';
import { selectPaletteOpen } from '../productivitySelectors';

/**
 * Exposes palette state and controls. The palette can be toggled
 * programmatically from anywhere.
 */
export function useCommandPalette() {
  const dispatch = useDispatch();
  const open = useSelector(selectPaletteOpen);
  return {
    open,
    setOpen: (v) => dispatch(setPaletteOpen(v)),
    toggle: () => dispatch(setPaletteOpen(!open)),
  };
}