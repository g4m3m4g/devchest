import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WordCharCounter from '../../components/tools/text/WordCharCounter';

describe('WordCharCounter', () => {
  it('renders the tool title', () => {
    render(<WordCharCounter />);
    expect(screen.getByText('Word & Character Counter')).toBeInTheDocument();
  });

  it('shows all-zero stats for empty input', () => {
    render(<WordCharCounter />);
    expect(screen.getByText('Words')).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.getByText('0 sec')).toBeInTheDocument();
  });

  it('updates word and character counts as the user types', async () => {
    const user = userEvent.setup();
    render(<WordCharCounter />);
    const textarea = screen.getByPlaceholderText(/Type or paste your text here/);
    await user.type(textarea, 'hello world');

    const wordsTile = screen.getByText('Words').nextElementSibling;
    expect(wordsTile).toHaveTextContent('2');

    const charsTile = screen.getByText('Characters').nextElementSibling;
    expect(charsTile).toHaveTextContent('11');
  });

  it('counts sentences and paragraphs', async () => {
    const user = userEvent.setup();
    render(<WordCharCounter />);
    const textarea = screen.getByPlaceholderText(/Type or paste your text here/);
    await user.type(textarea, 'One. Two.{Enter}{Enter}Three.');

    const sentencesTile = screen.getByText('Sentences').nextElementSibling;
    expect(sentencesTile).toHaveTextContent('3');

    const paragraphsTile = screen.getByText('Paragraphs').nextElementSibling;
    expect(paragraphsTile).toHaveTextContent('2');
  });

  it('clears input and resets stats on Clear click', async () => {
    const user = userEvent.setup();
    render(<WordCharCounter />);
    const textarea = screen.getByPlaceholderText(/Type or paste your text here/) as HTMLTextAreaElement;
    await user.type(textarea, 'some text');
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
    const wordsTile = screen.getByText('Words').nextElementSibling;
    expect(wordsTile).toHaveTextContent('0');
  });

  it('pastes text from clipboard', async () => {
    const user = userEvent.setup();
    render(<WordCharCounter />);
    const readTextFn = () => Promise.resolve('pasted words here');
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextFn, writeText: () => Promise.resolve() },
      configurable: true,
      writable: true,
    });
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(/Type or paste your text here/) as HTMLTextAreaElement;
    expect(textarea.value).toBe('pasted words here');
  });
});
