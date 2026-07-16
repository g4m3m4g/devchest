export type BitwiseOp = 'AND' | 'OR' | 'XOR' | 'NOT' | 'LSHIFT' | 'RSHIFT';

export const BITWISE_OPS: BitwiseOp[] = ['AND', 'OR', 'XOR', 'NOT', 'LSHIFT', 'RSHIFT'];

export function bitwiseOp(a: bigint, b: bigint, op: BitwiseOp): bigint {
  switch (op) {
    case 'AND': return a & b;
    case 'OR': return a | b;
    case 'XOR': return a ^ b;
    case 'NOT': return ~a;
    case 'LSHIFT':
    case 'RSHIFT':
      if (b < 0n) {
        throw new Error('Shift amount must be non-negative');
      }
      return op === 'LSHIFT' ? a << b : a >> b;
  }
}

export function toBinaryString(value: bigint, minBits = 0): string {
  const bits = (value < 0n ? -value : value).toString(2);
  return bits.padStart(minBits, '0');
}
