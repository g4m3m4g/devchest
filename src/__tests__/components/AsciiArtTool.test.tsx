import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AsciiArtTool from '../../components/tools/text/AsciiArtTool';

describe('AsciiArtTool', () => {
  it('renders the tool title', () => {
    render(<AsciiArtTool />);
    expect(screen.getByText('Text to ASCII Art')).toBeInTheDocument();
  });

  it('renders ASCII art for typed text', () => {
    render(<AsciiArtTool />);
    fireEvent.change(screen.getByPlaceholderText(/Type text/), { target: { value: 'L' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('#####');
  });

  it('shows a placeholder when input is empty', () => {
    render(<AsciiArtTool />);
    expect(screen.getByText(/ASCII art will appear here/)).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<AsciiArtTool />);
    const textarea = screen.getByPlaceholderText(/Type text/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'HI' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
