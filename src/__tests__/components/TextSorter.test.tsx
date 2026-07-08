import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TextSorter from '../../components/tools/text/TextSorter';

describe('TextSorter', () => {
  it('renders the tool title', () => {
    render(<TextSorter />);
    expect(screen.getByText('Text Sorter')).toBeInTheDocument();
  });

  it('sorts lines alphabetically by default', () => {
    render(<TextSorter />);
    const textarea = screen.getByPlaceholderText(/Paste lines of text to sort/);
    fireEvent.change(textarea, { target: { value: 'banana\napple\ncherry' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('apple\nbanana\ncherry');
  });

  it('sorts descending when toggled', () => {
    render(<TextSorter />);
    const textarea = screen.getByPlaceholderText(/Paste lines of text to sort/);
    fireEvent.change(textarea, { target: { value: 'banana\napple\ncherry' } });
    fireEvent.click(screen.getByRole('button', { name: 'Descending' }));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('cherry\nbanana\napple');
  });

  it('sorts numerically when Numeric mode is selected', () => {
    render(<TextSorter />);
    const textarea = screen.getByPlaceholderText(/Paste lines of text to sort/);
    fireEvent.change(textarea, { target: { value: 'item10\nitem2\nitem1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Numeric' }));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('item1\nitem2\nitem10');
  });

  it('sorts by length when Length mode is selected', () => {
    render(<TextSorter />);
    const textarea = screen.getByPlaceholderText(/Paste lines of text to sort/);
    fireEvent.change(textarea, { target: { value: 'ccc\na\nbb' } });
    fireEvent.click(screen.getByRole('button', { name: 'Length' }));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('a\nbb\nccc');
  });

  it('removes duplicates when the checkbox is checked', () => {
    render(<TextSorter />);
    const textarea = screen.getByPlaceholderText(/Paste lines of text to sort/);
    fireEvent.change(textarea, { target: { value: 'b\na\nb' } });
    fireEvent.click(screen.getByText('Remove duplicates'));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('a\nb');
  });

  it('shows the input and output line counts', () => {
    render(<TextSorter />);
    const textarea = screen.getByPlaceholderText(/Paste lines of text to sort/);
    fireEvent.change(textarea, { target: { value: 'b\na\nc' } });
    expect(screen.getByText('Input (3 lines)')).toBeInTheDocument();
    expect(screen.getByText('Sorted Output (3 lines)')).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<TextSorter />);
    const textarea = screen.getByPlaceholderText(/Paste lines of text to sort/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'b\na' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
    expect(screen.getByText('Input (0 lines)')).toBeInTheDocument();
  });
});
