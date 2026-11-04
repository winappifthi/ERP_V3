import { calculateDocument } from '../../domain/calculations/documentCalculator';

/**
 * Build a flat array of searchable entries from the current state.
 * Called via a memoized selector.
 */
export const buildSearchIndex = (state) => {
  const { app, masters, sales, purchases, finance, manufacturing } = state;
  const entries = [];

  const partiesById = Object.fromEntries((masters.parties || []).map((p) => [p.id, p]));

  // ---- Products ----
  for (const p of masters.products || []) {
    entries.push({
      id: `product-${p.id}`,
      type: 'product',
      typeLabel: 'Product',
      title: p.name,
      subtitle: `${p.sku}${p.hsn ? ' · HSN ' + p.hsn : ''}`,
      path: `/app/masters/products`,
      keywords: `${p.name} ${p.sku} ${p.hsn}`.toLowerCase(),
    });
  }

  // ---- Parties (customers, vendors, leads) ----
  for (const p of masters.parties || []) {
    if (p.companyId !== app.companyId) continue;

    const isCustomer = p.type === 'customer';
    const isVendor = p.type === 'vendor';
    const isLead = p.type === 'lead';

    const typeLabel = isCustomer ? 'Customer' : isVendor ? 'Vendor' : 'Lead';
    const detailBits = [
      p.code,
      p.gstin,
      p.phone,
      isLead && p.stage ? `Stage: ${p.stage}` : null,
    ].filter(Boolean);

    entries.push({
      id: `party-${p.id}`,
      type: p.type,
      typeLabel,
      title: p.name,
      subtitle: detailBits.join(' · '),
      path: `/app/masters/parties/${p.id}`,
      keywords: `${p.name} ${p.code} ${p.gstin || ''} ${p.phone || ''} ${p.email || ''} ${p.stage || ''}`.toLowerCase(),
    });
  }

  // ---- Sales Orders ----
  for (const o of sales.orders || []) {
    if (o.companyId !== app.companyId) continue;
    entries.push({
      id: `sales-order-${o.id}`,
      type: 'sales-order',
      typeLabel: 'Sales Order',
      title: o.orderNumber,
      subtitle: `${partiesById[o.customerId]?.name || '—'} · ${o.status}`,
      path: `/app/transactions/orders/${o.id}`,
      keywords: `${o.orderNumber} ${partiesById[o.customerId]?.name || ''} ${o.status}`.toLowerCase(),
    });
  }

  // ---- Sales Invoices ----
  for (const i of sales.invoices || []) {
    if (i.companyId !== app.companyId) continue;
    entries.push({
      id: `sales-invoice-${i.id}`,
      type: 'sales-invoice',
      typeLabel: 'Sales Invoice',
      title: i.invoiceNumber,
      subtitle: `${partiesById[i.customerId]?.name || '—'} · ${i.status}`,
      path: `/app/transactions/invoices/${i.id}`,
      keywords: `${i.invoiceNumber} ${partiesById[i.customerId]?.name || ''} ${i.status}`.toLowerCase(),
    });
  }

  // ---- Sales Returns ----
  for (const r of sales.returns || []) {
    if (r.companyId !== app.companyId) continue;
    entries.push({
      id: `sales-return-${r.id}`,
      type: 'sales-return',
      typeLabel: 'Sales Return',
      title: r.returnNumber,
      subtitle: `${partiesById[r.customerId]?.name || '—'} · ${r.status}`,
      path: `/app/transactions/returns`,
      keywords: `${r.returnNumber} ${partiesById[r.customerId]?.name || ''} ${r.status}`.toLowerCase(),
    });
  }

  // ---- Customer Receipts ----
  for (const rc of sales.receipts || []) {
    if (rc.companyId !== app.companyId) continue;
    entries.push({
      id: `receipt-${rc.id}`,
      type: 'receipt',
      typeLabel: 'Customer Receipt',
      title: rc.receiptNumber,
      subtitle: `${partiesById[rc.customerId]?.name || '—'}`,
      path: `/app/transactions/payments`,
      keywords: `${rc.receiptNumber} ${partiesById[rc.customerId]?.name || ''}`.toLowerCase(),
    });
  }

  // ---- GDNs ----
  for (const g of sales.gdns || []) {
    if (g.companyId !== app.companyId) continue;
    entries.push({
      id: `gdn-${g.id}`,
      type: 'gdn',
      typeLabel: 'Goods Delivery',
      title: g.deliveryNumber || g.id,
      subtitle: `${partiesById[g.customerId]?.name || '—'} · ${g.status || 'posted'}`,
      path: `/app/transactions/grn`,
      keywords: `${g.deliveryNumber || ''} gdn ${partiesById[g.customerId]?.name || ''}`.toLowerCase(),
    });
  }

  // ---- Purchase Orders ----
  for (const o of purchases.orders || []) {
    if (o.companyId !== app.companyId) continue;
    entries.push({
      id: `purchase-order-${o.id}`,
      type: 'purchase-order',
      typeLabel: 'Purchase Order',
      title: o.orderNumber,
      subtitle: `${partiesById[o.vendorId]?.name || '—'} · ${o.status}`,
      path: `/app/transactions/orders/${o.id}`,
      keywords: `${o.orderNumber} ${partiesById[o.vendorId]?.name || ''} ${o.status}`.toLowerCase(),
    });
  }

  // ---- Purchase Invoices ----
  for (const i of purchases.invoices || []) {
    if (i.companyId !== app.companyId) continue;
    entries.push({
      id: `purchase-invoice-${i.id}`,
      type: 'purchase-invoice',
      typeLabel: 'Purchase Invoice',
      title: i.invoiceNumber,
      subtitle: `${partiesById[i.vendorId]?.name || '—'}${i.vendorInvoiceNumber ? ' · ' + i.vendorInvoiceNumber : ''}`,
      path: `/app/transactions/invoices/${i.id}`,
      keywords: `${i.invoiceNumber} ${i.vendorInvoiceNumber || ''} ${partiesById[i.vendorId]?.name || ''}`.toLowerCase(),
    });
  }

  // ---- Purchase Returns ----
  for (const r of purchases.returns || []) {
    if (r.companyId !== app.companyId) continue;
    entries.push({
      id: `purchase-return-${r.id}`,
      type: 'purchase-return',
      typeLabel: 'Purchase Return',
      title: r.returnNumber,
      subtitle: `${partiesById[r.vendorId]?.name || '—'} · ${r.status}`,
      path: `/app/transactions/returns`,
      keywords: `${r.returnNumber} ${partiesById[r.vendorId]?.name || ''} ${r.status}`.toLowerCase(),
    });
  }

  // ---- Vendor Payments ----
  for (const p of purchases.payments || []) {
    if (p.companyId !== app.companyId) continue;
    entries.push({
      id: `payment-${p.id}`,
      type: 'payment',
      typeLabel: 'Vendor Payment',
      title: p.paymentNumber,
      subtitle: `${partiesById[p.vendorId]?.name || '—'}`,
      path: `/app/transactions/payments`,
      keywords: `${p.paymentNumber} ${partiesById[p.vendorId]?.name || ''}`.toLowerCase(),
    });
  }

  // ---- GRNs ----
  for (const g of purchases.grns || []) {
    if (g.companyId !== app.companyId) continue;
    entries.push({
      id: `grn-${g.id}`,
      type: 'grn',
      typeLabel: 'Goods Receipt',
      title: g.receiptNumber || g.id,
      subtitle: `${partiesById[g.vendorId]?.name || '—'} · ${g.status || 'posted'}`,
      path: `/app/transactions/grn`,
      keywords: `${g.receiptNumber || ''} grn ${partiesById[g.vendorId]?.name || ''}`.toLowerCase(),
    });
  }

  // ---- Journals ----
  for (const j of finance.journals || []) {
    if (j.companyId !== app.companyId) continue;
    entries.push({
      id: `journal-${j.id}`,
      type: 'journal',
      typeLabel: 'Journal',
      title: j.voucherNumber,
      subtitle: j.narration,
      path: `/app/finance/journals`,
      keywords: `${j.voucherNumber} ${j.narration} ${j.status}`.toLowerCase(),
    });
  }

  // ---- Production Orders ----
  for (const p of manufacturing.productionOrders || []) {
    if (p.companyId !== app.companyId) continue;
    entries.push({
      id: `production-order-${p.id}`,
      type: 'production-order',
      typeLabel: 'Production Order',
      title: p.orderNumber,
      subtitle: `${p.status} · qty ${p.plannedQuantity}`,
      path: `/app/manufacturing/production-orders/${p.id}`,
      keywords: `${p.orderNumber} ${p.status}`.toLowerCase(),
    });
  }

  return entries;
};

/** Fuzzy filter: all tokens must match somewhere in `keywords`. */
export const filterSearchIndex = (entries, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  return entries
    .filter((e) => tokens.every((t) => e.keywords.includes(t)))
    .slice(0, 40);
};

/** Group results by type, preserving insertion order. */
export const groupByType = (results) => {
  const map = new Map();
  for (const r of results) {
    if (!map.has(r.type)) map.set(r.type, { type: r.type, typeLabel: r.typeLabel, items: [] });
    map.get(r.type).items.push(r);
  }
  return Array.from(map.values());
};