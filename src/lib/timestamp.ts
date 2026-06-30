export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatRelativeTime(diffSeconds: number): string {
  const abs = Math.abs(diffSeconds);
  const suffix = diffSeconds > 0 ? 'from now' : 'ago';
  if (abs < 60) return `${abs}s ${suffix}`;
  if (abs < 3600) return `${Math.floor(abs / 60)}m ${Math.floor(abs % 60)}s ${suffix}`;
  if (abs < 86400) return `${Math.floor(abs / 3600)}h ${Math.floor((abs % 3600) / 60)}m ${suffix}`;
  return `${Math.floor(abs / 86400)}d ${Math.floor((abs % 86400) / 3600)}h ${suffix}`;
}

export interface UnixToDateInfo {
  iso: string;
  local: string;
  utc: string;
  relative: string;
  ms: number;
}

export function convertUnixToDate(ts: number, nowTs: number): UnixToDateInfo | { error: string } {
  if (isNaN(ts)) return { error: 'Invalid timestamp' };
  const d = new Date(ts * 1000);
  if (isNaN(d.getTime())) return { error: 'Invalid timestamp' };
  return {
    iso: d.toISOString(),
    local: formatLocal(d),
    utc: d.toUTCString(),
    relative: formatRelativeTime(ts - nowTs),
    ms: ts * 1000,
  };
}

export interface DateToUnixInfo {
  unix: number;
  ms: number;
}

export function convertDateToUnix(dateStr: string): DateToUnixInfo | { error: string } {
  if (!dateStr) return { error: 'Empty input' };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { error: 'Invalid date string' };
  return { unix: Math.floor(d.getTime() / 1000), ms: d.getTime() };
}
