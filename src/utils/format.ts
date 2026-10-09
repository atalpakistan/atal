/**
 * Global Currency and Formatting Helpers
 */

export const CURRENCY_CODE = 'PKR';
export const CURRENCY_PREFIX = 'PKR ';

export function formatPrice(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return `${CURRENCY_PREFIX}0`;
  }
  const numeric = Math.round(Number(amount));
  return `${CURRENCY_PREFIX}${numeric.toLocaleString('en-PK')}`;
}

export const STANDARD_SHIPPING_FEE = 290;
export const FREE_SHIPPING_THRESHOLD = 5000;
