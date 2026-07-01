export interface XmlResult {
  output: string;
  error: string | null;
}

function serializeNode(node: Node, depth: number, indent: string): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim() ?? '';
    return text ? indent.repeat(depth) + text + '\n' : '';
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return indent.repeat(depth) + `<!--${node.textContent}-->` + '\n';
  }

  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    const pi = node as ProcessingInstruction;
    const data = pi.data ? ` ${pi.data}` : '';
    return indent.repeat(depth) + `<?${pi.target}${data}?>` + '\n';
  }

  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return indent.repeat(depth) + `<![CDATA[${node.textContent}]]>` + '\n';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as Element;
  const attrs = Array.from(el.attributes)
    .map(a => ` ${a.name}="${a.value}"`)
    .join('');
  const tag = el.tagName;
  const children = Array.from(el.childNodes);

  if (children.length === 0) {
    return indent.repeat(depth) + `<${tag}${attrs}/>` + '\n';
  }

  const allText = children.every(c => c.nodeType === Node.TEXT_NODE);
  if (allText) {
    const text = el.textContent?.trim() ?? '';
    return indent.repeat(depth) + `<${tag}${attrs}>${text}</${tag}>` + '\n';
  }

  let out = indent.repeat(depth) + `<${tag}${attrs}>` + '\n';
  for (const child of children) {
    out += serializeNode(child, depth + 1, indent);
  }
  out += indent.repeat(depth) + `</${tag}>` + '\n';
  return out;
}

export function formatXml(xml: string, indentSize = 2): XmlResult {
  const input = xml.trim();
  if (!input) return { output: '', error: null };

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'application/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    const msg = parseError.textContent?.trim() ?? 'Invalid XML';
    return { output: '', error: msg };
  }

  const indent = ' '.repeat(indentSize);
  let out = '';

  for (const child of Array.from(doc.childNodes)) {
    out += serializeNode(child, 0, indent);
  }

  return { output: out.trim(), error: null };
}
