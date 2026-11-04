/**
 * Canonical inventory movements. Every posted receipt/issue/transfer/adjustment
 * adds a row here. Stock on hand is DERIVED from these movements — never stored
 * directly. Signed quantity: positive = in, negative = out.
 *
 * movementType: 'purchase-receipt' | 'sales-issue' | 'sale-return' |
 *               'purchase-return' | 'transfer-out' | 'transfer-in' |
 *               'adjustment' | 'production-issue' | 'production-receipt' |
 *               'opening'
 */
export const stockMovements = [
  // Opening stock for retail Chennai (June 1, 2024)
  { id: 'MOV-0001', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', warehouseId: 'WH-RET-CHN-A', productId: 'PRD-0001', quantity: 10, movementType: 'opening', movementDate: '2024-06-01', referenceType: null, referenceId: null },
  { id: 'MOV-0002', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', warehouseId: 'WH-RET-CHN-A', productId: 'PRD-0003', quantity: 100, movementType: 'opening', movementDate: '2024-06-01', referenceType: null, referenceId: null },
  { id: 'MOV-0003', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', warehouseId: 'WH-RET-CHN-A', productId: 'PRD-0005', quantity: 5, movementType: 'opening', movementDate: '2024-06-01', referenceType: null, referenceId: null },

  // Sales issue from INV-0001 (2024-06-11)
  { id: 'MOV-0004', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', warehouseId: 'WH-RET-CHN-A', productId: 'PRD-0001', quantity: -2, movementType: 'sales-issue', movementDate: '2024-06-11', referenceType: 'sales-invoice', referenceId: 'INV-0001' },
  { id: 'MOV-0005', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', warehouseId: 'WH-RET-CHN-A', productId: 'PRD-0003', quantity: -10, movementType: 'sales-issue', movementDate: '2024-06-11', referenceType: 'sales-invoice', referenceId: 'INV-0001' },

  // Sales issue from INV-0003 (2024-06-16)
  { id: 'MOV-0006', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', warehouseId: 'WH-RET-CHN-A', productId: 'PRD-0005', quantity: -1, movementType: 'sales-issue', movementDate: '2024-06-16', referenceType: 'sales-invoice', referenceId: 'INV-0003' },

  // Sales return restock from SR-0001 (2024-06-18)
  { id: 'MOV-0007', companyId: 'COM-RETAIL', branchId: 'BR-RET-CHN', warehouseId: 'WH-RET-CHN-A', productId: 'PRD-0003', quantity: 2, movementType: 'sale-return', movementDate: '2024-06-18', referenceType: 'sales-return', referenceId: 'SR-0001' },

  // Wholesale Bengaluru opening
  { id: 'MOV-0008', companyId: 'COM-WHOLESALE', branchId: 'BR-WS-BLR', warehouseId: 'WH-WS-BLR-A', productId: 'PRD-0003', quantity: 200, movementType: 'opening', movementDate: '2024-06-01', referenceType: null, referenceId: null },

  // Sales issue from INV-0002 (2024-06-23)
  { id: 'MOV-0009', companyId: 'COM-WHOLESALE', branchId: 'BR-WS-BLR', warehouseId: 'WH-WS-BLR-A', productId: 'PRD-0003', quantity: -100, movementType: 'sales-issue', movementDate: '2024-06-23', referenceType: 'sales-invoice', referenceId: 'INV-0002' },
];