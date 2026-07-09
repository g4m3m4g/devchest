import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LineFilterTool from '../../components/tools/text/LineFilterTool';

describe('LineFilterTool', () => {
  it('renders the tool title', () => {
    render(<LineFilterTool />);
    expect(screen.getByText('Line Filter')).toBeInTheDocument();
  });

  it('keeps matching lines by default', () => {
    render(<LineFilterTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste lines/), { target: { value: 'apple\nbanana\ncherry' } });
    fireEvent.change(screen.getByPlaceholderText('Pattern…'), { target: { value: 'an' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('banana');
  });

  it('removes matching lines when Remove mode is selected', () => {
    render(<LineFilterTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste lines/), { target: { value: 'apple\nbanana\ncherry' } });
    fireEvent.change(screen.getByPlaceholderText('Pattern…'), { target: { value: 'an' } });
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('apple\ncherry');
  });

  it('filters using a regex when Use regex is enabled', () => {
    render(<LineFilterTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste lines/), { target: { value: 'foo123\nbar\nbaz456' } });
    fireEvent.click(screen.getByText('Use regex'));
    fireEvent.change(screen.getByPlaceholderText('Pattern…'), { target: { value: '\\d+' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('foo123\nbaz456');
  });

  it('shows an error message for an invalid regex pattern', () => {
    render(<LineFilterTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste lines/), { target: { value: 'abc' } });
    fireEvent.click(screen.getByText('Use regex'));
    fireEvent.change(screen.getByPlaceholderText('Pattern…'), { target: { value: '(' } });
    expect(document.body).toHaveTextContent(/Invalid regular expression/i);
  });

  it('shows the output line count', () => {
    render(<LineFilterTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste lines/), { target: { value: 'apple\nbanana\ncherry' } });
    fireEvent.change(screen.getByPlaceholderText('Pattern…'), { target: { value: 'a' } });
    expect(screen.getByText('Output (2 lines)')).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<LineFilterTool />);
    const textarea = screen.getByPlaceholderText(/Paste lines/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'abc' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
