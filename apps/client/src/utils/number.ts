/*
 * Need to ensure that all the following are not numbers
 * Number('') and Number(null) => 0
 * parseInt('50 + 5') => 50
 */

export const isNumber = (value?: string | number | undefined | null): boolean => {
  if (value === undefined || value === null || value === '') return false;
  const num = Number(value);
  return Number.isFinite(num) && !Number.isNaN(num);
};
