import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dialog, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { selectPaletteOpen } from '../productivitySelectors';
import { setPaletteOpen } from '../productivitySlice';
import { selectSearchableEntries } from '../productivitySelectors';
import { filterSearchIndex, groupByType } from '../searchIndex';
import SearchResultGroup from './SearchResultGroup';

const STATIC_PAGES = [
  {
    id: 'page-dashboard',
    title: 'Dashboard',
    subtitle: 'Overview',
    path: '/app/dashboard',
    keywords: 'dashboard home',
  },
  {
    id: 'page-orders',
    title: 'Orders',
    subtitle: 'Sales & purchase orders',
    path: '/app/transactions/orders',
    keywords: 'orders sales purchase so po',
  },
  {
    id: 'page-invoices',
    title: 'Invoices',
    subtitle: 'Sales & purchase invoices',
    path: '/app/transactions/invoices',
    keywords: 'invoices sales purchase bill inv pi',
  },
  {
    id: 'page-returns',
    title: 'Returns',
    subtitle: 'Sales & purchase returns',
    path: '/app/transactions/returns',
    keywords: 'returns sales purchase credit debit note',
  },
  {
    id: 'page-payments',
    title: 'Receipts & Payments',
    subtitle: 'Customer receipts & vendor payments',
    path: '/app/transactions/payments',
    keywords: 'receipts payments customer vendor collection payout',
  },
  {
    id: 'page-pos',
    title: 'POS Billing',
    subtitle: 'Point of sale',
    path: '/app/sales/pos',
    keywords: 'pos billing retail counter',
  },
  {
    id: 'page-grn-gdn',
    title: 'Goods Receipts & Deliveries',
    subtitle: 'GRN / GDN',
    path: '/app/transactions/grn',
    keywords: 'grn gdn goods receipt delivery inbound outbound',
  },
  {
    id: 'page-ledger',
    title: 'Ledger',
    subtitle: 'Customer & vendor ledger',
    path: '/app/transactions/ledger',
    keywords: 'ledger customer vendor statement',
  },
  {
    id: 'page-pos',
    title: 'POS Billing',
    subtitle: 'Point of sale',
    path: '/app/transactions/pos',
    keywords: 'pos billing retail counter',
  },

  // Inventory
  {
    id: 'page-stock',
    title: 'Stock Overview',
    subtitle: 'Inventory',
    path: '/app/inventory/stock',
    keywords: 'stock inventory',
  },
  {
    id: 'page-stock-ledger',
    title: 'Stock Ledger',
    subtitle: 'Inventory',
    path: '/app/inventory/ledger',
    keywords: 'movements ledger stock',
  },
  {
    id: 'page-stock-transfers',
    title: 'Stock Transfers',
    subtitle: 'Warehouse transfers',
    path: '/app/inventory/transfers',
    keywords: 'transfer',
  },
  {
    id: 'page-stock-adjustments',
    title: 'Stock Adjustments',
    subtitle: 'Adjustments',
    path: '/app/inventory/adjustments',
    keywords: 'adjust',
  },

  // Manufacturing
  {
    id: 'page-bom',
    title: 'Bills of Materials',
    subtitle: 'Manufacturing',
    path: '/app/manufacturing/bom',
    keywords: 'bom manufacturing',
  },
  {
    id: 'page-production-orders',
    title: 'Production Orders',
    subtitle: 'Manufacturing',
    path: '/app/manufacturing/production-orders',
    keywords: 'production manufacturing',
  },
  {
    id: 'page-mrp',
    title: 'MRP Preview',
    subtitle: 'Manufacturing',
    path: '/app/manufacturing/mrp',
    keywords: 'mrp material requirement',
  },

  // Finance
  {
    id: 'page-coa',
    title: 'Chart of Accounts',
    subtitle: 'Finance',
    path: '/app/finance/coa',
    keywords: 'coa chart accounts',
  },
  {
    id: 'page-journals',
    title: 'Journal Entries',
    subtitle: 'Finance',
    path: '/app/finance/journals',
    keywords: 'journal voucher jv',
  },
  {
    id: 'page-trial-balance',
    title: 'Trial Balance',
    subtitle: 'Finance',
    path: '/app/finance/trial-balance',
    keywords: 'trial balance',
  },
  {
    id: 'page-pl',
    title: 'Profit & Loss',
    subtitle: 'Finance',
    path: '/app/finance/profit-loss',
    keywords: 'profit loss pl pnl',
  },
  {
    id: 'page-bs',
    title: 'Balance Sheet',
    subtitle: 'Finance',
    path: '/app/finance/balance-sheet',
    keywords: 'balance sheet bs',
  },

  // Tax
  {
    id: 'page-gstr1',
    title: 'GSTR-1',
    subtitle: 'Tax',
    path: '/app/tax/gstr1',
    keywords: 'gstr1 gst return',
  },
  {
    id: 'page-gstr3b',
    title: 'GSTR-3B',
    subtitle: 'Tax',
    path: '/app/tax/gstr3b',
    keywords: 'gstr3b gst',
  },

  // Misc
  {
    id: 'page-reports',
    title: 'Reports',
    subtitle: 'Analytics',
    path: '/app/reports',
    keywords: 'report analytics',
  },
  {
    id: 'page-approvals',
    title: 'Approval Inbox',
    subtitle: 'Workflow',
    path: '/app/approvals',
    keywords: 'approval approve inbox',
  },
  {
    id: 'page-parties',
    title: 'Parties',
    subtitle: 'Customers, vendors, leads',
    path: '/app/masters/parties',
    keywords: 'parties customers vendors leads contacts',
  },
];

const filterStatic = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  return STATIC_PAGES.filter((p) =>
    tokens.every(
      (t) => p.keywords.includes(t) || p.title.toLowerCase().includes(t),
    ),
  ).slice(0, 8);
};

export default function CommandPaletteModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const open = useSelector(selectPaletteOpen);
  const allEntries = useSelector(selectSearchableEntries);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Compute grouped results
  const staticMatches = useMemo(() => filterStatic(query), [query]);
  const entityMatches = useMemo(
    () => filterSearchIndex(allEntries, query),
    [allEntries, query],
  );
  const entityGroups = useMemo(
    () => groupByType(entityMatches),
    [entityMatches],
  );

  // Flat list for keyboard navigation
  const flat = useMemo(() => {
    const items = [];
    staticMatches.forEach((p) => items.push({ kind: 'page', item: p }));
    entityGroups.forEach((g) =>
      g.items.forEach((it) => items.push({ kind: 'entity', item: it })),
    );
    return items;
  }, [staticMatches, entityGroups]);

  useEffect(() => {
    if (activeIdx >= flat.length) setActiveIdx(0);
  }, [flat, activeIdx]);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const picked = flat[activeIdx];
      if (picked) {
        dispatch(setPaletteOpen(false));
        navigate(picked.item.path);
      }
    }
  };

  // Compute index offset per group for highlighting
  let groupOffset = staticMatches.length;

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setPaletteOpen(false))}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          mt: -8,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <div className="p-2 border-b border-gray-200">
        <TextField
          inputRef={inputRef}
          fullWidth
          size="small"
          placeholder="Search pages, invoices, products, customers…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIdx(0);
          }}
          onKeyDown={handleKey}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {query && flat.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            No matches for {query}.
          </div>
        )}
        {!query && (
          <div className="p-6 text-center text-xs text-gray-500">
            Type to search pages, invoices, products, customers, vendors…
            <div className="mt-2 text-gray-400">
              ↑↓ to navigate · Enter to open · Esc to close
            </div>
          </div>
        )}

        {staticMatches.length > 0 && (
          <div>
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-50 sticky top-0">
              Pages · {staticMatches.length}
            </div>
            {staticMatches.map((p, i) => {
              const isActive = i === activeIdx;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    dispatch(setPaletteOpen(false));
                    navigate(p.path);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                    Page
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className="text-xs text-gray-500">{p.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {entityGroups.map((g) => {
          const offset = groupOffset;
          groupOffset += g.items.length;
          return (
            <SearchResultGroup
              key={g.type}
              group={g}
              activeIndex={activeIdx}
              indexOffset={offset}
            />
          );
        })}
      </div>

      <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500 flex justify-between">
        <span>Search across {allEntries.length} records</span>
        <span>⌘K / Ctrl+K</span>
      </div>
    </Dialog>
  );
}
