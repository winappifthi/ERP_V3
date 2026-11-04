export const purchaseInvoices = [
  {
    id: 'PINV-0001',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    invoiceNumber: 'PI/RET-CHN/2425/0001',
    vendorInvoiceNumber: 'BE/2024/0456',
    invoiceDate: '2024-06-09',
    dueDate: '2024-07-09',
    type: 'purchase-invoice',
    vendorId: 'VND-0001',
    sourceReceiptId: 'GRN-0001',
    status: 'draft',
    taxTreatment: 'intra',
    lines: [
      { productId: 'PRD-0001', quantity: 10, unitPriceRupees: 9800, discountPercent: 0, taxRatePercent: 18, taxTreatment: 'intra', taxInclusive: false },
      { productId: 'PRD-0003', quantity: 100, unitPriceRupees: 620, discountPercent: 0, taxRatePercent: 12, taxTreatment: 'intra', taxInclusive: false },
    ],
    charges: { freightRupees: 0, packingRupees: 0, otherRupees: 0 },
    amountPaid: 20000,
    notes: 'Received Bharath Electronics invoice.',
    createdAt: '2024-06-09T15:00:00',
  },
];