export function encodeBase64(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return '[Error: input contains invalid characters]';
  }
}

export function decodeBase64(b64: string): string {
  try {
    return decodeURIComponent(escape(atob(b64.trim())));
  } catch {
    return '[Error: invalid Base64 string]';
  }
}
