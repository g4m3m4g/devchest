import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ULIDGenerator from '../../components/tools/generators/ULIDGenerator';

describe('ULIDGenerator', () => {
  it('renders the tool title', () => {
    render(<ULIDGenerator />);
    expect(screen.getByText('ULID Generator')).toBeInTheDocument();
  });

  it('shows empty state before generation', () => {
    render(<ULIDGenerator />);
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('generates ULIDs when Generate button is clicked', async () => {
    const user = userEvent.setup();
    render(<ULIDGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
  });

  it('respects the quantity input', async () => {
    const user = userEvent.setup();
    render(<ULIDGenerator />);
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '3' } });
    await user.click(screen.getByRole('button', { name: /generate/i }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('each generated ULID is 26 characters', async () => {
    const user = userEvent.setup();
    render(<ULIDGenerator />);
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '1' } });
    await user.click(screen.getByRole('button', { name: /generate/i }));
    const items = screen.getAllByRole('listitem');
    expect(items[0].textContent).toMatch(/[0-9A-HJKMNP-TV-Z]{26}/);
  });

  it('clears the ULID list', async () => {
    const user = userEvent.setup();
    render(<ULIDGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await user.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('copies all ULIDs to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<ULIDGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await user.click(screen.getByRole('button', { name: /copy all/i }));
    expect(writeTextFn).toHaveBeenCalled();
  });
});
