import type { LucideIcon } from 'lucide-react';
import {
  Braces, Database, Minimize2,
  FileCode, AlignLeft, SlidersHorizontal, FileJson, BookOpen, Table2, Workflow, Settings2, Container, Server, Globe, ScrollText,
  Code2, Link, Key, Ampersand, Binary, Hexagon, Calculator, Radio, Languages, Mail, Shuffle, FileArchive,
  Search, Type, ArrowLeftRight,
  Hash, Fingerprint, Clock,
} from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  icon: LucideIcon;
}

export interface Category {
  id: string;
  name: string;
}

export const CATEGORIES: Category[] = [
  { id: 'formatters', name: 'Formatters & Minifiers' },
  { id: 'encoders', name: 'Encoders & Decoders' },
  { id: 'text', name: 'Regex & Text' },
  { id: 'generators', name: 'Security & Generators' },
];

export const TOOLS: Tool[] = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format and validate JSON with configurable indentation',
    categoryId: 'formatters',
    icon: Braces,
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Transform messy SQL into clean, structured queries',
    categoryId: 'formatters',
    icon: Database,
  },
  {
    id: 'html-css-minifier',
    name: 'HTML / CSS Minifier',
    description: 'Strip spaces and comments from HTML and CSS payloads',
    categoryId: 'formatters',
    icon: Minimize2,
  },
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Pretty-print and validate XML with configurable indentation',
    categoryId: 'formatters',
    icon: FileCode,
  },
  {
    id: 'yaml-converter',
    name: 'YAML Converter',
    description: 'Format YAML or convert between YAML and JSON',
    categoryId: 'formatters',
    icon: AlignLeft,
  },
  {
    id: 'toml-converter',
    name: 'TOML Converter',
    description: 'Format TOML or convert between TOML and JSON',
    categoryId: 'formatters',
    icon: SlidersHorizontal,
  },
  {
    id: 'js-formatter',
    name: 'JS / TS Formatter',
    description: 'Format JavaScript and TypeScript using Prettier rules',
    categoryId: 'formatters',
    icon: FileJson,
  },
  {
    id: 'csv-viewer',
    name: 'CSV Formatter & Viewer',
    description: 'Parse, view, and reformat CSV with configurable delimiters',
    categoryId: 'formatters',
    icon: Table2,
  },
  {
    id: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Preview rendered Markdown or format and normalise its syntax',
    categoryId: 'formatters',
    icon: BookOpen,
  },
  {
    id: 'graphql-formatter',
    name: 'GraphQL Formatter',
    description: 'Format GraphQL schemas, queries, mutations, and fragments',
    categoryId: 'formatters',
    icon: Workflow,
  },
  {
    id: 'ini-formatter',
    name: 'INI Formatter',
    description: 'Format INI and config files — normalize separators, sort sections and keys',
    categoryId: 'formatters',
    icon: Settings2,
  },
  {
    id: 'dockerfile-formatter',
    name: 'Dockerfile Formatter',
    description: 'Format Dockerfiles and lint for common mistakes — deprecated instructions, missing version tags, apt hygiene',
    categoryId: 'formatters',
    icon: Container,
  },
  {
    id: 'nginx-formatter',
    name: 'Nginx Config Formatter',
    description: 'Format and normalize Nginx configuration files with consistent indentation',
    categoryId: 'formatters',
    icon: Server,
  },
  {
    id: 'http-headers',
    name: 'HTTP Headers Formatter',
    description: 'Parse and format HTTP request and response headers — sort, normalize casing, table view',
    categoryId: 'formatters',
    icon: Globe,
  },
  {
    id: 'log-formatter',
    name: 'Log Formatter',
    description: 'Parse structured JSON logs (pino, winston, bunyan) into a readable view — filter by level, toggle metadata',
    categoryId: 'formatters',
    icon: ScrollText,
  },
  {
    id: 'base64',
    name: 'Base64 Encoder',
    description: 'Encode or decode Base64 text and convert images to Data URLs',
    categoryId: 'encoders',
    icon: Code2,
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder',
    description: 'Encode and decode URL components safely',
    categoryId: 'encoders',
    icon: Link,
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Inspect JWT header, payload, and expiration client-side',
    categoryId: 'encoders',
    icon: Key,
  },
  {
    id: 'html-entity-coder',
    name: 'HTML Entity Encoder / Decoder',
    description: 'Escape reserved HTML characters or decode named and numeric entities',
    categoryId: 'encoders',
    icon: Ampersand,
  },
  {
    id: 'unicode-escape-coder',
    name: 'Unicode Encoder / Decoder',
    description: 'Convert text to Unicode escape sequences (JS, CSS, Python, U+ notation) and back',
    categoryId: 'encoders',
    icon: Binary,
  },
  {
    id: 'hex-coder',
    name: 'Hex Encoder / Decoder',
    description: 'Convert text to its UTF-8 hexadecimal byte representation and back',
    categoryId: 'encoders',
    icon: Hexagon,
  },
  {
    id: 'number-base-converter',
    name: 'Number Base Converter',
    description: 'Convert integers between binary, octal, decimal, and hexadecimal',
    categoryId: 'encoders',
    icon: Calculator,
  },
  {
    id: 'morse-coder',
    name: 'Morse Code Encoder / Decoder',
    description: 'Convert text to Morse code and back, with word separators',
    categoryId: 'encoders',
    icon: Radio,
  },
  {
    id: 'punycode-coder',
    name: 'Punycode / IDN Encoder / Decoder',
    description: 'Convert internationalized domain names to Punycode ASCII form and back',
    categoryId: 'encoders',
    icon: Languages,
  },
  {
    id: 'quoted-printable-coder',
    name: 'Quoted-Printable Encoder / Decoder',
    description: 'Convert text to Quoted-Printable (RFC 2045) encoding and back',
    categoryId: 'encoders',
    icon: Mail,
  },
  {
    id: 'caesar-cipher',
    name: 'Caesar Cipher / ROT-13',
    description: 'Shift letters by a configurable amount, with a ROT-13 preset',
    categoryId: 'encoders',
    icon: Shuffle,
  },
  {
    id: 'gzip-deflate',
    name: 'Gzip / Deflate Compress & Decompress',
    description: 'Compress and decompress text with Gzip or Deflate entirely in the browser',
    categoryId: 'encoders',
    icon: FileArchive,
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test regular expressions with live match highlighting',
    categoryId: 'text',
    icon: Search,
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text to camelCase, snake_case, PascalCase, and more',
    categoryId: 'text',
    icon: Type,
  },
  {
    id: 'diff-checker',
    name: 'Diff Checker',
    description: 'Compare two text blocks and visualize line differences',
    categoryId: 'text',
    icon: ArrowLeftRight,
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Compute MD5, SHA-1, SHA-256, and SHA-512 simultaneously',
    categoryId: 'generators',
    icon: Hash,
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Bulk-generate v4 UUIDs with format and delimiter controls',
    categoryId: 'generators',
    icon: Fingerprint,
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert Unix epochs and ISO dates with a live ticker',
    categoryId: 'generators',
    icon: Clock,
  },
];
