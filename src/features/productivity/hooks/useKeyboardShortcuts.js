import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { togglePalette, setShortcutsHelpOpen, setPaletteOpen } from '../productivitySlice';
import { selectShortcutsHelpOpen, selectPaletteOpen } from '../productivitySelectors';

/**
 * Global keyboard shortcuts:
 *  Cmd/Ctrl+K   — open command palette
 *  Esc          — close any open overlay
 *  ?            — show shortcuts help (only when no input focused)
 *  G then D     — go to dashboard
 *  G then S     — go to sales orders
 *  G then P     — go to purchase orders
 *  G then I     — go to inventory
 *  G then F     — go to finance (COA)
 */
export function useKeyboardShortcuts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const paletteOpen = useSelector(selectPaletteOpen);
  const helpOpen = useSelector(selectShortcutsHelpOpen);

  useEffect(() => {
    let gPressed = false;
    let gTimer = null;

    const isTyping = (e) => {
      const tag = e.target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;
    };

    const onKeyDown = (e) => {
      // Cmd/Ctrl+K — always works
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        dispatch(togglePalette());
        return;
      }

      // Esc — close overlays
      if (e.key === 'Escape') {
        if (paletteOpen) dispatch(setPaletteOpen(false));
        if (helpOpen) dispatch(setShortcutsHelpOpen(false));
        return;
      }

      if (isTyping(e)) return;

      // ? — help
      if (e.key === '?') {
        e.preventDefault();
        dispatch(setShortcutsHelpOpen(true));
        return;
      }

      // G-prefixed navigation
      if (e.key.toLowerCase() === 'g') {
        gPressed = true;
        clearTimeout(gTimer);
        gTimer = setTimeout(() => { gPressed = false; }, 800);
        return;
      }

      if (gPressed) {
        const map = {
          d: '/app/dashboard',
          s: '/app/sales/orders',
          p: '/app/purchases/orders',
          i: '/app/inventory/stock',
          f: '/app/finance/coa',
          r: '/app/reports',
          a: '/app/approvals',
        };
        const dest = map[e.key.toLowerCase()];
        if (dest) {
          e.preventDefault();
          navigate(dest);
          gPressed = false;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      clearTimeout(gTimer);
    };
  }, [dispatch, navigate, paletteOpen, helpOpen]);
}