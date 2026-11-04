/**
 * Shared helpers for report aggregation. All money in paise.
 */

/** Group by a key and sum numeric fields. */
export const groupSum = (rows, keyFn, fieldFns) => {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!map.has(key)) map.set(key, { key, count: 0 });
    const entry = map.get(key);
    entry.count += 1;
    for (const [field, fn] of Object.entries(fieldFns)) {
      entry[field] = (entry[field] || 0) + fn(row);
    }
  }
  return Array.from(map.values());
};

/** Format a date as YYYY-MM for month grouping. */
export const monthKey = (isoDate) => (isoDate ? isoDate.slice(0, 7) : '');

/** Convert paise to rupees (for chart Y axes). */
export const paiseToRupees = (paise) => Math.round((paise || 0) / 100);

/** CSV export helper. */
export const exportCSV = (filename, headers, rows) => {
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};