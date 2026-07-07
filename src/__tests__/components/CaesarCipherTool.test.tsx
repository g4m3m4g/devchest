import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CaesarCipherTool from '../../components/tools/encoders/CaesarCipherTool';

describe('CaesarCipherTool', () => {
  it('renders the tool title', () => {
    render(<CaesarCipherTool />);
    expect(screen.getByText('Caesar Cipher / ROT-13')).toBeInTheDocument();
  });

  it('starts in encode mode with a default shift of 13', () => {
    render(<CaesarCipherTool />);
    expect(screen.getByText('Plain Text')).toBeInTheDocument();
    const shiftInput = screen.getByLabelText('Shift') as HTMLInputElement;
    expect(shiftInput.value).toBe('13');
  });

  it('encodes text with the default ROT-13 shift', () => {
    render(<CaesarCipherTool />);
    const textarea = screen.getByPlaceholderText(/Enter text to encode/);
    fireEvent.change(textarea, { target: { value: 'Hello, World!' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('Uryyb, Jbeyq!');
  });

  it('encodes with a custom shift', () => {
    render(<CaesarCipherTool />);
    const shiftInput = screen.getByLabelText('Shift');
    fireEvent.change(shiftInput, { target: { value: '3' } });
    const textarea = screen.getByPlaceholderText(/Enter text to encode/);
    fireEvent.change(textarea, { target: { value: 'abc' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('def');
  });

  it('switches to decode mode', async () => {
    const user = userEvent.setup();
    render(<CaesarCipherTool />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    expect(screen.getByText('Cipher Text')).toBeInTheDocument();
    const panels = screen.getAllByText('Plain Text');
    expect(panels.length).toBeGreaterThan(0);
  });

  it('decodes cipher text back to plain text', async () => {
    const user = userEvent.setup();
    render(<CaesarCipherTool />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    const textarea = screen.getByPlaceholderText(/Enter text to decode/);
    fireEvent.change(textarea, { target: { value: 'Uryyb, Jbeyq!' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('Hello, World!');
  });

  it('resets the shift to 13 when the ROT-13 preset is clicked', () => {
    render(<CaesarCipherTool />);
    const shiftInput = screen.getByLabelText('Shift') as HTMLInputElement;
    fireEvent.change(shiftInput, { target: { value: '5' } });
    expect(shiftInput.value).toBe('5');
    fireEvent.click(screen.getByRole('button', { name: 'ROT-13' }));
    expect(shiftInput.value).toBe('13');
  });

  it('clears input on Clear click', () => {
    render(<CaesarCipherTool />);
    const textarea = screen.getByPlaceholderText(/Enter text to encode/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'test' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
