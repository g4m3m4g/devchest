import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextReverse from '../../components/tools/text/TextReverse';

describe('TextReverse', () => {
  it('renders the tool title', () => {
    render(<TextReverse />);
    expect(screen.getByText('Text Reverse')).toBeInTheDocument();
  });

  it('reverses characters by default', async () => {
    const user = userEvent.setup();
    render(<TextReverse />);
    const textarea = screen.getByPlaceholderText(/Type or paste your text here/);
    await user.type(textarea, 'hello');
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('olleh');
  });

  it('reverses word order when Words mode is selected', async () => {
    const user = userEvent.setup();
    render(<TextReverse />);
    await user.click(screen.getByRole('button', { name: 'Words' }));
    const textarea = screen.getByPlaceholderText(/Type or paste your text here/);
    await user.type(textarea, 'the quick fox');
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('fox quick the');
  });

  it('reverses line order when Lines mode is selected', () => {
    render(<TextReverse />);
    fireEvent.click(screen.getByRole('button', { name: 'Lines' }));
    const textarea = screen.getByPlaceholderText(/Type or paste your text here/);
    fireEvent.change(textarea, { target: { value: 'a\nb\nc' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('c\nb\na');
  });

  it('clears input on Clear click', async () => {
    const user = userEvent.setup();
    render(<TextReverse />);
    const textarea = screen.getByPlaceholderText(/Type or paste your text here/) as HTMLTextAreaElement;
    await user.type(textarea, 'test');
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
