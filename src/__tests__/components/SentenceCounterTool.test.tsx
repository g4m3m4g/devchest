import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SentenceCounterTool from '../../components/tools/text/SentenceCounterTool';

describe('SentenceCounterTool', () => {
  it('renders the tool title', () => {
    render(<SentenceCounterTool />);
    expect(screen.getByText('Sentence Counter')).toBeInTheDocument();
  });

  it('shows sentence and word counts', () => {
    render(<SentenceCounterTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste text/), { target: { value: 'One two. Three four five.' } });
    expect(screen.getByText('2', { selector: '.stat-sentences' })).toBeInTheDocument();
    expect(screen.getByText('5', { selector: '.stat-words' })).toBeInTheDocument();
  });

  it('shows the average words per sentence', () => {
    render(<SentenceCounterTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste text/), { target: { value: 'One two. Three four five.' } });
    expect(screen.getByText('2.5', { selector: '.stat-average' })).toBeInTheDocument();
  });

  it('shows zeroed stats for empty input', () => {
    render(<SentenceCounterTool />);
    expect(screen.getByText('0', { selector: '.stat-sentences' })).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<SentenceCounterTool />);
    const textarea = screen.getByPlaceholderText(/Paste text/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'abc' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
