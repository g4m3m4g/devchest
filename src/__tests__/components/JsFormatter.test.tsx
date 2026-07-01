import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JsFormatter from '../../components/tools/formatters/JsFormatter';

describe('JsFormatter', () => {
  it('renders the tool title', () => {
    render(<JsFormatter />);
    expect(screen.getByText('JS / TS Formatter')).toBeInTheDocument();
  });

  it('renders input and output panels', () => {
    render(<JsFormatter />);
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Formatted Output')).toBeInTheDocument();
  });

  it('shows JS and TS parser toggle buttons', () => {
    render(<JsFormatter />);
    expect(screen.getByRole('button', { name: /^js$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^ts$/i })).toBeInTheDocument();
  });

  it('formats JavaScript input', async () => {
    render(<JsFormatter />);
    const textarea = screen.getByPlaceholderText(/const/);
    fireEvent.change(textarea, { target: { value: 'const x=1' } });
    await waitFor(() => {
      const pre = document.querySelector('pre');
      expect(pre?.textContent).toContain('const x = 1');
    }, { timeout: 5000 });
  });

  it('shows Valid badge after successful format', async () => {
    render(<JsFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/const/), { target: { value: 'const x = 1' } });
    await waitFor(() => {
      expect(screen.getByText('Valid')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('shows Invalid badge for syntax errors', async () => {
    render(<JsFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/const/), { target: { value: 'function (((bad' } });
    await waitFor(() => {
      expect(screen.getByText('Invalid')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('switches to TypeScript parser', async () => {
    const user = userEvent.setup();
    render(<JsFormatter />);
    await user.click(screen.getByRole('button', { name: /^ts$/i }));
    fireEvent.change(screen.getByPlaceholderText(/const/), {
      target: { value: 'const greet=(name:string)=>name' },
    });
    await waitFor(() => {
      const pre = document.querySelector('pre');
      expect(pre?.textContent).toContain('name: string');
    }, { timeout: 5000 });
  });

  it('toggles semicolons off', async () => {
    const user = userEvent.setup();
    render(<JsFormatter />);
    await user.click(screen.getByRole('checkbox', { name: /semi/i }));
    fireEvent.change(screen.getByPlaceholderText(/const/), { target: { value: 'const x = 1' } });
    await waitFor(() => {
      const pre = document.querySelector('pre');
      expect(pre?.textContent).not.toContain(';');
    }, { timeout: 5000 });
  });

  it('toggles single quotes on', async () => {
    const user = userEvent.setup();
    render(<JsFormatter />);
    await user.click(screen.getByRole('checkbox', { name: /single quotes/i }));
    fireEvent.change(screen.getByPlaceholderText(/const/), { target: { value: 'const s = "hi"' } });
    await waitFor(() => {
      const pre = document.querySelector('pre');
      expect(pre?.textContent).toContain("'hi'");
    }, { timeout: 5000 });
  });

  it('clears input when Clear is clicked', async () => {
    const user = userEvent.setup();
    render(<JsFormatter />);
    const textarea = screen.getByPlaceholderText(/const/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'const x = 1' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes text when Paste is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('const pasted = true');
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextFn, writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
    render(<JsFormatter />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(/const/) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('const pasted = true');
    });
  });
});
