import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogFormatter from '../../components/tools/formatters/LogFormatter';

const PLACEHOLDER_SNIPPET = /Server started/;

// Helper to build a single-line JSON log string
const logLine = (obj: object) => JSON.stringify(obj);

describe('LogFormatter', () => {
  // ── structure ────────────────────────────────────────────────────────────
  it('renders the tool title', () => {
    render(<LogFormatter />);
    expect(screen.getByText('Log Formatter')).toBeInTheDocument();
  });

  it('renders Source and Log Output panels', () => {
    render(<LogFormatter />);
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Log Output')).toBeInTheDocument();
  });

  it('renders level filter buttons', () => {
    render(<LogFormatter />);
    expect(screen.getByRole('button', { name: /^All$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Debug$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Info$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Warn$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Error$/i })).toBeInTheDocument();
  });

  it('renders Show Meta toggle', () => {
    render(<LogFormatter />);
    expect(screen.getByRole('button', { name: /meta/i })).toBeInTheDocument();
  });

  // ── entry rendering ───────────────────────────────────────────────────────
  it('renders the message for a parsed log entry', () => {
    render(<LogFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: logLine({ level: 'info', msg: 'unique_msg_abc' }) },
    });
    expect(screen.getByText('unique_msg_abc')).toBeInTheDocument();
  });

  it('renders the level badge for an info entry', () => {
    render(<LogFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: logLine({ level: 30, msg: 'hello' }) },
    });
    expect(screen.getByText('info')).toBeInTheDocument();
  });

  it('renders the level badge for a warn entry', () => {
    render(<LogFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: logLine({ level: 40, msg: 'something wrong' }) },
    });
    expect(screen.getByText('warn')).toBeInTheDocument();
  });

  it('renders the level badge for an error entry', () => {
    render(<LogFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: logLine({ level: 50, msg: 'boom' }) },
    });
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('renders the timestamp when present', () => {
    render(<LogFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: {
        value: logLine({ level: 30, time: 1640995200000, msg: 'timed' }),
      },
    });
    // Should show HH:MM:SS portion of 2022-01-01T00:00:00.000Z
    expect(document.body.textContent).toContain('00:00:00');
  });

  it('renders a parse-error indicator for invalid JSON', () => {
    render(<LogFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'this is not json at all' },
    });
    expect(screen.getByText(/parse error/i)).toBeInTheDocument();
  });

  it('renders multiple entries', () => {
    render(<LogFormatter />);
    const input = [
      logLine({ level: 30, msg: 'entry_one_unique' }),
      logLine({ level: 40, msg: 'entry_two_unique' }),
      logLine({ level: 50, msg: 'entry_three_unique' }),
    ].join('\n');
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: input },
    });
    expect(screen.getByText('entry_one_unique')).toBeInTheDocument();
    expect(screen.getByText('entry_two_unique')).toBeInTheDocument();
    expect(screen.getByText('entry_three_unique')).toBeInTheDocument();
  });

  // ── level filtering ───────────────────────────────────────────────────────
  it('filters out debug entries when Error level is selected', async () => {
    const user = userEvent.setup();
    render(<LogFormatter />);
    const input = [
      logLine({ level: 20, msg: 'xdebugmsgx' }),
      logLine({ level: 50, msg: 'xerrormsgx' }),
    ].join('\n');
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: input },
    });
    expect(screen.getByText('xdebugmsgx')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Error$/i }));
    expect(screen.queryByText('xdebugmsgx')).not.toBeInTheDocument();
    expect(screen.getByText('xerrormsgx')).toBeInTheDocument();
  });

  it('shows all entries when All filter is active', async () => {
    const user = userEvent.setup();
    render(<LogFormatter />);
    const input = [
      logLine({ level: 10, msg: 'xtracemsgx' }),
      logLine({ level: 50, msg: 'xerrormsgx2' }),
    ].join('\n');
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: input },
    });
    await user.click(screen.getByRole('button', { name: /^Error$/i }));
    expect(screen.queryByText('xtracemsgx')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^All$/i }));
    expect(screen.getByText('xtracemsgx')).toBeInTheDocument();
  });

  it('shows parse-error entries regardless of level filter', async () => {
    const user = userEvent.setup();
    render(<LogFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'xbadlinejsonx' },
    });
    await user.click(screen.getByRole('button', { name: /^Error$/i }));
    expect(screen.getByText(/parse error/i)).toBeInTheDocument();
  });

  // ── metadata toggle ───────────────────────────────────────────────────────
  it('shows metadata fields by default', () => {
    render(<LogFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: logLine({ level: 30, msg: 'x', xuniquefieldx: 'xuniqueval' }) },
    });
    expect(screen.getByText('xuniquefieldx')).toBeInTheDocument();
  });

  it('hides metadata fields when Meta is toggled off', async () => {
    const user = userEvent.setup();
    render(<LogFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: logLine({ level: 30, msg: 'x', xuniquefieldx: 'xuniqueval' }) },
    });
    expect(screen.getByText('xuniquefieldx')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /meta/i }));
    expect(screen.queryByText('xuniquefieldx')).not.toBeInTheDocument();
  });

  it('re-shows metadata when Meta is toggled back on', async () => {
    const user = userEvent.setup();
    render(<LogFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: logLine({ level: 30, msg: 'x', xuniquefieldx: 'xuniqueval' }) },
    });
    await user.click(screen.getByRole('button', { name: /meta/i }));
    await user.click(screen.getByRole('button', { name: /meta/i }));
    expect(screen.getByText('xuniquefieldx')).toBeInTheDocument();
  });

  // ── empty / placeholder state ─────────────────────────────────────────────
  it('shows an empty-state message when there is no input', () => {
    render(<LogFormatter />);
    expect(document.body.textContent).toContain('Log entries will appear here');
  });

  // ── clear / paste ─────────────────────────────────────────────────────────
  it('clears input when Clear is clicked', async () => {
    const user = userEvent.setup();
    render(<LogFormatter />);
    const textarea = screen.getByPlaceholderText(PLACEHOLDER_SNIPPET) as HTMLTextAreaElement;
    fireEvent.change(textarea, {
      target: { value: logLine({ level: 30, msg: 'clearme' }) },
    });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes from clipboard when Paste is clicked', async () => {
    const user = userEvent.setup();
    const pasteContent = logLine({ level: 30, msg: 'pasted_msg_unique' });
    const readTextFn = vi.fn().mockResolvedValue(pasteContent);
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextFn, writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
    render(<LogFormatter />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(PLACEHOLDER_SNIPPET) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe(pasteContent);
    });
  });
});
