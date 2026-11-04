import { createSelector } from '@reduxjs/toolkit';

const selectInventory = (s) => s.inventory;
const selectMasters = (s) => s.masters;
const selectApp = (s) => s.app;

/** Filter movements to current company + branch. */
export const selectMovementsInContext = createSelector(
  [selectInventory, selectApp],
  (inv, app) => inv.movements.filter((m) => m.companyId === app.companyId && m.branchId === app.branchId)
);

export const selectMovementsForWarehouse = (warehouseId) =>
  createSelector([selectMovementsInContext], (moves) =>
    moves.filter((m) => m.warehouseId === warehouseId)
  );

export const selectTransfersInContext = createSelector(
  [selectInventory, selectApp],
  (inv, app) => inv.transfers.filter((t) => t.companyId === app.companyId && t.branchId === app.branchId)
);

export const selectTransfersForCompany = createSelector(
  [selectInventory, selectApp],
  (inv, app) => inv.transfers.filter((t) => t.companyId === app.companyId)
);

export const selectAdjustmentsInContext = createSelector(
  [selectInventory, selectApp],
  (inv, app) => inv.adjustments.filter((a) => a.companyId === app.companyId && a.branchId === app.branchId)
);

export const selectAdjustmentsForCompany = createSelector(
  [selectInventory, selectApp],
  (inv, app) => inv.adjustments.filter((a) => a.companyId === app.companyId)
);

/**
 * Stock overview: for each (product, warehouse) pair, compute on-hand.
 * Returns rows: [{ productId, warehouseId, onHand, product, warehouse }]
 * Only includes rows where onHand != 0 OR the product has any movement history.
 */
export const selectStockOverview = createSelector(
  [selectMovementsInContext, selectMasters, selectApp],
  (movements, masters, app) => {
    const warehouses = masters.warehouses.filter((w) => w.branchId === app.branchId);
    const productById = Object.fromEntries(masters.products.map((p) => [p.id, p]));
    const warehouseById = Object.fromEntries(masters.warehouses.map((w) => [w.id, w]));

    const key = (p, w) => `${p}::${w}`;
    const onHand = new Map();
    const lastMovement = new Map();

    for (const m of movements) {
      const k = key(m.productId, m.warehouseId);
      onHand.set(k, (onHand.get(k) || 0) + m.quantity);
      const prev = lastMovement.get(k);
      if (!prev || m.movementDate > prev) lastMovement.set(k, m.movementDate);
    }

    const rows = [];
    for (const w of warehouses) {
      for (const [k, qty] of onHand.entries()) {
        const [productId, warehouseId] = k.split('::');
        if (warehouseId !== w.id) continue;
        const product = productById[productId];
        if (!product) continue;
        rows.push({
          productId,
          warehouseId,
          product,
          warehouse: warehouseById[warehouseId],
          onHand: qty,
          lastMovementDate: lastMovement.get(k) || null,
          valuePaise: qty * (product.purchasePrice * 100),
        });
      }
    }

    // Also include products with no movements at all (onHand = 0) for completeness
    for (const p of masters.products) {
      for (const w of warehouses) {
        const k = key(p.id, w.id);
        if (!onHand.has(k)) {
          rows.push({
            productId: p.id,
            warehouseId: w.id,
            product: p,
            warehouse: w,
            onHand: 0,
            lastMovementDate: null,
            valuePaise: 0,
          });
        }
      }
    }

    return rows;
  }
);

/**
 * Aggregate on-hand per product across all warehouses in the current branch.
 */
export const selectStockByProduct = createSelector([selectStockOverview], (rows) => {
  const map = new Map();
  for (const r of rows) {
    const existing = map.get(r.productId);
    if (existing) {
      existing.onHand += r.onHand;
      existing.valuePaise += r.valuePaise;
      existing.warehouses.push({ warehouseId: r.warehouseId, warehouse: r.warehouse, onHand: r.onHand });
    } else {
      map.set(r.productId, {
        productId: r.productId,
        product: r.product,
        onHand: r.onHand,
        valuePaise: r.valuePaise,
        warehouses: [{ warehouseId: r.warehouseId, warehouse: r.warehouse, onHand: r.onHand }],
      });
    }
  }
  return Array.from(map.values());
});

/** Reorder alerts: products where aggregate on-hand < reorderLevel. */
export const selectReorderAlerts = createSelector([selectStockByProduct], (byProduct) => {
  return byProduct
    .filter((r) => r.product.reorderLevel != null && r.onHand < r.product.reorderLevel)
    .map((r) => ({ ...r, shortage: r.product.reorderLevel - r.onHand }));
});

/** Total inventory value. */
export const selectTotalInventoryValue = createSelector([selectStockOverview], (rows) =>
  rows.reduce((s, r) => s + r.valuePaise, 0)
);

/** Stock aging: bucket on-hand by age since last IN movement (FIFO approximation). */
export const selectStockAging = createSelector([selectMovementsInContext, selectMasters, selectApp], (movements, masters, app) => {
  const today = new Date();
  const productById = Object.fromEntries(masters.products.map((p) => [p.id, p]));
  const warehouses = masters.warehouses.filter((w) => w.branchId === app.branchId);

  // For each product × warehouse, compute on-hand and bucket by age of IN movements (FIFO)
  const result = [];
  for (const w of warehouses) {
    const productMovements = {};
    for (const m of movements) {
      if (m.warehouseId !== w.id) continue;
      if (!productMovements[m.productId]) productMovements[m.productId] = [];
      productMovements[m.productId].push(m);
    }

    for (const [productId, moves] of Object.entries(productMovements)) {
      const product = productById[productId];
      if (!product) continue;
      const sorted = [...moves].sort((a, b) => a.movementDate.localeCompare(b.movementDate));
      const totalOnHand = sorted.reduce((s, m) => s + m.quantity, 0);
      if (totalOnHand <= 0) continue;

      // FIFO consume
      const batches = [];
      for (const m of sorted) {
        if (m.quantity > 0) batches.push({ qty: m.quantity, date: m.movementDate, type: 'in' });
        else {
          let toConsume = -m.quantity;
          while (toConsume > 0 && batches.length) {
            const b = batches[0];
            const take = Math.min(toConsume, b.qty);
            b.qty -= take;
            toConsume -= take;
            if (b.qty === 0) batches.shift();
          }
        }
      }

      const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
      for (const b of batches) {
        if (b.qty <= 0) continue;
        const age = Math.floor((today - new Date(b.date)) / (1000 * 60 * 60 * 24));
        if (age <= 30) buckets['0-30'] += b.qty;
        else if (age <= 60) buckets['31-60'] += b.qty;
        else if (age <= 90) buckets['61-90'] += b.qty;
        else buckets['90+'] += b.qty;
      }

      result.push({ productId, product, warehouse: w, totalOnHand, buckets });
    }
  }
  return result;
});