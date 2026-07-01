export interface NginxFormatOptions {
  indentSize: 2 | 4;
}

export interface NginxFormatResult {
  output: string;
  error: string | null;
}

type Token =
  | { type: 'word'; value: string }
  | { type: 'string'; value: string }
  | { type: 'comment'; value: string }
  | { type: 'semicolon' }
  | { type: 'open_brace' }
  | { type: 'close_brace' };

function tokenize(input: string): { tokens: Token[]; error: string | null } {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) { i++; continue; }

    if (ch === '#') {
      let j = i;
      while (j < input.length && input[j] !== '\n') j++;
      tokens.push({ type: 'comment', value: input.slice(i, j) });
      i = j;
      continue;
    }

    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < input.length && input[j] !== quote) {
        if (input[j] === '\\') j++;
        j++;
      }
      if (j >= input.length) {
        return { tokens: [], error: `Unterminated string starting at position ${i}` };
      }
      tokens.push({ type: 'string', value: input.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    if (ch === ';') { tokens.push({ type: 'semicolon' }); i++; continue; }
    if (ch === '{') { tokens.push({ type: 'open_brace' }); i++; continue; }
    if (ch === '}') { tokens.push({ type: 'close_brace' }); i++; continue; }

    let j = i;
    while (j < input.length && !/[\s;{}#"']/.test(input[j])) j++;
    tokens.push({ type: 'word', value: input.slice(i, j) });
    i = j;
  }

  return { tokens, error: null };
}

export function formatNginxConfig(input: string, options: NginxFormatOptions): NginxFormatResult {
  const trimmed = input.trim();
  if (!trimmed) return { output: '', error: null };

  const { tokens, error: tokenError } = tokenize(trimmed);
  if (tokenError) return { output: '', error: tokenError };

  const pad = ' '.repeat(options.indentSize);
  const lines: string[] = [];
  let depth = 0;
  let words: string[] = [];

  const ind = () => pad.repeat(depth);

  const flushPending = () => {
    if (words.length > 0) {
      lines.push(`${ind()}${words.join(' ')}`);
      words = [];
    }
  };

  for (const token of tokens) {
    switch (token.type) {
      case 'word':
      case 'string':
        words.push(token.value);
        break;

      case 'comment':
        flushPending();
        lines.push(`${ind()}${token.value}`);
        break;

      case 'semicolon':
        lines.push(`${ind()}${words.join(' ')};`);
        words = [];
        break;

      case 'open_brace':
        lines.push(words.length > 0 ? `${ind()}${words.join(' ')} {` : `${ind()}{`);
        words = [];
        depth++;
        break;

      case 'close_brace':
        flushPending();
        depth--;
        if (depth < 0) {
          return { output: '', error: 'Unexpected closing brace' };
        }
        lines.push(`${ind()}}`);
        break;
    }
  }

  flushPending();

  if (depth !== 0) {
    return { output: '', error: `Unclosed block: ${depth} unclosed brace${depth > 1 ? 's' : ''}` };
  }

  return { output: lines.join('\n'), error: null };
}
