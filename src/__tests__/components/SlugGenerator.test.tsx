import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SlugGenerator from '../../components/tools/text/SlugGenerator';

describe('SlugGenerator', () => {
  it('renders the tool title', () => {
    render(<SlugGenerator />);
    expect(screen.getByText('Slug Generator')).toBeInTheDocument();
  });

  it('slugifies a title as the user types', async () => {
    const user = userEvent.setup();
    render(<SlugGenerator />);
    const input = screen.getByPlaceholderText(/Enter a title to slugify/);
    await user.type(input, 'Hello World');
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('hello-world');
  });

  it('uses an underscore separator when selected', async () => {
    const user = userEvent.setup();
    render(<SlugGenerator />);
    const input = screen.getByPlaceholderText(/Enter a title to slugify/);
    await user.type(input, 'Hello World');
    await user.selectOptions(screen.getByRole('combobox'), '_');
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('hello_world');
  });

  it('preserves case when Lowercase is unchecked', async () => {
    const user = userEvent.setup();
    render(<SlugGenerator />);
    const input = screen.getByPlaceholderText(/Enter a title to slugify/);
    await user.type(input, 'Hello World');
    await user.click(screen.getByRole('checkbox'));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('Hello-World');
  });

  it('truncates to the given max length', async () => {
    const user = userEvent.setup();
    render(<SlugGenerator />);
    const input = screen.getByPlaceholderText(/Enter a title to slugify/);
    await user.type(input, 'one two three');
    const maxLengthInput = screen.getByPlaceholderText('none');
    await user.type(maxLengthInput, '4');
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('one');
  });

  it('clears input on Clear click', async () => {
    const user = userEvent.setup();
    render(<SlugGenerator />);
    const input = screen.getByPlaceholderText(/Enter a title to slugify/) as HTMLInputElement;
    await user.type(input, 'test');
    await user.click(screen.getByTitle('Clear all'));
    expect(input.value).toBe('');
  });
});
