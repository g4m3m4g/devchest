export interface SlugOptions {
  separator?: string;
  lowercase?: boolean;
  maxLength?: number;
}

const DIACRITIC_MARKS_REGEX = new RegExp('[\\u0300-\\u036f]', 'g');

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function slugify(text: string, options: SlugOptions = {}): string {
  const { separator = '-', lowercase = true, maxLength } = options;

  let result = text.normalize('NFKD').replace(DIACRITIC_MARKS_REGEX, '');
  if (lowercase) result = result.toLowerCase();

  result = result.replace(/[^a-zA-Z0-9]+/g, separator);

  const escapedSep = escapeRegExp(separator);
  const edgeSepRegex = new RegExp(`^(?:${escapedSep})+|(?:${escapedSep})+$`, 'g');
  result = result.replace(edgeSepRegex, '');

  if (maxLength !== undefined && result.length > maxLength) {
    const trailingSepRegex = new RegExp(`(?:${escapedSep})+$`);
    result = result.slice(0, maxLength).replace(trailingSepRegex, '');
  }

  return result;
}
