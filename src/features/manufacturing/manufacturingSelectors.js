import { createSelector } from '@reduxjs/toolkit';
import { computeOnHand } from '../inventory/inventorySlice';
import { selectStockByProduct } from '../inventory/inventorySelectors';

const selectMfg = (s) => s.manufacturing;
const selectInv = (s) => s.inventory;
const selectMasters = (s) => s.masters;
const selectApp = (s) => s.app;

export const selectBomsInContext = createSelector([selectMfg, selectApp], (m, app) =>
  m.boms.filter((b) => b.companyId === app.companyId)
);

export const selectBomById = (id) => createSelector([selectMfg], (m) => m.boms.find((b) => b.id === id) || null);

export const selectWorkCentersInContext = createSelector([selectMfg, selectApp], (m, app) =>
  m.workCenters.filter((w) => w.companyId === app.companyId)
);

export const selectProductionOrdersInContext = createSelector([selectMfg, selectApp], (m, app) =>
  m.productionOrders.filter((o) => o.companyId === app.companyId && o.branchId === app.branchId)
);

export const selectProductionOrdersForCompany = createSelector([selectMfg, selectApp], (m, app) =>
  m.productionOrders.filter((o) => o.companyId === app.companyId)
);

export const selectProductionOrderById = (id) => createSelector([selectMfg], (m) =>
  m.productionOrders.find((o) => o.id === id) || null
);

/**
 * Enriched production order: computes planned vs issued vs completed,
 * cost analysis, WIP value, and material requirement breakdown.
 *
 * Planned cost = sum(BOM line qty × (1 + scrap%) × product.purchasePrice)
 *              + BOM.laborCostPerUnit + BOM.overheadCostPerUnit — scaled by planned qty.
 * Actual material cost = sum of posted material issue qty × product.purchasePrice.
 * WIP value = actual material cost − cost of finished units + labor/overhead amortised.
 */
export const selectProductionOrderEnriched = (id) =>
  createSelector(
    [selectMfg, selectInv, selectMasters],
    (mfg, inv, masters) => {
      const order = mfg.productionOrders.find((o) => o.id === id);
      if (!order) return null;
      const bom = mfg.boms.find((b) => b.id === order.bomId);
      const productById = Object.fromEntries(masters.products.map((p) => [p.id, p]));

      // Planned material requirement (for planned qty)
      const plannedRequirements = (bom?.lines || []).map((l) => {
        const perUnit = l.quantity * (1 + (l.scrapPercent || 0) / 100);
        const totalRequired = perUnit * order.plannedQuantity * (1 + (bom?.scrapPercent || 0) / 100);
        return {
          productId: l.productId,
          product: productById[l.productId],
          perUnit,
          totalRequired,
        };
      });

      // Planned cost
      let plannedMaterialCostPaise = 0;
      for (const r of plannedRequirements) {
        plannedMaterialCostPaise += Math.round(r.totalRequired * (r.product?.purchasePrice || 0) * 100);
      }
      const laborCostPaise = Math.round((bom?.laborCostPerUnit || 0) * order.plannedQuantity * 100);
      const overheadCostPaise = Math.round((bom?.overheadCostPerUnit || 0) * order.plannedQuantity * 100);
      const totalPlannedCostPaise = plannedMaterialCostPaise + laborCostPaise + overheadCostPaise;

      // Actual issued
      const issuedByProduct = {};
      for (const issue of order.materialIssues || []) {
        if (issue.status !== 'posted') continue;
        for (const line of issue.lines || []) {
          issuedByProduct[line.productId] = (issuedByProduct[line.productId] || 0) + line.quantity;
        }
      }

      let actualMaterialCostPaise = 0;
      for (const [productId, qty] of Object.entries(issuedByProduct)) {
        const p = productById[productId];
        if (p) actualMaterialCostPaise += Math.round(qty * p.purchasePrice * 100);
      }

      // Completed: units produced. Cost per unit = actualMaterialCost / plannedQty for now.
      const completedQty = order.completedQuantity || 0;
      const unitCost = order.plannedQuantity > 0 ? actualMaterialCostPaise / order.plannedQuantity : 0;
      const costOfProduced = Math.round(unitCost * completedQty);
      const wipValuePaise = Math.max(0, actualMaterialCostPaise - costOfProduced);

      // Progress
      const progressPercent = order.plannedQuantity > 0 ? Math.min(100, Math.round((completedQty / order.plannedQuantity) * 100)) : 0;

      return {
        order,
        bom,
        product: productById[order.outputProductId],
        plannedRequirements,
        issuedByProduct,
        plannedMaterialCostPaise,
        laborCostPaise,
        overheadCostPaise,
        totalPlannedCostPaise,
        actualMaterialCostPaise,
        costOfProducedPaise: costOfProduced,
        wipValuePaise,
        progressPercent,
      };
    }
  );

/**
 * Material Requirement Planning: for a given BOM and quantity, check
 * availability of each raw material against current stock.
 */
export const selectMrpPreview = (bomId, quantity, warehouseId) =>
  createSelector(
    [selectMfg, selectInv, selectMasters],
    (mfg, inv, masters) => {
      const bom = mfg.boms.find((b) => b.id === bomId);
      if (!bom) return null;
      const productById = Object.fromEntries(masters.products.map((p) => [p.id, p]));

      return bom.lines.map((l) => {
        const perUnit = l.quantity * (1 + (l.scrapPercent || 0) / 100);
        const required = perUnit * quantity * (1 + (bom.scrapPercent || 0) / 100);
        const available = computeOnHand(inv.movements, { productId: l.productId, warehouseId });
        const product = productById[l.productId];
        return {
          productId: l.productId,
          product,
          required: Math.ceil(required * 100) / 100,
          available,
          shortfall: Math.max(0, required - available),
          sufficient: available >= required,
          estimatedCostPaise: Math.round(required * (product?.purchasePrice || 0) * 100),
        };
      });
    }
  );

/** Production efficiency across completed orders. */
export const selectProductionEfficiency = createSelector([selectMfg], (mfg) => {
  const rows = mfg.productionOrders
    .filter((o) => o.status === 'completed' || o.completedQuantity > 0)
    .map((o) => {
      const plannedQty = o.plannedQuantity;
      const completedQty = o.completedQuantity || 0;
      const efficiency = plannedQty > 0 ? Math.round((completedQty / plannedQty) * 100) : 0;
      return { order: o, plannedQty, completedQty, efficiency };
    });
  return rows;
});