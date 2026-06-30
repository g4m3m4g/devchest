export function encodeUrl(text: string): string {
  try {
    return encodeURIComponent(text);
  } catch {
    return '[Error: could not encode input]';
  }
}

export function decodeUrl(encoded: string): string {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return '[Error: invalid encoded URL string]';
  }
}
