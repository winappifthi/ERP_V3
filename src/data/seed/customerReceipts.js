export const customerReceipts = [
  {
    id: 'RCP-0001',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    receiptNumber: 'RCP/RET-CHN/2425/0001',
    receiptDate: '2024-06-15',
    type: 'receipt',
    customerId: 'CUST-0001',
    status: 'draft',
    mode: 'bank',
    referenceNumber: 'NEFT/2024/001',
    allocations: [
      { invoiceId: 'INV-0001', amountRupees: 25000 },
    ],
    notes: 'Received via NEFT.',
    createdAt: '2024-06-15T16:00:00',
  },
];