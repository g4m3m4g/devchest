const NUMERALS: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

const VALUES: Record<string, number> = {
  I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
};

const STRICT_PATTERN = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

export function toRoman(num: number): string {
  if (!Number.isInteger(num) || num < 1 || num > 3999) {
    throw new Error('Value must be an integer between 1 and 3999');
  }
  let remaining = num;
  let result = '';
  for (const [value, symbol] of NUMERALS) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

export function fromRoman(roman: string): number {
  const normalized = roman.trim().toUpperCase();
  if (normalized === '' || !STRICT_PATTERN.test(normalized)) {
    throw new Error('Not a valid Roman numeral');
  }
  let total = 0;
  for (let i = 0; i < normalized.length; i++) {
    const current = VALUES[normalized[i]];
    const next = VALUES[normalized[i + 1]];
    total += next && current < next ? -current : current;
  }
  return total;
}
