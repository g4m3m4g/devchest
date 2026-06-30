import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiffChecker from '../../components/tools/text/DiffChecker';

describe('DiffChecker', () => {
  it('renders the tool title', () => {
    render(<DiffChecker />);
    expect(screen.getByText('Diff Checker')).toBeInTheDocument();
  });

  it('renders original and modified input panels', () => {
    render(<DiffChecker />);
    expect(screen.getByText('Original')).toBeInTheDocument();
    expect(screen.getByText('Modified')).toBeInTheDocument();
  });

  it('renders the Diff output panel', () => {
    render(<DiffChecker />);
    expect(screen.getByText('Diff')).toBeInTheDocument();
  });

  it('shows diff when original and modified differ', async () => {
    const user = userEvent.setup();
    render(<DiffChecker />);
    const [original, modified] = screen.getAllByRole('textbox');
    await user.type(original, 'line one\nline two');
    await user.type(modified, 'line one\nline three');
    // Should show +/- indicators in the diff table
    const table = document.querySelector('table');
    expect(table).toBeInTheDocument();
  });

  it('shows added lines stat', async () => {
    const user = userEvent.setup();
    render(<DiffChecker />);
    const [original, modified] = screen.getAllByRole('textbox');
    await user.type(original, 'line one');
    await user.type(modified, 'line one\nline two');
    expect(screen.getByText(/\+.*added/)).toBeInTheDocument();
  });

  it('shows removed lines stat', async () => {
    const user = userEvent.setup();
    render(<DiffChecker />);
    const [original, modified] = screen.getAllByRole('textbox');
    await user.type(original, 'line one\nline two');
    await user.type(modified, 'line one');
    expect(screen.getByText(/−.*removed/)).toBeInTheDocument();
  });

  it('clears both inputs on Clear click', async () => {
    const user = userEvent.setup();
    render(<DiffChecker />);
    const [original, modified] = screen.getAllByRole('textbox') as HTMLTextAreaElement[];
    await user.type(original, 'hello');
    await user.type(modified, 'world');
    await user.click(screen.getByTitle('Clear all'));
    expect(original.value).toBe('');
    expect(modified.value).toBe('');
  });
});
