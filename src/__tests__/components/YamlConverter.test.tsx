import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YamlConverter from '../../components/tools/formatters/YamlConverter';

describe('YamlConverter', () => {
  it('renders the tool title', () => {
    render(<YamlConverter />);
    expect(screen.getByText('YAML Formatter / Converter')).toBeInTheDocument();
  });

  it('renders input and output panels', () => {
    render(<YamlConverter />);
    expect(screen.getByText('Input')).toBeInTheDocument();
    expect(screen.getByText('Output')).toBeInTheDocument();
  });

  it('shows Format, YAML→JSON, and JSON→YAML mode buttons', () => {
    render(<YamlConverter />);
    expect(screen.getByRole('button', { name: /format/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yaml.*json/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /json.*yaml/i })).toBeInTheDocument();
  });

  it('formats YAML in Format mode', () => {
    render(<YamlConverter />);
    const textarea = screen.getByPlaceholderText(/name:/);
    fireEvent.change(textarea, { target: { value: 'name: Alice\nage: 30' } });
    expect(document.body).toHaveTextContent('name: Alice');
  });

  it('shows Valid badge for valid YAML', () => {
    render(<YamlConverter />);
    const textarea = screen.getByPlaceholderText(/name:/);
    fireEvent.change(textarea, { target: { value: 'name: Alice' } });
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('shows Invalid badge for invalid YAML', () => {
    render(<YamlConverter />);
    const textarea = screen.getByPlaceholderText(/name:/);
    fireEvent.change(textarea, { target: { value: 'key: [unclosed bracket' } });
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  it('converts YAML to JSON in YAML→JSON mode', async () => {
    const user = userEvent.setup();
    render(<YamlConverter />);
    await user.click(screen.getByRole('button', { name: /yaml.*json/i }));
    const textarea = screen.getByPlaceholderText(/name:/);
    fireEvent.change(textarea, { target: { value: 'name: Alice\nage: 30' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('"name"');
    expect(pre?.textContent).toContain('"Alice"');
  });

  it('converts JSON to YAML in JSON→YAML mode', async () => {
    const user = userEvent.setup();
    render(<YamlConverter />);
    await user.click(screen.getByRole('button', { name: /json.*yaml/i }));
    const textarea = screen.getByPlaceholderText(/"key":/);
    fireEvent.change(textarea, { target: { value: '{"name":"Alice","age":30}' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('name: Alice');
  });

  it('clears input when Clear is clicked', async () => {
    const user = userEvent.setup();
    render(<YamlConverter />);
    const textarea = screen.getByPlaceholderText(/name:/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'name: Alice' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes text when Paste is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('name: Pasted');
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextFn, writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
    render(<YamlConverter />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(/name:/) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('name: Pasted');
    });
  });
});
