import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarkdownPreview from '../../components/tools/formatters/MarkdownPreview';

describe('MarkdownPreview', () => {
  it('renders the tool title', () => {
    render(<MarkdownPreview />);
    expect(screen.getByText('Markdown Preview')).toBeInTheDocument();
  });

  it('renders source and preview panels', () => {
    render(<MarkdownPreview />);
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('shows Preview and Format mode buttons', () => {
    render(<MarkdownPreview />);
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /format/i })).toBeInTheDocument();
  });

  it('renders a heading in preview mode', () => {
    render(<MarkdownPreview />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '# Hello World' } });
    // ToolLayout also renders an <h1> for the tool title, so filter by name
    expect(screen.getByRole('heading', { level: 1, name: /hello world/i })).toBeInTheDocument();
  });

  it('renders bold text in preview mode', () => {
    render(<MarkdownPreview />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '**bold**' } });
    const strong = document.querySelector('strong');
    expect(strong).toBeInTheDocument();
    expect(strong?.textContent).toBe('bold');
  });

  it('renders a link in preview mode', () => {
    render(<MarkdownPreview />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '[click me](https://example.com)' },
    });
    const link = screen.getByRole('link', { name: /click me/i });
    expect(link).toBeInTheDocument();
  });

  it('renders a code block in preview mode', () => {
    render(<MarkdownPreview />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '```\nconst x = 1;\n```' },
    });
    expect(document.querySelector('pre')).toBeInTheDocument();
  });

  it('shows formatted markdown in format mode', async () => {
    const user = userEvent.setup();
    render(<MarkdownPreview />);
    await user.click(screen.getByRole('button', { name: /format/i }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '* item one\n* item two' } });
    await waitFor(() => {
      expect(document.querySelector('pre')?.textContent).toContain('- item');
    }, { timeout: 5000 });
  });

  it('shows Valid badge when format succeeds', async () => {
    const user = userEvent.setup();
    render(<MarkdownPreview />);
    await user.click(screen.getByRole('button', { name: /format/i }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '# Hello' } });
    await waitFor(() => {
      expect(screen.getByText('Valid')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('clears input when Clear is clicked', async () => {
    const user = userEvent.setup();
    render(<MarkdownPreview />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '# Hello' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes text when Paste is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('# Pasted');
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextFn, writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
    render(<MarkdownPreview />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('# Pasted');
    });
  });
});
