/**
 * Stock transfers. Each transfer creates 2 movements per line (out from source,
 * in to destination). Stored here as documents; movements are derived.
 */
export const stockTransfers = [
  {
    id: 'ST-0001',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    transferNumber: 'ST/RET-CHN/2425/0001',
    transferDate: '2024-06-12',
    sourceWarehouseId: 'WH-RET-CHN-A',
    destinationWarehouseId: 'WH-RET-CBE-A',
    status: 'posted',
    lines: [
      { productId: 'PRD-0003', quantity: 20 },
    ],
    notes: 'Sent 20 LED panels to Coimbatore.',
    createdAt: '2024-06-12T11:00:00',
  },
];