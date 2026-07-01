import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TomlConverter from '../../components/tools/formatters/TomlConverter';

describe('TomlConverter', () => {
  it('renders the tool title', () => {
    render(<TomlConverter />);
    expect(screen.getByText('TOML Formatter / Converter')).toBeInTheDocument();
  });

  it('renders input and output panels', () => {
    render(<TomlConverter />);
    expect(screen.getByText('Input')).toBeInTheDocument();
    expect(screen.getByText('Output')).toBeInTheDocument();
  });

  it('shows Format, TOML→JSON, and JSON→TOML mode buttons', () => {
    render(<TomlConverter />);
    expect(screen.getByRole('button', { name: /format/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toml.*json/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /json.*toml/i })).toBeInTheDocument();
  });

  it('formats TOML in Format mode', () => {
    render(<TomlConverter />);
    const textarea = screen.getByPlaceholderText(/name = /);
    fireEvent.change(textarea, { target: { value: 'name = "Alice"\nage = 30' } });
    expect(document.body).toHaveTextContent('name');
    expect(document.body).toHaveTextContent('Alice');
  });

  it('shows Valid badge for valid TOML', () => {
    render(<TomlConverter />);
    const textarea = screen.getByPlaceholderText(/name = /);
    fireEvent.change(textarea, { target: { value: 'name = "Alice"' } });
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('shows Invalid badge for invalid TOML', () => {
    render(<TomlConverter />);
    const textarea = screen.getByPlaceholderText(/name = /);
    fireEvent.change(textarea, { target: { value: 'key = [unclosed bracket' } });
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  it('converts TOML to JSON in TOML→JSON mode', async () => {
    const user = userEvent.setup();
    render(<TomlConverter />);
    await user.click(screen.getByRole('button', { name: /toml.*json/i }));
    const textarea = screen.getByPlaceholderText(/name = /);
    fireEvent.change(textarea, { target: { value: 'name = "Alice"\nage = 30' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('"name"');
    expect(pre?.textContent).toContain('"Alice"');
  });

  it('converts JSON to TOML in JSON→TOML mode', async () => {
    const user = userEvent.setup();
    render(<TomlConverter />);
    await user.click(screen.getByRole('button', { name: /json.*toml/i }));
    const textarea = screen.getByPlaceholderText(/"key":/);
    fireEvent.change(textarea, { target: { value: '{"name":"Alice","age":30}' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('name');
    expect(pre?.textContent).toContain('Alice');
  });

  it('clears input when Clear is clicked', async () => {
    const user = userEvent.setup();
    render(<TomlConverter />);
    const textarea = screen.getByPlaceholderText(/name = /) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'name = "Alice"' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes text when Paste is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('name = "Pasted"');
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextFn, writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
    render(<TomlConverter />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(/name = /) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('name = "Pasted"');
    });
  });
});
