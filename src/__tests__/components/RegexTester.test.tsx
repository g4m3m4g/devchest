import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegexTester from '../../components/tools/text/RegexTester';

describe('RegexTester', () => {
  it('renders the tool title', () => {
    render(<RegexTester />);
    expect(screen.getByText('Regex Tester')).toBeInTheDocument();
  });

  it('renders pattern input with delimiters', () => {
    render(<RegexTester />);
    const slashes = screen.getAllByText('/');
    expect(slashes.length).toBeGreaterThanOrEqual(2);
  });

  it('renders flag buttons', () => {
    render(<RegexTester />);
    expect(screen.getByTitle('global (always on)')).toBeInTheDocument();
    expect(screen.getByTitle('case insensitive')).toBeInTheDocument();
    expect(screen.getByTitle('multiline')).toBeInTheDocument();
  });

  it('finds a match and shows match count', async () => {
    const user = userEvent.setup();
    render(<RegexTester />);
    const patternInput = screen.getByPlaceholderText(/Enter regex pattern/);
    const testInput = screen.getByPlaceholderText(/Enter text to test/);
    await user.type(patternInput, 'world');
    await user.type(testInput, 'hello world');
    expect(screen.getByText('1 match')).toBeInTheDocument();
  });

  it('counts multiple matches', async () => {
    const user = userEvent.setup();
    render(<RegexTester />);
    const patternInput = screen.getByPlaceholderText(/Enter regex pattern/);
    const testInput = screen.getByPlaceholderText(/Enter text to test/);
    await user.type(patternInput, 'a');
    await user.type(testInput, 'banana');
    expect(screen.getByText('3 matches')).toBeInTheDocument();
  });

  it('shows "No matches" when pattern does not match', async () => {
    const user = userEvent.setup();
    render(<RegexTester />);
    const patternInput = screen.getByPlaceholderText(/Enter regex pattern/);
    const testInput = screen.getByPlaceholderText(/Enter text to test/);
    await user.type(patternInput, 'xyz');
    await user.type(testInput, 'hello world');
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });

  it('shows invalid regex error for bad pattern', () => {
    render(<RegexTester />);
    const patternInput = screen.getByPlaceholderText(/Enter regex pattern/);
    const testInput = screen.getByPlaceholderText(/Enter text to test/);
    // getRegexSegments returns error:null when testString is empty, so we need both
    fireEvent.change(testInput, { target: { value: 'test' } });
    // fireEvent avoids userEvent's bracket-key special-char interpretation for [
    fireEvent.change(patternInput, { target: { value: '[invalid' } });
    expect(document.body).toHaveTextContent('Invalid regex');
  });

  it('clears both inputs on Clear click', async () => {
    const user = userEvent.setup();
    render(<RegexTester />);
    const patternInput = screen.getByPlaceholderText(/Enter regex pattern/) as HTMLInputElement;
    const testInput = screen.getByPlaceholderText(/Enter text to test/) as HTMLTextAreaElement;
    await user.type(patternInput, 'test');
    await user.type(testInput, 'test string');
    await user.click(screen.getByTitle('Clear all'));
    expect(patternInput.value).toBe('');
    expect(testInput.value).toBe('');
  });

  it('case insensitive flag toggle works', async () => {
    const user = userEvent.setup();
    render(<RegexTester />);
    const iFlag = screen.getByTitle('case insensitive');
    await user.click(iFlag);
    expect(iFlag.className).toContain('text-blue-400');
  });
});
