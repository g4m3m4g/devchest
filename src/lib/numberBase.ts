export type NumberBase = 2 | 8 | 10 | 16;

const BASE_PATTERNS: Record<NumberBase, RegExp> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
};

const BASE_PREFIX: Record<NumberBase, string> = {
  2: 'b',
  8: 'o',
  10: '',
  16: 'x',
};

function stripPrefix(value: string, base: NumberBase): string {
  const prefix = BASE_PREFIX[base];
  return prefix && /^0[bBoOxX]/.test(value) && value[1].toLowerCase() === prefix
    ? value.slice(2)
    : value;
}

function cleanNumberInput(value: string, base: NumberBase): string {
  return stripPrefix(value.trim().replace(/[\s_]/g, ''), base);
}

export function isValidForBase(value: string, base: NumberBase): boolean {
  const cleaned = cleanNumberInput(value, base);
  return cleaned.length > 0 && BASE_PATTERNS[base].test(cleaned);
}

export function parseInBase(value: string, base: NumberBase): bigint {
  const cleaned = cleanNumberInput(value, base);
  if (cleaned.length === 0 || !BASE_PATTERNS[base].test(cleaned)) {
    throw new Error(`"${value}" is not a valid base-${base} number`);
  }
  return BigInt(base === 10 ? cleaned : `0${BASE_PREFIX[base]}${cleaned}`);
}

export function formatInBase(value: bigint, base: NumberBase): string {
  return value.toString(base);
}

export interface AllBases {
  binary: string;
  octal: string;
  decimal: string;
  hex: string;
}

export function convertAll(value: string, fromBase: NumberBase): AllBases {
  const n = parseInBase(value, fromBase);
  return {
    binary: formatInBase(n, 2),
    octal: formatInBase(n, 8),
    decimal: formatInBase(n, 10),
    hex: formatInBase(n, 16),
  };
}
