import { describe, it, expect } from 'vitest';
import { calculateDocument } from '../../domain/calculations/documentCalculator';

describe('calculateDocument', () => {
  it('aggregates lines and applies round-off', () => {
    const doc = {
      lines: [
        { quantity: 1, unitPriceRupees: 500, taxRatePercent: 18, taxTreatment: 'intra' },
        { quantity: 1, unitPriceRupees: 500, taxRatePercent: 18, taxTreatment: 'intra' },
      ],
      applyRoundOff: true,
    };
    const r = calculateDocument(doc);
    // 1000 taxable + 90+90 CGST + 90+90 SGST = 1360 exactly, no round-off
    expect(r.totals.taxableValuePaise).toBe(100000);
    expect(r.totals.cgstPaise).toBe(18000);
    expect(r.totals.sgstPaise).toBe(18000);
    expect(r.totals.finalTotalPaise).toBe(136000);
    expect(r.totals.roundOffPaise).toBe(0);
  });

  it('applies header discount proportionally', () => {
    const doc = {
      lines: [
        { quantity: 1, unitPriceRupees: 1000, taxRatePercent: 0 },
        { quantity: 1, unitPriceRupees: 3000, taxRatePercent: 0 },
      ],
      headerDiscountRupees: 400,
    };
    const r = calculateDocument(doc);
    // Discount 400 allocates 100 / 300
    expect(r.lines[0].taxablePaise).toBe(90000);
    expect(r.lines[1].taxablePaise).toBe(270000);
    expect(r.totals.totalHeaderDiscountPaise).toBe(40000);
    expect(r.totals.finalTotalPaise).toBe(360000);
  });

  it('handles inter-state transaction as IGST', () => {
    const doc = {
      lines: [{ quantity: 1, unitPriceRupees: 1000, taxRatePercent: 18, taxTreatment: 'inter' }],
    };
    const r = calculateDocument(doc);
    expect(r.totals.cgstPaise).toBe(0);
    expect(r.totals.sgstPaise).toBe(0);
    expect(r.totals.igstPaise).toBe(18000);
  });

  it('produces round-off when total has paise', () => {
    const doc = {
      lines: [{ quantity: 1, unitPriceRupees: 999.99, taxRatePercent: 0 }],
      applyRoundOff: true,
    };
    const r = calculateDocument(doc);
    expect(r.totals.preRoundTotalPaise).toBe(99999);
    expect(r.totals.finalTotalPaise).toBe(100000);
    expect(r.totals.roundOffPaise).toBe(1);
  });
});