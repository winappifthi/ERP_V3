import { applyPercent } from './money';

/**
 * Line-level discount on gross amount.
 * @returns discountPaise
 */
export const lineDiscount = ({ grossPaise, discountPercent = 0, discountAmountPaise = 0, maxDiscountPercent = 100 }) => {
  const pct = Math.min(Number(discountPercent) || 0, maxDiscountPercent);
  const fromPercent = applyPercent(grossPaise, pct);
  const explicit = Number(discountAmountPaise) || 0;
  // Explicit amount wins if provided; otherwise use percent. Never both.
  return explicit > 0 ? Math.min(explicit, grossPaise) : Math.min(fromPercent, grossPaise);
};

/**
 * Allocate a header-level discount proportionally across line taxable amounts.
 * Returns array of per-line allocations (paise) that sum to headerDiscountPaise.
 * Any rounding remainder goes to the last line.
 */
export const allocateHeaderDiscount = (lineTaxableAmounts, headerDiscountPaise) => {
  const total = lineTaxableAmounts.reduce((s, v) => s + v, 0);
  if (total <= 0 || headerDiscountPaise <= 0) return lineTaxableAmounts.map(() => 0);
  const allocations = lineTaxableAmounts.map((amt) =>
    Math.floor((amt / total) * headerDiscountPaise)
  );
  const sum = allocations.reduce((s, v) => s + v, 0);
  allocations[allocations.length - 1] += headerDiscountPaise - sum;
  return allocations;
};