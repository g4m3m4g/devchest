export const COMMON_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'BRL',
  'MXN', 'SGD', 'HKD', 'NZD', 'SEK', 'NOK', 'KRW', 'ZAR', 'THB', 'IDR',
];

export function convertCurrency(amount: number, rate: number): number {
  return amount * rate;
}

export async function fetchRates(base: string): Promise<Record<string, number>> {
  const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch exchange rates (status ${response.status})`);
  }
  const data = await response.json();
  return data.rates;
}
