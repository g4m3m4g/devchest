import { marked } from 'marked';
import DOMPurify from 'dompurify';
import * as prettier from 'prettier';
import parserMarkdown from 'prettier/plugins/markdown';

export interface MarkdownRenderResult {
  html: string;
  error: string | null;
}

export interface MarkdownFormatResult {
  output: string;
  error: string | null;
}

export function renderMarkdown(md: string): MarkdownRenderResult {
  const input = md.trim();
  if (!input) return { html: '', error: null };
  try {
    const raw = marked.parse(input) as string;
    const html = DOMPurify.sanitize(raw);
    return { html, error: null };
  } catch (e) {
    return { html: '', error: (e as Error).message };
  }
}

export async function formatMarkdown(md: string): Promise<MarkdownFormatResult> {
  const input = md.trim();
  if (!input) return { output: '', error: null };
  try {
    const output = await prettier.format(input, {
      parser: 'markdown',
      plugins: [parserMarkdown],
      proseWrap: 'always',
    });
    return { output: output.trim(), error: null };
  } catch (e) {
    return { output: '', error: (e as Error).message };
  }
}
