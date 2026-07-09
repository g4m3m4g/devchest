import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WhitespaceLineCleaner from '../../components/tools/text/WhitespaceLineCleaner';

describe('WhitespaceLineCleaner', () => {
  it('renders the tool title', () => {
    render(<WhitespaceLineCleaner />);
    expect(screen.getByText('Whitespace / Line Cleaner')).toBeInTheDocument();
  });

  it('leaves output unchanged by default', () => {
    render(<WhitespaceLineCleaner />);
    const textarea = screen.getByPlaceholderText(/Paste text to clean/);
    fireEvent.change(textarea, { target: { value: '  a  \n\n\nb' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('  a  \n\n\nb');
  });

  it('trims lines when Trim lines is toggled', () => {
    render(<WhitespaceLineCleaner />);
    const textarea = screen.getByPlaceholderText(/Paste text to clean/);
    fireEvent.change(textarea, { target: { value: '  a  \n  b  ' } });
    fireEvent.click(screen.getByText('Trim lines'));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('a\nb');
  });

  it('collapses spaces when Collapse spaces is toggled', () => {
    render(<WhitespaceLineCleaner />);
    const textarea = screen.getByPlaceholderText(/Paste text to clean/);
    fireEvent.change(textarea, { target: { value: 'a    b' } });
    fireEvent.click(screen.getByText('Collapse spaces'));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('a b');
  });

  it('collapses blank lines when Collapse blank lines is toggled', () => {
    render(<WhitespaceLineCleaner />);
    const textarea = screen.getByPlaceholderText(/Paste text to clean/);
    fireEvent.change(textarea, { target: { value: 'a\n\n\n\nb' } });
    fireEvent.click(screen.getByText('Collapse blank lines'));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('a\n\nb');
  });

  it('strips blank lines when Strip blank lines is toggled', () => {
    render(<WhitespaceLineCleaner />);
    const textarea = screen.getByPlaceholderText(/Paste text to clean/);
    fireEvent.change(textarea, { target: { value: 'a\n\n\nb' } });
    fireEvent.click(screen.getByText('Strip blank lines'));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('a\nb');
  });

  it('trims the document when Trim document is toggled', () => {
    render(<WhitespaceLineCleaner />);
    const textarea = screen.getByPlaceholderText(/Paste text to clean/);
    fireEvent.change(textarea, { target: { value: '\n\na\nb\n\n' } });
    fireEvent.click(screen.getByText('Trim document'));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('a\nb');
  });

  it('shows the input and output line counts', () => {
    render(<WhitespaceLineCleaner />);
    const textarea = screen.getByPlaceholderText(/Paste text to clean/);
    fireEvent.change(textarea, { target: { value: 'a\nb\nc' } });
    expect(screen.getByText('Input (3 lines)')).toBeInTheDocument();
    expect(screen.getByText('Output (3 lines)')).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<WhitespaceLineCleaner />);
    const textarea = screen.getByPlaceholderText(/Paste text to clean/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'a\nb' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
    expect(screen.getByText('Input (0 lines)')).toBeInTheDocument();
  });
});
