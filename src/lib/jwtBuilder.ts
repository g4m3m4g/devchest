import CryptoJS from 'crypto-js';

export function base64UrlEncode(input: string): string {
  const wordArray = CryptoJS.enc.Utf8.parse(input);
  return CryptoJS.enc.Base64.stringify(wordArray)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function signJwtHs256(payloadJson: string, secret: string, headerJson = ''): string {
  let payloadObj: unknown;
  try {
    payloadObj = JSON.parse(payloadJson);
  } catch {
    throw new Error('Payload must be valid JSON');
  }

  let headerObj: Record<string, unknown> = { alg: 'HS256', typ: 'JWT' };
  if (headerJson.trim()) {
    let customHeader: unknown;
    try {
      customHeader = JSON.parse(headerJson);
    } catch {
      throw new Error('Header must be valid JSON');
    }
    if (typeof customHeader !== 'object' || customHeader === null || Array.isArray(customHeader)) {
      throw new Error('Header must be a JSON object');
    }
    headerObj = { ...headerObj, ...(customHeader as Record<string, unknown>) };
  }
  headerObj.alg = 'HS256';

  const encodedHeader = base64UrlEncode(JSON.stringify(headerObj));
  const encodedPayload = base64UrlEncode(JSON.stringify(payloadObj));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = CryptoJS.HmacSHA256(signingInput, secret);
  const encodedSignature = CryptoJS.enc.Base64.stringify(signature)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${signingInput}.${encodedSignature}`;
}
