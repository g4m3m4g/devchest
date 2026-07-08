import { lookupByMimeType } from './mimeTypes';

export interface ParsedDataUrl {
  mimeType: string;
  isBase64: boolean;
  data: string;
}

export function parseDataUrl(input: string): ParsedDataUrl | null {
  const match = /^data:([^,]*),([\s\S]*)$/.exec(input);
  if (!match) return null;

  const [, mediaType, data] = match;
  const isBase64 = /;base64$/i.test(mediaType);
  const mimeType = (isBase64 ? mediaType.replace(/;base64$/i, '') : mediaType) || 'text/plain';

  return { mimeType, isBase64, data };
}

export function buildDataUrl(mimeType: string, base64Data: string): string {
  return `data:${mimeType};base64,${base64Data}`;
}

export function base64ByteLength(base64: string): number {
  const clean = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  if (!clean) return 0;
  const padding = clean.match(/=+$/)?.[0].length ?? 0;
  return Math.floor((clean.length * 3) / 4) - padding;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  const rounded = Math.round(value * 100) / 100;
  return `${rounded} ${units[unitIndex]}`;
}

export function suggestFileName(mimeType: string): string {
  const bareMimeType = mimeType.split(';')[0];
  const entry = lookupByMimeType(bareMimeType);
  return `download.${entry?.extensions[0] ?? 'bin'}`;
}
