import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JwtDecoder from '../../components/tools/encoders/JwtDecoder';

const VALID_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// JWT with exp in the past (expired)
const EXPIRED_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxMDAwMDAwMDAwfQ.' +
  'signature';

describe('JwtDecoder', () => {
  it('renders the tool title', () => {
    render(<JwtDecoder />);
    expect(screen.getByText('JWT Decoder')).toBeInTheDocument();
  });

  it('renders three output panels', () => {
    render(<JwtDecoder />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Payload')).toBeInTheDocument();
    expect(screen.getByText('Signature')).toBeInTheDocument();
  });

  it('shows "Not verified" for signature', () => {
    render(<JwtDecoder />);
    expect(screen.getByText('Not verified')).toBeInTheDocument();
  });

  it('decodes a valid JWT and shows header', () => {
    render(<JwtDecoder />);
    const textarea = screen.getByPlaceholderText(/eyJhbGci/);
    fireEvent.change(textarea, { target: { value: VALID_JWT } });
    // HS256 appears in both the actions span and the pre content — use body assertion
    expect(document.body).toHaveTextContent('HS256');
  });

  it('decodes a valid JWT and shows payload fields', () => {
    render(<JwtDecoder />);
    const textarea = screen.getByPlaceholderText(/eyJhbGci/);
    fireEvent.change(textarea, { target: { value: VALID_JWT } });
    expect(document.body).toHaveTextContent('1234567890');
    expect(document.body).toHaveTextContent('John Doe');
  });

  it('shows error for invalid JWT', () => {
    render(<JwtDecoder />);
    const textarea = screen.getByPlaceholderText(/eyJhbGci/);
    fireEvent.change(textarea, { target: { value: 'not.a.valid.jwt.with.too.many.parts' } });
    expect(screen.getByText(/Invalid JWT/)).toBeInTheDocument();
  });

  it('shows expired status for expired token', () => {
    render(<JwtDecoder />);
    const textarea = screen.getByPlaceholderText(/eyJhbGci/);
    fireEvent.change(textarea, { target: { value: EXPIRED_JWT } });
    expect(screen.getByText(/Expired/)).toBeInTheDocument();
  });

  it('clears input on Clear click', async () => {
    const user = userEvent.setup();
    render(<JwtDecoder />);
    const textarea = screen.getByPlaceholderText(/eyJhbGci/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: VALID_JWT } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
