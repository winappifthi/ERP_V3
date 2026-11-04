export const salesInvoices = [
  {
    id: 'INV-0001',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    invoiceNumber: 'INV/RET-CHN/2425/0001',
    invoiceDate: '2024-06-11',
    dueDate: '2024-07-11',
    type: 'sales-invoice',
    customerId: 'CUST-0001',
    sourceOrderId: 'SO-0001',
    status: 'draft',
    taxTreatment: 'intra',
    lines: [
      { productId: 'PRD-0001', quantity: 2, unitPriceRupees: 12500, discountPercent: 5, taxRatePercent: 18, taxTreatment: 'intra', taxInclusive: false, warehouseId: 'WH-RET-CHN-A' },
      { productId: 'PRD-0003', quantity: 10, unitPriceRupees: 850, discountPercent: 0, taxRatePercent: 12, taxTreatment: 'intra', taxInclusive: false, warehouseId: 'WH-RET-CHN-A' },
    ],
    charges: { freightRupees: 500, packingRupees: 0, otherRupees: 0 },
    amountPaid: 25000,
    notes: 'Delivered via own vehicle.',
    createdAt: '2024-06-11T10:00:00',
  },
];