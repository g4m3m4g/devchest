export type FloatPrecision = 'single' | 'double';

export interface FloatBreakdown {
  sign: string;
  exponentBits: string;
  mantissaBits: string;
  hex: string;
  biasedExponent: number;
  unbiasedExponent: number;
  reconstructedValue: number;
}

const SPEC = {
  single: { byteLength: 4, exponentBitsCount: 8, bias: 127 },
  double: { byteLength: 8, exponentBitsCount: 11, bias: 1023 },
} as const;

export function analyzeFloat(value: number, precision: FloatPrecision): FloatBreakdown {
  const { byteLength, exponentBitsCount, bias } = SPEC[precision];
  const buffer = new ArrayBuffer(byteLength);
  const view = new DataView(buffer);

  let hex: string;
  let reconstructedValue: number;

  if (precision === 'single') {
    view.setFloat32(0, value);
    hex = view.getUint32(0).toString(16).padStart(8, '0');
    reconstructedValue = view.getFloat32(0);
  } else {
    view.setFloat64(0, value);
    hex = view.getBigUint64(0).toString(16).padStart(16, '0');
    reconstructedValue = view.getFloat64(0);
  }

  let bitStr = '';
  for (let i = 0; i < byteLength; i++) {
    bitStr += view.getUint8(i).toString(2).padStart(8, '0');
  }

  const sign = bitStr[0];
  const exponentBits = bitStr.slice(1, 1 + exponentBitsCount);
  const mantissaBits = bitStr.slice(1 + exponentBitsCount);
  const biasedExponent = parseInt(exponentBits, 2);
  const unbiasedExponent = biasedExponent - bias;

  return { sign, exponentBits, mantissaBits, hex, biasedExponent, unbiasedExponent, reconstructedValue };
}
