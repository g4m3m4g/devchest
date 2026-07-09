function convertChildren(node: Node): string {
  let result = '';
  for (const child of Array.from(node.childNodes)) {
    result += convertNode(child);
  }
  return result;
}

function convertList(node: Element, ordered: boolean): string {
  const items = Array.from(node.children).filter(el => el.tagName === 'LI');
  return items
    .map((li, i) => `${ordered ? `${i + 1}.` : '-'} ${convertChildren(li).trim()}`)
    .join('\n');
}

function convertNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const inner = () => convertChildren(el);

  switch (tag) {
    case 'h1': return `# ${inner().trim()}`;
    case 'h2': return `## ${inner().trim()}`;
    case 'h3': return `### ${inner().trim()}`;
    case 'h4': return `#### ${inner().trim()}`;
    case 'h5': return `##### ${inner().trim()}`;
    case 'h6': return `###### ${inner().trim()}`;
    case 'p': return inner().trim();
    case 'strong':
    case 'b': return `**${inner()}**`;
    case 'em':
    case 'i': return `_${inner()}_`;
    case 'a': {
      const href = el.getAttribute('href') ?? '';
      return `[${inner()}](${href})`;
    }
    case 'img': {
      const src = el.getAttribute('src') ?? '';
      const alt = el.getAttribute('alt') ?? '';
      return `![${alt}](${src})`;
    }
    case 'pre': {
      const code = el.querySelector('code');
      const content = code ? code.textContent ?? '' : el.textContent ?? '';
      return `\`\`\`\n${content}\n\`\`\``;
    }
    case 'code': return `\`${inner()}\``;
    case 'ul': return convertList(el, false);
    case 'ol': return convertList(el, true);
    case 'blockquote': return `> ${inner().trim()}`;
    case 'br': return '\n';
    case 'hr': return '---';
    default: return inner();
  }
}

const BLOCK_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'UL', 'OL', 'BLOCKQUOTE', 'PRE', 'HR']);

export function convertHtmlToMarkdown(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return '';

  const doc = new DOMParser().parseFromString(trimmed, 'text/html');
  const blocks = Array.from(doc.body.childNodes)
    .map(node => {
      if (node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has((node as Element).tagName)) {
        return convertNode(node);
      }
      return convertNode(node);
    })
    .map(text => text.trim())
    .filter(text => text !== '');

  return blocks.join('\n\n');
}
