import { useState, useEffect, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { convertUnixToDate, convertDateToUnix, formatRelativeTime } from '../../../lib/timestamp';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function TimestampConverter() {
  const [nowTs, setNowTs] = useState(() => Math.floor(Date.now() / 1000));
  const [unixInput, setUnixInput] = useState('');
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNowTs(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const fromUnix = useMemo(() => {
    const ts = parseInt(unixInput, 10);
    if (!unixInput || isNaN(ts)) return null;
    return convertUnixToDate(ts, nowTs);
  }, [unixInput, nowTs]);

  const fromDate = useMemo(() => {
    if (!dateInput) return null;
    return convertDateToUnix(dateInput);
  }, [dateInput]);

  const useNow = () => {
    setUnixInput(String(nowTs));
    setDateInput(new Date(nowTs * 1000).toISOString());
  };

  return (
    <ToolLayout
      title="Timestamp Converter"
      description="Convert Unix epochs to human-readable times and vice-versa with a live current-time ticker."
      onClear={() => { setUnixInput(''); setDateInput(''); }}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 mb-1">Current Time</p>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xl font-medium text-white tabular-nums">{nowTs}</span>
              <span className="text-xs text-neutral-500">{new Date(nowTs * 1000).toISOString()}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={useNow}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600/10 border border-blue-600/20 text-blue-400 hover:bg-blue-600/20 transition-all"
          >
            <RefreshCw className="w-3 h-3" />Use Now
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="flex flex-col gap-3 min-h-0">
            <Panel label="Unix Timestamp → Date">
              <div className="px-4 pt-3 pb-2">
                <input
                  type="number"
                  value={unixInput}
                  onChange={e => setUnixInput(e.target.value)}
                  placeholder="e.g. 1700000000"
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 font-mono text-sm text-neutral-200 placeholder-neutral-800 outline-none focus:border-blue-500/40 transition-all"
                />
              </div>
              {fromUnix && (
                'error' in fromUnix ? (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-red-400">{fromUnix.error}</p>
                  </div>
                ) : (
                  <div className="px-4 pb-3 flex flex-col gap-2">
                    {([
                      ['ISO 8601', fromUnix.iso],
                      ['Local', fromUnix.local],
                      ['UTC', fromUnix.utc],
                      ['Relative', fromUnix.relative],
                      ['Milliseconds', String(fromUnix.ms)],
                    ] as [string, string][]).map(([label, value]) => (
                      <div key={label} className="flex items-baseline gap-2">
                        <span className="text-[10px] text-neutral-700 w-24 shrink-0">{label}</span>
                        <span className="font-mono text-xs text-neutral-300 break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </Panel>
          </div>

          <div className="flex flex-col gap-3 min-h-0">
            <Panel label="Date String → Unix Timestamp">
              <div className="px-4 pt-3 pb-2">
                <input
                  type="text"
                  value={dateInput}
                  onChange={e => setDateInput(e.target.value)}
                  placeholder="e.g. 2024-01-15T12:00:00Z"
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 font-mono text-sm text-neutral-200 placeholder-neutral-800 outline-none focus:border-blue-500/40 transition-all"
                />
              </div>
              {fromDate && (
                'error' in fromDate ? (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-red-400">{fromDate.error}</p>
                  </div>
                ) : (
                  <div className="px-4 pb-3 flex flex-col gap-2">
                    {([
                      ['Unix (seconds)', String(fromDate.unix)],
                      ['Unix (ms)', String(fromDate.ms)],
                    ] as [string, string][]).map(([label, value]) => (
                      <div key={label} className="flex items-baseline gap-2">
                        <span className="text-[10px] text-neutral-700 w-32 shrink-0">{label}</span>
                        <span className="font-mono text-sm text-neutral-300">{value}</span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </Panel>

            <Panel label="Common Date Formats">
              <div className="px-4 py-3 flex flex-col gap-1.5">
                {([
                  ['ISO 8601', '2024-01-15T12:00:00Z'],
                  ['ISO local', '2024-01-15T12:00:00'],
                  ['Short date', '2024-01-15'],
                  ['US format', '01/15/2024 12:00:00 PM'],
                  ['RFC 2822', 'Mon, 15 Jan 2024 12:00:00 GMT'],
                ] as [string, string][]).map(([label, example]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setDateInput(example)}
                    className="flex items-center gap-2 text-left hover:bg-white/5 rounded-lg px-1 py-0.5 transition-all group"
                  >
                    <span className="text-[10px] text-neutral-700 w-24 shrink-0 group-hover:text-neutral-500">{label}</span>
                    <span className="font-mono text-[10px] text-neutral-600 group-hover:text-neutral-400 truncate">{example}</span>
                  </button>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

// Re-export for use in other modules
export { formatRelativeTime };
