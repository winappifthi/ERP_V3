export const vendorPayments = [
  {
    id: 'VPAY-0001',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    paymentNumber: 'VPAY/RET-CHN/2425/0001',
    paymentDate: '2024-06-15',
    type: 'payment',
    vendorId: 'VND-0001',
    status: 'draft',
    mode: 'bank',
    referenceNumber: 'NEFT-20240615-001',
    allocations: [
      { invoiceId: 'PINV-0001', amountRupees: 20000 },
    ],
    notes: 'Part payment against PI-0001.',
    createdAt: '2024-06-15T12:00:00',
  },
];