import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReadabilityTool from '../../components/tools/text/ReadabilityTool';

describe('ReadabilityTool', () => {
  it('renders the tool title', () => {
    render(<ReadabilityTool />);
    expect(screen.getByText('Readability Score')).toBeInTheDocument();
  });

  it('shows word, sentence, and syllable counts', () => {
    render(<ReadabilityTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste text/), { target: { value: 'Cat sat.' } });
    expect(screen.getByText('2', { selector: '.stat-words' })).toBeInTheDocument();
    expect(screen.getByText('1', { selector: '.stat-sentences' })).toBeInTheDocument();
    expect(screen.getByText('2', { selector: '.stat-syllables' })).toBeInTheDocument();
  });

  it('shows the Flesch Reading Ease score', () => {
    render(<ReadabilityTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste text/), { target: { value: 'Cat sat.' } });
    expect(screen.getByText('120.2', { selector: '.stat-ease' })).toBeInTheDocument();
  });

  it('shows zeroed stats for empty input', () => {
    render(<ReadabilityTool />);
    expect(screen.getByText('0', { selector: '.stat-words' })).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<ReadabilityTool />);
    const textarea = screen.getByPlaceholderText(/Paste text/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'abc' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});
