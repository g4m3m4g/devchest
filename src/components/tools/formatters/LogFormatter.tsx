import { useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { formatLogEntries } from '../../../lib/logFormatter';
import type { LogEntry, LogLevel } from '../../../lib/logFormatter';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type FilterLevel = LogLevel | 'all';

const FILTER_LEVELS: FilterLevel[] = ['all', 'debug', 'info', 'warn', 'error'];
const FILTER_LABELS: Record<FilterLevel, string> = {
  all: 'All', trace: 'Trace', debug: 'Debug', info: 'Info', warn: 'Warn',
  error: 'Error', fatal: 'Fatal',
};

const LEVEL_BADGE: Record<LogLevel, string> = {
  trace: 'text-neutral-600 bg-neutral-600/10',
  debug: 'text-neutral-500 bg-neutral-500/10',
  info:  'text-blue-400   bg-blue-400/10',
  warn:  'text-amber-400  bg-amber-400/10',
  error: 'text-red-400    bg-red-400/10',
  fatal: 'text-red-300    bg-red-400/20',
};

const MESSAGE_COLOR: Record<LogLevel, string> = {
  trace: 'text-neutral-600',
  debug: 'text-neutral-500',
  info:  'text-neutral-300',
  warn:  'text-amber-200',
  error: 'text-red-300',
  fatal: 'text-red-200',
};

const PLACEHOLDER = `{"level":30,"time":1640995200000,"pid":1,"msg":"Server started","port":3000}
{"level":30,"time":1640995201000,"pid":1,"msg":"User logged in","user_id":42,"ip":"192.168.1.1"}
{"level":40,"time":1640995202000,"pid":1,"msg":"Slow query detected","duration_ms":1850,"table":"orders"}
{"level":50,"time":1640995203000,"pid":1,"msg":"Payment failed","error":"card_declined","amount":99.99}`;

function formatTimestamp(ts: string): string {
  const match = ts.match(/T(\d{2}:\d{2}:\d{2})/);
  if (match) return match[1];
  return ts.length > 19 ? ts.slice(0, 19) : ts;
}

function EntryRow({ entry, showMeta }: { entry: LogEntry; showMeta: boolean }) {
  if (entry.parseError) {
    return (
      <div className="flex items-start gap-2 py-1 px-2 rounded-lg bg-orange-400/5 border border-orange-400/10">
        <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-orange-400/10 text-orange-400 shrink-0 mt-0.5">
          parse error
        </span>
        <span className="font-mono text-xs text-orange-400/80 break-all leading-snug">
          {entry.message ?? entry.raw}
        </span>
      </div>
    );
  }

  const fieldEntries = Object.entries(entry.fields);

  return (
    <div className="py-0.5">
      <div className="flex items-baseline gap-2">
        {entry.timestamp && (
          <span className="font-mono text-[11px] text-neutral-700 shrink-0 tabular-nums">
            {formatTimestamp(entry.timestamp)}
          </span>
        )}
        {entry.level ? (
          <span
            className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0 ${LEVEL_BADGE[entry.level]}`}
          >
            {entry.level}
          </span>
        ) : (
          <span className="text-[9px] text-neutral-700 shrink-0">?</span>
        )}
        <span
          className={`font-mono text-xs leading-snug ${entry.level ? MESSAGE_COLOR[entry.level] : 'text-neutral-400'}`}
        >
          {entry.message ?? '(no message)'}
        </span>
      </div>

      {showMeta && fieldEntries.length > 0 && (
        <div className="ml-[4.5rem] mt-0.5 space-y-px">
          {fieldEntries.map(([k, v]) => (
            <div key={k} className="flex gap-1.5 font-mono text-[11px]">
              <span className="text-neutral-600 shrink-0">{k}</span>
              <span className="text-neutral-500 break-all">
                {typeof v === 'string' ? v : JSON.stringify(v)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LogFormatter() {
  const [input, setInput] = useState('');
  const [minLevel, setMinLevel] = useState<FilterLevel>('all');
  const [showMeta, setShowMeta] = useState(true);

  const result = useMemo(
    () => formatLogEntries(input, { minLevel, showMeta }),
    [input, minLevel, showMeta],
  );

  return (
    <ToolLayout
      title="Log Formatter"
      description="Parse structured JSON logs (pino, winston, bunyan, logrus) into a readable view — filter by level, toggle metadata."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel label="Source">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel
          label="Log Output"
          actions={
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
                {FILTER_LEVELS.map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setMinLevel(lvl)}
                    className={[
                      'px-2 py-0.5 text-[10px] font-medium rounded transition-all',
                      minLevel === lvl
                        ? 'bg-white/10 text-white'
                        : 'text-neutral-600 hover:text-neutral-400',
                    ].join(' ')}
                  >
                    {FILTER_LABELS[lvl]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowMeta(v => !v)}
                className={[
                  'px-2 py-0.5 text-[10px] font-medium rounded transition-all bg-white/5',
                  showMeta
                    ? 'text-white bg-white/10'
                    : 'text-neutral-600 hover:text-neutral-400',
                ].join(' ')}
              >
                Meta
              </button>
            </div>
          }
        >
          {result.visibleEntries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-neutral-800">
              {input.trim() ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">No entries match the current filter</p>
                </>
              ) : (
                <p className="text-sm">Log entries will appear here…</p>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-auto px-4 py-3 space-y-0.5">
              {result.visibleEntries.map(entry => (
                <EntryRow key={entry.index} entry={entry} showMeta={showMeta} />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
