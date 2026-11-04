export const purchaseReturns = [
  {
    id: 'PRET-0001',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    returnNumber: 'PRET/RET-CHN/2425/0001',
    returnDate: '2024-06-20',
    type: 'purchase-return',
    vendorId: 'VND-0001',
    sourceInvoiceId: 'PINV-0001',
    returnToVendor: true,
    status: 'draft',
    taxTreatment: 'intra',
    lines: [
      { 
        productId: 'PRD-0003', 
        quantity: 5, 
        unitPriceRupees: 620, 
        taxRatePercent: 12, 
        taxTreatment: 'intra',
        warehouseId: 'WH-RET-CHN-A',
        reason: 'Defective batch'
      },
    ],
    notes: 'Returned 5 defective LED panels.',
    createdAt: '2024-06-20T11:00:00',
  },
];