export interface MimeEntry {
  mimeType: string;
  extensions: string[];
  category: string;
}

export const MIME_TYPES: MimeEntry[] = [
  { mimeType: 'text/plain', extensions: ['txt'], category: 'Text' },
  { mimeType: 'text/html', extensions: ['html', 'htm'], category: 'Text' },
  { mimeType: 'text/css', extensions: ['css'], category: 'Text' },
  { mimeType: 'text/csv', extensions: ['csv'], category: 'Text' },
  { mimeType: 'text/markdown', extensions: ['md', 'markdown'], category: 'Text' },
  { mimeType: 'text/xml', extensions: ['xml'], category: 'Text' },
  { mimeType: 'text/calendar', extensions: ['ics'], category: 'Text' },
  { mimeType: 'application/javascript', extensions: ['js', 'mjs'], category: 'Application' },
  { mimeType: 'application/typescript', extensions: ['ts'], category: 'Application' },
  { mimeType: 'application/json', extensions: ['json'], category: 'Application' },
  { mimeType: 'application/ld+json', extensions: ['jsonld'], category: 'Application' },
  { mimeType: 'application/xml', extensions: ['xsl', 'xslt'], category: 'Application' },
  { mimeType: 'application/pdf', extensions: ['pdf'], category: 'Application' },
  { mimeType: 'application/zip', extensions: ['zip'], category: 'Application' },
  { mimeType: 'application/gzip', extensions: ['gz'], category: 'Application' },
  { mimeType: 'application/x-tar', extensions: ['tar'], category: 'Application' },
  { mimeType: 'application/x-7z-compressed', extensions: ['7z'], category: 'Application' },
  { mimeType: 'application/vnd.rar', extensions: ['rar'], category: 'Application' },
  { mimeType: 'application/vnd.ms-excel', extensions: ['xls'], category: 'Application' },
  { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extensions: ['xlsx'], category: 'Application' },
  { mimeType: 'application/msword', extensions: ['doc'], category: 'Application' },
  { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extensions: ['docx'], category: 'Application' },
  { mimeType: 'application/vnd.ms-powerpoint', extensions: ['ppt'], category: 'Application' },
  { mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', extensions: ['pptx'], category: 'Application' },
  { mimeType: 'application/octet-stream', extensions: ['bin'], category: 'Application' },
  { mimeType: 'application/wasm', extensions: ['wasm'], category: 'Application' },
  { mimeType: 'application/rtf', extensions: ['rtf'], category: 'Application' },
  { mimeType: 'application/vnd.sqlite3', extensions: ['sqlite', 'db'], category: 'Application' },
  { mimeType: 'application/x-sh', extensions: ['sh'], category: 'Application' },
  { mimeType: 'application/x-yaml', extensions: ['yaml', 'yml'], category: 'Application' },
  { mimeType: 'application/toml', extensions: ['toml'], category: 'Application' },
  { mimeType: 'application/graphql', extensions: ['graphql', 'gql'], category: 'Application' },
  { mimeType: 'application/x-httpd-php', extensions: ['php'], category: 'Application' },
  { mimeType: 'application/vnd.android.package-archive', extensions: ['apk'], category: 'Application' },
  { mimeType: 'application/x-msdownload', extensions: ['exe'], category: 'Application' },
  { mimeType: 'application/x-iso9660-image', extensions: ['iso'], category: 'Application' },
  { mimeType: 'image/png', extensions: ['png'], category: 'Image' },
  { mimeType: 'image/jpeg', extensions: ['jpg', 'jpeg'], category: 'Image' },
  { mimeType: 'image/gif', extensions: ['gif'], category: 'Image' },
  { mimeType: 'image/webp', extensions: ['webp'], category: 'Image' },
  { mimeType: 'image/svg+xml', extensions: ['svg'], category: 'Image' },
  { mimeType: 'image/bmp', extensions: ['bmp'], category: 'Image' },
  { mimeType: 'image/x-icon', extensions: ['ico'], category: 'Image' },
  { mimeType: 'image/tiff', extensions: ['tif', 'tiff'], category: 'Image' },
  { mimeType: 'image/avif', extensions: ['avif'], category: 'Image' },
  { mimeType: 'image/heic', extensions: ['heic'], category: 'Image' },
  { mimeType: 'audio/mpeg', extensions: ['mp3'], category: 'Audio' },
  { mimeType: 'audio/wav', extensions: ['wav'], category: 'Audio' },
  { mimeType: 'audio/ogg', extensions: ['ogg', 'oga'], category: 'Audio' },
  { mimeType: 'audio/webm', extensions: ['weba'], category: 'Audio' },
  { mimeType: 'audio/aac', extensions: ['aac'], category: 'Audio' },
  { mimeType: 'audio/flac', extensions: ['flac'], category: 'Audio' },
  { mimeType: 'audio/midi', extensions: ['mid', 'midi'], category: 'Audio' },
  { mimeType: 'video/mp4', extensions: ['mp4', 'm4v'], category: 'Video' },
  { mimeType: 'video/webm', extensions: ['webm'], category: 'Video' },
  { mimeType: 'video/ogg', extensions: ['ogv'], category: 'Video' },
  { mimeType: 'video/mpeg', extensions: ['mpeg', 'mpg'], category: 'Video' },
  { mimeType: 'video/quicktime', extensions: ['mov'], category: 'Video' },
  { mimeType: 'video/x-msvideo', extensions: ['avi'], category: 'Video' },
  { mimeType: 'video/x-matroska', extensions: ['mkv'], category: 'Video' },
  { mimeType: 'font/ttf', extensions: ['ttf'], category: 'Font' },
  { mimeType: 'font/otf', extensions: ['otf'], category: 'Font' },
  { mimeType: 'font/woff', extensions: ['woff'], category: 'Font' },
  { mimeType: 'font/woff2', extensions: ['woff2'], category: 'Font' },
];

const extensionMap = new Map<string, MimeEntry>();
const mimeTypeMap = new Map<string, MimeEntry>();

for (const entry of MIME_TYPES) {
  for (const ext of entry.extensions) {
    extensionMap.set(ext, entry);
  }
  mimeTypeMap.set(entry.mimeType.toLowerCase(), entry);
}

export function normalizeExtension(input: string): string {
  let ext = input.trim().toLowerCase();
  if (ext.includes('.')) {
    ext = ext.slice(ext.lastIndexOf('.') + 1);
  }
  return ext.replace(/^\.+/, '');
}

export function lookupByExtension(input: string): MimeEntry | null {
  const ext = normalizeExtension(input);
  if (!ext) return null;
  return extensionMap.get(ext) ?? null;
}

export function lookupByMimeType(mimeType: string): MimeEntry | null {
  const key = mimeType.trim().toLowerCase();
  if (!key) return null;
  return mimeTypeMap.get(key) ?? null;
}

export function searchMimeTypes(query: string): MimeEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return MIME_TYPES;
  return MIME_TYPES.filter(entry =>
    entry.mimeType.toLowerCase().includes(q) ||
    entry.extensions.some(ext => ext.includes(q)) ||
    entry.category.toLowerCase().includes(q)
  );
}
