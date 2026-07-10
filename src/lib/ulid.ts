const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const TIME_LEN = 10;
const RANDOM_LEN = 16;
const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/i;

function encodeTime(timestamp: number, length: number): string {
  let now = timestamp;
  let str = '';
  for (let i = 0; i < length; i++) {
    const mod = now % 32;
    str = ENCODING[mod] + str;
    now = (now - mod) / 32;
  }
  return str;
}

function encodeRandom(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let str = '';
  for (let i = 0; i < length; i++) {
    str += ENCODING[bytes[i] % 32];
  }
  return str;
}

export function generateUlid(timestamp: number = Date.now()): string {
  return encodeTime(timestamp, TIME_LEN) + encodeRandom(RANDOM_LEN);
}

export function decodeUlidTimestamp(ulid: string): number {
  if (!isValidUlid(ulid)) {
    throw new Error('Invalid ULID');
  }
  const timeChars = ulid.slice(0, TIME_LEN).toUpperCase();
  let time = 0;
  for (const char of timeChars) {
    time = time * 32 + ENCODING.indexOf(char);
  }
  return time;
}

export function isValidUlid(value: string): boolean {
  return ULID_REGEX.test(value.trim());
}
