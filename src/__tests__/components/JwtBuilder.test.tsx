import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JwtBuilder from '../../components/tools/encoders/JwtBuilder';

describe('JwtBuilder', () => {
  it('renders the tool title', () => {
    render(<JwtBuilder />);
    expect(screen.getByText('JWT Builder')).toBeInTheDocument();
  });

  it('signs a token by default using the pre-filled payload and secret', () => {
    render(<JwtBuilder />);
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    );
  });

  it('regenerates the token when the payload changes', () => {
    render(<JwtBuilder />);
    const textareas = document.querySelectorAll('textarea');
    const payloadTextarea = textareas[1];
    fireEvent.change(payloadTextarea, { target: { value: '{"foo":"bar"}' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).not.toBe('');
    expect(pre?.textContent?.split('.')).toHaveLength(3);
  });

  it('regenerates the token when the secret changes', () => {
    render(<JwtBuilder />);
    const before = document.querySelector('pre')?.textContent;
    const secretInput = screen.getByPlaceholderText('your-256-bit-secret');
    fireEvent.change(secretInput, { target: { value: 'a-different-secret' } });
    const after = document.querySelector('pre')?.textContent;
    expect(after).not.toBe(before);
  });

  it('shows an error for invalid payload JSON', () => {
    render(<JwtBuilder />);
    const payloadTextarea = document.querySelectorAll('textarea')[1];
    fireEvent.change(payloadTextarea, { target: { value: 'not json' } });
    expect(screen.getByText('Payload must be valid JSON')).toBeInTheDocument();
  });

  it('toggles the secret field visibility', () => {
    render(<JwtBuilder />);
    const secretInput = screen.getByPlaceholderText('your-256-bit-secret') as HTMLInputElement;
    expect(secretInput.type).toBe('password');
    fireEvent.click(screen.getByTitle('Show secret'));
    expect(secretInput.type).toBe('text');
  });

  it('resets fields on Clear click', () => {
    render(<JwtBuilder />);
    const secretInput = screen.getByPlaceholderText('your-256-bit-secret') as HTMLInputElement;
    fireEvent.change(secretInput, { target: { value: 'custom-secret' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(secretInput.value).toBe('');
  });
});
