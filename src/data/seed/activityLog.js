/**
 * Pre-seeded activity history. Every status transition on a document is
 * appended here — never overwritten — providing an audit trail.
 */
export const activityLog = [
  // SO-0001: draft → pending → approved → completed
  { id: 'ACT-0001', documentType: 'sales-order', documentId: 'SO-0001', action: 'created', userId: 'USR-001', userName: 'Arjun Mehta', at: '2024-06-10T09:30:00', comment: 'Order created.' },
  { id: 'ACT-0002', documentType: 'sales-order', documentId: 'SO-0001', action: 'submitted', userId: 'USR-001', userName: 'Arjun Mehta', at: '2024-06-10T09:35:00', comment: 'Submitted for approval.' },
  { id: 'ACT-0003', documentType: 'sales-order', documentId: 'SO-0001', action: 'approved', userId: 'USR-002', userName: 'Priya Nair', at: '2024-06-10T10:00:00', comment: 'Approved.' },
  { id: 'ACT-0004', documentType: 'sales-order', documentId: 'SO-0001', action: 'completed', userId: 'USR-001', userName: 'Arjun Mehta', at: '2024-06-11T14:00:00', comment: 'Delivered.' },

  // SO-0003: pending awaiting manager
  { id: 'ACT-0005', documentType: 'sales-order', documentId: 'SO-0003', action: 'created', userId: 'USR-003', userName: 'Karthik R', at: '2024-06-18T14:15:00', comment: 'Order created.' },
  { id: 'ACT-0006', documentType: 'sales-order', documentId: 'SO-0003', action: 'submitted', userId: 'USR-003', userName: 'Karthik R', at: '2024-06-18T14:20:00', comment: 'Awaiting manager approval.' },

  // SO-0006: rejected
  { id: 'ACT-0007', documentType: 'sales-order', documentId: 'SO-0006', action: 'created', userId: 'USR-003', userName: 'Karthik R', at: '2024-06-25T09:00:00', comment: '' },
  { id: 'ACT-0008', documentType: 'sales-order', documentId: 'SO-0006', action: 'submitted', userId: 'USR-003', userName: 'Karthik R', at: '2024-06-25T09:05:00', comment: '' },
  { id: 'ACT-0009', documentType: 'sales-order', documentId: 'SO-0006', action: 'rejected', userId: 'USR-002', userName: 'Priya Nair', at: '2024-06-25T11:00:00', comment: 'Credit limit exceeded.' },

  // SO-0007: high-value, awaiting admin
  { id: 'ACT-0010', documentType: 'sales-order', documentId: 'SO-0007', action: 'created', userId: 'USR-003', userName: 'Karthik R', at: '2024-06-26T11:30:00', comment: '' },
  { id: 'ACT-0011', documentType: 'sales-order', documentId: 'SO-0007', action: 'submitted', userId: 'USR-003', userName: 'Karthik R', at: '2024-06-26T11:35:00', comment: 'Requires admin approval (>₹50,000).' },
];