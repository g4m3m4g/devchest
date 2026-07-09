import { describe, it, expect } from 'vitest';
import {
  splitLines,
  trimLines,
  collapseSpaces,
  collapseBlankLines,
  stripBlankLines,
  cleanWhitespace,
} from '../../lib/whitespaceLineCleaner';

describe('splitLines', () => {
  it('splits on newlines', () => {
    expect(splitLines('a\nb\nc')).toEqual(['a', 'b', 'c']);
  });

  it('handles CRLF line endings', () => {
    expect(splitLines('a\r\nb\r\nc')).toEqual(['a', 'b', 'c']);
  });

  it('returns an empty array for an empty string', () => {
    expect(splitLines('')).toEqual([]);
  });
});

describe('trimLines', () => {
  it('trims leading and trailing whitespace on each line', () => {
    expect(trimLines(['  a  ', '\tb\t', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('leaves already-trimmed lines unchanged', () => {
    expect(trimLines(['a', 'b'])).toEqual(['a', 'b']);
  });
});

describe('collapseSpaces', () => {
  it('collapses runs of spaces into a single space', () => {
    expect(collapseSpaces(['a    b   c'])).toEqual(['a b c']);
  });

  it('collapses tabs mixed with spaces', () => {
    expect(collapseSpaces(['a\t\t  b'])).toEqual(['a b']);
  });

  it('does not affect leading/trailing whitespace shape beyond collapsing', () => {
    expect(collapseSpaces(['  a  b  '])).toEqual([' a b ']);
  });
});

describe('collapseBlankLines', () => {
  it('collapses multiple consecutive blank lines into one', () => {
    expect(collapseBlankLines(['a', '', '', '', 'b'])).toEqual(['a', '', 'b']);
  });

  it('leaves single blank lines alone', () => {
    expect(collapseBlankLines(['a', '', 'b'])).toEqual(['a', '', 'b']);
  });

  it('treats whitespace-only lines as blank', () => {
    expect(collapseBlankLines(['a', '', '   ', 'b'])).toEqual(['a', '', 'b']);
  });
});

describe('stripBlankLines', () => {
  it('removes all blank lines', () => {
    expect(stripBlankLines(['a', '', 'b', '', '', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('removes whitespace-only lines', () => {
    expect(stripBlankLines(['a', '   ', 'b'])).toEqual(['a', 'b']);
  });

  it('returns an empty array when all lines are blank', () => {
    expect(stripBlankLines(['', '  ', ''])).toEqual([]);
  });
});

describe('cleanWhitespace', () => {
  it('returns lines unchanged when no options are set', () => {
    expect(cleanWhitespace('  a  \n\n\nb', {})).toEqual(['  a  ', '', '', 'b']);
  });

  it('trims lines when trimLines is set', () => {
    expect(cleanWhitespace('  a  \n  b  ', { trimLines: true })).toEqual(['a', 'b']);
  });

  it('collapses spaces when collapseSpaces is set', () => {
    expect(cleanWhitespace('a    b', { collapseSpaces: true })).toEqual(['a b']);
  });

  it('collapses blank lines when collapseBlankLines is set', () => {
    expect(cleanWhitespace('a\n\n\n\nb', { collapseBlankLines: true })).toEqual(['a', '', 'b']);
  });

  it('strips blank lines when stripBlankLines is set', () => {
    expect(cleanWhitespace('a\n\n\nb', { stripBlankLines: true })).toEqual(['a', 'b']);
  });

  it('gives stripBlankLines precedence over collapseBlankLines when both are set', () => {
    expect(
      cleanWhitespace('a\n\n\nb', { stripBlankLines: true, collapseBlankLines: true })
    ).toEqual(['a', 'b']);
  });

  it('trims leading and trailing blank lines from the document when trimDocument is set', () => {
    expect(cleanWhitespace('\n\na\nb\n\n', { trimDocument: true })).toEqual(['a', 'b']);
  });

  it('applies trimLines before collapseSpaces', () => {
    expect(
      cleanWhitespace('  a   b  ', { trimLines: true, collapseSpaces: true })
    ).toEqual(['a b']);
  });

  it('combines all options together', () => {
    expect(
      cleanWhitespace('\n  a    b  \n\n\n  c  \n\n', {
        trimLines: true,
        collapseSpaces: true,
        collapseBlankLines: true,
        trimDocument: true,
      })
    ).toEqual(['a b', '', 'c']);
  });

  it('returns an empty array for empty input', () => {
    expect(cleanWhitespace('', {})).toEqual([]);
  });
});
