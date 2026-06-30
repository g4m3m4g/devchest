export function minifyHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')       // strip HTML comments
    .replace(/\s*\n\s*/g, ' ')             // collapse newlines
    .replace(/\s{2,}/g, ' ')              // collapse runs of spaces
    .replace(/>\s+</g, '><')              // whitespace between tags
    .replace(/\s+>/g, '>')               // trailing space before >
    .replace(/<\s+/g, '<')              // leading space after <
    .trim();
}

export function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')         // strip CSS comments
    .replace(/\s*\n\s*/g, '')                  // collapse newlines
    .replace(/\s{2,}/g, ' ')                   // collapse spaces
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')     // spaces around punctuation
    .replace(/;}/g, '}')                       // trailing semicolons before }
    .trim();
}

export interface MinifySavings {
  original: number;
  compressed: number;
  pct: number;
}

export function calcSavings(original: string, minified: string): MinifySavings {
  const o = original.length;
  const c = minified.length;
  return { original: o, compressed: c, pct: o > 0 ? Math.round((1 - c / o) * 100) : 0 };
}
