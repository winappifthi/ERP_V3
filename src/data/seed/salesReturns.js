export const salesReturns = [
  {
    id: 'SR-0001',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    returnNumber: 'SR/RET-CHN/2425/0001',
    returnDate: '2024-06-18',
    type: 'sales-return',
    customerId: 'CUST-0001',
    sourceInvoiceId: 'INV-0001',
    restock: true,
    status: 'draft',
    taxTreatment: 'intra',
    lines: [
      { 
        productId: 'PRD-0003', 
        quantity: 2, 
        unitPriceRupees: 850, 
        discountPercent: 0, 
        taxRatePercent: 12, 
        taxTreatment: 'intra', 
        taxInclusive: false, 
        warehouseId: 'WH-RET-CHN-A',
        reason: 'Damaged in transit'
      },
    ],
    notes: 'Customer returned 2 LED panels.',
    createdAt: '2024-06-18T15:00:00',
  },
];