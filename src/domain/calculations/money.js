/**
 * Money primitives. All values are integer paise.
 * Percent operations return integer paise using half-up rounding.
 */
export const ZERO = 0;

export const isAmount = (v) => Number.isInteger(v) && Number.isFinite(v);

/** applyPercent(amountPaise, percent) -> integer paise, half-up. */
export const applyPercent = (amountPaise, percent) => {
  if (!isAmount(amountPaise)) throw new Error('applyPercent: amount must be integer paise');
  const p = Number(percent) || 0;
  return Math.round((amountPaise * p) / 100);
};

export const addAmounts = (list) => list.reduce((s, a) => s + (Number(a) || 0), 0);

export const clampNonNegative = (n) => Math.max(0, Number(n) || 0);

export const safeNumber = (n, fallback = 0) => {
  const num = Number(n);
  return Number.isFinite(num) ? num : fallback;
};