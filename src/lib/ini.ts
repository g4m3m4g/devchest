export interface IniFormatOptions {
  separator: '=' | ':';
  sortSections: boolean;
  sortKeys: boolean;
}

export interface IniFormatResult {
  output: string;
  error: string | null;
}

type IniItem = {
  comments: string[];
  key: string;
  value: string;
};

type IniSection = {
  leadingComments: string[];
  name: string | null;
  items: IniItem[];
};

function parseIni(input: string): { sections: IniSection[]; error: string | null } {
  const global: IniSection = { leadingComments: [], name: null, items: [] };
  const sections: IniSection[] = [global];
  let current = global;
  let pendingComments: string[] = [];

  for (const rawLine of input.split('\n')) {
    const line = rawLine.trim();

    if (line === '') continue;

    if (line.startsWith(';') || line.startsWith('#')) {
      pendingComments.push(line);
      continue;
    }

    if (line.startsWith('[')) {
      if (!line.endsWith(']')) {
        return { sections: [], error: `Unclosed section bracket: "${line}"` };
      }
      const name = line.slice(1, -1).trim();
      if (!name) {
        return { sections: [], error: 'Empty section name' };
      }
      current = { leadingComments: pendingComments, name, items: [] };
      pendingComments = [];
      sections.push(current);
      continue;
    }

    const eqIdx = line.indexOf('=');
    const colIdx = line.indexOf(':');

    let sepIdx: number;
    if (eqIdx === -1 && colIdx === -1) {
      current.items.push({ comments: pendingComments, key: line, value: '' });
      pendingComments = [];
      continue;
    } else if (eqIdx === -1) {
      sepIdx = colIdx;
    } else if (colIdx === -1) {
      sepIdx = eqIdx;
    } else {
      sepIdx = Math.min(eqIdx, colIdx);
    }

    current.items.push({
      comments: pendingComments,
      key: line.slice(0, sepIdx).trim(),
      value: line.slice(sepIdx + 1).trim(),
    });
    pendingComments = [];
  }

  // Flush trailing comments into a comment-only item on the last section
  if (pendingComments.length > 0) {
    current.items.push({ comments: pendingComments, key: '', value: '' });
  }

  return { sections, error: null };
}

function serializeItem(item: IniItem, sep: '=' | ':'): string[] {
  const lines = item.comments.slice();
  if (item.key) {
    if (sep === '=') {
      lines.push(item.value !== '' ? `${item.key} = ${item.value}` : `${item.key} =`);
    } else {
      lines.push(item.value !== '' ? `${item.key}: ${item.value}` : `${item.key}:`);
    }
  }
  return lines;
}

function serializeSection(section: IniSection, options: IniFormatOptions): string {
  const lines: string[] = [];

  for (const c of section.leadingComments) lines.push(c);
  if (section.name !== null) lines.push(`[${section.name}]`);

  const items = options.sortKeys
    ? [...section.items].sort((a, b) => a.key.localeCompare(b.key))
    : section.items;

  for (const item of items) {
    lines.push(...serializeItem(item, options.separator));
  }

  return lines.join('\n');
}

export function formatIni(input: string, options: IniFormatOptions): IniFormatResult {
  const trimmed = input.trim();
  if (!trimmed) return { output: '', error: null };

  const { sections, error } = parseIni(trimmed);
  if (error) return { output: '', error };

  let ordered = sections;
  if (options.sortSections) {
    const globals = sections.filter(s => s.name === null);
    const named = sections
      .filter(s => s.name !== null)
      .sort((a, b) => a.name!.localeCompare(b.name!));
    ordered = [...globals, ...named];
  }

  const blocks = ordered
    .filter(
      s =>
        s.name !== null ||
        s.items.length > 0 ||
        s.leadingComments.length > 0,
    )
    .map(s => serializeSection(s, options));

  return { output: blocks.join('\n\n'), error: null };
}
