import { describe, it, expect } from 'vitest';
import { computeGst, extractTaxFromInclusive } from '../../domain/calculations/taxCalculator';

describe('computeGst', () => {
  it('splits intra-state GST 50/50', () => {
    const r = computeGst({ taxTreatment: 'intra', rate: 18, taxablePaise: 100000 });
    expect(r.cgst).toBe(9000);
    expect(r.sgst).toBe(9000);
    expect(r.igst).toBe(0);
    expect(r.totalTax).toBe(18000);
  });

  it('charges IGST for inter-state', () => {
    const r = computeGst({ taxTreatment: 'inter', rate: 18, taxablePaise: 100000 });
    expect(r.cgst).toBe(0);
    expect(r.sgst).toBe(0);
    expect(r.igst).toBe(18000);
  });

  it('handles odd paise split for intra-state', () => {
    // 5% of 101 paise = 5.05 -> rounds to 5 paise. CGST 2, SGST 3.
    const r = computeGst({ taxTreatment: 'intra', rate: 5, taxablePaise: 101 });
    expect(r.totalTax).toBe(5);
    expect(r.cgst).toBe(2);
    expect(r.sgst).toBe(3);
  });

  it('returns zero tax for exempt/nil', () => {
    expect(computeGst({ taxTreatment: 'exempt', rate: 18, taxablePaise: 100000 }).totalTax).toBe(0);
    expect(computeGst({ taxTreatment: 'nil', rate: 18, taxablePaise: 100000 }).totalTax).toBe(0);
  });
});

describe('extractTaxFromInclusive', () => {
  it('extracts 18% tax from inclusive 118 rupees', () => {
    // 11800 paise inclusive at 18% -> taxable = 11800 / 1.18 = 10000, tax = 1800
    const r = extractTaxFromInclusive({ inclusivePaise: 11800, rate: 18, taxTreatment: 'intra' });
    expect(r.taxablePaise).toBe(10000);
    expect(r.cgst).toBe(900);
    expect(r.sgst).toBe(900);
  });

  it('handles zero rate', () => {
    const r = extractTaxFromInclusive({ inclusivePaise: 10000, rate: 0, taxTreatment: 'intra' });
    expect(r.taxablePaise).toBe(10000);
    expect(r.totalTax).toBe(0);
  });
});