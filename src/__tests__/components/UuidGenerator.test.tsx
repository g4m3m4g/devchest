import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UuidGenerator from '../../components/tools/generators/UuidGenerator';

const MOCK_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('UuidGenerator', () => {
  beforeEach(() => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(
      MOCK_UUID as `${string}-${string}-${string}-${string}-${string}`,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the tool title', () => {
    render(<UuidGenerator />);
    expect(screen.getByText('UUID Generator')).toBeInTheDocument();
  });

  it('shows empty state before generation', () => {
    render(<UuidGenerator />);
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('generates UUIDs when Generate button is clicked', async () => {
    const user = userEvent.setup();
    render(<UuidGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    const uuids = screen.getAllByText(MOCK_UUID);
    expect(uuids.length).toBeGreaterThan(0);
  });

  it('respects the quantity input', async () => {
    const user = userEvent.setup();
    render(<UuidGenerator />);
    // Use fireEvent.change to directly set quantity (avoids controlled-input cursor issues)
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '3' } });
    await user.click(screen.getByRole('button', { name: /generate/i }));
    expect(screen.getAllByText(MOCK_UUID)).toHaveLength(3);
  });

  it('applies uppercase format', async () => {
    const user = userEvent.setup();
    render(<UuidGenerator />);
    // Set quantity to 1 so getByText finds a single element
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '1' } });
    await user.click(screen.getByRole('checkbox', { name: /uppercase/i }));
    await user.click(screen.getByRole('button', { name: /generate/i }));
    expect(screen.getByText(MOCK_UUID.toUpperCase())).toBeInTheDocument();
  });

  it('applies no-hyphens format', async () => {
    const user = userEvent.setup();
    render(<UuidGenerator />);
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '1' } });
    await user.selectOptions(screen.getByRole('combobox'), 'none');
    await user.click(screen.getByRole('button', { name: /generate/i }));
    expect(screen.getByText(MOCK_UUID.replace(/-/g, ''))).toBeInTheDocument();
  });

  it('applies braces format', async () => {
    const user = userEvent.setup();
    render(<UuidGenerator />);
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '1' } });
    await user.selectOptions(screen.getByRole('combobox'), 'braces');
    await user.click(screen.getByRole('button', { name: /generate/i }));
    expect(screen.getByText(`{${MOCK_UUID}}`)).toBeInTheDocument();
  });

  it('clears the UUID list', async () => {
    const user = userEvent.setup();
    render(<UuidGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    // ToolLayout's "Clear all" button (title attr) disambiguates from UuidGenerator's own Clear
    await user.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('copies all UUIDs to clipboard', async () => {
    const user = userEvent.setup();
    // Set clipboard mock AFTER userEvent.setup() to override any clipboard userEvent installs
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<UuidGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await user.click(screen.getByRole('button', { name: /copy all/i }));
    expect(writeTextFn).toHaveBeenCalled();
  });
});
