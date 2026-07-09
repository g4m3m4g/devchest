import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LevenshteinTool from '../../components/tools/text/LevenshteinTool';

describe('LevenshteinTool', () => {
  it('renders the tool title', () => {
    render(<LevenshteinTool />);
    expect(screen.getByText('Levenshtein Distance Calculator')).toBeInTheDocument();
  });

  it('computes the distance between two strings', () => {
    render(<LevenshteinTool />);
    fireEvent.change(screen.getByPlaceholderText('First string…'), { target: { value: 'kitten' } });
    fireEvent.change(screen.getByPlaceholderText('Second string…'), { target: { value: 'sitting' } });
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows 100% similarity for identical strings', () => {
    render(<LevenshteinTool />);
    fireEvent.change(screen.getByPlaceholderText('First string…'), { target: { value: 'abc' } });
    fireEvent.change(screen.getByPlaceholderText('Second string…'), { target: { value: 'abc' } });
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('clears both inputs on Clear click', () => {
    render(<LevenshteinTool />);
    const first = screen.getByPlaceholderText('First string…') as HTMLTextAreaElement;
    const second = screen.getByPlaceholderText('Second string…') as HTMLTextAreaElement;
    fireEvent.change(first, { target: { value: 'abc' } });
    fireEvent.change(second, { target: { value: 'xyz' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(first.value).toBe('');
    expect(second.value).toBe('');
  });
});
