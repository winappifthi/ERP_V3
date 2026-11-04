import { calculateLine } from './lineCalculator';
import { allocateHeaderDiscount } from './discountCalculator';
import { roundToNearestRupee } from './roundOff';
import { safeNumber } from './money';


export const calculateDocument = (doc) => {
  const rawLines = doc.lines || [];

  // 1. First pass: compute lines WITHOUT header discount to get taxable subtotal
  const firstPass = rawLines.map((l) => calculateLine({ ...l, headerDiscountAllocationPaise: 0 }));
  const taxableSubtotal = firstPass.reduce((s, l) => s + l.taxablePaise, 0);

  // 2. Resolve header discount amount (percent or flat)
  let headerDiscountPaise = Math.round(safeNumber(doc.headerDiscountRupees, 0) * 100);
  if (doc.headerDiscountPercentMode) {
    const pct = safeNumber(doc.headerDiscountPercent, 0);
    headerDiscountPaise = Math.round((taxableSubtotal * pct) / 100);
  }

  // 3. Allocate proportionally across taxable amounts
  const allocations = allocateHeaderDiscount(
    firstPass.map((l) => l.taxablePaise),
    headerDiscountPaise
  );

  // 4. Recompute final lines with allocation
  const lines = rawLines.map((l, i) =>
    calculateLine({ ...l, headerDiscountAllocationPaise: allocations[i] })
  );

  // 5. Aggregate
  const grossSubtotal = lines.reduce((s, l) => s + l.grossPaise, 0);
  const totalLineDiscounts = lines.reduce((s, l) => s + l.discountPaise, 0);
  const totalHeaderDiscount = allocations.reduce((s, a) => s + a, 0);
  const taxableValue = lines.reduce((s, l) => s + l.taxablePaise, 0);
  const cgst = lines.reduce((s, l) => s + l.cgstPaise, 0);
  const sgst = lines.reduce((s, l) => s + l.sgstPaise, 0);
  const igst = lines.reduce((s, l) => s + l.igstPaise, 0);
  const lineCharges = lines.reduce((s, l) => s + l.additionalChargesPaise, 0);

  const freight = Math.round(safeNumber(doc.charges?.freightRupees, 0) * 100);
  const packing = Math.round(safeNumber(doc.charges?.packingRupees, 0) * 100);
  const other = Math.round(safeNumber(doc.charges?.otherRupees, 0) * 100);
  const totalCharges = freight + packing + other + lineCharges;

  const preRoundTotal = taxableValue + cgst + sgst + igst + totalCharges;

  let finalTotal = preRoundTotal;
  let roundOff = 0;
  if (doc.applyRoundOff) {
    const { roundedPaise, roundOffPaise } = roundToNearestRupee(preRoundTotal);
    finalTotal = roundedPaise;
    roundOff = roundOffPaise;
  }

  const advance = Math.round(safeNumber(doc.advancePaidRupees, 0) * 100);
  const outstanding = finalTotal - advance;

  return {
    lines,
    totals: {
      grossSubtotalPaise: grossSubtotal,
      totalLineDiscountsPaise: totalLineDiscounts,
      totalHeaderDiscountPaise: totalHeaderDiscount,
      taxableValuePaise: taxableValue,
      cgstPaise: cgst,
      sgstPaise: sgst,
      igstPaise: igst,
      totalTaxPaise: cgst + sgst + igst,
      freightPaise: freight,
      packingPaise: packing,
      otherChargesPaise: other,
      lineChargesPaise: lineCharges,
      totalChargesPaise: totalCharges,
      preRoundTotalPaise: preRoundTotal,
      roundOffPaise: roundOff,
      finalTotalPaise: finalTotal,
      advancePaidPaise: advance,
      outstandingPaise: outstanding,
    },
  };
};