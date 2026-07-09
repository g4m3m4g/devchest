import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HtmlToMarkdownTool from '../../components/tools/text/HtmlToMarkdownTool';

describe('HtmlToMarkdownTool', () => {
  it('renders the tool title', () => {
    render(<HtmlToMarkdownTool />);
    expect(screen.getByText('HTML to Markdown Converter')).toBeInTheDocument();
  });

  it('converts HTML headings and bold text to markdown', () => {
    render(<HtmlToMarkdownTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste HTML/), {
      target: { value: '<h1>Title</h1><p><strong>bold</strong></p>' },
    });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('# Title\n\n**bold**');
  });

  it('converts links to markdown syntax', () => {
    render(<HtmlToMarkdownTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste HTML/), {
      target: { value: '<a href="https://example.com">text</a>' },
    });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('[text](https://example.com)');
  });

  it('clears input on Clear click', () => {
    render(<HtmlToMarkdownTool />);
    const textarea = screen.getByPlaceholderText(/Paste HTML/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '<p>hi</p>' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
