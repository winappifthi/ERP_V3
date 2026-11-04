/**
 * Pure functions that translate business documents into GL posting lines.
 * Each function returns an ARRAY of GL line objects (not yet saved).
 * The caller dispatches `addPostings(array)` to persist.
 *
 * All amounts are integer paise. The caller is responsible for ensuring
 * the document's totals are computed via `calculateDocument`.
 */

import { nanoid } from '@reduxjs/toolkit';

const line = (accountCode, debitPaise, creditPaise, narration) => ({
  id: `GL-${nanoid(6)}`,
  accountCode,
  debitPaise,
  creditPaise,
  narration,
});

/** Sales invoice → AR + Sales + Output GST + COGS + Inventory reduction. */
export const buildSalesInvoicePostings = ({ invoice, totals, cogsPaise, companyId, branchId }) => {
  const out = [];
  out.push({
    ...line('1130', totals.finalTotalPaise, 0, `Sales to ${invoice.customerId}`),
    companyId, branchId, date: invoice.invoiceDate,
    referenceType: 'sales-invoice', referenceId: invoice.id,
  });
  out.push({
    ...line('4100', 0, totals.taxableValuePaise + totals.roundOffPaise, 'Sales revenue'),
    companyId, branchId, date: invoice.invoiceDate,
    referenceType: 'sales-invoice', referenceId: invoice.id,
  });
  if (totals.cgstPaise > 0) out.push({ ...line('2120', 0, totals.cgstPaise, 'Output CGST'), companyId, branchId, date: invoice.invoiceDate, referenceType: 'sales-invoice', referenceId: invoice.id });
  if (totals.sgstPaise > 0) out.push({ ...line('2121', 0, totals.sgstPaise, 'Output SGST'), companyId, branchId, date: invoice.invoiceDate, referenceType: 'sales-invoice', referenceId: invoice.id });
  if (totals.igstPaise > 0) out.push({ ...line('2122', 0, totals.igstPaise, 'Output IGST'), companyId, branchId, date: invoice.invoiceDate, referenceType: 'sales-invoice', referenceId: invoice.id });
  // COGS / inventory reduction (only if we know cost)
  if (cogsPaise > 0) {
    out.push({ ...line('5100', cogsPaise, 0, 'Cost of goods sold'), companyId, branchId, date: invoice.invoiceDate, referenceType: 'sales-invoice', referenceId: invoice.id });
    out.push({ ...line('1150', 0, cogsPaise, 'FG inventory reduction'), companyId, branchId, date: invoice.invoiceDate, referenceType: 'sales-invoice', referenceId: invoice.id });
  }
  return out;
};

/** Purchase invoice → Inventory + Input GST + AP. */
export const buildPurchaseInvoicePostings = ({ invoice, totals, companyId, branchId }) => {
  const out = [];
  out.push({ ...line('1140', totals.taxableValuePaise + totals.roundOffPaise, 0, `Purchase from ${invoice.vendorId}`), companyId, branchId, date: invoice.invoiceDate, referenceType: 'purchase-invoice', referenceId: invoice.id });
  if (totals.cgstPaise > 0) out.push({ ...line('1160', totals.cgstPaise, 0, 'Input CGST'), companyId, branchId, date: invoice.invoiceDate, referenceType: 'purchase-invoice', referenceId: invoice.id });
  if (totals.sgstPaise > 0) out.push({ ...line('1161', totals.sgstPaise, 0, 'Input SGST'), companyId, branchId, date: invoice.invoiceDate, referenceType: 'purchase-invoice', referenceId: invoice.id });
  if (totals.igstPaise > 0) out.push({ ...line('1162', totals.igstPaise, 0, 'Input IGST'), companyId, branchId, date: invoice.invoiceDate, referenceType: 'purchase-invoice', referenceId: invoice.id });
  out.push({ ...line('2110', 0, totals.finalTotalPaise, 'Vendor payable'), companyId, branchId, date: invoice.invoiceDate, referenceType: 'purchase-invoice', referenceId: invoice.id });
  return out;
};

/** Customer receipt → Dr Bank/Cash · Cr AR. */
export const buildCustomerReceiptPostings = ({ receipt, totalPaise, companyId, branchId }) => {
  const bankAccount = receipt.mode === 'cash' ? '1110' : '1120';
  return [
    { ...line(bankAccount, totalPaise, 0, `Receipt from ${receipt.customerId}`), companyId, branchId, date: receipt.receiptDate, referenceType: 'customer-receipt', referenceId: receipt.id },
    { ...line('1130', 0, totalPaise, 'AR cleared'), companyId, branchId, date: receipt.receiptDate, referenceType: 'customer-receipt', referenceId: receipt.id },
  ];
};

/** Vendor payment → Dr AP · Cr Bank/Cash. */
export const buildVendorPaymentPostings = ({ payment, totalPaise, companyId, branchId }) => {
  const bankAccount = payment.mode === 'cash' ? '1110' : '1120';
  return [
    { ...line('2110', totalPaise, 0, `Payment to ${payment.vendorId}`), companyId, branchId, date: payment.paymentDate, referenceType: 'vendor-payment', referenceId: payment.id },
    { ...line(bankAccount, 0, totalPaise, 'Bank payment'), companyId, branchId, date: payment.paymentDate, referenceType: 'vendor-payment', referenceId: payment.id },
  ];
};

/** Sales return (credit note) → Dr Sales Returns · Dr Output GST · Cr AR. */
export const buildSalesReturnPostings = ({ ret, totals, companyId, branchId }) => {
  const out = [];
  out.push({ ...line('4200', totals.taxableValuePaise, 0, 'Sales return'), companyId, branchId, date: ret.returnDate, referenceType: 'sales-return', referenceId: ret.id });
  if (totals.cgstPaise > 0) out.push({ ...line('2120', totals.cgstPaise, 0, 'Reverse CGST'), companyId, branchId, date: ret.returnDate, referenceType: 'sales-return', referenceId: ret.id });
  if (totals.sgstPaise > 0) out.push({ ...line('2121', totals.sgstPaise, 0, 'Reverse SGST'), companyId, branchId, date: ret.returnDate, referenceType: 'sales-return', referenceId: ret.id });
  if (totals.igstPaise > 0) out.push({ ...line('2122', totals.igstPaise, 0, 'Reverse IGST'), companyId, branchId, date: ret.returnDate, referenceType: 'sales-return', referenceId: ret.id });
  out.push({ ...line('1130', 0, totals.finalTotalPaise, 'AR reduction'), companyId, branchId, date: ret.returnDate, referenceType: 'sales-return', referenceId: ret.id });
  return out;
};

/** Purchase return (debit note) → Dr AP · Cr Inventory · Cr Input GST. */
export const buildPurchaseReturnPostings = ({ ret, totals, companyId, branchId }) => {
  const out = [];
  out.push({ ...line('2110', totals.finalTotalPaise, 0, 'AP reduction'), companyId, branchId, date: ret.returnDate, referenceType: 'purchase-return', referenceId: ret.id });
  out.push({ ...line('1140', 0, totals.taxableValuePaise, 'Inventory return'), companyId, branchId, date: ret.returnDate, referenceType: 'purchase-return', referenceId: ret.id });
  if (totals.cgstPaise > 0) out.push({ ...line('1160', 0, totals.cgstPaise, 'Reverse input CGST'), companyId, branchId, date: ret.returnDate, referenceType: 'purchase-return', referenceId: ret.id });
  if (totals.sgstPaise > 0) out.push({ ...line('1161', 0, totals.sgstPaise, 'Reverse input SGST'), companyId, branchId, date: ret.returnDate, referenceType: 'purchase-return', referenceId: ret.id });
  if (totals.igstPaise > 0) out.push({ ...line('1162', 0, totals.igstPaise, 'Reverse input IGST'), companyId, branchId, date: ret.returnDate, referenceType: 'purchase-return', referenceId: ret.id });
  return out;
};

/**
 * Production completion → Dr FG inventory · Cr RM inventory (at cost) · Cr WIP/mfg overhead.
 * Simplified: Dr FG for total planned cost · Cr RM for material cost · Cr Overhead for the rest.
 */
export const buildProductionCompletionPostings = ({ order, materialCostPaise, totalCostPaise, companyId, branchId, date }) => {
  const out = [];
  out.push({ ...line('1150', totalCostPaise, 0, 'FG produced'), companyId, branchId, date, referenceType: 'production-completion', referenceId: order.id });
  out.push({ ...line('1140', 0, materialCostPaise, 'RM consumed'), companyId, branchId, date, referenceType: 'production-completion', referenceId: order.id });
  const overheadPaise = Math.max(0, totalCostPaise - materialCostPaise);
  if (overheadPaise > 0) {
    out.push({ ...line('5600', 0, overheadPaise, 'Manufacturing overhead applied'), companyId, branchId, date, referenceType: 'production-completion', referenceId: order.id });
  }
  return out;
};