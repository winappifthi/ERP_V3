import { useSelector, useDispatch } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, IconButton, Button } from '@mui/material';
import { Close } from '@mui/icons-material';
import { selectShortcutsHelpOpen } from '../productivitySelectors';
import { setShortcutsHelpOpen } from '../productivitySlice';

const SHORTCUTS = [
  { group: 'Global', items: [
    { keys: ['⌘', 'K'], label: 'Open command palette' },
    { keys: ['Ctrl', 'K'], label: 'Open command palette (Windows/Linux)' },
    { keys: ['?'], label: 'Show this help' },
    { keys: ['Esc'], label: 'Close overlay' },
  ]},
  { group: 'Navigate (press G then key)', items: [
    { keys: ['G', 'D'], label: 'Dashboard' },
    { keys: ['G', 'S'], label: 'Sales Orders' },
    { keys: ['G', 'P'], label: 'Purchase Orders' },
    { keys: ['G', 'I'], label: 'Inventory' },
    { keys: ['G', 'F'], label: 'Chart of Accounts' },
    { keys: ['G', 'R'], label: 'Reports' },
    { keys: ['G', 'A'], label: 'Approvals' },
  ]},
  { group: 'Inside command palette', items: [
    { keys: ['↑', '↓'], label: 'Navigate results' },
    { keys: ['↵'], label: 'Open selected' },
  ]},
];

export default function KeyboardShortcuts() {
  const dispatch = useDispatch();
  const open = useSelector(selectShortcutsHelpOpen);

  return (
    <Dialog open={open} onClose={() => dispatch(setShortcutsHelpOpen(false))} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16, fontWeight: 600 }}>
        Keyboard Shortcuts
        <IconButton size="small" onClick={() => dispatch(setShortcutsHelpOpen(false))} aria-label="Close"><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        {SHORTCUTS.map((section) => (
          <div key={section.group} className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">{section.group}</h3>
            <div className="space-y-1.5">
              {section.items.map((s, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{s.label}</span>
                  <span className="flex gap-1">
                    {s.keys.map((k, j) => (
                      <kbd key={j} className="px-1.5 py-0.5 text-[11px] rounded bg-gray-100 border border-gray-300 text-gray-700 font-mono">{k}</kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="pt-2 text-xs text-gray-500 border-t border-gray-200">
          Tip: press <kbd className="px-1 border rounded">?</kbd> anywhere to reopen this help.
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Route-less trigger: a small button that opens the shortcuts dialog. */
export function ShortcutsHelpButton() {
  const dispatch = useDispatch();
  return (
    <Button size="small" variant="text" onClick={() => dispatch(setShortcutsHelpOpen(true))}>
      Shortcuts (?)
    </Button>
  );
}