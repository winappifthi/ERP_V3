const mkProduct = (id, sku, name, categoryId, sell, buy, taxId, opts = {}) => ({
  id,
  sku,
  name,
  categoryId,
  baseUom: opts.baseUom || 'PCS',
  sellingPrice: sell,
  purchasePrice: buy,
  taxCategoryId: taxId,
  trackBatch: !!opts.trackBatch,
  trackSerial: !!opts.trackSerial,
  hsn: opts.hsn || '0000',
  active: true,
  reorderLevel: opts.reorderLevel ?? 10,
});

export const products = [
  // Retail electronics
  mkProduct('PRD-0001', 'ELEC-0001', 'Industrial Electric Motor 5HP', 'CAT-IND', 12500, 9800, 'TAX-GST18', { trackSerial: true, hsn: '8501' }),
  mkProduct('PRD-0002', 'ELEC-0002', 'Copper Wire Spool 100m', 'CAT-ELEC', 4500, 3200, 'TAX-GST18', { baseUom: 'MTR', hsn: '8544' }),
  mkProduct('PRD-0003', 'ELEC-0003', 'LED Panel Light 36W', 'CAT-ELEC', 850, 620, 'TAX-GST12', { hsn: '9405' }),
  mkProduct('PRD-0004', 'ELEC-0004', 'Industrial Circuit Breaker 32A', 'CAT-ELEC', 1450, 1050, 'TAX-GST18', { trackSerial: true, hsn: '8536' }),
  mkProduct('PRD-0005', 'ELEC-0005', 'Digital Multimeter', 'CAT-ELEC', 2100, 1500, 'TAX-GST18', { trackSerial: true, hsn: '9030' }),
  // Industrial
  mkProduct('PRD-0006', 'IND-0001', 'Hydraulic Pump Assembly', 'CAT-IND', 28500, 22000, 'TAX-GST18', { trackSerial: true, hsn: '8413' }),
  mkProduct('PRD-0007', 'IND-0002', 'Steel Bearing 20mm', 'CAT-IND', 320, 210, 'TAX-GST18', { hsn: '8482' }),
  mkProduct('PRD-0008', 'IND-0003', 'Conveyor Belt 5m', 'CAT-IND', 8900, 7200, 'TAX-GST18', { hsn: '4010' }),
  // Fasteners
  mkProduct('PRD-0009', 'FAST-0001', 'Hex Bolt M10x50 (Box of 100)', 'CAT-FAST', 950, 720, 'TAX-GST18', { hsn: '7318' }),
  mkProduct('PRD-0010', 'FAST-0002', 'Stainless Steel Washer (Box of 500)', 'CAT-FAST', 620, 450, 'TAX-GST18', { hsn: '7318' }),
  // FMCG (retail)
  mkProduct('PRD-0011', 'FMCG-0001', 'Premium Tea Powder 1kg', 'CAT-FMCG', 520, 380, 'TAX-GST5', { trackBatch: true, hsn: '0902' }),
  mkProduct('PRD-0012', 'FMCG-0002', 'Refined Sunflower Oil 5L', 'CAT-FMCG', 950, 780, 'TAX-GST5', { trackBatch: true, hsn: '1512' }),
  mkProduct('PRD-0013', 'FMCG-0003', 'Packaged Drinking Water 1L (12 pack)', 'CAT-FMCG', 180, 120, 'TAX-GST18', { trackBatch: true, hsn: '2201' }),
  // RM for manufacturing
  mkProduct('PRD-0014', 'RM-0001', 'Sheet Metal Panel 2mm', 'CAT-RM', 0, 550, 'TAX-GST18', { hsn: '7208' }),
  mkProduct('PRD-0015', 'RM-0002', 'Copper Coil 2kg', 'CAT-RM', 0, 1850, 'TAX-GST18', { hsn: '7408' }),
  mkProduct('PRD-0016', 'RM-0003', 'Packing Carton Box Large', 'CAT-RM', 0, 45, 'TAX-GST12', { hsn: '4819' }),
  mkProduct('PRD-0017', 'RM-0004', 'Printed Label Roll', 'CAT-RM', 0, 80, 'TAX-GST18', { hsn: '4821' }),
  // FG from manufacturing
  mkProduct('PRD-0018', 'FG-0001', 'EZY Industrial Motor 3HP (Assembled)', 'CAT-FG', 18900, 14200, 'TAX-GST18', { trackSerial: true, hsn: '8501' }),
  mkProduct('PRD-0019', 'FG-0002', 'EZY Control Panel Unit', 'CAT-FG', 22500, 17800, 'TAX-GST18', { trackSerial: true, hsn: '8537' }),
  // Wholesale bulk items
  mkProduct('PRD-0020', 'WS-0001', 'Steel Rod 12mm (per metre)', 'CAT-WS', 180, 140, 'TAX-GST18', { baseUom: 'MTR', hsn: '7214' }),
];