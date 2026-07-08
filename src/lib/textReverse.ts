export type ReverseMode = 'characters' | 'words' | 'lines';

export function reverseCharacters(text: string): string {
  return Array.from(text).reverse().join('');
}

export function reverseWords(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return trimmed.split(/\s+/).reverse().join(' ');
}

export function reverseLines(text: string): string {
  return text.split(/\r?\n/).reverse().join('\n');
}

export function reverseText(text: string, mode: ReverseMode): string {
  switch (mode) {
    case 'words':
      return reverseWords(text);
    case 'lines':
      return reverseLines(text);
    case 'characters':
    default:
      return reverseCharacters(text);
  }
}
