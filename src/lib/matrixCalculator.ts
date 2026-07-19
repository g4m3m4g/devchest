export type Matrix = number[][];

function dimensions(m: Matrix): { rows: number; cols: number } {
  return { rows: m.length, cols: m[0]?.length ?? 0 };
}

function assertSameDimensions(a: Matrix, b: Matrix): void {
  const da = dimensions(a);
  const db = dimensions(b);
  if (da.rows !== db.rows || da.cols !== db.cols) {
    throw new Error('Matrices must have the same dimensions');
  }
}

export function add(a: Matrix, b: Matrix): Matrix {
  assertSameDimensions(a, b);
  return a.map((row, i) => row.map((value, j) => value + b[i][j]));
}

export function subtract(a: Matrix, b: Matrix): Matrix {
  assertSameDimensions(a, b);
  return a.map((row, i) => row.map((value, j) => value - b[i][j]));
}

export function multiply(a: Matrix, b: Matrix): Matrix {
  const da = dimensions(a);
  const db = dimensions(b);
  if (da.cols !== db.rows) {
    throw new Error('Number of columns in the first matrix must match the number of rows in the second');
  }
  const result: Matrix = [];
  for (let i = 0; i < da.rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < db.cols; j++) {
      let sum = 0;
      for (let k = 0; k < da.cols; k++) {
        sum += a[i][k] * b[k][j];
      }
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

export function transpose(a: Matrix): Matrix {
  const { rows, cols } = dimensions(a);
  const result: Matrix = [];
  for (let j = 0; j < cols; j++) {
    const row: number[] = [];
    for (let i = 0; i < rows; i++) {
      row.push(a[i][j]);
    }
    result.push(row);
  }
  return result;
}

function assertSquare2or3(a: Matrix): number {
  const { rows, cols } = dimensions(a);
  if (rows !== cols) {
    throw new Error('Matrix must be square');
  }
  if (rows !== 2 && rows !== 3) {
    throw new Error('Only 2x2 and 3x3 matrices are supported');
  }
  return rows;
}

export function determinant(a: Matrix): number {
  const size = assertSquare2or3(a);
  if (size === 2) {
    return a[0][0] * a[1][1] - a[0][1] * a[1][0];
  }
  return (
    a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) -
    a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) +
    a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0])
  );
}

export function inverse(a: Matrix): Matrix {
  const size = assertSquare2or3(a);
  const det = determinant(a);
  if (Math.abs(det) < 1e-10) {
    throw new Error('Matrix is singular and has no inverse');
  }
  if (size === 2) {
    return [
      [a[1][1] / det, -a[0][1] / det],
      [-a[1][0] / det, a[0][0] / det],
    ];
  }
  const cofactor = (r: number, c: number): number => {
    const minor: number[][] = [];
    for (let i = 0; i < 3; i++) {
      if (i === r) continue;
      const row: number[] = [];
      for (let j = 0; j < 3; j++) {
        if (j === c) continue;
        row.push(a[i][j]);
      }
      minor.push(row);
    }
    const sign = (r + c) % 2 === 0 ? 1 : -1;
    return sign * (minor[0][0] * minor[1][1] - minor[0][1] * minor[1][0]);
  };
  const adjugateTransposed: Matrix = [];
  for (let i = 0; i < 3; i++) {
    const row: number[] = [];
    for (let j = 0; j < 3; j++) {
      row.push(cofactor(j, i) / det);
    }
    adjugateTransposed.push(row);
  }
  return adjugateTransposed;
}
