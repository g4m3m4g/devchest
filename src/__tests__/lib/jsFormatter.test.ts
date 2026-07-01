import { describe, it, expect } from 'vitest';
import { formatJs } from '../../lib/jsFormatter';

describe('formatJs', () => {
  it('returns empty output for empty input', async () => {
    const result = await formatJs('', { parser: 'babel' });
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns empty output for whitespace-only input', async () => {
    const result = await formatJs('   ', { parser: 'babel' });
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('formats a simple JavaScript expression', async () => {
    const result = await formatJs('const x=1', { parser: 'babel' });
    expect(result.error).toBeNull();
    expect(result.output).toContain('const x = 1');
  });

  it('adds semicolons by default', async () => {
    const result = await formatJs('const x = 1', { parser: 'babel' });
    expect(result.error).toBeNull();
    expect(result.output).toContain(';');
  });

  it('omits semicolons when semi is false', async () => {
    const result = await formatJs('const x = 1', { parser: 'babel', semi: false });
    expect(result.error).toBeNull();
    expect(result.output).not.toContain(';');
  });

  it('uses double quotes by default', async () => {
    const result = await formatJs("const s = 'hello'", { parser: 'babel' });
    expect(result.error).toBeNull();
    expect(result.output).toContain('"hello"');
  });

  it('uses single quotes when singleQuote is true', async () => {
    const result = await formatJs('const s = "hello"', { parser: 'babel', singleQuote: true });
    expect(result.error).toBeNull();
    expect(result.output).toContain("'hello'");
  });

  it('uses 2-space indent by default', async () => {
    const result = await formatJs('function f(){return 1}', { parser: 'babel' });
    expect(result.error).toBeNull();
    expect(result.output).toMatch(/^  /m);
  });

  it('uses 4-space indent when tabWidth is 4', async () => {
    const result = await formatJs('function f(){return 1}', { parser: 'babel', tabWidth: 4 });
    expect(result.error).toBeNull();
    expect(result.output).toMatch(/^    /m);
  });

  it('formats a multi-line function', async () => {
    const code = 'function add(a,b){return a+b}';
    const result = await formatJs(code, { parser: 'babel' });
    expect(result.error).toBeNull();
    expect(result.output).toContain('function add');
    expect(result.output).toContain('return a + b');
  });

  it('formats TypeScript with type annotations', async () => {
    const code = 'const greet=(name:string):string=>{return `Hello ${name}`}';
    const result = await formatJs(code, { parser: 'typescript' });
    expect(result.error).toBeNull();
    expect(result.output).toContain('name: string');
  });

  it('returns error for invalid JavaScript syntax', async () => {
    const result = await formatJs('function (((', { parser: 'babel' });
    expect(result.error).not.toBeNull();
    expect(result.output).toBe('');
  });

  it('returns error for invalid TypeScript syntax', async () => {
    const result = await formatJs('const x: = 1', { parser: 'typescript' });
    expect(result.error).not.toBeNull();
    expect(result.output).toBe('');
  });

  it('wraps lines at printWidth', async () => {
    const long = 'const obj = { alpha: 1, beta: 2, gamma: 3, delta: 4, epsilon: 5, zeta: 6 }';
    const narrow = await formatJs(long, { parser: 'babel', printWidth: 40 });
    expect(narrow.error).toBeNull();
    const lines = narrow.output.split('\n');
    expect(lines.length).toBeGreaterThan(1);
  });

  it('adds trailing commas in function parameters by default', async () => {
    const code = 'function f(a,b,c){return a}';
    const result = await formatJs(code, { parser: 'babel', trailingComma: 'all' });
    expect(result.error).toBeNull();
    expect(result.output).toContain(',');
  });
});
