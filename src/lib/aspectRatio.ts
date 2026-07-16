export interface Ratio {
  w: number;
  h: number;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function simplifyRatio(width: number, height: number): Ratio {
  if (width <= 0 || height <= 0) {
    throw new Error('Width and height must be positive numbers');
  }
  const divisor = gcd(Math.round(width), Math.round(height));
  return { w: width / divisor, h: height / divisor };
}

export function resolveHeight(width: number, ratioW: number, ratioH: number): number {
  if (ratioW <= 0) {
    throw new Error('Ratio width must be positive');
  }
  return (width * ratioH) / ratioW;
}

export function resolveWidth(height: number, ratioW: number, ratioH: number): number {
  if (ratioH <= 0) {
    throw new Error('Ratio height must be positive');
  }
  return (height * ratioW) / ratioH;
}
