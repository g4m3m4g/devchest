// Minimal ASN.1 DER reader — just enough structure to walk an X.509 certificate.

interface Asn1Node {
  tagClass: number;
  constructed: boolean;
  tagNumber: number;
  contentStart: number;
  contentEnd: number;
}

function readLength(bytes: Uint8Array, offset: number): { length: number; bytesRead: number } {
  const first = bytes[offset];
  if ((first & 0x80) === 0) return { length: first, bytesRead: 1 };
  const numBytes = first & 0x7f;
  let length = 0;
  for (let i = 0; i < numBytes; i++) length = (length << 8) | bytes[offset + 1 + i];
  return { length, bytesRead: 1 + numBytes };
}

function readNode(bytes: Uint8Array, offset: number): Asn1Node {
  const tagByte = bytes[offset];
  const tagClass = (tagByte & 0xc0) >> 6;
  const constructed = (tagByte & 0x20) !== 0;
  let tagNumber = tagByte & 0x1f;
  let pos = offset + 1;
  if (tagNumber === 0x1f) {
    tagNumber = 0;
    let b: number;
    do {
      b = bytes[pos++];
      tagNumber = (tagNumber << 7) | (b & 0x7f);
    } while (b & 0x80);
  }
  const { length, bytesRead } = readLength(bytes, pos);
  const contentStart = pos + bytesRead;
  return { tagClass, constructed, tagNumber, contentStart, contentEnd: contentStart + length };
}

function children(bytes: Uint8Array, node: Asn1Node): Asn1Node[] {
  const result: Asn1Node[] = [];
  let pos = node.contentStart;
  while (pos < node.contentEnd) {
    const child = readNode(bytes, pos);
    result.push(child);
    pos = child.contentEnd;
  }
  return result;
}

function nodeBytes(bytes: Uint8Array, node: Asn1Node): Uint8Array {
  return bytes.subarray(node.contentStart, node.contentEnd);
}

function readOid(bytes: Uint8Array, node: Asn1Node): string {
  const content = nodeBytes(bytes, node);
  const first = content[0];
  const arcs = [Math.floor(first / 40), first % 40];
  let value = 0;
  for (let i = 1; i < content.length; i++) {
    value = (value << 7) | (content[i] & 0x7f);
    if ((content[i] & 0x80) === 0) {
      arcs.push(value);
      value = 0;
    }
  }
  return arcs.join('.');
}

function readIntegerBytes(bytes: Uint8Array, node: Asn1Node): Uint8Array {
  const content = nodeBytes(bytes, node);
  return content.length > 1 && content[0] === 0x00 ? content.subarray(1) : content;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function readString(bytes: Uint8Array, node: Asn1Node): string {
  return new TextDecoder().decode(nodeBytes(bytes, node));
}

function readTime(bytes: Uint8Array, node: Asn1Node): Date {
  const raw = readString(bytes, node);
  const isUtc = node.tagNumber === 23;
  const match = isUtc
    ? /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/.exec(raw)
    : /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/.exec(raw);
  if (!match) throw new Error(`Unrecognized time format: ${raw}`);

  if (isUtc) {
    const [, yy, mo, d, h, mi, s] = match;
    const year = Number(yy) >= 50 ? 1900 + Number(yy) : 2000 + Number(yy);
    return new Date(Date.UTC(year, Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)));
  }
  const [, yyyy, mo, d, h, mi, s] = match;
  return new Date(Date.UTC(Number(yyyy), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)));
}

const RDN_OIDS: Record<string, string> = {
  '2.5.4.3': 'CN',
  '2.5.4.6': 'C',
  '2.5.4.7': 'L',
  '2.5.4.8': 'ST',
  '2.5.4.9': 'STREET',
  '2.5.4.10': 'O',
  '2.5.4.11': 'OU',
  '2.5.4.5': 'SERIALNUMBER',
  '2.5.4.17': 'PostalCode',
  '1.2.840.113549.1.9.1': 'E',
};

const SIGNATURE_ALGORITHM_OIDS: Record<string, string> = {
  '1.2.840.113549.1.1.4': 'MD5 with RSA',
  '1.2.840.113549.1.1.5': 'SHA-1 with RSA',
  '1.2.840.113549.1.1.11': 'SHA-256 with RSA',
  '1.2.840.113549.1.1.12': 'SHA-384 with RSA',
  '1.2.840.113549.1.1.13': 'SHA-512 with RSA',
  '1.2.840.113549.1.1.10': 'RSASSA-PSS',
  '1.2.840.10045.4.3.1': 'ECDSA with SHA-224',
  '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
  '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
  '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
  '1.3.101.112': 'Ed25519',
};

const PUBLIC_KEY_ALGORITHM_OIDS: Record<string, string> = {
  '1.2.840.113549.1.1.1': 'RSA',
  '1.2.840.10045.2.1': 'EC',
  '1.3.101.112': 'Ed25519',
};

const CURVE_OIDS: Record<string, string> = {
  '1.2.840.10045.3.1.7': 'P-256',
  '1.3.132.0.34': 'P-384',
  '1.3.132.0.35': 'P-521',
};

const EXTENSION_OIDS: Record<string, string> = {
  '2.5.29.14': 'subjectKeyIdentifier',
  '2.5.29.15': 'keyUsage',
  '2.5.29.17': 'subjectAltName',
  '2.5.29.19': 'basicConstraints',
  '2.5.29.35': 'authorityKeyIdentifier',
  '2.5.29.37': 'extKeyUsage',
};

export interface RdnAttribute {
  oid: string;
  shortName: string;
  value: string;
}

export interface SubjectAltName {
  type: 'DNS' | 'IP' | 'email' | 'URI';
  value: string;
}

export interface DecodedCertificate {
  version: number;
  serialNumber: string;
  signatureAlgorithm: string;
  issuer: RdnAttribute[];
  issuerString: string;
  subject: RdnAttribute[];
  subjectString: string;
  notBefore: Date;
  notAfter: Date;
  isExpired: boolean;
  isNotYetValid: boolean;
  daysUntilExpiry: number;
  publicKeyAlgorithm: string;
  publicKeyBits: number | null;
  subjectAltNames: SubjectAltName[];
  isCA: boolean;
  pathLenConstraint: number | null;
  fingerprintSha1: string;
  fingerprintSha256: string;
}

export function pemToDer(pem: string): Uint8Array {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  if (!base64) throw new Error('No PEM certificate body found');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function parseRdnSequence(bytes: Uint8Array, node: Asn1Node): RdnAttribute[] {
  const attributes: RdnAttribute[] = [];
  for (const rdnSet of children(bytes, node)) {
    for (const atv of children(bytes, rdnSet)) {
      const [oidNode, valueNode] = children(bytes, atv);
      const oid = readOid(bytes, oidNode);
      attributes.push({ oid, shortName: RDN_OIDS[oid] ?? oid, value: readString(bytes, valueNode) });
    }
  }
  return attributes;
}

function formatRdn(attributes: RdnAttribute[]): string {
  return attributes.map(a => `${a.shortName}=${a.value}`).join(', ');
}

function parseSubjectPublicKeyInfo(bytes: Uint8Array, spkiNode: Asn1Node): { algorithm: string; bits: number | null } {
  const [algIdNode, bitStringNode] = children(bytes, spkiNode);
  const [oidNode] = children(bytes, algIdNode);
  const oid = readOid(bytes, oidNode);
  const algorithm = PUBLIC_KEY_ALGORITHM_OIDS[oid] ?? oid;

  const bitStringContent = nodeBytes(bytes, bitStringNode);
  const keyBytes = bitStringContent.subarray(1); // skip unused-bits count byte

  if (algorithm === 'RSA') {
    const keyNode = readNode(keyBytes, 0);
    const [modulusNode] = children(keyBytes, keyNode);
    const modulus = readIntegerBytes(keyBytes, modulusNode);
    let bits = modulus.length * 8;
    let leading = modulus[0];
    let extraZeroBits = 0;
    while (leading !== 0 && (leading & 0x80) === 0) {
      extraZeroBits++;
      leading <<= 1;
    }
    bits -= extraZeroBits;
    return { algorithm, bits };
  }

  if (algorithm === 'EC') {
    const algIdChildren = children(bytes, algIdNode);
    if (algIdChildren.length > 1) {
      const curveOid = readOid(bytes, algIdChildren[1]);
      const curveName = CURVE_OIDS[curveOid] ?? curveOid;
      const curveBits = curveName === 'P-256' ? 256 : curveName === 'P-384' ? 384 : curveName === 'P-521' ? 521 : null;
      return { algorithm: `EC (${curveName})`, bits: curveBits };
    }
  }

  return { algorithm, bits: null };
}

function parseSubjectAltNames(bytes: Uint8Array, extnValueNode: Asn1Node): SubjectAltName[] {
  const inner = nodeBytes(bytes, extnValueNode);
  const sanSeq = readNode(inner, 0);
  const names: SubjectAltName[] = [];
  for (const generalName of children(inner, sanSeq)) {
    const content = nodeBytes(inner, generalName);
    if (generalName.tagNumber === 2) {
      names.push({ type: 'DNS', value: new TextDecoder().decode(content) });
    } else if (generalName.tagNumber === 1) {
      names.push({ type: 'email', value: new TextDecoder().decode(content) });
    } else if (generalName.tagNumber === 6) {
      names.push({ type: 'URI', value: new TextDecoder().decode(content) });
    } else if (generalName.tagNumber === 7) {
      names.push({ type: 'IP', value: formatIpAddress(content) });
    }
  }
  return names;
}

function formatIpAddress(bytes: Uint8Array): string {
  if (bytes.length === 4) return Array.from(bytes).join('.');
  if (bytes.length === 16) {
    const hextets: string[] = [];
    for (let i = 0; i < 16; i += 2) {
      hextets.push(((bytes[i] << 8) | bytes[i + 1]).toString(16));
    }
    return hextets.join(':');
  }
  return bytesToHex(bytes);
}

function parseBasicConstraints(bytes: Uint8Array, extnValueNode: Asn1Node): { isCA: boolean; pathLenConstraint: number | null } {
  const inner = nodeBytes(bytes, extnValueNode);
  const seq = readNode(inner, 0);
  const parts = children(inner, seq);
  let isCA = false;
  let pathLenConstraint: number | null = null;
  for (const part of parts) {
    if (part.tagNumber === 1 && part.tagClass === 0) {
      isCA = nodeBytes(inner, part)[0] !== 0x00;
    } else if (part.tagNumber === 2 && part.tagClass === 0) {
      pathLenConstraint = nodeBytes(inner, part).reduce((acc, b) => (acc << 8) | b, 0);
    }
  }
  return { isCA, pathLenConstraint };
}

export async function decodeCertificate(pem: string): Promise<DecodedCertificate> {
  const der = pemToDer(pem);
  const certNode = readNode(der, 0);
  const [tbsNode, sigAlgNode] = children(der, certNode);
  const tbsChildren = children(der, tbsNode);

  let idx = 0;
  let version: number;
  if (tbsChildren[idx].tagClass === 2 && tbsChildren[idx].tagNumber === 0) {
    const versionInt = children(der, tbsChildren[idx])[0];
    version = nodeBytes(der, versionInt).reduce((acc, b) => (acc << 8) | b, 0) + 1;
    idx++;
  } else {
    version = 1;
  }

  const serialNumberNode = tbsChildren[idx++];
  idx++; // signature AlgorithmIdentifier inside TBS (same as outer sigAlgNode)
  const issuerNode = tbsChildren[idx++];
  const validityNode = tbsChildren[idx++];
  const subjectNode = tbsChildren[idx++];
  const spkiNode = tbsChildren[idx++];

  let extensionsNode: Asn1Node | null = null;
  for (; idx < tbsChildren.length; idx++) {
    const node = tbsChildren[idx];
    if (node.tagClass === 2 && node.tagNumber === 3) extensionsNode = node;
  }

  const [oidNode] = children(der, sigAlgNode);
  const sigOid = readOid(der, oidNode);
  const signatureAlgorithm = SIGNATURE_ALGORITHM_OIDS[sigOid] ?? sigOid;

  const serialBytes = readIntegerBytes(der, serialNumberNode);
  const serialNumber = bytesToHex(serialBytes).toUpperCase();

  const [notBeforeNode, notAfterNode] = children(der, validityNode);
  const notBefore = readTime(der, notBeforeNode);
  const notAfter = readTime(der, notAfterNode);

  const issuer = parseRdnSequence(der, issuerNode);
  const subject = parseRdnSequence(der, subjectNode);
  const { algorithm: publicKeyAlgorithm, bits: publicKeyBits } = parseSubjectPublicKeyInfo(der, spkiNode);

  let subjectAltNames: SubjectAltName[] = [];
  let isCA = false;
  let pathLenConstraint: number | null = null;

  if (extensionsNode) {
    const extensionsSeq = children(der, extensionsNode)[0];
    for (const extNode of children(der, extensionsSeq)) {
      const extChildren = children(der, extNode);
      const extOid = readOid(der, extChildren[0]);
      const extnValueNode = extChildren[extChildren.length - 1];
      const extName = EXTENSION_OIDS[extOid];

      if (extName === 'subjectAltName') {
        subjectAltNames = parseSubjectAltNames(der, extnValueNode);
      } else if (extName === 'basicConstraints') {
        const bc = parseBasicConstraints(der, extnValueNode);
        isCA = bc.isCA;
        pathLenConstraint = bc.pathLenConstraint;
      }
    }
  }

  const now = new Date();
  const digestSha1 = await crypto.subtle.digest('SHA-1', der.slice());
  const digestSha256 = await crypto.subtle.digest('SHA-256', der.slice());

  return {
    version,
    serialNumber,
    signatureAlgorithm,
    issuer,
    issuerString: formatRdn(issuer),
    subject,
    subjectString: formatRdn(subject),
    notBefore,
    notAfter,
    isExpired: now > notAfter,
    isNotYetValid: now < notBefore,
    daysUntilExpiry: Math.ceil((notAfter.getTime() - now.getTime()) / 86_400_000),
    publicKeyAlgorithm,
    publicKeyBits,
    subjectAltNames,
    isCA,
    pathLenConstraint,
    fingerprintSha1: bytesToHex(new Uint8Array(digestSha1)).toUpperCase(),
    fingerprintSha256: bytesToHex(new Uint8Array(digestSha256)).toUpperCase(),
  };
}
