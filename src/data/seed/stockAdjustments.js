/**
 * Stock adjustments. Positive = increase, negative = decrease.
 * Reason codes: damaged, expired, found, shrinkage, sample, other.
 */
export const stockAdjustments = [
  {
    id: 'ADJ-0001',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    adjustmentNumber: 'ADJ/RET-CHN/2425/0001',
    adjustmentDate: '2024-06-19',
    warehouseId: 'WH-RET-CHN-A',
    status: 'posted',
    lines: [
      { productId: 'PRD-0003', quantity: -3, reason: 'damaged', notes: '3 panels cracked in storage' },
    ],
    createdAt: '2024-06-19T16:00:00',
  },
];