import { useDispatch } from 'react-redux';
import { Search as SearchIcon } from '@mui/icons-material';
import { setPaletteOpen } from '../productivitySlice';

export default function GlobalSearchInput() {
  const dispatch = useDispatch();

  const open = () => dispatch(setPaletteOpen(true));

  return (
    <div
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      aria-label="Open command palette"
      className="flex items-center gap-2 px-3 py-1.5 rounded border border-gray-200 bg-gray-50 hover:bg-white cursor-pointer text-sm text-gray-500 min-w-[260px] transition-colors"
    >
      <SearchIcon fontSize="small" />
      <span className="flex-1 text-left">Search…</span>
      <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-600 font-mono">
        ⌘K
      </kbd>
    </div>
  );
}