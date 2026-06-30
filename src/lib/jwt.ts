export interface JwtPayload {
  exp?: number;
  iat?: number;
  nbf?: number;
  sub?: string;
  iss?: string;
  aud?: string | string[];
  [key: string]: unknown;
}

export interface JwtDecodeResult {
  header: string;
  payload: string;
  payloadObj: JwtPayload | null;
  signature: string;
  error: string | null;
}

export interface ExpStatus {
  expired: boolean;
  label: string;
  isoExpiry: string;
}

export function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
  try {
    return decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
  } catch {
    return atob(padded);
  }
}

export function decodeJwt(token: string): JwtDecodeResult {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return {
      header: '',
      payload: '',
      payloadObj: null,
      signature: '',
      error: 'Invalid JWT: expected 3 dot-separated parts.',
    };
  }
  try {
    const header = JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2);
    const payloadStr = base64UrlDecode(parts[1]);
    const payloadObj = JSON.parse(payloadStr) as JwtPayload;
    return {
      header,
      payload: JSON.stringify(payloadObj, null, 2),
      payloadObj,
      signature: parts[2],
      error: null,
    };
  } catch (e) {
    return { header: '', payload: '', payloadObj: null, signature: '', error: (e as Error).message };
  }
}

export function getExpStatus(payloadObj: JwtPayload | null, nowTs: number): ExpStatus | null {
  if (!payloadObj?.exp) return null;
  const exp = payloadObj.exp as number;
  const diff = exp - nowTs;
  return {
    expired: diff < 0,
    label: diff < 0
      ? `Expired ${jwtFormatRelative(Math.abs(diff))} ago`
      : `Expires in ${jwtFormatRelative(diff)}`,
    isoExpiry: new Date(exp * 1000).toISOString(),
  };
}

export function jwtFormatRelative(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
