export interface FindReplaceOptions {
  find: string;
  replace: string;
  useRegex: boolean;
  caseSensitive: boolean;
  global: boolean;
}

export interface FindReplaceResult {
  output: string;
  matchCount: number;
  error: string | null;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function findAndReplace(text: string, options: FindReplaceOptions): FindReplaceResult {
  const { find, replace, useRegex, caseSensitive, global } = options;

  if (find === '') {
    return { output: text, matchCount: 0, error: null };
  }

  const pattern = useRegex ? find : escapeRegExp(find);
  const flags = (global ? 'g' : '') + (caseSensitive ? '' : 'i');

  let countRegex: RegExp;
  let replaceRegex: RegExp;
  try {
    countRegex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    replaceRegex = new RegExp(pattern, flags);
  } catch (e) {
    return { output: text, matchCount: 0, error: (e as Error).message };
  }

  const matches = text.match(countRegex);
  const matchCount = global ? (matches?.length ?? 0) : matches && matches.length > 0 ? 1 : 0;
  const output = text.replace(replaceRegex, replace);

  return { output, matchCount, error: null };
}
