export const goodsDeliveries = [
  {
    id: 'GDN-0001',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    deliveryNumber: 'GDN/RET-CHN/2425/0001',
    deliveryDate: '2024-06-11',
    type: 'gdn',
    customerId: 'CUST-0001',
    sourceOrderId: 'SO-0001',
    warehouseId: 'WH-RET-CHN-A',
    status: 'draft',
    lines: [
      { productId: 'PRD-0001', quantity: 2, unitPriceRupees: 12500, taxRatePercent: 18, taxTreatment: 'intra', warehouseId: 'WH-RET-CHN-A' },
    ],
    notes: 'Delivered to Anand Traders.',
    createdAt: '2024-06-11T14:00:00',
  },
];