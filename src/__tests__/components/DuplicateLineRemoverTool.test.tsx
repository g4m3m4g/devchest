import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DuplicateLineRemoverTool from '../../components/tools/text/DuplicateLineRemoverTool';

describe('DuplicateLineRemoverTool', () => {
  it('renders the tool title', () => {
    render(<DuplicateLineRemoverTool />);
    expect(screen.getByText('Duplicate Line Remover')).toBeInTheDocument();
  });

  it('removes duplicate lines', () => {
    render(<DuplicateLineRemoverTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste lines/), { target: { value: 'a\nb\na\nc' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('a\nb\nc');
  });

  it('is case-insensitive when the checkbox is toggled', () => {
    render(<DuplicateLineRemoverTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste lines/), { target: { value: 'Apple\napple' } });
    fireEvent.click(screen.getByText('Case-insensitive'));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('Apple');
  });

  it('trims lines before comparing when toggled', () => {
    render(<DuplicateLineRemoverTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste lines/), { target: { value: 'a\n a ' } });
    fireEvent.click(screen.getByText('Trim lines'));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('a');
  });

  it('shows the output line count', () => {
    render(<DuplicateLineRemoverTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste lines/), { target: { value: 'a\nb\na' } });
    expect(screen.getByText('Output (2 lines)')).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<DuplicateLineRemoverTool />);
    const textarea = screen.getByPlaceholderText(/Paste lines/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'a\nb' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
