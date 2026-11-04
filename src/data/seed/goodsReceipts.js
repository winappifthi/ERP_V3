export const goodsReceipts = [
  {
    id: 'GRN-0001',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    receiptNumber: 'GRN/RET-CHN/2425/0001',
    receiptDate: '2024-06-09',
    type: 'grn',
    vendorId: 'VND-0001',
    sourceOrderId: 'PO-0001',
    warehouseId: 'WH-RET-CHN-A',
    status: 'draft',
    lines: [
      { productId: 'PRD-0001', quantity: 10, unitPriceRupees: 9800, taxRatePercent: 18, taxTreatment: 'intra', warehouseId: 'WH-RET-CHN-A' },
      { productId: 'PRD-0003', quantity: 100, unitPriceRupees: 620, taxRatePercent: 12, taxTreatment: 'intra', warehouseId: 'WH-RET-CHN-A' },
    ],
    notes: 'Complete receipt for PO-0001.',
    createdAt: '2024-06-09T14:00:00',
  },
];