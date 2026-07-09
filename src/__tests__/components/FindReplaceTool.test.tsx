import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FindReplaceTool from '../../components/tools/text/FindReplaceTool';

describe('FindReplaceTool', () => {
  it('renders the tool title', () => {
    render(<FindReplaceTool />);
    expect(screen.getByText('Find & Replace')).toBeInTheDocument();
  });

  it('replaces plain text matches', () => {
    render(<FindReplaceTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste text/), { target: { value: 'foo bar foo' } });
    fireEvent.change(screen.getByPlaceholderText('Find…'), { target: { value: 'foo' } });
    fireEvent.change(screen.getByPlaceholderText('Replace…'), { target: { value: 'baz' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('baz bar baz');
  });

  it('substitutes capture groups when regex mode is enabled', () => {
    render(<FindReplaceTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste text/), { target: { value: 'John Smith' } });
    fireEvent.click(screen.getByText('Use regex'));
    fireEvent.change(screen.getByPlaceholderText('Find…'), { target: { value: '(\\w+) (\\w+)' } });
    fireEvent.change(screen.getByPlaceholderText('Replace…'), { target: { value: '$2 $1' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('Smith John');
  });

  it('shows a regex error message for an invalid pattern', () => {
    render(<FindReplaceTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste text/), { target: { value: 'abc' } });
    fireEvent.click(screen.getByText('Use regex'));
    fireEvent.change(screen.getByPlaceholderText('Find…'), { target: { value: '(' } });
    expect(document.body).toHaveTextContent(/Invalid regular expression/i);
  });

  it('replaces only the first match when Replace all is off', () => {
    render(<FindReplaceTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste text/), { target: { value: 'foo bar foo' } });
    fireEvent.change(screen.getByPlaceholderText('Find…'), { target: { value: 'foo' } });
    fireEvent.change(screen.getByPlaceholderText('Replace…'), { target: { value: 'baz' } });
    fireEvent.click(screen.getByText('Replace all'));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('baz bar foo');
  });

  it('shows the match count', () => {
    render(<FindReplaceTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste text/), { target: { value: 'foo bar foo' } });
    fireEvent.change(screen.getByPlaceholderText('Find…'), { target: { value: 'foo' } });
    expect(screen.getByText(/2 matches/)).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<FindReplaceTool />);
    const textarea = screen.getByPlaceholderText(/Paste text/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'abc' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
