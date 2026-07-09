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
const HashGenerator    = lazy(() => import('../components/tools/generators/HashGenerator'));
const UuidGenerator    = lazy(() => import('../components/tools/generators/UuidGenerator'));
const TimestampConverter = lazy(() => import('../components/tools/generators/TimestampConverter'));

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
  'hash-generator':      <HashGenerator />,
  'uuid-generator':      <UuidGenerator />,
  'timestamp-converter': <TimestampConverter />,
};
