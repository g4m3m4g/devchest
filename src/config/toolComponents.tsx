/* eslint-disable react-refresh/only-export-components -- data map of lazy tool components, not a component module */
import { lazy } from 'react';

const JsonFormatter    = lazy(() => import('../components/tools/formatters/JsonFormatter'));
const SqlFormatter     = lazy(() => import('../components/tools/formatters/SqlFormatter'));
const HtmlCssMinifier  = lazy(() => import('../components/tools/formatters/HtmlCssMinifier'));
const XmlFormatter     = lazy(() => import('../components/tools/formatters/XmlFormatter'));
const YamlConverter    = lazy(() => import('../components/tools/formatters/YamlConverter'));
const TomlConverter    = lazy(() => import('../components/tools/formatters/TomlConverter'));
const JsFormatter      = lazy(() => import('../components/tools/formatters/JsFormatter'));
const MarkdownPreview  = lazy(() => import('../components/tools/formatters/MarkdownPreview'));
const CsvViewer        = lazy(() => import('../components/tools/formatters/CsvViewer'));
const GraphqlFormatter = lazy(() => import('../components/tools/formatters/GraphqlFormatter'));
const IniFormatter         = lazy(() => import('../components/tools/formatters/IniFormatter'));
const DockerfileFormatter  = lazy(() => import('../components/tools/formatters/DockerfileFormatter'));
const NginxConfigFormatter  = lazy(() => import('../components/tools/formatters/NginxConfigFormatter'));
const HttpHeadersFormatter  = lazy(() => import('../components/tools/formatters/HttpHeadersFormatter'));
const LogFormatter          = lazy(() => import('../components/tools/formatters/LogFormatter'));
const Base64Tool       = lazy(() => import('../components/tools/encoders/Base64Tool'));
const UrlEncoder       = lazy(() => import('../components/tools/encoders/UrlEncoder'));
const JwtDecoder       = lazy(() => import('../components/tools/encoders/JwtDecoder'));
const HtmlEntityCoder  = lazy(() => import('../components/tools/encoders/HtmlEntityCoder'));
const UnicodeEscapeCoder = lazy(() => import('../components/tools/encoders/UnicodeEscapeCoder'));
const HexCoder         = lazy(() => import('../components/tools/encoders/HexCoder'));
const NumberBaseConverter = lazy(() => import('../components/tools/encoders/NumberBaseConverter'));
const MorseCoder       = lazy(() => import('../components/tools/encoders/MorseCoder'));
const PunycodeCoder    = lazy(() => import('../components/tools/encoders/PunycodeCoder'));
const QuotedPrintableCoder = lazy(() => import('../components/tools/encoders/QuotedPrintableCoder'));
const CaesarCipherTool = lazy(() => import('../components/tools/encoders/CaesarCipherTool'));
const GzipDeflateTool  = lazy(() => import('../components/tools/encoders/GzipDeflateTool'));
const JwtBuilder       = lazy(() => import('../components/tools/encoders/JwtBuilder'));
const MimeTypeLookup   = lazy(() => import('../components/tools/encoders/MimeTypeLookup'));
const DataUrlFileConverter = lazy(() => import('../components/tools/encoders/DataUrlFileConverter'));
const RegexTester      = lazy(() => import('../components/tools/text/RegexTester'));
const CaseConverter    = lazy(() => import('../components/tools/text/CaseConverter'));
const DiffChecker      = lazy(() => import('../components/tools/text/DiffChecker'));
const WordCharCounter  = lazy(() => import('../components/tools/text/WordCharCounter'));
const LoremIpsumGenerator = lazy(() => import('../components/tools/text/LoremIpsumGenerator'));
const TextSorter       = lazy(() => import('../components/tools/text/TextSorter'));
const TextReverse      = lazy(() => import('../components/tools/text/TextReverse'));
const SlugGenerator    = lazy(() => import('../components/tools/text/SlugGenerator'));
const WhitespaceLineCleaner = lazy(() => import('../components/tools/text/WhitespaceLineCleaner'));
const StringEscapeTool = lazy(() => import('../components/tools/text/StringEscapeTool'));
const FindReplaceTool  = lazy(() => import('../components/tools/text/FindReplaceTool'));
const LineFilterTool   = lazy(() => import('../components/tools/text/LineFilterTool'));
const ColumnExtractorTool = lazy(() => import('../components/tools/text/ColumnExtractorTool'));
const MarkdownToHtmlTool = lazy(() => import('../components/tools/text/MarkdownToHtmlTool'));
const HtmlToMarkdownTool = lazy(() => import('../components/tools/text/HtmlToMarkdownTool'));
const AsciiArtTool     = lazy(() => import('../components/tools/text/AsciiArtTool'));
const LevenshteinTool  = lazy(() => import('../components/tools/text/LevenshteinTool'));
const ReadabilityTool  = lazy(() => import('../components/tools/text/ReadabilityTool'));
const DuplicateLineRemoverTool = lazy(() => import('../components/tools/text/DuplicateLineRemoverTool'));
const SentenceCounterTool = lazy(() => import('../components/tools/text/SentenceCounterTool'));
const HashGenerator    = lazy(() => import('../components/tools/generators/HashGenerator'));
const UuidGenerator    = lazy(() => import('../components/tools/generators/UuidGenerator'));
const TimestampConverter = lazy(() => import('../components/tools/generators/TimestampConverter'));
const UuidVersionsGenerator = lazy(() => import('../components/tools/generators/UuidVersionsGenerator'));
const ULIDGenerator = lazy(() => import('../components/tools/generators/ULIDGenerator'));
const PasswordGenerator = lazy(() => import('../components/tools/generators/PasswordGenerator'));
const PassphraseGenerator = lazy(() => import('../components/tools/generators/PassphraseGenerator'));
const HmacGenerator = lazy(() => import('../components/tools/generators/HmacGenerator'));
const TotpGenerator = lazy(() => import('../components/tools/generators/TotpGenerator'));
const BcryptTool = lazy(() => import('../components/tools/generators/BcryptTool'));
const Argon2Tool = lazy(() => import('../components/tools/generators/Argon2Tool'));
const RsaKeyPairGenerator = lazy(() => import('../components/tools/generators/RsaKeyPairGenerator'));
const CertificateDecoder = lazy(() => import('../components/tools/generators/CertificateDecoder'));
const SshFingerprintTool = lazy(() => import('../components/tools/generators/SshFingerprintTool'));
const CsrfTokenGenerator = lazy(() => import('../components/tools/generators/CsrfTokenGenerator'));
const CspBuilder = lazy(() => import('../components/tools/generators/CspBuilder'));
const RobotsTxtGenerator = lazy(() => import('../components/tools/generators/RobotsTxtGenerator'));
const HtaccessGenerator = lazy(() => import('../components/tools/generators/HtaccessGenerator'));
const NanoIdGenerator = lazy(() => import('../components/tools/generators/NanoIdGenerator'));
const UnitConverterTool = lazy(() => import('../components/tools/numbers/UnitConverterTool'));
const CurrencyConverterTool = lazy(() => import('../components/tools/numbers/CurrencyConverterTool'));
const PercentageCalculatorTool = lazy(() => import('../components/tools/numbers/PercentageCalculatorTool'));
const AspectRatioCalculatorTool = lazy(() => import('../components/tools/numbers/AspectRatioCalculatorTool'));
const BitwiseCalculatorTool = lazy(() => import('../components/tools/numbers/BitwiseCalculatorTool'));
const IeeeFloatVisualizerTool = lazy(() => import('../components/tools/numbers/IeeeFloatVisualizerTool'));

export const TOOL_MAP: Record<string, React.ReactNode> = {
  'json-formatter':      <JsonFormatter />,
  'sql-formatter':       <SqlFormatter />,
  'html-css-minifier':   <HtmlCssMinifier />,
  'xml-formatter':       <XmlFormatter />,
  'yaml-converter':      <YamlConverter />,
  'toml-converter':      <TomlConverter />,
  'js-formatter':        <JsFormatter />,
  'csv-viewer':          <CsvViewer />,
  'markdown-preview':    <MarkdownPreview />,
  'graphql-formatter':   <GraphqlFormatter />,
  'ini-formatter':        <IniFormatter />,
  'dockerfile-formatter':  <DockerfileFormatter />,
  'nginx-formatter':       <NginxConfigFormatter />,
  'http-headers':          <HttpHeadersFormatter />,
  'log-formatter':         <LogFormatter />,
  'base64':              <Base64Tool />,
  'url-encoder':         <UrlEncoder />,
  'jwt-decoder':         <JwtDecoder />,
  'html-entity-coder':   <HtmlEntityCoder />,
  'unicode-escape-coder': <UnicodeEscapeCoder />,
  'hex-coder':           <HexCoder />,
  'number-base-converter': <NumberBaseConverter />,
  'morse-coder':         <MorseCoder />,
  'punycode-coder':      <PunycodeCoder />,
  'quoted-printable-coder': <QuotedPrintableCoder />,
  'caesar-cipher':       <CaesarCipherTool />,
  'gzip-deflate':        <GzipDeflateTool />,
  'jwt-builder':         <JwtBuilder />,
  'mime-type-lookup':    <MimeTypeLookup />,
  'data-url-file-converter': <DataUrlFileConverter />,
  'regex-tester':        <RegexTester />,
  'case-converter':      <CaseConverter />,
  'diff-checker':        <DiffChecker />,
  'word-char-counter':   <WordCharCounter />,
  'lorem-ipsum-generator': <LoremIpsumGenerator />,
  'text-sorter':         <TextSorter />,
  'text-reverse':        <TextReverse />,
  'slug-generator':      <SlugGenerator />,
  'whitespace-line-cleaner': <WhitespaceLineCleaner />,
  'string-escape':       <StringEscapeTool />,
  'find-replace':        <FindReplaceTool />,
  'line-filter':         <LineFilterTool />,
  'column-extractor':    <ColumnExtractorTool />,
  'markdown-to-html':    <MarkdownToHtmlTool />,
  'html-to-markdown':    <HtmlToMarkdownTool />,
  'ascii-art':           <AsciiArtTool />,
  'levenshtein-distance': <LevenshteinTool />,
  'readability-score':   <ReadabilityTool />,
  'duplicate-line-remover': <DuplicateLineRemoverTool />,
  'sentence-counter':    <SentenceCounterTool />,
  'hash-generator':      <HashGenerator />,
  'uuid-generator':      <UuidGenerator />,
  'timestamp-converter': <TimestampConverter />,
  'uuid-versions-generator': <UuidVersionsGenerator />,
  'ulid-generator':      <ULIDGenerator />,
  'password-generator':  <PasswordGenerator />,
  'passphrase-generator': <PassphraseGenerator />,
  'hmac-generator':      <HmacGenerator />,
  'totp-generator':      <TotpGenerator />,
  'bcrypt-tool':         <BcryptTool />,
  'argon2-tool':         <Argon2Tool />,
  'rsa-key-pair-generator': <RsaKeyPairGenerator />,
  'certificate-decoder': <CertificateDecoder />,
  'ssh-fingerprint':     <SshFingerprintTool />,
  'csrf-token-generator': <CsrfTokenGenerator />,
  'csp-builder':         <CspBuilder />,
  'robots-txt-generator': <RobotsTxtGenerator />,
  'htaccess-generator':  <HtaccessGenerator />,
  'nanoid-generator':    <NanoIdGenerator />,
  'unit-converter':      <UnitConverterTool />,
  'currency-converter':  <CurrencyConverterTool />,
  'percentage-calculator': <PercentageCalculatorTool />,
  'aspect-ratio-calculator': <AspectRatioCalculatorTool />,
  'bitwise-calculator':  <BitwiseCalculatorTool />,
  'ieee754-visualizer':  <IeeeFloatVisualizerTool />,
};
