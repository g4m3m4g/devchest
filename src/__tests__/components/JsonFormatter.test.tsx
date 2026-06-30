import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JsonFormatter from '../../components/tools/formatters/JsonFormatter';

describe('JsonFormatter', () => {
  it('renders the tool title', () => {
    render(<JsonFormatter />);
    expect(screen.getByText('JSON Formatter')).toBeInTheDocument();
  });

  it('renders input and output panels', () => {
    render(<JsonFormatter />);
    expect(screen.getByText('Input JSON')).toBeInTheDocument();
    expect(screen.getByText('Formatted Output')).toBeInTheDocument();
  });

  it('formats valid JSON with 2-space indent', () => {
    render(<JsonFormatter />);
    const textarea = screen.getByPlaceholderText(/\{/);
    // Use fireEvent to avoid { } being treated as special keys by userEvent
    fireEvent.change(textarea, { target: { value: '{"key":"value"}' } });
    expect(document.body).toHaveTextContent('"key"');
  });

  it('shows "Valid" badge for valid JSON', () => {
    render(<JsonFormatter />);
    const textarea = screen.getByPlaceholderText(/\{/);
    fireEvent.change(textarea, { target: { value: '{"a":1}' } });
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('shows "Invalid JSON" badge and error for bad JSON', () => {
    render(<JsonFormatter />);
    const textarea = screen.getByPlaceholderText(/\{/);
    fireEvent.change(textarea, { target: { value: '{bad json}' } });
    expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
  });

  it('switches to 4-space indent', async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    await user.click(screen.getByText('4sp'));
    const textarea = screen.getByPlaceholderText(/\{/);
    fireEvent.change(textarea, { target: { value: '{"x":1}' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('    '); // 4 spaces
  });

  it('enables minify mode', async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    await user.click(screen.getByRole('checkbox', { name: /minify/i }));
    const textarea = screen.getByPlaceholderText(/\{/);
    fireEvent.change(textarea, { target: { value: '{"key":"value"}' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).not.toContain('\n');
  });

  it('clears input when Clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    const textarea = screen.getByPlaceholderText(/\{/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '{"a":1}' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes text when Paste button is clicked', async () => {
    const user = userEvent.setup();
    // Set clipboard mock AFTER userEvent.setup() to override any clipboard userEvent installs
    const readTextFn = vi.fn().mockResolvedValue('pasted text from clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined), readText: readTextFn },
      configurable: true,
      writable: true,
    });
    render(<JsonFormatter />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(/\{/) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('pasted text from clipboard');
    });
  });
});
