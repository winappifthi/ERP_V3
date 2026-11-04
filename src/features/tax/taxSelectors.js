import { createSelector } from '@reduxjs/toolkit';
import { calculateDocument } from '../../domain/calculations/documentCalculator';

const selectTax = (s) => s.tax;
const selectApp = (s) => s.app;
const selectMasters = (s) => s.masters;
const selectSales = (s) => s.sales;
const selectPurchases = (s) => s.purchases;
const selectFinance = (s) => s.finance;

/** Current company's GST settings. */
export const selectCurrentTaxSettings = createSelector(
  [selectTax, selectApp],
  (tax, app) => tax.settings.find((s) => s.companyId === app.companyId) || null
);

/** All GST rate rows (configurable). */
export const selectTaxRates = (s) => s.tax.rates;

/**
 * Outward supplies for a date range: posted sales invoices for the current company.
 * Returns enriched rows with GST split, place of supply, and customer info.
 */
export const selectOutwardSupplies = (fromDate, toDate) =>
  createSelector(
    [selectSales, selectMasters, selectApp],
    (sales, masters, app) => {
      const customerById = Object.fromEntries(masters.customers.map((c) => [c.id, c]));
      const rows = [];

      for (const inv of sales.invoices) {
        if (inv.companyId !== app.companyId) continue;
        if (inv.status !== 'posted') continue;
        if (fromDate && inv.invoiceDate < fromDate) continue;
        if (toDate && inv.invoiceDate > toDate) continue;

        const calc = calculateDocument({
          lines: inv.lines,
          headerDiscountRupees: inv.headerDiscountRupees || 0,
          charges: inv.charges,
          applyRoundOff: inv.applyRoundOff,
        });
        const customer = customerById[inv.customerId];

        rows.push({
          id: inv.id,
          documentType: 'invoice',
          documentNumber: inv.invoiceNumber,
          date: inv.invoiceDate,
          customerId: inv.customerId,
          customerName: customer?.name || '—',
          customerGstin: customer?.gstin || 'URP',
          customerState: customer?.state || '—',
          customerStateCode: customer?.stateCode || '',
          placeOfSupply: customer?.stateCode || app.companyId?.slice(-2) || '',
          taxTreatment: inv.taxTreatment,
          taxablePaise: calc.totals.taxableValuePaise,
          cgstPaise: calc.totals.cgstPaise,
          sgstPaise: calc.totals.sgstPaise,
          igstPaise: calc.totals.igstPaise,
          totalPaise: calc.totals.finalTotalPaise,
          invoiceType: inv.taxTreatment === 'inter' ? 'inter-state' : 'intra-state',
        });
      }

      // Credit notes (sales returns) shown as negative rows
      for (const ret of sales.returns) {
        if (ret.companyId !== app.companyId) continue;
        if (ret.status !== 'posted') continue;
        if (fromDate && ret.returnDate < fromDate) continue;
        if (toDate && ret.returnDate > toDate) continue;

        const calc = calculateDocument({
          lines: ret.lines,
          headerDiscountRupees: 0,
          charges: { freightRupees: 0, packingRupees: 0, otherRupees: 0 },
          applyRoundOff: true,
        });
        const customer = customerById[ret.customerId];

        rows.push({
          id: ret.id,
          documentType: 'credit-note',
          documentNumber: ret.returnNumber,
          date: ret.returnDate,
          customerId: ret.customerId,
          customerName: customer?.name || '—',
          customerGstin: customer?.gstin || 'URP',
          customerState: customer?.state || '—',
          customerStateCode: customer?.stateCode || '',
          placeOfSupply: customer?.stateCode || '',
          taxTreatment: ret.taxTreatment,
          taxablePaise: -calc.totals.taxableValuePaise,
          cgstPaise: -calc.totals.cgstPaise,
          sgstPaise: -calc.totals.sgstPaise,
          igstPaise: -calc.totals.igstPaise,
          totalPaise: -calc.totals.finalTotalPaise,
          invoiceType: ret.taxTreatment === 'inter' ? 'inter-state' : 'intra-state',
        });
      }

      rows.sort((a, b) => a.date.localeCompare(b.date));
      return rows;
    }
  );

/**
 * Inward supplies for a date range: posted purchase invoices + purchase returns
 * (as negative).
 */
export const selectInwardSupplies = (fromDate, toDate) =>
  createSelector(
    [selectPurchases, selectMasters, selectApp],
    (purchases, masters, app) => {
      const vendorById = Object.fromEntries(masters.vendors.map((v) => [v.id, v]));
      const rows = [];

      for (const inv of purchases.invoices) {
        if (inv.companyId !== app.companyId) continue;
        if (inv.status !== 'posted') continue;
        if (fromDate && inv.invoiceDate < fromDate) continue;
        if (toDate && inv.invoiceDate > toDate) continue;

        const calc = calculateDocument({
          lines: inv.lines,
          headerDiscountRupees: inv.headerDiscountRupees || 0,
          charges: inv.charges,
          applyRoundOff: true,
        });
        const vendor = vendorById[inv.vendorId];

        rows.push({
          id: inv.id,
          documentType: 'invoice',
          documentNumber: inv.invoiceNumber,
          vendorInvoiceNumber: inv.vendorInvoiceNumber,
          date: inv.invoiceDate,
          vendorId: inv.vendorId,
          vendorName: vendor?.name || '—',
          vendorGstin: vendor?.gstin || 'URP',
          vendorState: vendor?.state || '—',
          taxTreatment: inv.taxTreatment,
          taxablePaise: calc.totals.taxableValuePaise,
          cgstPaise: calc.totals.cgstPaise,
          sgstPaise: calc.totals.sgstPaise,
          igstPaise: calc.totals.igstPaise,
          totalPaise: calc.totals.finalTotalPaise,
        });
      }

      for (const ret of purchases.returns) {
        if (ret.companyId !== app.companyId) continue;
        if (ret.status !== 'posted') continue;
        if (fromDate && ret.returnDate < fromDate) continue;
        if (toDate && ret.returnDate > toDate) continue;

        const calc = calculateDocument({
          lines: ret.lines,
          headerDiscountRupees: 0,
          charges: { freightRupees: 0, packingRupees: 0, otherRupees: 0 },
          applyRoundOff: true,
        });
        const vendor = vendorById[ret.vendorId];

        rows.push({
          id: ret.id,
          documentType: 'debit-note',
          documentNumber: ret.returnNumber,
          date: ret.returnDate,
          vendorId: ret.vendorId,
          vendorName: vendor?.name || '—',
          vendorGstin: vendor?.gstin || 'URP',
          vendorState: vendor?.state || '—',
          taxTreatment: ret.taxTreatment,
          taxablePaise: -calc.totals.taxableValuePaise,
          cgstPaise: -calc.totals.cgstPaise,
          sgstPaise: -calc.totals.sgstPaise,
          igstPaise: -calc.totals.igstPaise,
          totalPaise: -calc.totals.finalTotalPaise,
        });
      }

      rows.sort((a, b) => a.date.localeCompare(b.date));
      return rows;
    }
  );

/**
 * GSTR-3B style summary: aggregate output tax from outward supplies and
 * input tax from inward supplies, grouped by tax head.
 */
export const selectGstr3bSummary = (fromDate, toDate) =>
  createSelector(
    [selectOutwardSupplies(fromDate, toDate), selectInwardSupplies(fromDate, toDate)],
    (outward, inward) => {
      const sum = (rows, key) => rows.reduce((s, r) => s + (r[key] || 0), 0);

      // 3.1 Outward supplies (a) Taxable supplies
      const outwardTaxable = sum(outward, 'taxablePaise');
      const outwardCgst = sum(outward, 'cgstPaise');
      const outwardSgst = sum(outward, 'sgstPaise');
      const outwardIgst = sum(outward, 'igstPaise');
      const outwardTotalTax = outwardCgst + outwardSgst + outwardIgst;

      // 4. Eligible ITC — Inward supplies
      const inwardTaxable = sum(inward, 'taxablePaise');
      const inwardCgst = sum(inward, 'cgstPaise');
      const inwardSgst = sum(inward, 'sgstPaise');
      const inwardIgst = sum(inward, 'igstPaise');
      const inwardTotalTax = inwardCgst + inwardSgst + inwardIgst;

      // Net payable per tax head
      const netCgst = outwardCgst - inwardCgst;
      const netSgst = outwardSgst - inwardSgst;
      const netIgst = outwardIgst - inwardIgst;
      const netTotal = netCgst + netSgst + netIgst;

      return {
        outward: { taxable: outwardTaxable, cgst: outwardCgst, sgst: outwardSgst, igst: outwardIgst, totalTax: outwardTotalTax },
        inward: { taxable: inwardTaxable, cgst: inwardCgst, sgst: inwardSgst, igst: inwardIgst, totalTax: inwardTotalTax },
        net: { cgst: netCgst, sgst: netSgst, igst: netIgst, total: netTotal },
      };
    }
  );

/**
 * HSN summary: group outward supplies by HSN code, from product data on each
 * invoice line.
 */
export const selectHsnSummary = (fromDate, toDate) =>
  createSelector(
    [selectSales, selectMasters, selectApp],
    (sales, masters, app) => {
      const productById = Object.fromEntries(masters.products.map((p) => [p.id, p]));
      const map = new Map();

      for (const inv of sales.invoices) {
        if (inv.companyId !== app.companyId) continue;
        if (inv.status !== 'posted') continue;
        if (fromDate && inv.invoiceDate < fromDate) continue;
        if (toDate && inv.invoiceDate > toDate) continue;

        const calc = calculateDocument({
          lines: inv.lines,
          headerDiscountRupees: inv.headerDiscountRupees || 0,
          charges: inv.charges,
          applyRoundOff: inv.applyRoundOff,
        });

        for (let i = 0; i < calc.lines.length; i++) {
          const line = calc.lines[i];
          const product = productById[inv.lines[i].productId];
          const hsn = product?.hsn || '0000';
          const key = `${hsn}|${line.unitPricePaise}|${inv.lines[i].taxRatePercent}`;
          const existing = map.get(key) || {
            hsn,
            description: product?.name || '',
            uom: product?.baseUom || 'PCS',
            rate: inv.lines[i].taxRatePercent,
            quantity: 0,
            taxablePaise: 0,
            cgstPaise: 0,
            sgstPaise: 0,
            igstPaise: 0,
            totalPaise: 0,
          };
          existing.quantity += line.quantity;
          existing.taxablePaise += line.taxablePaise;
          existing.cgstPaise += line.cgstPaise;
          existing.sgstPaise += line.sgstPaise;
          existing.igstPaise += line.igstPaise;
          existing.totalPaise += line.lineTotalPaise;
          map.set(key, existing);
        }
      }

      // Subtract returns
      for (const ret of sales.returns) {
        if (ret.companyId !== app.companyId) continue;
        if (ret.status !== 'posted') continue;
        if (fromDate && ret.returnDate < fromDate) continue;
        if (toDate && ret.returnDate > toDate) continue;

        const calc = calculateDocument({ lines: ret.lines, headerDiscountRupees: 0, charges: { freightRupees: 0, packingRupees: 0, otherRupees: 0 }, applyRoundOff: true });
        for (let i = 0; i < calc.lines.length; i++) {
          const line = calc.lines[i];
          const product = productById[ret.lines[i].productId];
          const hsn = product?.hsn || '0000';
          const key = `${hsn}|${line.unitPricePaise}|${ret.lines[i].taxRatePercent}`;
          const existing = map.get(key);
          if (existing) {
            existing.quantity -= line.quantity;
            existing.taxablePaise -= line.taxablePaise;
            existing.cgstPaise -= line.cgstPaise;
            existing.sgstPaise -= line.sgstPaise;
            existing.igstPaise -= line.igstPaise;
            existing.totalPaise -= line.lineTotalPaise;
          }
        }
      }

      return Array.from(map.values()).filter((r) => r.taxablePaise !== 0 || r.quantity !== 0);
    }
  );

/**
 * Reconciliation: compare outward/input tax from registers against GL postings
 * in the output/input tax accounts. Should be zero difference.
 */
export const selectTaxReconciliation = (fromDate, toDate) =>
  createSelector(
    [selectGstr3bSummary(fromDate, toDate), selectFinance, selectApp],
    (gstr3b, finance, app) => {
      const postings = finance.postings.filter(
        (p) => p.companyId === app.companyId &&
          (!fromDate || p.date >= fromDate) && (!toDate || p.date <= toDate)
      );

      // Output tax GL = credits minus debits on 2120/2121/2122
      const outputGL = postings
        .filter((p) => ['2120', '2121', '2122'].includes(p.accountCode))
        .reduce((s, p) => s + (p.creditPaise - p.debitPaise), 0);

      // Input tax GL = debits minus credits on 1160/1161/1162
      const inputGL = postings
        .filter((p) => ['1160', '1161', '1162'].includes(p.accountCode))
        .reduce((s, p) => s + (p.debitPaise - p.creditPaise), 0);

      const outputRegister = gstr3b.outward.totalTax;
      const inputRegister = gstr3b.inward.totalTax;

      return {
        output: { register: outputRegister, gl: outputGL, difference: outputRegister - outputGL },
        input: { register: inputRegister, gl: inputGL, difference: inputRegister - inputGL },
        reconciled: outputRegister === outputGL && inputRegister === inputGL,
      };
    }
  );

/**
 * Place of supply: aggregate outward supplies by customer state.
 */
export const selectPlaceOfSupply = (fromDate, toDate) =>
  createSelector([selectOutwardSupplies(fromDate, toDate)], (outward) => {
    const map = new Map();
    for (const row of outward) {
      const key = `${row.customerStateCode}|${row.customerState}`;
      const existing = map.get(key) || {
        state: row.customerState,
        stateCode: row.customerStateCode,
        taxablePaise: 0,
        cgstPaise: 0,
        sgstPaise: 0,
        igstPaise: 0,
        totalPaise: 0,
        invoiceCount: 0,
        taxTreatment: row.taxTreatment,
      };
      existing.taxablePaise += row.taxablePaise;
      existing.cgstPaise += row.cgstPaise;
      existing.sgstPaise += row.sgstPaise;
      existing.igstPaise += row.igstPaise;
      existing.totalPaise += row.totalPaise;
      existing.invoiceCount += 1;
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.taxablePaise - a.taxablePaise);
  });

/**
 * GST tax ledger: GL postings on input/output tax accounts.
 */
export const selectTaxLedger = (fromDate, toDate) =>
  createSelector([selectFinance, selectApp], (finance, app) => {
    const accountByCode = Object.fromEntries(finance.accounts.map((a) => [a.code, a]));
    return finance.postings
      .filter((p) => ['1160', '1161', '1162', '2120', '2121', '2122'].includes(p.accountCode))
      .filter((p) => p.companyId === app.companyId)
      .filter((p) => (!fromDate || p.date >= fromDate) && (!toDate || p.date <= toDate))
      .map((p) => ({ ...p, account: accountByCode[p.accountCode] }))
      .sort((a, b) => a.date.localeCompare(b.date));
  });