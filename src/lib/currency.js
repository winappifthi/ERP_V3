/**
 * Money is stored as integer paise (1 INR = 100 paise) to avoid float drift.
 * All arithmetic happens on integers; formatting is separate.
 */
export const toPaise = (rupees) => Math.round(Number(rupees || 0) * 100);
export const toRupees = (paise) => Number(paise || 0) / 100;

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatINR = (paise) => inrFormatter.format(toRupees(paise));

export const formatAmount = (paise) =>
  new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toRupees(paise));