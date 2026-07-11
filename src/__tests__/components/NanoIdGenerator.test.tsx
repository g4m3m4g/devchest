import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NanoIdGenerator from '../../components/tools/generators/NanoIdGenerator';

describe('NanoIdGenerator', () => {
  it('renders the tool title', () => {
    render(<NanoIdGenerator />);
    expect(screen.getByText('Nano ID Generator')).toBeInTheDocument();
  });

  it('shows an empty state before generation', () => {
    render(<NanoIdGenerator />);
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('generates IDs of default size 21 when Generate is clicked', async () => {
    const user = userEvent.setup();
    render(<NanoIdGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(items[0].textContent).toMatch(/^.{21,}/);
  });

  it('respects the quantity input', async () => {
    const user = userEvent.setup();
    render(<NanoIdGenerator />);
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '3' } });
    await user.click(screen.getByRole('button', { name: /generate/i }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('respects a custom size', async () => {
    const user = userEvent.setup();
    render(<NanoIdGenerator />);
    fireEvent.change(screen.getByDisplayValue('21'), { target: { value: '10' } });
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '1' } });
    await user.click(screen.getByRole('button', { name: /generate/i }));
    const items = screen.getAllByRole('listitem');
    expect(items[0].textContent?.trim().length).toBeGreaterThanOrEqual(10);
  });

  it('clears the list', async () => {
    const user = userEvent.setup();
    render(<NanoIdGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await user.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('copies all IDs to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<NanoIdGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await user.click(screen.getByRole('button', { name: /copy all/i }));
    expect(writeTextFn).toHaveBeenCalled();
  });
});
