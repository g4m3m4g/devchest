import * as prettier from 'prettier';
import parserGraphql from 'prettier/plugins/graphql';

export interface GraphqlFormatResult {
  output: string;
  error: string | null;
}

export async function formatGraphql(
  code: string,
  printWidth = 80,
): Promise<GraphqlFormatResult> {
  const input = code.trim();
  if (!input) return { output: '', error: null };

  try {
    const output = await prettier.format(input, {
      parser: 'graphql',
      plugins: [parserGraphql],
      printWidth,
      tabWidth: 2,
    });
    return { output: output.trim(), error: null };
  } catch (e) {
    return { output: '', error: (e as Error).message };
  }
}
