# DevChest Roadmap

Tools are grouped by category. Checked items are already shipped.

---

## Formatters & Minifiers

- [x] JSON Formatter
- [x] SQL Formatter
- [x] HTML / CSS Minifier
- [x] XML Formatter
- [x] YAML Formatter / Converter (YAML ↔ JSON)
- [x] TOML Formatter / Converter (TOML ↔ JSON)
- [x] JavaScript / TypeScript Formatter (Prettier-style)
- [x] Markdown Preview & Formatter
- [x] CSV Formatter & Viewer
- [x] GraphQL Schema Formatter
- [x] INI / Config File Formatter
- [x] Dockerfile Linter & Formatter
- [x] Nginx Config Formatter
- [x] HTTP Headers Formatter
- [x] Log Formatter (structured JSON logs → readable)

---

## Encoders & Decoders

- [x] Base64 Encoder / Decoder
- [x] URL Encoder / Decoder
- [x] JWT Decoder
- [ ] HTML Entity Encoder / Decoder
- [ ] Unicode Encoder / Decoder (escape sequences ↔ text)
- [ ] Hex Encoder / Decoder
- [ ] Binary / Octal / Decimal / Hex Number Converter
- [ ] Morse Code Encoder / Decoder
- [ ] Punycode / IDN Encoder / Decoder
- [ ] Quoted-Printable Encoder / Decoder
- [ ] Caesar Cipher / ROT-13
- [ ] Gzip / Deflate Compress & Decompress (in-browser)
- [ ] JWT Builder (sign HS256 tokens)
- [ ] MIME Type Lookup
- [ ] Data URL ↔ File Converter

---

## Regex & Text

- [x] Regex Tester
- [x] Case Converter
- [x] Diff Checker
- [ ] Word & Character Counter
- [ ] Lorem Ipsum Generator
- [ ] Text Sorter (alphabetical, numeric, by length, dedup)
- [ ] Text Reverse
- [ ] Slug Generator
- [ ] Whitespace / Line Cleaner (trim, collapse, strip blank lines)
- [ ] String Escape / Unescape (JS, Python, SQL strings)
- [ ] Find & Replace (plain + regex, with capture group substitution)
- [ ] Line Filter (grep-like — keep / remove matching lines)
- [ ] Column Extractor (split on delimiter, pick columns)
- [ ] Markdown to HTML Converter
- [ ] HTML to Markdown Converter
- [ ] Text to ASCII Art
- [ ] Levenshtein Distance Calculator
- [ ] Readability Score (Flesch-Kincaid)
- [ ] Duplicate Line Remover
- [ ] Sentence Counter

---

## Security & Generators

- [x] Hash Generator (MD5, SHA-1/256/512)
- [x] UUID Generator (v4)
- [x] Timestamp Converter
- [ ] UUID v1 / v3 / v5 / v7 Generator
- [ ] ULID Generator
- [ ] Nano ID Generator
- [ ] Password Generator (length, charset, entropy display)
- [ ] Passphrase Generator (wordlist-based, BIP39)
- [ ] HMAC Generator (key + message → HMAC-SHA256/512)
- [ ] TOTP / 2FA Code Generator
- [ ] Bcrypt Hash & Verify
- [ ] Argon2 Hash & Verify
- [ ] RSA Key Pair Generator (in-browser WebCrypto)
- [ ] Certificate Decoder (PEM → human-readable fields)
- [ ] SSH Key Fingerprint
- [ ] CSRF Token Generator
- [ ] Content Security Policy Builder
- [ ] robots.txt Generator
- [ ] .htaccess Generator

---

## Network & Web

- [ ] IP Address Info (CIDR calculator, subnet mask, range)
- [ ] DNS Lookup (via DoH)
- [ ] HTTP Status Code Reference
- [ ] CORS Header Builder
- [ ] Curl Command Builder
- [ ] URL Parser (break URL into scheme, host, path, query params)
- [ ] Query String Builder / Parser
- [ ] User-Agent Parser
- [ ] Webhook Tester (listen for incoming POSTs via EventSource)
- [ ] Ping / Latency Test (fetch-based)
- [ ] IP Geolocation Lookup
- [ ] SSL Certificate Checker
- [ ] Email Header Analyzer
- [ ] Open Graph / Meta Tag Previewer

---

## Numbers & Math

- [ ] Number Base Converter (bin / oct / dec / hex)
- [ ] Unit Converter (length, weight, temperature, area, volume)
- [ ] Currency Converter (latest rates via free API)
- [ ] Percentage Calculator
- [ ] Aspect Ratio Calculator
- [ ] Bitwise Calculator
- [ ] IEEE 754 Float Visualizer
- [ ] Roman Numeral Converter
- [ ] Big Number Calculator (arbitrary precision)
- [ ] Fibonacci / Prime Sequence Generator
- [ ] Matrix Calculator
- [ ] Statistics Calculator (mean, median, mode, std dev)
- [ ] Color Math (mix, contrast ratio, WCAG check)

---

## Colors & Design

- [ ] Color Picker & Converter (HEX ↔ RGB ↔ HSL ↔ HSV ↔ OKLCH)
- [ ] Gradient Generator
- [ ] Color Palette Generator (harmonies: analogous, triadic…)
- [ ] Tailwind Color Lookup
- [ ] CSS Box Shadow Builder
- [ ] CSS Border Radius Builder
- [ ] CSS Flexbox / Grid Playground
- [ ] CSS Filter Generator (blur, brightness, contrast…)
- [ ] CSS Animation Builder
- [ ] SVG Path Viewer / Minifier
- [ ] Image Color Extractor (dominant palette from upload)
- [ ] Favicon Generator (from emoji or image)

---

## Data & Code

- [ ] JSON to TypeScript Interface Generator
- [ ] JSON to Zod Schema Generator
- [ ] JSON to CSV Converter
- [ ] CSV to JSON Converter
- [ ] JSON Path Tester (JSONPath / jq-style queries)
- [ ] JSON Schema Validator
- [ ] OpenAPI / Swagger Validator
- [ ] XML to JSON Converter
- [ ] cron Expression Parser & Builder
- [ ] Semver Calculator (range matching, bump preview)
- [ ] Git Commit Message Linter (Conventional Commits)
- [ ] SQL → Prisma Schema Generator
- [ ] Code Snippet Share (local-only, ephemeral URL hash)
- [ ] JWT Claim Validator (check `exp`, `nbf`, `iss`, audience)
- [ ] Protobuf / JSON Converter

---

## Images & Media

- [ ] Image Converter (format: PNG / JPEG / WebP / AVIF — canvas-based)
- [ ] Image Resizer (in-browser canvas)
- [ ] Image Metadata Viewer (EXIF striper)
- [ ] SVG Optimizer (SVGO in WASM)
- [ ] QR Code Generator
- [ ] QR Code Reader (camera + file upload)
- [ ] Barcode Generator
- [ ] Screenshot to Code (diff overlay)
- [ ] ASCII Art from Image
- [ ] PDF Page Counter & Metadata Viewer

---

## DevOps & Infra

- [ ] Docker Run → Compose Converter
- [ ] Kubernetes YAML Validator & Linter
- [ ] Terraform HCL Formatter
- [ ] Environment Variable Diff (compare two `.env` files)
- [ ] .gitignore Generator (by language / framework)
- [ ] License Text Generator (MIT, Apache 2.0, GPL, …)
- [ ] Semantic Versioning Bumper
- [ ] GitHub Actions Syntax Validator
- [ ] Package.json Scripts Visualizer

---

## Misc Utilities

- [ ] Epoch / Date Arithmetic (add / subtract durations)
- [ ] Timezone Converter (multi-zone side-by-side)
- [ ] Stopwatch & Countdown Timer
- [ ] Pomodoro Timer
- [ ] Random Number Generator
- [ ] Coin Flip / Dice Roller
- [ ] Decision Picker (spin-the-wheel from a list)
- [ ] Placeholder Image Generator
- [ ] Lorem Picsum URL Builder
- [ ] Text-to-Speech Preview
- [ ] Screen Ruler (pixel measurement overlay)
- [ ] Local Storage / Session Storage Inspector
- [ ] Cookie Inspector & Editor
- [ ] Browser Info Dump (UA, screen, feature flags)
