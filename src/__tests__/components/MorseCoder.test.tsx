import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MorseCoder from '../../components/tools/encoders/MorseCoder';

describe('MorseCoder', () => {
  it('renders the tool title', () => {
    render(<MorseCoder />);
    expect(screen.getByText('Morse Code Encoder / Decoder')).toBeInTheDocument();
  });

  it('starts in encode mode', () => {
    render(<MorseCoder />);
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('Morse Output')).toBeInTheDocument();
  });

  it('encodes text to Morse code', () => {
    render(<MorseCoder />);
    const textarea = screen.getByPlaceholderText(/Enter text to encode/);
    fireEvent.change(textarea, { target: { value: 'SOS' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('... --- ...');
  });

  it('switches to decode mode', async () => {
    const user = userEvent.setup();
    render(<MorseCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    expect(screen.getByText('Morse Code')).toBeInTheDocument();
    expect(screen.getByText('Decoded Text')).toBeInTheDocument();
  });

  it('decodes Morse code back to text', async () => {
    const user = userEvent.setup();
    render(<MorseCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    const textarea = screen.getByPlaceholderText(/\.\.\.\./);
    fireEvent.change(textarea, { target: { value: '... --- ...' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('SOS');
  });

  it('shows an error for unencodable characters', () => {
    render(<MorseCoder />);
    const textarea = screen.getByPlaceholderText(/Enter text to encode/);
    fireEvent.change(textarea, { target: { value: 'café' } });
    expect(screen.getByText(/Cannot encode character/)).toBeInTheDocument();
  });

  it('shows an error for invalid Morse sequences', async () => {
    const user = userEvent.setup();
    render(<MorseCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    const textarea = screen.getByPlaceholderText(/\.\.\.\./);
    fireEvent.change(textarea, { target: { value: '.......' } });
    expect(screen.getByText(/Invalid Morse code sequence/)).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<MorseCoder />);
    const textarea = screen.getByPlaceholderText(/Enter text to encode/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'test' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
