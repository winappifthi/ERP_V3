/**
 * Approval rules. When a document of a given type exceeds thresholdRupees,
 * it must be approved by at least one user with the required role.
 * Rules are evaluated in order; the first matching rule determines the approver role.
 */
export const approvalRules = [
  {
    id: 'RULE-SO-LOW',
    documentType: 'sales-order',
    minRupees: 0,
    maxRupees: 50000,
    approverRole: 'manager',
    autoApprove: false,
    active: true,
    description: 'Sales orders ≤ ₹50,000 require manager approval.',
  },
  {
    id: 'RULE-SO-HIGH',
    documentType: 'sales-order',
    minRupees: 50000,
    maxRupees: null, // unbounded
    approverRole: 'admin',
    autoApprove: false,
    active: true,
    description: 'Sales orders above ₹50,000 require admin approval.',
  },
  {
    id: 'RULE-PO-LOW',
    documentType: 'purchase-order',
    minRupees: 0,
    maxRupees: 100000,
    approverRole: 'manager',
    autoApprove: false,
    active: true,
    description: 'Purchase orders ≤ ₹1,00,000 require manager approval.',
  },
  {
    id: 'RULE-PO-HIGH',
    documentType: 'purchase-order',
    minRupees: 100000,
    maxRupees: null,
    approverRole: 'admin',
    autoApprove: false,
    active: true,
    description: 'Purchase orders above ₹1,00,000 require admin approval.',
  },
  {
    id: 'RULE-PINV',
    documentType: 'purchase-invoice',
    minRupees: 0,
    maxRupees: null,
    approverRole: 'manager',
    autoApprove: false,
    active: true,
    description: 'Purchase invoices require manager approval.',
  },
  {
    id: 'RULE-JV',
    documentType: 'journal',
    minRupees: 10000,
    maxRupees: null,
    approverRole: 'admin',
    autoApprove: false,
    active: true,
    description: 'Journals above ₹10,000 require admin approval.',
  },
];