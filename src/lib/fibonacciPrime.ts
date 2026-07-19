export function fibonacciSequence(n: number): bigint[] {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error('Count must be an integer of at least 1');
  }
  const sequence: bigint[] = [];
  let a = 0n;
  let b = 1n;
  for (let i = 0; i < n; i++) {
    sequence.push(a);
    [a, b] = [b, a + b];
  }
  return sequence;
}

export function primesUpTo(limit: number): number[] {
  if (!Number.isInteger(limit) || limit < 2) {
    throw new Error('Limit must be an integer of at least 2');
  }
  const sieve = new Array<boolean>(limit + 1).fill(true);
  sieve[0] = sieve[1] = false;
  for (let i = 2; i * i <= limit; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= limit; j += i) {
        sieve[j] = false;
      }
    }
  }
  const primes: number[] = [];
  for (let i = 2; i <= limit; i++) {
    if (sieve[i]) primes.push(i);
  }
  return primes;
}
