export interface DockerfileIssue {
  line: number;
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
}

export interface DockerfileResult {
  output: string;
  issues: DockerfileIssue[];
  error: string | null;
}

type BlankNode = { type: 'blank'; lineNumber: number };
type CommentNode = { type: 'comment'; lineNumber: number; text: string };
type InstructionNode = {
  type: 'instruction';
  lineNumber: number;
  keyword: string;
  fullArgs: string;
  rawLines: string[];
};
type DockerfileNode = BlankNode | CommentNode | InstructionNode;

function parseNodes(input: string): DockerfileNode[] {
  const lines = input.split('\n');
  const nodes: DockerfileNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      nodes.push({ type: 'blank', lineNumber: lineNum });
      i++;
      continue;
    }

    if (trimmed.startsWith('#')) {
      nodes.push({ type: 'comment', lineNumber: lineNum, text: trimmed });
      i++;
      continue;
    }

    // Collect continuation lines
    const rawLines: string[] = [line];
    i++;
    let last = line;
    while (last.trimEnd().endsWith('\\') && i < lines.length) {
      last = lines[i];
      rawLines.push(last);
      i++;
    }

    // Extract keyword from first line
    const firstTrimmed = rawLines[0].trim();
    const kwMatch = firstTrimmed.match(/^(\S+)/);
    const rawKw = kwMatch ? kwMatch[1] : '';
    const keyword = rawKw.toUpperCase();

    // Build fullArgs by stripping keyword, joining continuation parts
    const argParts: string[] = [];
    for (let k = 0; k < rawLines.length; k++) {
      let part = rawLines[k].trim();
      if (k === 0) part = part.slice(rawKw.length).trim();
      if (part.endsWith('\\')) part = part.slice(0, -1).trim();
      if (part) argParts.push(part);
    }

    nodes.push({
      type: 'instruction',
      lineNumber: lineNum,
      keyword,
      fullArgs: argParts.join(' '),
      rawLines,
    });
  }

  return nodes;
}

function formatNodes(nodes: DockerfileNode[]): string {
  const out: string[] = [];
  let lastWasBlank = false;

  for (const node of nodes) {
    if (node.type === 'blank') {
      if (!lastWasBlank && out.length > 0) out.push('');
      lastWasBlank = true;
      continue;
    }
    lastWasBlank = false;

    if (node.type === 'comment') {
      out.push(node.text);
    } else {
      const [first, ...rest] = node.rawLines;
      // Uppercase the instruction keyword in the first line only
      const formatted = first.replace(/^\s*(\S+)/, (_, kw: string) => kw.toUpperCase());
      out.push(formatted.trimEnd());
      for (const l of rest) out.push(l.trimEnd());
    }
  }

  while (out.length > 0 && out[0] === '') out.shift();
  while (out.length > 0 && out[out.length - 1] === '') out.pop();

  return out.join('\n');
}

function parseImageRef(args: string): { image: string; tag: string | null; hasDigest: boolean } {
  // Strip --flag=value tokens
  let s = args.replace(/--[\w-]+=\S+\s*/g, '').trim();
  // Strip AS alias
  s = s.replace(/\s+AS\s+\S+$/i, '').trim();
  // First token is the image reference
  const ref = s.split(/\s+/)[0] ?? '';

  if (ref.includes('@')) {
    return { image: ref.split('@')[0], tag: null, hasDigest: true };
  }
  if (ref.includes(':')) {
    const idx = ref.lastIndexOf(':');
    return { image: ref.slice(0, idx), tag: ref.slice(idx + 1), hasDigest: false };
  }
  return { image: ref, tag: null, hasDigest: false };
}

function lintNodes(nodes: DockerfileNode[]): DockerfileIssue[] {
  const issues: DockerfileIssue[] = [];
  const instructions = nodes.filter((n): n is InstructionNode => n.type === 'instruction');

  const hasFrom = instructions.some(n => n.keyword === 'FROM');
  if (!hasFrom && instructions.length > 0) {
    issues.push({
      line: 1,
      severity: 'error',
      code: 'DF001',
      message: 'Dockerfile must begin with a FROM instruction',
    });
  }

  let hasUser = false;

  for (const { keyword, fullArgs, lineNumber: line } of instructions) {
    switch (keyword) {
      case 'FROM': {
        const { image, tag, hasDigest } = parseImageRef(fullArgs);
        if (image === 'scratch' || hasDigest) break;
        if (!tag || tag === 'latest') {
          issues.push({
            line,
            severity: 'warning',
            code: 'DL3006',
            message:
              tag === 'latest'
                ? `Avoid :latest — pin to a specific version (e.g. ${image}:1.0)`
                : `Always tag the version of an image explicitly (e.g. ${image}:<version>)`,
          });
        }
        break;
      }

      case 'MAINTAINER':
        issues.push({
          line,
          severity: 'error',
          code: 'DL4000',
          message: 'MAINTAINER is deprecated; use LABEL maintainer="..." instead',
        });
        break;

      case 'ADD':
        issues.push({
          line,
          severity: 'warning',
          code: 'DL3020',
          message: 'Use COPY instead of ADD unless you need URL fetching or archive extraction',
        });
        break;

      case 'WORKDIR':
        if (!fullArgs.startsWith('/') && !fullArgs.startsWith('$')) {
          issues.push({
            line,
            severity: 'warning',
            code: 'DL3000',
            message: 'Use an absolute WORKDIR path',
          });
        }
        break;

      case 'CMD':
      case 'ENTRYPOINT':
        if (!fullArgs.trimStart().startsWith('[')) {
          issues.push({
            line,
            severity: 'warning',
            code: 'DL3025',
            message: `Use JSON array syntax for ${keyword}: ["executable", "arg1"]`,
          });
        }
        break;

      case 'RUN': {
        const hasAptInstall = fullArgs.includes('apt-get install');
        const hasAptUpdate = fullArgs.includes('apt-get update');
        const hasY = fullArgs.includes(' -y') || fullArgs.includes('--yes');
        const hasListClean = fullArgs.includes('/var/lib/apt/lists');

        if (hasAptInstall && !hasY) {
          issues.push({
            line,
            severity: 'warning',
            code: 'DL3015',
            message: 'Add -y to apt-get install to avoid interactive prompts',
          });
        }
        if (hasAptUpdate && !hasAptInstall) {
          issues.push({
            line,
            severity: 'warning',
            code: 'DL3009',
            message:
              'Combine apt-get update and apt-get install in a single RUN to avoid stale cache layers',
          });
        }
        if (hasAptInstall && !hasListClean) {
          issues.push({
            line,
            severity: 'warning',
            code: 'DL3028',
            message: 'Clean up apt-get lists to reduce image size: && rm -rf /var/lib/apt/lists/*',
          });
        }
        break;
      }

      case 'USER':
        hasUser = true;
        if (fullArgs === 'root' || fullArgs === '0') {
          issues.push({
            line,
            severity: 'warning',
            code: 'DL3002',
            message: 'Avoid running the container as root',
          });
        }
        break;
    }
  }

  if (!hasUser && hasFrom) {
    const lastLine = instructions[instructions.length - 1]?.lineNumber ?? 1;
    issues.push({
      line: lastLine,
      severity: 'info',
      code: 'DL3002',
      message: 'No USER instruction — container will run as root by default',
    });
  }

  return issues.sort((a, b) => a.line - b.line);
}

export function processDockerfile(input: string): DockerfileResult {
  const trimmed = input.trim();
  if (!trimmed) return { output: '', issues: [], error: null };

  try {
    const nodes = parseNodes(trimmed);
    return { output: formatNodes(nodes), issues: lintNodes(nodes), error: null };
  } catch (e) {
    return { output: '', issues: [], error: (e as Error).message };
  }
}
