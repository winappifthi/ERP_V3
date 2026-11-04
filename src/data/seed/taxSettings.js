/**
 * Per-company GST configuration. Each record aligns with a company in the
 * seed and defines GSTIN, registration type, filing frequency, and default
 * place-of-supply logic.
 */
export const taxSettings = [
  {
    companyId: 'COM-RETAIL',
    gstin: '33AABCE1234F1Z5',
    legalName: 'EZY Retail Private Limited',
    tradeName: 'EZY Retail',
    registrationType: 'regular',
    state: 'Tamil Nadu',
    stateCode: '33',
    pan: 'AABCE1234F',
    filingFrequency: 'monthly',
    reverseChargeEnabled: false,
    eInvoiceEnabled: false,
    gstinVerifiedOn: '2024-04-01',
    active: true,
  },
  {
    companyId: 'COM-WHOLESALE',
    gstin: '33AABCW5678K1Z3',
    legalName: 'EZY Wholesale Trading Private Limited',
    tradeName: 'EZY Wholesale',
    registrationType: 'regular',
    state: 'Tamil Nadu',
    stateCode: '33',
    pan: 'AABCW5678K',
    filingFrequency: 'monthly',
    reverseChargeEnabled: false,
    eInvoiceEnabled: false,
    gstinVerifiedOn: '2024-04-01',
    active: true,
  },
  {
    companyId: 'COM-MFG',
    gstin: '33AABCM9012P1Z1',
    legalName: 'EZY Manufacturing Private Limited',
    tradeName: 'EZY Manufacturing',
    registrationType: 'regular',
    state: 'Tamil Nadu',
    stateCode: '33',
    pan: 'AABCM9012P',
    filingFrequency: 'monthly',
    reverseChargeEnabled: true,
    eInvoiceEnabled: false,
    gstinVerifiedOn: '2024-04-01',
    active: true,
  },
];