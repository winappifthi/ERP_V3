import { describe, it, expect } from 'vitest';
import {
  companies, branches, warehouses, products, customers, vendors,
  salesOrders, salesInvoices, salesReturns, customerReceipts,
  purchaseOrders, goodsReceipts, purchaseInvoices, purchaseReturns, vendorPayments,
  stockMovements, boms, productionOrders, chartOfAccounts, glPostings, journalEntries,
} from '../fixtures';

const companyIds = new Set(companies.map((c) => c.id));
const branchIds = new Set(branches.map((b) => b.id));
const warehouseIds = new Set(warehouses.map((w) => w.id));
const productIds = new Set(products.map((p) => p.id));
const customerIds = new Set(customers.map((c) => c.id));
const vendorIds = new Set(vendors.map((v) => v.id));
const accountCodes = new Set(chartOfAccounts.map((a) => a.code));

const branchBelongsTo = (branchId, companyId) =>
  branches.find((b) => b.id === branchId)?.companyId === companyId;

const warehouseBelongsTo = (warehouseId, branchId) =>
  warehouses.find((w) => w.id === warehouseId)?.branchId === branchId;

describe('Data Consistency — Reference Integrity', () => {
  it('every branch belongs to a valid company', () => {
    for (const b of branches) expect(companyIds.has(b.companyId)).toBe(true);
  });

  it('every warehouse belongs to a valid branch and company', () => {
    for (const w of warehouses) {
      expect(branchIds.has(w.branchId)).toBe(true);
      expect(branchBelongsTo(w.branchId, w.companyId)).toBe(true);
    }
  });

  it('every sales order references valid company/branch/customer/products/warehouses', () => {
    for (const o of salesOrders) {
      expect(companyIds.has(o.companyId)).toBe(true);
      expect(branchIds.has(o.branchId)).toBe(true);
      expect(branchBelongsTo(o.branchId, o.companyId)).toBe(true);
      expect(customerIds.has(o.customerId)).toBe(true);
      for (const l of o.lines) expect(productIds.has(l.productId)).toBe(true);
    }
  });

  it('every sales invoice references valid company/branch/customer/products/warehouses', () => {
    for (const i of salesInvoices) {
      expect(companyIds.has(i.companyId)).toBe(true);
      expect(branchBelongsTo(i.branchId, i.companyId)).toBe(true);
      expect(customerIds.has(i.customerId)).toBe(true);
      for (const l of i.lines) {
        expect(productIds.has(l.productId)).toBe(true);
        if (l.warehouseId) {
          expect(warehouseIds.has(l.warehouseId)).toBe(true);
          expect(warehouseBelongsTo(l.warehouseId, i.branchId)).toBe(true);
        }
      }
    }
  });

  it('every purchase order references valid company/branch/vendor/products/warehouses', () => {
    for (const o of purchaseOrders) {
      expect(companyIds.has(o.companyId)).toBe(true);
      expect(branchBelongsTo(o.branchId, o.companyId)).toBe(true);
      expect(vendorIds.has(o.vendorId)).toBe(true);
      for (const l of o.lines) {
        expect(productIds.has(l.productId)).toBe(true);
        if (l.warehouseId) expect(warehouseIds.has(l.warehouseId)).toBe(true);
      }
    }
  });

  it('every purchase invoice references valid vendor and products', () => {
    for (const i of purchaseInvoices) {
      expect(vendorIds.has(i.vendorId)).toBe(true);
      for (const l of i.lines) expect(productIds.has(l.productId)).toBe(true);
    }
  });

  it('every stock movement references a valid warehouse and product', () => {
    for (const m of stockMovements) {
      expect(warehouseIds.has(m.warehouseId)).toBe(true);
      expect(productIds.has(m.productId)).toBe(true);
    }
  });

  it('every BOM output references a product and components reference products', () => {
    for (const b of boms) {
      expect(productIds.has(b.outputProductId)).toBe(true);
      for (const l of b.lines) expect(productIds.has(l.productId)).toBe(true);
    }
  });

  it('every production order references a valid BOM and output product', () => {
    const bomIds = new Set(boms.map((b) => b.id));
    for (const po of productionOrders) {
      expect(bomIds.has(po.bomId)).toBe(true);
      expect(productIds.has(po.outputProductId)).toBe(true);
    }
  });

  it('every GL posting references a valid account code', () => {
    for (const p of glPostings) expect(accountCodes.has(p.accountCode)).toBe(true);
  });

  it('every journal line references a valid account code', () => {
    for (const j of journalEntries) {
      for (const l of j.lines) expect(accountCodes.has(l.accountCode)).toBe(true);
    }
  });
});

describe('Data Consistency — No Duplicates', () => {
  it('no duplicate company ids', () => {
    expect(new Set(companies.map((c) => c.id)).size).toBe(companies.length);
  });
  it('no duplicate product SKUs', () => {
    expect(new Set(products.map((p) => p.sku)).size).toBe(products.length);
  });
  it('no duplicate sales order numbers', () => {
    expect(new Set(salesOrders.map((o) => o.orderNumber)).size).toBe(salesOrders.length);
  });
  it('no duplicate sales invoice numbers', () => {
    expect(new Set(salesInvoices.map((i) => i.invoiceNumber)).size).toBe(salesInvoices.length);
  });
  it('no duplicate purchase order numbers', () => {
    expect(new Set(purchaseOrders.map((o) => o.orderNumber)).size).toBe(purchaseOrders.length);
  });
  it('no duplicate purchase invoice numbers', () => {
    expect(new Set(purchaseInvoices.map((i) => i.invoiceNumber)).size).toBe(purchaseInvoices.length);
  });
  it('no duplicate customer codes within company', () => {
    const keys = customers.map((c) => `${c.companyId}::${c.code}`);
    expect(new Set(keys).size).toBe(customers.length);
  });
});