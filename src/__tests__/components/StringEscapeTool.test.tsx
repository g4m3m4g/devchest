import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StringEscapeTool from '../../components/tools/text/StringEscapeTool';

describe('StringEscapeTool', () => {
  it('renders the tool title', () => {
    render(<StringEscapeTool />);
    expect(screen.getByText('String Escape / Unescape')).toBeInTheDocument();
  });

  it('escapes JS strings by default', () => {
    render(<StringEscapeTool />);
    const textarea = screen.getByPlaceholderText(/Paste text/);
    fireEvent.change(textarea, { target: { value: 'line1\nline2\t"q"' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('line1\\nline2\\t\\"q\\"');
  });

  it('escapes Python strings when Python format is selected', () => {
    render(<StringEscapeTool />);
    fireEvent.click(screen.getByRole('button', { name: 'Python' }));
    const textarea = screen.getByPlaceholderText(/Paste text/);
    fireEvent.change(textarea, { target: { value: "a'b" } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe("a\\'b");
  });

  it('escapes SQL strings when SQL format is selected', () => {
    render(<StringEscapeTool />);
    fireEvent.click(screen.getByRole('button', { name: 'SQL' }));
    const textarea = screen.getByPlaceholderText(/Paste text/);
    fireEvent.change(textarea, { target: { value: "O'Brien" } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe("O''Brien");
  });

  it('unescapes when Unescape mode is selected', () => {
    render(<StringEscapeTool />);
    fireEvent.click(screen.getByRole('button', { name: 'Unescape' }));
    const textarea = screen.getByPlaceholderText(/Paste text/);
    fireEvent.change(textarea, { target: { value: 'line1\\nline2' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('line1\nline2');
  });

  it('clears input on Clear click', () => {
    render(<StringEscapeTool />);
    const textarea = screen.getByPlaceholderText(/Paste text/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'abc' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
