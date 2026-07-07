export type CompressionFormat = 'gzip' | 'deflate' | 'deflate-raw';

function toReadableStream(bytes: Uint8Array): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

async function streamToUint8Array(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.length;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

type BytePipe = ReadableWritablePair<Uint8Array, Uint8Array>;

export async function compress(input: Uint8Array, format: CompressionFormat): Promise<Uint8Array> {
  const stream = toReadableStream(input).pipeThrough(new CompressionStream(format) as unknown as BytePipe);
  return streamToUint8Array(stream);
}

export async function decompress(input: Uint8Array, format: CompressionFormat): Promise<Uint8Array> {
  try {
    const stream = toReadableStream(input).pipeThrough(new DecompressionStream(format) as unknown as BytePipe);
    return await streamToUint8Array(stream);
  } catch {
    throw new Error(`Failed to decompress: input is not valid ${format} data`);
  }
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new Error('Invalid Base64 input');
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function compressTextToBase64(text: string, format: CompressionFormat): Promise<string> {
  const compressed = await compress(new TextEncoder().encode(text), format);
  return bytesToBase64(compressed);
}

export async function decompressBase64ToText(base64: string, format: CompressionFormat): Promise<string> {
  const decompressed = await decompress(base64ToBytes(base64), format);
  return new TextDecoder().decode(decompressed);
}
