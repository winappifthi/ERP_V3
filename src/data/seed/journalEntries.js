export const journalEntries = [
  {
    id: 'JV-0001',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    voucherNumber: 'JV/RET-CHN/2425/0001',
    date: '2024-06-05',
    status: 'posted',
    narration: 'Monthly rent paid for Chennai store',
    lines: [
      { accountCode: '5400', debitPaise: 5000000, creditPaise: 0, narration: 'June rent' },
      { accountCode: '1120', debitPaise: 0, creditPaise: 5000000, narration: 'Bank transfer' },
    ],
    createdAt: '2024-06-05T10:00:00',
  },
];