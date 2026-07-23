export type CronFieldMode = 'every' | 'specific' | 'range' | 'step';

export interface CronField {
  raw: string;
  values: number[] | 'any';
  valid: boolean;
  error?: string;
}

export interface CronFields {
  minute: CronField;
  hour: CronField;
  dayOfMonth: CronField;
  month: CronField;
  dayOfWeek: CronField;
}

export interface CronParseResult {
  valid: boolean;
  errors: string[];
  fields: CronFields | null;
  description: string | null;
}

const MONTH_ALIASES: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};

const DOW_ALIASES: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function resolveToken(token: string, aliases?: Record<string, number>): number {
  const upper = token.toUpperCase();
  if (aliases && upper in aliases) return aliases[upper];
  if (/^\d+$/.test(token)) return parseInt(token, 10);
  return NaN;
}

function parseField(raw: string, min: number, max: number, label: string, aliases?: Record<string, number>): CronField {
  if (raw === '') return { raw, values: [], valid: false, error: `${label} field is empty` };
  if (raw === '*') return { raw, values: 'any', valid: true };

  const values = new Set<number>();
  const parts = raw.split(',');

  for (const part of parts) {
    const [base, stepStr] = part.split('/');
    let step: number | undefined;

    if (stepStr !== undefined) {
      if (!/^\d+$/.test(stepStr) || parseInt(stepStr, 10) <= 0) {
        return { raw, values: [], valid: false, error: `Invalid step '${stepStr}' in ${label} field` };
      }
      step = parseInt(stepStr, 10);
    }

    let rangeMin: number;
    let rangeMax: number;

    if (base === '*') {
      rangeMin = min;
      rangeMax = max;
    } else if (base.includes('-')) {
      const [startTok, endTok] = base.split('-');
      const start = resolveToken(startTok, aliases);
      const end = resolveToken(endTok, aliases);
      if (Number.isNaN(start) || Number.isNaN(end)) {
        return { raw, values: [], valid: false, error: `Invalid value in ${label} field: '${base}'` };
      }
      if (start < min || start > max || end < min || end > max) {
        return { raw, values: [], valid: false, error: `${label} value out of range (${min}-${max}): '${base}'` };
      }
      if (start > end) {
        return { raw, values: [], valid: false, error: `${label} range start must be <= end: '${base}'` };
      }
      rangeMin = start;
      rangeMax = end;
    } else {
      const num = resolveToken(base, aliases);
      if (Number.isNaN(num)) {
        return { raw, values: [], valid: false, error: `Invalid value in ${label} field: '${base}'` };
      }
      if (num < min || num > max) {
        return { raw, values: [], valid: false, error: `${label} value out of range (${min}-${max}): '${num}'` };
      }
      if (step === undefined) {
        values.add(num);
        continue;
      }
      rangeMin = num;
      rangeMax = max;
    }

    const s = step ?? 1;
    for (let i = rangeMin; i <= rangeMax; i += s) values.add(i);
  }

  return { raw, values: Array.from(values).sort((a, b) => a - b), valid: true };
}

function isRangeRaw(raw: string): boolean {
  return /^[A-Za-z0-9]+-[A-Za-z0-9]+$/.test(raw);
}

function stepOnly(field: CronField): number | null {
  const match = /^\*\/(\d+)$/.exec(field.raw);
  return match ? parseInt(match[1], 10) : null;
}

function isSingle(field: CronField): boolean {
  return field.values !== 'any' && field.values.length === 1;
}

function singleValue(field: CronField): number {
  return (field.values as number[])[0];
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function describeValues(field: CronField, unit: string): string {
  if (field.values === 'any') return `every ${unit}`;
  const list = field.values.join(', ');
  return field.values.length === 1 ? `${unit} ${list}` : `${unit}s ${list}`;
}

function buildTimeClause(minute: CronField, hour: CronField): string {
  const minuteStep = stepOnly(minute);
  if (minute.raw === '*' && hour.raw === '*') return 'Every minute';
  if (minuteStep !== null && hour.raw === '*') return `Every ${minuteStep} minutes`;
  if (isSingle(minute) && hour.raw === '*') return `At minute ${singleValue(minute)} past every hour`;
  if (isSingle(minute) && isSingle(hour)) return `At ${pad2(singleValue(hour))}:${pad2(singleValue(minute))}`;
  return `At ${describeValues(minute, 'minute')}, ${describeValues(hour, 'hour')}`;
}

function weekdayListDesc(field: CronField): string {
  const values = field.values as number[];
  const names = values.map(v => WEEKDAY_NAMES[v]);
  return isRangeRaw(field.raw) ? `${names[0]} through ${names[names.length - 1]}` : names.join(', ');
}

function buildDayClause(dayOfMonth: CronField, dayOfWeek: CronField): string {
  const domRestricted = dayOfMonth.raw !== '*';
  const dowRestricted = dayOfWeek.raw !== '*';
  if (!domRestricted && !dowRestricted) return '';

  const domDesc = domRestricted ? `on day-of-month ${(dayOfMonth.values as number[]).join(', ')}` : '';
  const dowDesc = dowRestricted ? `on ${weekdayListDesc(dayOfWeek)}` : '';

  if (domRestricted && dowRestricted) return `, ${domDesc} or ${dowDesc.replace('on ', '')}`;
  return `, ${domRestricted ? domDesc : dowDesc}`;
}

function buildMonthClause(month: CronField): string {
  if (month.raw === '*') return '';
  const values = month.values as number[];
  const names = values.map(v => MONTH_NAMES[v - 1]);
  const desc = isRangeRaw(month.raw) ? `${names[0]} through ${names[names.length - 1]}` : names.join(', ');
  return `, in ${desc}`;
}

function buildDescription(fields: CronFields): string {
  return (
    buildTimeClause(fields.minute, fields.hour) +
    buildDayClause(fields.dayOfMonth, fields.dayOfWeek) +
    buildMonthClause(fields.month)
  );
}

export function parseCron(expression: string): CronParseResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { valid: false, errors: ['Expression is empty'], fields: null, description: null };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length !== 5) {
    return {
      valid: false,
      errors: [`Expected 5 fields (minute hour day-of-month month day-of-week), got ${parts.length}`],
      fields: null,
      description: null,
    };
  }

  const [minuteRaw, hourRaw, domRaw, monthRaw, dowRaw] = parts;
  const fields: CronFields = {
    minute: parseField(minuteRaw, 0, 59, 'Minute'),
    hour: parseField(hourRaw, 0, 23, 'Hour'),
    dayOfMonth: parseField(domRaw, 1, 31, 'Day-of-month'),
    month: parseField(monthRaw, 1, 12, 'Month', MONTH_ALIASES),
    dayOfWeek: parseField(dowRaw, 0, 6, 'Day-of-week', DOW_ALIASES),
  };

  const errors = Object.values(fields)
    .filter(f => !f.valid)
    .map(f => f.error as string);

  if (errors.length > 0) {
    return { valid: false, errors, fields, description: null };
  }

  return { valid: true, errors: [], fields, description: buildDescription(fields) };
}

function matchesField(field: CronField, value: number): boolean {
  return field.values === 'any' || field.values.includes(value);
}

export function getNextRunTimes(expression: string, count = 5, from: Date = new Date()): Date[] {
  const parsed = parseCron(expression);
  if (!parsed.valid || !parsed.fields) return [];

  const { minute, hour, dayOfMonth, month, dayOfWeek } = parsed.fields;
  const domRestricted = dayOfMonth.raw !== '*';
  const dowRestricted = dayOfWeek.raw !== '*';

  const results: Date[] = [];
  const candidate = new Date(from.getTime());
  candidate.setSeconds(0, 0);
  candidate.setMinutes(candidate.getMinutes() + 1);

  const maxIterations = 4 * 366 * 24 * 60;
  let iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    iterations++;

    const minuteMatch = matchesField(minute, candidate.getMinutes());
    const hourMatch = matchesField(hour, candidate.getHours());
    const monthMatch = matchesField(month, candidate.getMonth() + 1);

    let dayMatch: boolean;
    if (domRestricted && dowRestricted) {
      dayMatch = matchesField(dayOfMonth, candidate.getDate()) || matchesField(dayOfWeek, candidate.getDay());
    } else if (domRestricted) {
      dayMatch = matchesField(dayOfMonth, candidate.getDate());
    } else if (dowRestricted) {
      dayMatch = matchesField(dayOfWeek, candidate.getDay());
    } else {
      dayMatch = true;
    }

    if (minuteMatch && hourMatch && monthMatch && dayMatch) {
      results.push(new Date(candidate.getTime()));
    }

    candidate.setMinutes(candidate.getMinutes() + 1);
  }

  return results;
}

export function buildFieldExpression(
  mode: CronFieldMode,
  params: { values?: number[]; start?: number; end?: number; step?: number },
): string {
  switch (mode) {
    case 'every':
      return '*';
    case 'specific':
      return (params.values ?? []).join(',');
    case 'range':
      return `${params.start}-${params.end}`;
    case 'step':
      return `*/${params.step}`;
  }
}

export function detectFieldMode(raw: string): CronFieldMode {
  if (raw === '*') return 'every';
  if (/^\*\/\d+$/.test(raw)) return 'step';
  if (/^[^,/-]+-[^,/-]+$/.test(raw)) return 'range';
  return 'specific';
}
