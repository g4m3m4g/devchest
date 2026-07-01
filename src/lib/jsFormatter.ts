import * as prettier from 'prettier';
import parserBabel from 'prettier/plugins/babel';
import parserEstree from 'prettier/plugins/estree';
import parserTypeScript from 'prettier/plugins/typescript';

export interface JsFormatOptions {
  parser: 'babel' | 'typescript';
  printWidth?: number;
  tabWidth?: number;
  semi?: boolean;
  singleQuote?: boolean;
  trailingComma?: 'all' | 'es5' | 'none';
}

export interface JsFormatResult {
  output: string;
  error: string | null;
}

export async function formatJs(code: string, options: JsFormatOptions): Promise<JsFormatResult> {
  const input = code.trim();
  if (!input) return { output: '', error: null };

  try {
    const plugins =
      options.parser === 'typescript'
        ? [parserBabel, parserEstree, parserTypeScript]
        : [parserBabel, parserEstree];

    const output = await prettier.format(input, {
      parser: options.parser,
      plugins,
      printWidth: options.printWidth ?? 80,
      tabWidth: options.tabWidth ?? 2,
      semi: options.semi ?? true,
      singleQuote: options.singleQuote ?? false,
      trailingComma: options.trailingComma ?? 'all',
    });

    return { output: output.trim(), error: null };
  } catch (e) {
    return { output: '', error: (e as Error).message };
  }
}
