import { useMemo, useState } from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, TablePagination,
  IconButton, Menu, MenuItem, Tooltip, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { DensityMedium, DensitySmall, ViewCompact } from '@mui/icons-material';
import EmptyState from '../common/EmptyState';

const DENSITY_PADDING = {
  compact: '4px 8px',
  normal: '8px 12px',
  comfortable: '12px 14px',
};

/**
 * Generic data table.
 * columns: [{ key, label, align?, render?, sortable?, hideOnMobile? }]
 *
 * Responsive behavior:
 *  - On small screens, columns marked `hideOnMobile` are hidden
 *  - Table scrolls horizontally if needed
 */
export default function DataTable({
  columns,
  rows,
  pageSize = 10,
  emptyMessage = 'No records found',
  emptyTitle,
  emptyAction,
  density: initialDensity = 'normal',
  showDensityToggle = true,
}) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [density, setDensity] = useState(initialDensity);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  const paged = useMemo(
    () => sorted.slice(page * pageSize, page * pageSize + pageSize),
    [sorted, page, pageSize]
  );

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  if (!rows.length) {
    return (
      <EmptyState
        title={emptyTitle || 'No records'}
        description={emptyMessage}
        action={emptyAction}
      />
    );
  }

  const cellPad = DENSITY_PADDING[density];

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      {showDensityToggle && (
        <div className="flex justify-end p-1 border-b border-gray-100">
          <ToggleButtonGroup
            size="small"
            value={density}
            exclusive
            onChange={(_, v) => v && setDensity(v)}
            aria-label="Table density"
          >
            <ToggleButton value="compact" aria-label="Compact"><DensitySmall fontSize="small" /></ToggleButton>
            <ToggleButton value="normal" aria-label="Normal"><DensityMedium fontSize="small" /></ToggleButton>
            <ToggleButton value="comfortable" aria-label="Comfortable"><ViewCompact fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </div>
      )}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell
                  key={c.key}
                  align={c.align || 'left'}
                  onClick={() => c.sortable !== false && handleSort(c.key)}
                  sx={{
                    fontWeight: 600,
                    bgcolor: 'grey.50',
                    cursor: c.sortable === false ? 'default' : 'pointer',
                    userSelect: 'none',
                    padding: cellPad,
                    display: c.hideOnMobile ? { xs: 'none', md: 'table-cell' } : undefined,
                  }}
                >
                  {c.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((row, i) => (
              <TableRow key={row.id || i} hover>
                {columns.map((c) => (
                  <TableCell
                    key={c.key}
                    align={c.align || 'left'}
                    className={c.align === 'right' ? 'tabular-nums' : ''}
                    sx={{
                      padding: cellPad,
                      display: c.hideOnMobile ? { xs: 'none', md: 'table-cell' } : undefined,
                    }}
                  >
                    {c.render ? c.render(row) : row[c.key] ?? '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={sorted.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[pageSize]}
        onRowsPerPageChange={() => {}}
      />
    </Paper>
  );
}