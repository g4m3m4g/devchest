export interface XmlToJsonResult {
  output: string;
  error: string | null;
}

function elementToValue(el: Element): unknown {
  const attrs = Array.from(el.attributes);
  const childNodes = Array.from(el.childNodes);
  const childElements = childNodes.filter((n): n is Element => n.nodeType === Node.ELEMENT_NODE);
  const text = childNodes
    .filter(n => n.nodeType === Node.TEXT_NODE || n.nodeType === Node.CDATA_SECTION_NODE)
    .map(n => n.textContent ?? '')
    .join('')
    .trim();

  if (attrs.length === 0 && childElements.length === 0) {
    return text;
  }

  const obj: Record<string, unknown> = {};
  for (const attr of attrs) {
    obj[`@${attr.name}`] = attr.value;
  }

  for (const child of childElements) {
    const tag = child.tagName;
    const value = elementToValue(child);
    if (tag in obj) {
      const existing = obj[tag];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        obj[tag] = [existing, value];
      }
    } else {
      obj[tag] = value;
    }
  }

  if (text) {
    obj['#text'] = text;
  }

  return obj;
}

export function xmlToJson(xml: string, indent = 2): XmlToJsonResult {
  const input = xml.trim();
  if (!input) return { output: '', error: null };

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'application/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    const msg = parseError.textContent?.trim() ?? 'Invalid XML';
    return { output: '', error: msg };
  }

  const root = doc.documentElement;
  const result = { [root.tagName]: elementToValue(root) };

  return { output: JSON.stringify(result, null, indent), error: null };
}
