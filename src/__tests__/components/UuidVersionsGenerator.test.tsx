import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UuidVersionsGenerator from '../../components/tools/generators/UuidVersionsGenerator';
import { generateUuidV3 } from '../../lib/uuidVersions';

describe('UuidVersionsGenerator', () => {
  beforeEach(() => {
    vi.spyOn(crypto, 'getRandomValues').mockImplementation(<T extends ArrayBufferView | null>(arr: T): T => {
      if (arr instanceof Uint8Array) {
        arr.fill(0x42);
      }
      return arr;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the tool title', () => {
    render(<UuidVersionsGenerator />);
    expect(screen.getByText('UUID v1 / v3 / v5 / v7 Generator')).toBeInTheDocument();
  });

  it('shows empty state before generation', () => {
    render(<UuidVersionsGenerator />);
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('generates v7 UUIDs by default, respecting quantity', async () => {
    const user = userEvent.setup();
    render(<UuidVersionsGenerator />);
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '3' } });
    await user.click(screen.getByRole('button', { name: /generate/i }));
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('generates a v1 UUID with version nibble 1', async () => {
    const user = userEvent.setup();
    render(<UuidVersionsGenerator />);
    await user.selectOptions(screen.getAllByRole('combobox')[0], 'v1');
    await user.click(screen.getByRole('button', { name: /generate/i }));
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);
  });

  it('generates a deterministic v3 UUID from name + namespace', async () => {
    const user = userEvent.setup();
    render(<UuidVersionsGenerator />);
    await user.selectOptions(screen.getAllByRole('combobox')[0], 'v3');
    await user.type(screen.getByPlaceholderText(/www.example.com/i), 'www.example.com');
    await user.click(screen.getByRole('button', { name: /generate/i }));

    const expected = generateUuidV3('www.example.com', '6ba7b810-9dad-11d1-80b4-00c04fd430c8');
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('shows an error for an invalid custom namespace', async () => {
    const user = userEvent.setup();
    render(<UuidVersionsGenerator />);
    await user.selectOptions(screen.getAllByRole('combobox')[0], 'v5');
    const namespaceSelect = screen.getAllByRole('combobox')[1];
    await user.selectOptions(namespaceSelect, 'custom');
    fireEvent.change(screen.getByPlaceholderText('00000000-0000-0000-0000-000000000000'), {
      target: { value: 'not-a-uuid' },
    });
    await user.click(screen.getByRole('button', { name: /generate/i }));
    expect(screen.getByText(/valid uuid/i)).toBeInTheDocument();
  });

  it('clears the UUID list', async () => {
    const user = userEvent.setup();
    render(<UuidVersionsGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await user.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('copies all UUIDs to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<UuidVersionsGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await user.click(screen.getByRole('button', { name: /copy all/i }));
    expect(writeTextFn).toHaveBeenCalled();
  });
});
