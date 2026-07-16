import { describe, it, expect, vi, afterEach } from 'vitest';
import { convertCurrency, fetchRates, COMMON_CURRENCIES } from '../../lib/currencyConverter';

describe('convertCurrency', () => {
  it('multiplies amount by rate', () => {
    expect(convertCurrency(10, 1.5)).toBe(15);
  });

  it('returns 0 for a 0 amount', () => {
    expect(convertCurrency(0, 1.5)).toBe(0);
  });

  it('handles a rate below 1', () => {
    expect(convertCurrency(100, 0.85)).toBeCloseTo(85);
  });
});

describe('COMMON_CURRENCIES', () => {
  it('includes USD, EUR, GBP, and JPY', () => {
    expect(COMMON_CURRENCIES).toEqual(expect.arrayContaining(['USD', 'EUR', 'GBP', 'JPY']));
  });
});

describe('fetchRates', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the rates object from a successful response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ rates: { EUR: 0.9, GBP: 0.8 } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const rates = await fetchRates('USD');
    expect(rates).toEqual({ EUR: 0.9, GBP: 0.8 });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('USD'));
  });

  it('throws when the response is not ok', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', mockFetch);

    await expect(fetchRates('USD')).rejects.toThrow();
  });

  it('propagates network errors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network down'));
    vi.stubGlobal('fetch', mockFetch);

    await expect(fetchRates('USD')).rejects.toThrow('Network down');
  });
});
