import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MarkdownToHtmlTool from '../../components/tools/text/MarkdownToHtmlTool';

describe('MarkdownToHtmlTool', () => {
  it('renders the tool title', () => {
    render(<MarkdownToHtmlTool />);
    expect(screen.getByText('Markdown to HTML Converter')).toBeInTheDocument();
  });

  it('converts markdown headings and bold text to HTML', () => {
    render(<MarkdownToHtmlTool />);
    fireEvent.change(screen.getByPlaceholderText(/Write markdown/), { target: { value: '# Title\n\n**bold**' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('<h1>Title</h1>');
    expect(pre?.textContent).toContain('<strong>bold</strong>');
  });

  it('converts markdown links to anchor tags', () => {
    render(<MarkdownToHtmlTool />);
    fireEvent.change(screen.getByPlaceholderText(/Write markdown/), { target: { value: '[text](https://example.com)' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('<a href="https://example.com">text</a>');
  });

  it('shows a live HTML preview alongside the source', () => {
    render(<MarkdownToHtmlTool />);
    fireEvent.change(screen.getByPlaceholderText(/Write markdown/), { target: { value: '**bold**' } });
    const strong = document.querySelector('.md-prose strong');
    expect(strong?.textContent).toBe('bold');
  });

  it('clears input on Clear click', () => {
    render(<MarkdownToHtmlTool />);
    const textarea = screen.getByPlaceholderText(/Write markdown/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '# hi' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
