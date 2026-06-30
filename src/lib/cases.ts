export function tokenize(str: string): string[] {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[\s_\-./\\]+/)
    .filter(Boolean)
    .map(w => w.toLowerCase());
}

export function toCamelCase(str: string): string {
  const w = tokenize(str);
  if (w.length === 0) return '';
  return w[0] + w.slice(1).map(x => x[0].toUpperCase() + x.slice(1)).join('');
}

export function toPascalCase(str: string): string {
  return tokenize(str).map(w => w[0].toUpperCase() + w.slice(1)).join('');
}

export function toSnakeCase(str: string): string {
  return tokenize(str).join('_');
}

export function toScreamingSnakeCase(str: string): string {
  return tokenize(str).join('_').toUpperCase();
}

export function toKebabCase(str: string): string {
  return tokenize(str).join('-');
}

export function toTitleCase(str: string): string {
  return tokenize(str).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

export interface Conversion {
  id: string;
  label: string;
  sample: string;
  convert: (s: string) => string;
}

export const CONVERSIONS: Conversion[] = [
  { id: 'camel',     label: 'camelCase',       sample: 'helloWorld',   convert: toCamelCase },
  { id: 'pascal',    label: 'PascalCase',       sample: 'HelloWorld',   convert: toPascalCase },
  { id: 'snake',     label: 'snake_case',       sample: 'hello_world',  convert: toSnakeCase },
  { id: 'screaming', label: 'SCREAMING_SNAKE',  sample: 'HELLO_WORLD',  convert: toScreamingSnakeCase },
  { id: 'kebab',     label: 'kebab-case',       sample: 'hello-world',  convert: toKebabCase },
  { id: 'title',     label: 'Title Case',       sample: 'Hello World',  convert: toTitleCase },
  { id: 'upper',     label: 'UPPERCASE',         sample: 'HELLO WORLD',  convert: (s) => s.toUpperCase() },
  { id: 'lower',     label: 'lowercase',         sample: 'hello world',  convert: (s) => s.toLowerCase() },
];
