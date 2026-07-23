import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import XmlToJsonTool from '../../components/tools/data/XmlToJsonTool';

describe('XmlToJsonTool', () => {
  it('renders the tool title', () => {
    render(<XmlToJsonTool />);
    expect(screen.getByText('XML to JSON Converter')).toBeInTheDocument();
  });

  it('renders input and output panels', () => {
    render(<XmlToJsonTool />);
    expect(screen.getByText('Input XML')).toBeInTheDocument();
    expect(screen.getByText('JSON Output')).toBeInTheDocument();
  });

  it('converts XML to JSON', () => {
    render(<XmlToJsonTool />);
    const textarea = screen.getByPlaceholderText(/<root>/);
    fireEvent.change(textarea, { target: { value: '<root><name>Alice</name></root>' } });
    expect(document.body).toHaveTextContent('"name": "Alice"');
  });

  it('shows an error badge for malformed XML', () => {
    render(<XmlToJsonTool />);
    const textarea = screen.getByPlaceholderText(/<root>/);
    fireEvent.change(textarea, { target: { value: '<root><unclosed>' } });
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('clears input when Clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<XmlToJsonTool />);
    const textarea = screen.getByPlaceholderText(/<root>/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '<a>1</a>' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes text when Paste button is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('<a>1</a>');
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined), readText: readTextFn },
      configurable: true,
      writable: true,
    });
    render(<XmlToJsonTool />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(/<root>/) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('<a>1</a>');
    });
  });
});
