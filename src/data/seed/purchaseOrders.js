export const purchaseOrders = [
  {
    id: 'PO-0001',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    orderNumber: 'PO/RET-CHN/2425/0001',
    orderDate: '2024-06-05',
    expectedDate: '2024-06-10',
    type: 'purchase-order',
    vendorId: 'VND-0001',
    status: 'draft',
    taxTreatment: 'intra',
    lines: [
      { productId: 'PRD-0001', quantity: 10, unitPriceRupees: 9800, discountPercent: 0, taxRatePercent: 18, taxTreatment: 'intra', taxInclusive: false, warehouseId: 'WH-RET-CHN-A' },
      { productId: 'PRD-0003', quantity: 100, unitPriceRupees: 620, discountPercent: 0, taxRatePercent: 12, taxTreatment: 'intra', taxInclusive: false, warehouseId: 'WH-RET-CHN-A' },
    ],
    charges: { freightRupees: 0, packingRupees: 0, otherRupees: 0 },
    notes: 'Opening stock replenishment.',
    createdAt: '2024-06-05T09:00:00',
  },
];