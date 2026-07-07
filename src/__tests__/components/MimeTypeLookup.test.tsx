import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MimeTypeLookup from '../../components/tools/encoders/MimeTypeLookup';
import { MIME_TYPES } from '../../lib/mimeTypes';

describe('MimeTypeLookup', () => {
  it('renders the tool title', () => {
    render(<MimeTypeLookup />);
    expect(screen.getByText('MIME Type Lookup')).toBeInTheDocument();
  });

  it('shows every entry by default', () => {
    render(<MimeTypeLookup />);
    expect(screen.getByText(`Results (${MIME_TYPES.length})`)).toBeInTheDocument();
  });

  it('filters results as the user types', () => {
    render(<MimeTypeLookup />);
    const input = screen.getByPlaceholderText(/png, image\/png/);
    fireEvent.change(input, { target: { value: 'json' } });
    expect(screen.getAllByText('application/json').length).toBeGreaterThan(0);
    expect(screen.queryByText('image/png')).not.toBeInTheDocument();
  });

  it('shows an exact match callout when looking up by extension', () => {
    render(<MimeTypeLookup />);
    const input = screen.getByPlaceholderText(/png, image\/png/);
    fireEvent.change(input, { target: { value: 'pdf' } });
    expect(screen.getAllByText('application/pdf').length).toBeGreaterThan(0);
    expect(document.body).toHaveTextContent('.pdf · Application');
  });

  it('shows an exact match callout when looking up by MIME type', () => {
    render(<MimeTypeLookup />);
    const input = screen.getByPlaceholderText(/png, image\/png/);
    fireEvent.change(input, { target: { value: 'image/svg+xml' } });
    expect(document.body).toHaveTextContent('.svg · Image');
  });

  it('shows a no-results message for an unmatched query', () => {
    render(<MimeTypeLookup />);
    const input = screen.getByPlaceholderText(/png, image\/png/);
    fireEvent.change(input, { target: { value: 'zzzznotreal' } });
    expect(screen.getByText('No matching MIME types found.')).toBeInTheDocument();
  });

  it('clears the query on Clear click', () => {
    render(<MimeTypeLookup />);
    const input = screen.getByPlaceholderText(/png, image\/png/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'json' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(input.value).toBe('');
    expect(screen.getByText(`Results (${MIME_TYPES.length})`)).toBeInTheDocument();
  });
});
