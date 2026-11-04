/**
 * Canonical GL posting stream. Every financial event is one or more pairs of
 * debit/credit lines grouped by referenceId. Balances are derived by summing.
 */
export const glPostings = [
  // ==== Opening balances (June 1, 2024) ====
  { id: 'GL-0001', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-01', accountCode: '1110', debitPaise: 50000000, creditPaise: 0, narration: 'Opening cash', referenceType: 'opening', referenceId: 'OB-1' },
  { id: 'GL-0002', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-01', accountCode: '1120', debitPaise: 200000000, creditPaise: 0, narration: 'Opening bank', referenceType: 'opening', referenceId: 'OB-1' },
  { id: 'GL-0003', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-01', accountCode: '3100', debitPaise: 0, creditPaise: 250000000, narration: 'Owner capital', referenceType: 'opening', referenceId: 'OB-1' },

  // ==== Purchase invoice PINV-0001 (Bharath Electronics, intra) ====
  // Dr Inventory 1,19,600 · Dr Input CGST 17,820 · Dr Input SGST 17,820 · Cr AP 1,55,240
  { id: 'GL-0004', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-09', accountCode: '1140', debitPaise: 11960000, creditPaise: 0, narration: 'Purchase — Bharath Electronics', referenceType: 'purchase-invoice', referenceId: 'PINV-0001' },
  { id: 'GL-0005', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-09', accountCode: '1160', debitPaise: 1782000, creditPaise: 0, narration: 'Input CGST', referenceType: 'purchase-invoice', referenceId: 'PINV-0001' },
  { id: 'GL-0006', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-09', accountCode: '1161', debitPaise: 1782000, creditPaise: 0, narration: 'Input SGST', referenceType: 'purchase-invoice', referenceId: 'PINV-0001' },
  { id: 'GL-0007', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-09', accountCode: '2110', debitPaise: 0, creditPaise: 15524000, narration: 'Vendor payable', referenceType: 'purchase-invoice', referenceId: 'PINV-0001' },

  // ==== Sales invoice INV-0001 (Anand Traders, intra) ====
  // Dr AR 1,55,391 · Cr Sales 1,31,440 · Cr Output CGST 12,015 · Cr Output SGST 12,016 · Cr COGS 34,100 · Dr Inventory 34,100
  { id: 'GL-0008', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-11', accountCode: '1130', debitPaise: 15539100, creditPaise: 0, narration: 'Sales to Anand Traders', referenceType: 'sales-invoice', referenceId: 'INV-0001' },
  { id: 'GL-0009', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-11', accountCode: '4100', debitPaise: 0, creditPaise: 13144000, narration: 'Sales revenue', referenceType: 'sales-invoice', referenceId: 'INV-0001' },
  { id: 'GL-0010', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-11', accountCode: '2120', debitPaise: 0, creditPaise: 1201500, narration: 'Output CGST', referenceType: 'sales-invoice', referenceId: 'INV-0001' },
  { id: 'GL-0011', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-11', accountCode: '2121', debitPaise: 0, creditPaise: 1201600, narration: 'Output SGST', referenceType: 'sales-invoice', referenceId: 'INV-0001' },
  { id: 'GL-0012', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-11', accountCode: '5100', debitPaise: 3410000, creditPaise: 0, narration: 'COGS', referenceType: 'sales-invoice', referenceId: 'INV-0001' },
  { id: 'GL-0013', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-11', accountCode: '1150', debitPaise: 0, creditPaise: 3410000, narration: 'FG inventory reduction', referenceType: 'sales-invoice', referenceId: 'INV-0001' },

  // ==== Customer receipt RCP-0001 ====
  { id: 'GL-0014', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-15', accountCode: '1120', debitPaise: 2500000, creditPaise: 0, narration: 'Receipt from Anand Traders', referenceType: 'customer-receipt', referenceId: 'RCP-0001' },
  { id: 'GL-0015', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-15', accountCode: '1130', debitPaise: 0, creditPaise: 2500000, narration: 'AR cleared', referenceType: 'customer-receipt', referenceId: 'RCP-0001' },

  // ==== Vendor payment VPAY-0001 ====
  { id: 'GL-0016', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-15', accountCode: '2110', debitPaise: 2000000, creditPaise: 0, narration: 'Payment to Bharath Electronics', referenceType: 'vendor-payment', referenceId: 'VPAY-0001' },
  { id: 'GL-0017', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-15', accountCode: '1120', debitPaise: 0, creditPaise: 2000000, narration: 'Bank payment', referenceType: 'vendor-payment', referenceId: 'VPAY-0001' },

  // ==== Sales return SR-0001 (credit note) ====
  { id: 'GL-0018', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-18', accountCode: '4200', debitPaise: 170000, creditPaise: 0, narration: 'Sales return — 2 LED panels', referenceType: 'sales-return', referenceId: 'SR-0001' },
  { id: 'GL-0019', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-18', accountCode: '2120', debitPaise: 10200, creditPaise: 0, narration: 'Reverse CGST', referenceType: 'sales-return', referenceId: 'SR-0001' },
  { id: 'GL-0020', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-18', accountCode: '2121', debitPaise: 10200, creditPaise: 0, narration: 'Reverse SGST', referenceType: 'sales-return', referenceId: 'SR-0001' },
  { id: 'GL-0021', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-18', accountCode: '1130', debitPaise: 0, creditPaise: 190400, narration: 'AR reduction', referenceType: 'sales-return', referenceId: 'SR-0001' },

  // ==== Purchase invoice PINV-0002 ====
  { id: 'GL-0022', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-25', accountCode: '1140', debitPaise: 11700000, creditPaise: 0, narration: 'Purchase — Bharath Electronics (partial GRN)', referenceType: 'purchase-invoice', referenceId: 'PINV-0002' },
  { id: 'GL-0023', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-25', accountCode: '1160', debitPaise: 1755000, creditPaise: 0, narration: 'Input CGST', referenceType: 'purchase-invoice', referenceId: 'PINV-0002' },
  { id: 'GL-0024', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-25', accountCode: '1161', debitPaise: 1755000, creditPaise: 0, narration: 'Input SGST', referenceType: 'purchase-invoice', referenceId: 'PINV-0002' },
  { id: 'GL-0025', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', date: '2024-06-25', accountCode: '2110', debitPaise: 0, creditPaise: 15210000, narration: 'Vendor payable', referenceType: 'purchase-invoice', referenceId: 'PINV-0002' },
];