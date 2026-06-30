export type Delimiter = 'hyphen' | 'none' | 'braces' | 'brackets';

export function formatUuid(uuid: string, delimiter: Delimiter, uppercase: boolean): string {
  let formatted: string;
  switch (delimiter) {
    case 'none':
      formatted = uuid.replace(/-/g, '');
      break;
    case 'braces':
      formatted = `{${uuid}}`;
      break;
    case 'brackets':
      formatted = `(${uuid})`;
      break;
    default:
      formatted = uuid;
  }
  return uppercase ? formatted.toUpperCase() : formatted;
}

export const DELIMITER_OPTIONS: { value: Delimiter; label: string }[] = [
  { value: 'hyphen',   label: 'Standard' },
  { value: 'none',     label: 'No hyphens' },
  { value: 'braces',   label: 'Braces' },
  { value: 'brackets', label: 'Brackets' },
];
