import { applyPercent, safeNumber } from './money';
import { lineDiscount } from './discountCalculator';
import { computeGst, extractTaxFromInclusive } from './taxCalculator';


export const calculateLine = (line) => {
  const qty = safeNumber(line.quantity, 0);
  const unitPricePaise = Math.round(safeNumber(line.unitPriceRupees, 0) * 100);
  const grossPaise = Math.round(qty * unitPricePaise);

  let taxablePaise;
  let grossTaxBreakdown;

  if (line.taxInclusive) {
    const extracted = extractTaxFromInclusive({
      inclusivePaise: grossPaise,
      rate: safeNumber(line.taxRatePercent, 0),
      taxTreatment: line.taxTreatment || 'intra',
    });
    taxablePaise = extracted.taxablePaise;
    grossTaxBreakdown = { cgst: extracted.cgst, sgst: extracted.sgst, igst: extracted.igst };
  } else {
    taxablePaise = grossPaise;
    grossTaxBreakdown = null;
  }

  const discountPaise = lineDiscount({
    grossPaise: taxablePaise,
    discountPercent: line.discountPercent,
    discountAmountPaise: Math.round(safeNumber(line.discountAmountRupees, 0) * 100),
    maxDiscountPercent: safeNumber(line.maxDiscountPercent, 100),
  });

  const headerAlloc = safeNumber(line.headerDiscountAllocationPaise, 0);
  const taxableAfterDiscounts = Math.max(0, taxablePaise - discountPaise - headerAlloc);

  let taxBreakdown;
  if (line.taxInclusive) {
    // Recompute tax on discounted taxable amount using the rate
    const recomputed = computeGst({
      taxTreatment: line.taxTreatment || 'intra',
      rate: safeNumber(line.taxRatePercent, 0),
      taxablePaise: taxableAfterDiscounts,
    });
    taxBreakdown = recomputed;
  } else {
    taxBreakdown = computeGst({
      taxTreatment: line.taxTreatment || 'intra',
      rate: safeNumber(line.taxRatePercent, 0),
      taxablePaise: taxableAfterDiscounts,
    });
  }

  const charges = safeNumber(line.additionalChargesPaise, 0);
  const lineTotal = taxableAfterDiscounts + taxBreakdown.totalTax + charges;

  return {
    quantity: qty,
    unitPricePaise,
    grossPaise,
    discountPaise,
    headerDiscountAllocationPaise: headerAlloc,
    taxablePaise: taxableAfterDiscounts,
    cgstPaise: taxBreakdown.cgst,
    sgstPaise: taxBreakdown.sgst,
    igstPaise: taxBreakdown.igst,
    totalTaxPaise: taxBreakdown.totalTax,
    additionalChargesPaise: charges,
    lineTotalPaise: lineTotal,
    // Reverse-inclusive tax breakdown (informational for print)
    inclusiveTaxBreakdown: grossTaxBreakdown,
  };
};