import type { LucideIcon } from 'lucide-react';
import {
  Braces, Database, Minimize2,
  FileCode, AlignLeft, SlidersHorizontal, FileJson, BookOpen,
  Code2, Link, Key,
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
    id: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Preview rendered Markdown or format and normalise its syntax',
    categoryId: 'formatters',
    icon: BookOpen,
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
