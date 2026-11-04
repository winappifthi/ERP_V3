import { applyPercent } from './money';

/**
 * Determine GST split from a place-of-supply decision.
 * @param {object} params
 * @param {string} params.taxTreatment 'intra' | 'inter' | 'exempt' | 'nil'
 * @param {number} params.rate total GST rate in percent (e.g. 18)
 * @param {number} params.taxablePaise base amount (paise)
 * @returns {{ cgst:number, sgst:number, igst:number, totalTax:number }}
 */
export const computeGst = ({ taxTreatment, rate = 0, taxablePaise = 0 }) => {
  if (taxTreatment === 'exempt' || taxTreatment === 'nil' || rate === 0) {
    return { cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
  }
  const totalTax = applyPercent(taxablePaise, rate);
  if (taxTreatment === 'inter') {
    return { cgst: 0, sgst: 0, igst: totalTax, totalTax };
  }
  // intra: split into equal halves; give any odd paisa to CGST
  const cgst = Math.floor(totalTax / 2);
  const sgst = totalTax - cgst;
  return { cgst, sgst, igst: 0, totalTax };
};

/**
 * Extract tax from a tax-INCLUSIVE price.
 * taxable = inclusive / (1 + rate/100)
 */
export const extractTaxFromInclusive = ({ inclusivePaise, rate = 0, taxTreatment = 'intra' }) => {
  if (!rate) return { taxablePaise: inclusivePaise, ...computeGst({ taxTreatment, rate: 0, taxablePaise: 0 }) };
  const divisor = 1 + rate / 100;
  const taxablePaise = Math.round(inclusivePaise / divisor);
  const taxPaise = inclusivePaise - taxablePaise;
  if (taxTreatment === 'inter') {
    return { taxablePaise, cgst: 0, sgst: 0, igst: taxPaise, totalTax: taxPaise };
  }
  const cgst = Math.floor(taxPaise / 2);
  const sgst = taxPaise - cgst;
  return { taxablePaise, cgst, sgst, igst: 0, totalTax: taxPaise };
};