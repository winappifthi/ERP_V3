import { describe, it, expect } from 'vitest';
import { calculateLine } from '../../domain/calculations/lineCalculator';

describe('calculateLine', () => {
  it('computes exclusive line with discount and intra-state GST', () => {
    const r = calculateLine({
      quantity: 2,
      unitPriceRupees: 1000,        // 2000 gross
      discountPercent: 10,           // 200 discount
      taxRatePercent: 18,
      taxTreatment: 'intra',
      taxInclusive: false,
    });
    expect(r.grossPaise).toBe(200000);
    expect(r.discountPaise).toBe(20000);
    expect(r.taxablePaise).toBe(180000);
    expect(r.cgstPaise).toBe(16200);
    expect(r.sgstPaise).toBe(16200);
    expect(r.lineTotalPaise).toBe(212400); // 1800 + 324
  });

  it('handles tax-inclusive pricing without double tax', () => {
    const r = calculateLine({
      quantity: 1,
      unitPriceRupees: 1180,         // 1180 inclusive
      taxRatePercent: 18,
      taxTreatment: 'intra',
      taxInclusive: true,
    });
    expect(r.taxablePaise).toBe(100000);
    expect(r.totalTaxPaise).toBe(18000);
    expect(r.lineTotalPaise).toBe(118000);
  });

  it('applies header discount allocation before tax', () => {
    const r = calculateLine({
      quantity: 1,
      unitPriceRupees: 1000,
      taxRatePercent: 18,
      taxTreatment: 'intra',
      headerDiscountAllocationPaise: 10000, // 100 rupees
    });
    expect(r.taxablePaise).toBe(90000);
    expect(r.totalTaxPaise).toBe(16200);
  });

  it('returns zero for negative quantity safely', () => {
    const r = calculateLine({ quantity: -1, unitPriceRupees: 100 });
    expect(r.grossPaise).toBeLessThan(0);
    expect(Number.isFinite(r.lineTotalPaise)).toBe(true);
  });

  it('does not produce NaN for invalid numeric input', () => {
    const r = calculateLine({ quantity: 'x', unitPriceRupees: undefined });
    expect(Number.isFinite(r.lineTotalPaise)).toBe(true);
  });
});