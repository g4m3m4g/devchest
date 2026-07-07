const BASE = 36;
const T_MIN = 1;
const T_MAX = 26;
const SKEW = 38;
const DAMP = 700;
const INITIAL_BIAS = 72;
const INITIAL_N = 128;
const DELIMITER = '-';
const MAX_INT = 2147483647;
const ACE_PREFIX = 'xn--';

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
  let k = 0;
  let d = firstTime ? Math.floor(delta / DAMP) : delta >> 1;
  d += Math.floor(d / numPoints);
  for (; d > ((BASE - T_MIN) * T_MAX) >> 1; k += BASE) {
    d = Math.floor(d / (BASE - T_MIN));
  }
  return Math.floor(k + ((BASE - T_MIN + 1) * d) / (d + SKEW));
}

function digitToBasic(digit: number): number {
  return digit + 22 + 75 * (digit < 26 ? 1 : 0);
}

function basicToDigit(codePoint: number): number {
  if (codePoint >= 0x30 && codePoint - 0x30 < 0x0a) return codePoint - 0x16;
  if (codePoint >= 0x41 && codePoint - 0x41 < 0x1a) return codePoint - 0x41;
  if (codePoint >= 0x61 && codePoint - 0x61 < 0x1a) return codePoint - 0x61;
  return BASE;
}

export function punycodeEncode(input: string): string {
  const codePoints = Array.from(input).map(c => c.codePointAt(0) as number);
  const output: string[] = [];

  let n = INITIAL_N;
  let delta = 0;
  let bias = INITIAL_BIAS;

  for (const codePoint of codePoints) {
    if (codePoint < 0x80) {
      output.push(String.fromCharCode(codePoint));
    }
  }

  const basicLength = output.length;
  let handledCPCount = basicLength;

  if (basicLength > 0) {
    output.push(DELIMITER);
  }

  while (handledCPCount < codePoints.length) {
    let m = MAX_INT;
    for (const codePoint of codePoints) {
      if (codePoint >= n && codePoint < m) {
        m = codePoint;
      }
    }

    const handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > Math.floor((MAX_INT - delta) / handledCPCountPlusOne)) {
      throw new Error('Punycode overflow');
    }

    delta += (m - n) * handledCPCountPlusOne;
    n = m;

    for (const codePoint of codePoints) {
      if (codePoint < n) {
        delta++;
        if (delta > MAX_INT) {
          throw new Error('Punycode overflow');
        }
      }
      if (codePoint === n) {
        let q = delta;
        for (let k = BASE; ; k += BASE) {
          const t = k <= bias ? T_MIN : k >= bias + T_MAX ? T_MAX : k - bias;
          if (q < t) break;
          const qMinusT = q - t;
          const baseMinusT = BASE - t;
          output.push(String.fromCharCode(digitToBasic(t + (qMinusT % baseMinusT))));
          q = Math.floor(qMinusT / baseMinusT);
        }
        output.push(String.fromCharCode(digitToBasic(q)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
        delta = 0;
        handledCPCount++;
      }
    }

    delta++;
    n++;
  }

  return output.join('');
}

export function punycodeDecode(input: string): string {
  const output: number[] = [];
  const inputLength = input.length;

  let n = INITIAL_N;
  let i = 0;
  let bias = INITIAL_BIAS;

  let basic = input.lastIndexOf(DELIMITER);
  if (basic < 0) basic = 0;

  for (let j = 0; j < basic; j++) {
    const codePoint = input.charCodeAt(j);
    if (codePoint >= 0x80) {
      throw new Error('Invalid Punycode: non-basic code point in basic-code section');
    }
    output.push(codePoint);
  }

  let index = basic > 0 ? basic + 1 : 0;
  while (index < inputLength) {
    const oldI = i;
    for (let w = 1, k = BASE; ; k += BASE) {
      if (index >= inputLength) {
        throw new Error('Invalid Punycode: incomplete sequence');
      }
      const digit = basicToDigit(input.charCodeAt(index++));
      if (digit >= BASE) {
        throw new Error('Invalid Punycode: invalid digit');
      }
      if (digit > Math.floor((MAX_INT - i) / w)) {
        throw new Error('Punycode overflow');
      }
      i += digit * w;
      const t = k <= bias ? T_MIN : k >= bias + T_MAX ? T_MAX : k - bias;
      if (digit < t) break;
      const baseMinusT = BASE - t;
      if (w > Math.floor(MAX_INT / baseMinusT)) {
        throw new Error('Punycode overflow');
      }
      w *= baseMinusT;
    }

    const out = output.length + 1;
    bias = adapt(i - oldI, out, oldI === 0);

    if (Math.floor(i / out) > MAX_INT - n) {
      throw new Error('Punycode overflow');
    }
    n += Math.floor(i / out);
    i %= out;
    output.splice(i, 0, n);
    i++;
  }

  return String.fromCodePoint(...output);
}

function isASCII(str: string): boolean {
  return /^[\x00-\x7f]*$/.test(str);
}

function mapLabels(input: string, mapLabel: (label: string) => string): string {
  return input
    .split('.')
    .map(label => mapLabel(label))
    .join('.');
}

export function toASCII(input: string): string {
  return mapLabels(input, label => {
    if (isASCII(label)) return label;
    return ACE_PREFIX + punycodeEncode(label);
  });
}

export function toUnicode(input: string): string {
  return mapLabels(input, label => {
    if (!label.toLowerCase().startsWith(ACE_PREFIX)) return label;
    return punycodeDecode(label.slice(ACE_PREFIX.length));
  });
}
