import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import XmlFormatter from '../../components/tools/formatters/XmlFormatter';

describe('XmlFormatter', () => {
  it('renders the tool title', () => {
    render(<XmlFormatter />);
    expect(screen.getByText('XML Formatter')).toBeInTheDocument();
  });

  it('renders input and output panels', () => {
    render(<XmlFormatter />);
    expect(screen.getByText('Input XML')).toBeInTheDocument();
    expect(screen.getByText('Formatted Output')).toBeInTheDocument();
  });

  it('formats valid XML with 2-space indent by default', () => {
    render(<XmlFormatter />);
    const textarea = screen.getByPlaceholderText(/<root/);
    fireEvent.change(textarea, { target: { value: '<root><child>text</child></root>' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toMatch(/^\s{2}<child>/m);
  });

  it('shows Valid badge for valid XML', () => {
    render(<XmlFormatter />);
    const textarea = screen.getByPlaceholderText(/<root/);
    fireEvent.change(textarea, { target: { value: '<root><item>hello</item></root>' } });
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('shows Invalid XML badge and error for malformed XML', () => {
    render(<XmlFormatter />);
    const textarea = screen.getByPlaceholderText(/<root/);
    fireEvent.change(textarea, { target: { value: '<root><unclosed>' } });
    expect(screen.getByText('Invalid XML')).toBeInTheDocument();
  });

  it('switches to 4-space indent', async () => {
    const user = userEvent.setup();
    render(<XmlFormatter />);
    await user.click(screen.getByText('4sp'));
    const textarea = screen.getByPlaceholderText(/<root/);
    fireEvent.change(textarea, { target: { value: '<root><child>text</child></root>' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toMatch(/^\s{4}<child>/m);
  });

  it('clears input when Clear is clicked', async () => {
    const user = userEvent.setup();
    render(<XmlFormatter />);
    const textarea = screen.getByPlaceholderText(/<root/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '<root/>' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes text when Paste is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('<root><item>pasted</item></root>');
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextFn, writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
    render(<XmlFormatter />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(/<root/) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('<root><item>pasted</item></root>');
    });
  });
});
