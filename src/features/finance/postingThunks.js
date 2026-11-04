import { createAsyncThunk } from '@reduxjs/toolkit';
import { calculateDocument } from '../../domain/calculations/documentCalculator';
import { postInvoice as postSalesInvoiceAction } from '../sales/salesSlice';
import { postInvoice as postPurchaseInvoiceAction } from '../purchases/purchasesSlice';
import { postJournal as postJournalAction } from './financeSlice';
import { addPostings } from './financeSlice';
import {
  buildSalesInvoicePostings,
  buildPurchaseInvoicePostings,
} from './postingHelpers';

/**
 * Post a sales invoice: change status to 'posted' and generate balanced GL postings.
 * Skips GL generation if the invoice already has postings for its referenceId.
 */
export const postSalesInvoiceWithGL = createAsyncThunk(
  'finance/postSalesInvoiceWithGL',
  async (invoiceId, { dispatch, getState }) => {
    const state = getState();
    const inv = state.sales.invoices.find((i) => i.id === invoiceId);
    if (!inv) throw new Error(`Invoice ${invoiceId} not found`);

    // Idempotency guard
    const alreadyPosted = state.finance.postings.some(
      (p) => p.referenceType === 'sales-invoice' && p.referenceId === invoiceId
    );

    // Update status first
    dispatch(postSalesInvoiceAction(invoiceId));

    if (alreadyPosted) return { posted: false, reason: 'gl-exists' };

    const calc = calculateDocument({
      lines: inv.lines,
      headerDiscountRupees: inv.headerDiscountRupees || 0,
      charges: inv.charges,
      applyRoundOff: inv.applyRoundOff,
    });

    // Simple COGS estimate: use product.purchasePrice × qty
    const productById = Object.fromEntries(state.masters.products.map((p) => [p.id, p]));
    const cogsPaise = inv.lines.reduce((sum, l) => {
      const product = productById[l.productId];
      return sum + Math.round((product?.purchasePrice || 0) * l.quantity * 100);
    }, 0);

    const lines = buildSalesInvoicePostings({
      invoice: inv,
      totals: calc.totals,
      cogsPaise,
      companyId: inv.companyId,
      branchId: inv.branchId,
    });

    dispatch(addPostings(lines));
    return { posted: true, count: lines.length };
  }
);

export const postPurchaseInvoiceWithGL = createAsyncThunk(
  'finance/postPurchaseInvoiceWithGL',
  async (invoiceId, { dispatch, getState }) => {
    const state = getState();
    const inv = state.purchases.invoices.find((i) => i.id === invoiceId);
    if (!inv) throw new Error(`Purchase invoice ${invoiceId} not found`);

    const alreadyPosted = state.finance.postings.some(
      (p) => p.referenceType === 'purchase-invoice' && p.referenceId === invoiceId
    );

    dispatch(postPurchaseInvoiceAction(invoiceId));

    if (alreadyPosted) return { posted: false, reason: 'gl-exists' };

    const calc = calculateDocument({
      lines: inv.lines,
      headerDiscountRupees: inv.headerDiscountRupees || 0,
      charges: inv.charges,
      applyRoundOff: true,
    });

    const lines = buildPurchaseInvoicePostings({
      invoice: inv,
      totals: calc.totals,
      companyId: inv.companyId,
      branchId: inv.branchId,
    });

    dispatch(addPostings(lines));
    return { posted: true, count: lines.length };
  }
);

/**
 * Manual journals already post their own GL lines in `postJournal` reducer;
 * this thunk exists for symmetry and idempotent re-posting if needed.
 */
export const postJournalWithGL = createAsyncThunk(
  'finance/postJournalWithGL',
  async (journalId, { dispatch, getState }) => {
    const state = getState();
    const journal = state.finance.journals.find((j) => j.id === journalId);
    if (!journal) throw new Error(`Journal ${journalId} not found`);
    const alreadyPosted = state.finance.postings.some(
      (p) => p.referenceType === 'journal' && p.referenceId === journalId
    );
    dispatch(postJournalAction(journalId));
    if (alreadyPosted) return { posted: false, reason: 'gl-exists' };
    return { posted: true };
  }
);