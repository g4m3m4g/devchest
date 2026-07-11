import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PassphraseGenerator from '../../components/tools/generators/PassphraseGenerator';

describe('PassphraseGenerator', () => {
  it('renders the tool title', () => {
    render(<PassphraseGenerator />);
    expect(screen.getByText('Passphrase Generator')).toBeInTheDocument();
  });

  it('shows empty state before generation', () => {
    render(<PassphraseGenerator />);
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('generates a passphrase with the selected word count when Generate is clicked', async () => {
    const user = userEvent.setup();
    render(<PassphraseGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    const text = screen.getByTestId('generated-passphrase').textContent ?? '';
    expect(text.split('-')).toHaveLength(6);
  });

  it('regenerates with a new word count when the word count input changes', async () => {
    const user = userEvent.setup();
    render(<PassphraseGenerator />);
    fireEvent.change(screen.getByDisplayValue('6'), { target: { value: '4' } });
    await user.click(screen.getByRole('button', { name: /generate/i }));
    const text = screen.getByTestId('generated-passphrase').textContent ?? '';
    expect(text.split('-')).toHaveLength(4);
  });

  it('changes separator when the format select is changed', async () => {
    const user = userEvent.setup();
    render(<PassphraseGenerator />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'underscore' } });
    await user.click(screen.getByRole('button', { name: /generate/i }));
    const text = screen.getByTestId('generated-passphrase').textContent ?? '';
    expect(text).toContain('_');
  });

  it('shows an entropy and strength readout after generation', async () => {
    const user = userEvent.setup();
    render(<PassphraseGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    expect(screen.getByText(/bits/i)).toBeInTheDocument();
  });

  it('clears the passphrase', async () => {
    const user = userEvent.setup();
    render(<PassphraseGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await user.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('copies the passphrase to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<PassphraseGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await user.click(screen.getByTitle('Copy output'));
    expect(writeTextFn).toHaveBeenCalled();
  });
});
