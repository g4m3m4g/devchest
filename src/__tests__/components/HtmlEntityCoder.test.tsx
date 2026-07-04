import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HtmlEntityCoder from '../../components/tools/encoders/HtmlEntityCoder';

describe('HtmlEntityCoder', () => {
  it('renders the tool title', () => {
    render(<HtmlEntityCoder />);
    expect(screen.getByText('HTML Entity Encoder / Decoder')).toBeInTheDocument();
  });

  it('starts in encode mode', () => {
    render(<HtmlEntityCoder />);
    expect(screen.getByText('Raw Text / HTML')).toBeInTheDocument();
    expect(screen.getByText('Encoded Output')).toBeInTheDocument();
  });

  it('encodes reserved characters', () => {
    render(<HtmlEntityCoder />);
    const textarea = screen.getByPlaceholderText(/A & B/);
    fireEvent.change(textarea, { target: { value: '<div>A & B</div>' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('&lt;div&gt;A &amp; B&lt;/div&gt;');
  });

  it('shows the encode-mode toggle only when encoding', async () => {
    const user = userEvent.setup();
    render(<HtmlEntityCoder />);
    expect(screen.getByText('Reserved only')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /decode/i }));
    expect(screen.queryByText('Reserved only')).not.toBeInTheDocument();
  });

  it('encodes non-ASCII characters when "All non-ASCII" is selected', async () => {
    const user = userEvent.setup();
    render(<HtmlEntityCoder />);
    await user.click(screen.getByRole('button', { name: 'All non-ASCII' }));
    const textarea = screen.getByPlaceholderText(/A & B/);
    fireEvent.change(textarea, { target: { value: 'café' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('caf&#233;');
  });

  it('switches to decode mode', async () => {
    const user = userEvent.setup();
    render(<HtmlEntityCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    expect(screen.getByText('Encoded Entities')).toBeInTheDocument();
    expect(screen.getByText('Decoded Text')).toBeInTheDocument();
  });

  it('decodes encoded entities', async () => {
    const user = userEvent.setup();
    render(<HtmlEntityCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    const textarea = screen.getByPlaceholderText(/&lt;div/);
    fireEvent.change(textarea, { target: { value: '&lt;div&gt;A &amp; B&lt;/div&gt;' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('<div>A & B</div>');
  });

  it('shows common entities reference table', () => {
    render(<HtmlEntityCoder />);
    expect(screen.getByText('Common Entities')).toBeInTheDocument();
    expect(screen.getByText('&amp;')).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<HtmlEntityCoder />);
    const textarea = screen.getByPlaceholderText(/A & B/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'test' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
