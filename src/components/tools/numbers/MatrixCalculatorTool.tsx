import { useState, useMemo } from 'react';
import { add, subtract, multiply, transpose, determinant, inverse } from '../../../lib/matrixCalculator';
import type { Matrix } from '../../../lib/matrixCalculator';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const selectClass = 'flex-1 bg-white/5 border border-white/5 text-neutral-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/40';
const textareaClass = 'flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40 resize-none';
const outputClass = 'flex-1 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-emerald-400 outline-none resize-none';

const OPERATIONS = ['ADD', 'SUBTRACT', 'MULTIPLY', 'TRANSPOSE', 'DETERMINANT', 'INVERSE'] as const;
type Operation = (typeof OPERATIONS)[number];

const OP_LABELS: Record<Operation, string> = {
  ADD: 'Add (A + B)',
  SUBTRACT: 'Subtract (A − B)',
  MULTIPLY: 'Multiply (A × B)',
  TRANSPOSE: 'Transpose (A)',
  DETERMINANT: 'Determinant (A)',
  INVERSE: 'Inverse (A)',
};

const NEEDS_B: Record<Operation, boolean> = {
  ADD: true,
  SUBTRACT: true,
  MULTIPLY: true,
  TRANSPOSE: false,
  DETERMINANT: false,
  INVERSE: false,
};

function parseMatrix(text: string): Matrix {
  const rows = text
    .split('\n')
    .map(row => row.trim())
    .filter(row => row !== '');
  if (rows.length === 0) {
    throw new Error('Enter at least one row');
  }
  const matrix = rows.map(row =>
    row.split(/[,\s]+/).filter(Boolean).map(value => {
      const num = Number(value);
      if (Number.isNaN(num)) throw new Error(`"${value}" is not a valid number`);
      return num;
    })
  );
  const width = matrix[0].length;
  if (matrix.some(row => row.length !== width)) {
    throw new Error('All rows must have the same number of columns');
  }
  return matrix;
}

function formatMatrix(m: Matrix): string {
  return m.map(row => row.map(v => (Number.isInteger(v) ? v : Math.round(v * 10000) / 10000)).join(', ')).join('\n');
}

export default function MatrixCalculatorTool() {
  const [operation, setOperation] = useState<Operation>('ADD');
  const [matrixAText, setMatrixAText] = useState('1,2\n3,4');
  const [matrixBText, setMatrixBText] = useState('5,6\n7,8');

  const result = useMemo(() => {
    try {
      const a = parseMatrix(matrixAText);
      const b = NEEDS_B[operation] ? parseMatrix(matrixBText) : null;
      switch (operation) {
        case 'ADD':
          return { value: formatMatrix(add(a, b as Matrix)), error: null };
        case 'SUBTRACT':
          return { value: formatMatrix(subtract(a, b as Matrix)), error: null };
        case 'MULTIPLY':
          return { value: formatMatrix(multiply(a, b as Matrix)), error: null };
        case 'TRANSPOSE':
          return { value: formatMatrix(transpose(a)), error: null };
        case 'DETERMINANT':
          return { value: String(determinant(a)), error: null };
        case 'INVERSE':
          return { value: formatMatrix(inverse(a)), error: null };
      }
    } catch (err) {
      return { value: '', error: (err as Error).message };
    }
  }, [operation, matrixAText, matrixBText]);

  return (
    <ToolLayout
      title="Matrix Calculator"
      description="Add, subtract, multiply, transpose matrices, and compute determinant/inverse for square matrices."
      outputValue={result.value}
      onClear={() => { setMatrixAText(''); setMatrixBText(''); }}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-2">
          <label htmlFor="matrix-op" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 shrink-0">
            Operation
          </label>
          <select
            id="matrix-op"
            aria-label="Operation"
            value={operation}
            onChange={e => setOperation(e.target.value as Operation)}
            className={selectClass}
          >
            {OPERATIONS.map(op => (
              <option key={op} value={op}>{OP_LABELS[op]}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-h-0 flex gap-4">
          <Panel label="Matrix A" className="flex-1">
            <textarea
              id="matrix-a"
              aria-label="Matrix A"
              value={matrixAText}
              onChange={e => setMatrixAText(e.target.value)}
              placeholder="1,2&#10;3,4"
              className={`${textareaClass} m-4 h-auto`}
            />
          </Panel>

          {NEEDS_B[operation] && (
            <Panel label="Matrix B" className="flex-1">
              <textarea
                id="matrix-b"
                aria-label="Matrix B"
                value={matrixBText}
                onChange={e => setMatrixBText(e.target.value)}
                placeholder="5,6&#10;7,8"
                className={`${textareaClass} m-4 h-auto`}
              />
            </Panel>
          )}

          <Panel label="Result" className="flex-1">
            <textarea
              id="matrix-result"
              aria-label="Result"
              value={result.value}
              readOnly
              placeholder="—"
              className={`${outputClass} m-4 h-auto`}
            />
          </Panel>
        </div>

        {result.error && (
          <p className="shrink-0 text-xs text-red-400 px-1">{result.error}</p>
        )}
      </div>
    </ToolLayout>
  );
}
