export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const normalized = hex.trim().replace(/^#/, '');
  let expanded: string;
  if (/^[0-9a-fA-F]{3}$/.test(normalized)) {
    expanded = normalized.split('').map(c => c + c).join('');
  } else if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    expanded = normalized;
  } else {
    throw new Error('Invalid hex color — use #rgb or #rrggbb');
  }
  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  };
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (c: number) => Math.round(c).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function mixColors(a: RGB, b: RGB, ratio: number): RGB {
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const t = clamp(ratio);
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

export function relativeLuminance(rgb: RGB): number {
  const channel = (c: number) => {
    const normalized = c / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function contrastRatio(a: RGB, b: RGB): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function wcagLevel(ratio: number, isLargeText: boolean): { aa: boolean; aaa: boolean } {
  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;
  return { aa: ratio >= aaThreshold, aaa: ratio >= aaaThreshold };
}
