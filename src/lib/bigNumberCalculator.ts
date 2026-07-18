export type BigNumberOp = 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE' | 'MODULO' | 'POWER';

export const BIG_NUMBER_OPS: BigNumberOp[] = ['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE', 'MODULO', 'POWER'];

export function bigNumberOp(a: bigint, b: bigint, op: BigNumberOp): bigint {
  switch (op) {
    case 'ADD': return a + b;
    case 'SUBTRACT': return a - b;
    case 'MULTIPLY': return a * b;
    case 'DIVIDE':
      if (b === 0n) throw new Error('Cannot divide by zero');
      return a / b;
    case 'MODULO':
      if (b === 0n) throw new Error('Cannot compute modulo by zero');
      return a % b;
    case 'POWER':
      if (b < 0n) throw new Error('Exponent must be non-negative');
      return a ** b;
  }
}
