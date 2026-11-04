import { describe, it, expect } from 'vitest';
import { glPostings, journalEntries, chartOfAccounts } from '../fixtures';

const accountTypeByCode = Object.fromEntries(chartOfAccounts.map((a) => [a.code, a.accountType]));

describe('GL Postings — Invariants', () => {
  it('every posting has exactly one side (debit or credit) non-zero', () => {
    for (const p of glPostings) {
      const hasDebit = (p.debitPaise || 0) > 0;
      const hasCredit = (p.creditPaise || 0) > 0;
      expect(hasDebit && hasCredit).toBe(false);
      expect(hasDebit || hasCredit).toBe(true);
    }
  });

  it('all amounts are non-negative integers (paise)', () => {
    for (const p of glPostings) {
      expect(Number.isInteger(p.debitPaise || 0)).toBe(true);
      expect(Number.isInteger(p.creditPaise || 0)).toBe(true);
      expect((p.debitPaise || 0) >= 0).toBe(true);
      expect((p.creditPaise || 0) >= 0).toBe(true);
    }
  });

  it('every reference group balances (debits = credits)', () => {
    const groups = new Map();
    for (const p of glPostings) {
      const key = `${p.referenceType}::${p.referenceId}`;
      const g = groups.get(key) || { debit: 0, credit: 0 };
      g.debit += p.debitPaise || 0;
      g.credit += p.creditPaise || 0;
      groups.set(key, g);
    }
    for (const [key, g] of groups.entries()) {
      expect(g.debit, `Reference group ${key} does not balance`).toBe(g.credit);
    }
  });

  it('all groups are non-empty', () => {
    expect(glPostings.length).toBeGreaterThan(0);
  });

  it('every posting has a valid date and narration', () => {
    for (const p of glPostings) {
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof p.narration).toBe('string');
      expect(p.narration.length).toBeGreaterThan(0);
    }
  });

  it('overall trial balance is balanced', () => {
    const totalDebit = glPostings.reduce((s, p) => s + (p.debitPaise || 0), 0);
    const totalCredit = glPostings.reduce((s, p) => s + (p.creditPaise || 0), 0);
    expect(totalDebit).toBe(totalCredit);
  });

  it('journal entries always balance', () => {
    for (const j of journalEntries) {
      const d = j.lines.reduce((s, l) => s + (l.debitPaise || 0), 0);
      const c = j.lines.reduce((s, l) => s + (l.creditPaise || 0), 0);
      expect(d).toBe(c);
    }
  });

  it('income accounts are credit-normal, expense accounts debit-normal in aggregate', () => {
    const totalsByCode = {};
    for (const p of glPostings) {
      const net = (p.debitPaise || 0) - (p.creditPaise || 0);
      totalsByCode[p.accountCode] = (totalsByCode[p.accountCode] || 0) + net;
    }
    for (const [code, net] of Object.entries(totalsByCode)) {
      const type = accountTypeByCode[code];
      if (type === 'income') {
        // Income accounts should be net-credit (negative in debit-positive convention)
        expect(net).toBeLessThanOrEqual(0);
      } else if (type === 'expense') {
        expect(net).toBeGreaterThanOrEqual(0);
      }
    }
  });
});