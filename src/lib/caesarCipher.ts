function normalizeShift(shift: number): number {
  return ((shift % 26) + 26) % 26;
}

export function caesarEncode(text: string, shift: number): string {
  const s = normalizeShift(shift);
  return text.replace(/[a-zA-Z]/g, char => {
    const base = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + s) % 26) + base);
  });
}

export function caesarDecode(text: string, shift: number): string {
  return caesarEncode(text, -shift);
}

export function rot13(text: string): string {
  return caesarEncode(text, 13);
}
