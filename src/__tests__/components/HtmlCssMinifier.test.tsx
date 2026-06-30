import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HtmlCssMinifier from '../../components/tools/formatters/HtmlCssMinifier';

describe('HtmlCssMinifier', () => {
  it('renders the tool title', () => {
    render(<HtmlCssMinifier />);
    expect(screen.getByText('HTML / CSS Minifier')).toBeInTheDocument();
  });

  it('shows HTML mode tab active by default', () => {
    render(<HtmlCssMinifier />);
    const htmlBtn = screen.getByRole('button', { name: /html/i });
    expect(htmlBtn.className).toContain('text-white');
  });

  it('minifies HTML input (removes extra whitespace between tags)', () => {
    render(<HtmlCssMinifier />);
    const textarea = screen.getByPlaceholderText(/<div/);
    fireEvent.change(textarea, { target: { value: '<div>   <p>hello</p>   </div>' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('<div><p>hello</p></div>');
  });

  it('removes HTML comments', () => {
    render(<HtmlCssMinifier />);
    const textarea = screen.getByPlaceholderText(/<div/);
    fireEvent.change(textarea, { target: { value: '<!-- comment --><p>hi</p>' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('<p>hi</p>');
  });

  it('switches to CSS mode', async () => {
    const user = userEvent.setup();
    render(<HtmlCssMinifier />);
    await user.click(screen.getByRole('button', { name: /css/i }));
    expect(screen.getByPlaceholderText(/.container/)).toBeInTheDocument();
  });

  it('minifies CSS input', async () => {
    const user = userEvent.setup();
    render(<HtmlCssMinifier />);
    await user.click(screen.getByRole('button', { name: /css/i }));
    const textarea = screen.getByPlaceholderText(/.container/);
    // Use fireEvent to avoid special-char escaping issues with { } in userEvent
    fireEvent.change(textarea, { target: { value: '.a { color: red; }' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('.a{color:red}');
  });

  it('removes CSS comments', async () => {
    const user = userEvent.setup();
    render(<HtmlCssMinifier />);
    await user.click(screen.getByRole('button', { name: /css/i }));
    const textarea = screen.getByPlaceholderText(/.container/);
    fireEvent.change(textarea, { target: { value: '/* comment */ .a { color: red; }' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).not.toContain('comment');
    expect(pre?.textContent).toContain('color:red');
  });

  it('shows byte savings', () => {
    render(<HtmlCssMinifier />);
    const textarea = screen.getByPlaceholderText(/<div/);
    fireEvent.change(textarea, { target: { value: '<div>   <p>hello</p>   </div>' } });
    expect(screen.getByText(/%/)).toBeInTheDocument();
  });

  it('clears input on Clear click', async () => {
    const user = userEvent.setup();
    render(<HtmlCssMinifier />);
    const textarea = screen.getByPlaceholderText(/<div/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '<p>test</p>' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
