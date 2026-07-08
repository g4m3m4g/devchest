import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataUrlFileConverter from '../../components/tools/encoders/DataUrlFileConverter';

describe('DataUrlFileConverter', () => {
  it('renders the tool title', () => {
    render(<DataUrlFileConverter />);
    expect(screen.getByText('Data URL ↔ File Converter')).toBeInTheDocument();
  });

  it('starts in File → Data URL mode', () => {
    render(<DataUrlFileConverter />);
    expect(screen.getByText(/Drop any file here/)).toBeInTheDocument();
  });

  it('switches to Data URL → File mode', async () => {
    const user = userEvent.setup();
    render(<DataUrlFileConverter />);
    await user.click(screen.getByRole('button', { name: 'Data URL → File' }));
    expect(screen.getByPlaceholderText(/Paste a data:/)).toBeInTheDocument();
  });

  it('decodes a valid data URL and shows its MIME type and size', () => {
    render(<DataUrlFileConverter />);
    fireEvent.click(screen.getByRole('button', { name: 'Data URL → File' }));
    const textarea = screen.getByPlaceholderText(/Paste a data:/);
    fireEvent.change(textarea, { target: { value: 'data:text/plain;base64,aGVsbG8h' } });
    expect(screen.getByText('text/plain')).toBeInTheDocument();
    expect(screen.getByText('6 B')).toBeInTheDocument();
  });

  it('shows an image preview for image data URLs', () => {
    render(<DataUrlFileConverter />);
    fireEvent.click(screen.getByRole('button', { name: 'Data URL → File' }));
    const textarea = screen.getByPlaceholderText(/Paste a data:/);
    fireEvent.change(textarea, { target: { value: 'data:image/png;base64,iVBORw0KGgo=' } });
    const img = screen.getByAltText('Preview') as HTMLImageElement;
    expect(img.src).toContain('data:image/png;base64,iVBORw0KGgo=');
  });

  it('shows an error for an invalid data URL', () => {
    render(<DataUrlFileConverter />);
    fireEvent.click(screen.getByRole('button', { name: 'Data URL → File' }));
    const textarea = screen.getByPlaceholderText(/Paste a data:/);
    fireEvent.change(textarea, { target: { value: 'not a data url' } });
    expect(screen.getByText('Not a valid data URL.')).toBeInTheDocument();
  });

  it('shows a Download File button once a data URL is decoded', () => {
    render(<DataUrlFileConverter />);
    fireEvent.click(screen.getByRole('button', { name: 'Data URL → File' }));
    const textarea = screen.getByPlaceholderText(/Paste a data:/);
    fireEvent.change(textarea, { target: { value: 'data:text/plain;base64,aGVsbG8h' } });
    expect(screen.getByRole('button', { name: /Download File/ })).toBeInTheDocument();
  });

  it('triggers a download when clicking Download File', () => {
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') el.click = clickSpy;
      return el;
    });

    render(<DataUrlFileConverter />);
    fireEvent.click(screen.getByRole('button', { name: 'Data URL → File' }));
    const textarea = screen.getByPlaceholderText(/Paste a data:/);
    fireEvent.change(textarea, { target: { value: 'data:text/plain;base64,aGVsbG8h' } });
    fireEvent.click(screen.getByRole('button', { name: /Download File/ }));
    expect(clickSpy).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('clears the data URL input on Clear click', () => {
    render(<DataUrlFileConverter />);
    fireEvent.click(screen.getByRole('button', { name: 'Data URL → File' }));
    const textarea = screen.getByPlaceholderText(/Paste a data:/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'data:text/plain;base64,aGVsbG8h' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('renders the file drop zone in File → Data URL mode', () => {
    render(<DataUrlFileConverter />);
    expect(screen.getByText(/Drop any file here, or click to choose one/)).toBeInTheDocument();
  });
});
