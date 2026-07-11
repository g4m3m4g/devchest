import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordGenerator from '../../components/tools/generators/PasswordGenerator';

describe('PasswordGenerator', () => {
  it('renders the tool title', () => {
    render(<PasswordGenerator />);
    expect(screen.getByText('Password Generator')).toBeInTheDocument();
  });

  it('shows empty state before generation', () => {
    render(<PasswordGenerator />);
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('generates a password of the selected length when Generate is clicked', async () => {
    const user = userEvent.setup();
    render(<PasswordGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    expect(screen.getByTestId('generated-password').textContent).toHaveLength(16);
  });

  it('regenerates with a new length when the length input changes', async () => {
    const user = userEvent.setup();
    render(<PasswordGenerator />);
    fireEvent.change(screen.getByDisplayValue('16'), { target: { value: '24' } });
    await user.click(screen.getByRole('button', { name: /generate/i }));
    expect(screen.getByTestId('generated-password').textContent).toHaveLength(24);
  });

  it('disables Generate when all charset checkboxes are off', async () => {
    const user = userEvent.setup();
    render(<PasswordGenerator />);
    await user.click(screen.getByLabelText(/uppercase/i));
    await user.click(screen.getByLabelText(/digits/i));
    await user.click(screen.getByLabelText(/symbols/i));
    // lowercase remains checked by default; uncheck it too
    await user.click(screen.getByLabelText(/lowercase/i));
    expect(screen.getByRole('button', { name: /generate/i })).toBeDisabled();
  });

  it('shows an entropy and strength readout after generation', async () => {
    const user = userEvent.setup();
    render(<PasswordGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    expect(screen.getByText(/bits/i)).toBeInTheDocument();
  });

  it('clears the password', async () => {
    const user = userEvent.setup();
    render(<PasswordGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await user.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('copies the password to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<PasswordGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await user.click(screen.getByTitle('Copy output'));
    expect(writeTextFn).toHaveBeenCalled();
  });
});
