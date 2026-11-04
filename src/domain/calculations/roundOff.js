/**
 * Round document total to nearest rupee.
 * Returns { roundedPaise, roundOffPaise } where roundOff = rounded - original.
 * Positive roundOff = customer pays more; negative = pays less.
 */
export const roundToNearestRupee = (totalPaise) => {
  const rupees = totalPaise / 100;
  const roundedRupees = Math.round(rupees);
  const roundedPaise = roundedRupees * 100;
  return { roundedPaise, roundOffPaise: roundedPaise - totalPaise };
};