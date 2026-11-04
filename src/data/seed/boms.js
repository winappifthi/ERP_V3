/**
 * Bill of Materials. Each BOM defines raw-material requirements to produce
 * 1 unit of the finished-good output. BOM versioning supported via `version`.
 *
 * Lines reference product IDs. `scrapPercent` is an allowance applied on top
 * of the required quantity to account for process waste.
 */
export const boms = [
  {
    id: 'BOM-001',
    companyId: 'COM-MFG',
    outputProductId: 'PRD-0018',       // EZY Industrial Motor 3HP (FG)
    version: 'v1',
    status: 'active',
    outputQuantity: 1,
    scrapPercent: 2,
    lines: [
      { productId: 'PRD-0014', quantity: 4, scrapPercent: 5 },   // Sheet Metal Panel
      { productId: 'PRD-0015', quantity: 1, scrapPercent: 2 },   // Copper Coil 2kg
      { productId: 'PRD-0016', quantity: 2, scrapPercent: 0 },   // Carton Box
      { productId: 'PRD-0017', quantity: 1, scrapPercent: 0 },   // Label Roll
    ],
    laborCostPerUnit: 1200,            // ₹
    overheadCostPerUnit: 400,          // ₹
    notes: 'Standard 3HP industrial motor.',
    createdAt: '2024-06-01T09:00:00',
  },
  {
    id: 'BOM-002',
    companyId: 'COM-MFG',
    outputProductId: 'PRD-0019',       // EZY Control Panel Unit (FG)
    version: 'v1',
    status: 'active',
    outputQuantity: 1,
    scrapPercent: 3,
    lines: [
      { productId: 'PRD-0014', quantity: 2, scrapPercent: 5 },
      { productId: 'PRD-0015', quantity: 0.5, scrapPercent: 2 },
      { productId: 'PRD-0016', quantity: 1, scrapPercent: 0 },
      { productId: 'PRD-0017', quantity: 2, scrapPercent: 0 },
    ],
    laborCostPerUnit: 1800,
    overheadCostPerUnit: 600,
    notes: 'Standard control panel assembly.',
    createdAt: '2024-06-01T09:00:00',
  },
];