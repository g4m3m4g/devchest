import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { parseCron, getNextRunTimes, buildFieldExpression, detectFieldMode } from '../../../lib/cron';
import type { CronFieldMode } from '../../../lib/cron';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const DEFAULT_EXPRESSION = '* * * * *';

const FIELD_DEFS = [
  { label: 'Minute', min: 0, max: 59 },
  { label: 'Hour', min: 0, max: 23 },
  { label: 'Day of Month', min: 1, max: 31 },
  { label: 'Month', min: 1, max: 12 },
  { label: 'Day of Week', min: 0, max: 6 },
];

function rangeStart(raw: string, fallback: number): number {
  const m = /^(\d+)-(\d+)$/.exec(raw);
  return m ? parseInt(m[1], 10) : fallback;
}

function rangeEnd(raw: string, fallback: number): number {
  const m = /^(\d+)-(\d+)$/.exec(raw);
  return m ? parseInt(m[2], 10) : fallback;
}

function stepValue(raw: string): number {
  const m = /^\*\/(\d+)$/.exec(raw);
  return m ? parseInt(m[1], 10) : 1;
}

function FieldBuilder({
  label,
  raw,
  min,
  max,
  onChange,
}: {
  label: string;
  raw: string;
  min: number;
  max: number;
  onChange: (raw: string) => void;
}) {
  const mode = detectFieldMode(raw);

  const handleModeChange = (newMode: CronFieldMode) => {
    if (newMode === 'every') onChange(buildFieldExpression('every', {}));
    else if (newMode === 'specific') onChange(buildFieldExpression('specific', { values: [min] }));
    else if (newMode === 'range') onChange(buildFieldExpression('range', { start: min, end: max }));
    else onChange(buildFieldExpression('step', { step: 1 }));
  };

  return (
    <div className="flex items-center gap-2 py-1.5 flex-wrap">
      <span className="w-24 text-xs text-neutral-500 shrink-0">{label}</span>
      <select
        aria-label={`${label} mode`}
        value={mode}
        onChange={e => handleModeChange(e.target.value as CronFieldMode)}
        className="bg-white/5 rounded px-2 py-1 text-xs text-neutral-300 outline-none"
      >
        <option value="every">Every</option>
        <option value="specific">Specific</option>
        <option value="range">Range</option>
        <option value="step">Step</option>
      </select>

      {mode === 'specific' && (
        <input
          type="text"
          aria-label={`${label} value`}
          value={raw}
          onChange={e => onChange(e.target.value)}
          placeholder="1,3,5"
          spellCheck={false}
          className="w-24 bg-white/5 rounded px-2 py-1 text-xs font-mono text-neutral-300 outline-none"
        />
      )}

      {mode === 'range' && (
        <>
          <input
            type="number"
            aria-label={`${label} start`}
            value={rangeStart(raw, min)}
            onChange={e => onChange(buildFieldExpression('range', { start: Number(e.target.value), end: rangeEnd(raw, max) }))}
            className="w-16 bg-white/5 rounded px-2 py-1 text-xs font-mono text-neutral-300 outline-none"
          />
          <span className="text-neutral-600 text-xs">–</span>
          <input
            type="number"
            aria-label={`${label} end`}
            value={rangeEnd(raw, max)}
            onChange={e => onChange(buildFieldExpression('range', { start: rangeStart(raw, min), end: Number(e.target.value) }))}
            className="w-16 bg-white/5 rounded px-2 py-1 text-xs font-mono text-neutral-300 outline-none"
          />
        </>
      )}

      {mode === 'step' && (
        <input
          type="number"
          min={1}
          aria-label={`${label} step`}
          value={stepValue(raw)}
          onChange={e => onChange(buildFieldExpression('step', { step: Number(e.target.value) }))}
          className="w-16 bg-white/5 rounded px-2 py-1 text-xs font-mono text-neutral-300 outline-none"
        />
      )}
    </div>
  );
}

export default function CronBuilderTool() {
  const [expression, setExpression] = useState(DEFAULT_EXPRESSION);

  const result = useMemo(() => parseCron(expression), [expression]);
  const nextRuns = useMemo(() => getNextRunTimes(expression, 5), [expression]);

  const parts = expression.trim().split(/\s+/);
  const fieldRaw = parts.length === 5 ? parts : ['*', '*', '*', '*', '*'];

  const updateField = (index: number, raw: string) => {
    const next = [...fieldRaw];
    next[index] = raw;
    setExpression(next.join(' '));
  };

  const output = result.valid
    ? `${result.description}\n\nNext runs:\n${nextRuns.map(r => r.toLocaleString()).join('\n')}`
    : '';

  return (
    <ToolLayout
      title="cron Expression Parser & Builder"
      description="Build a cron expression field by field or type one directly, see a plain-English description, and preview upcoming run times."
      outputValue={output}
      onClear={() => setExpression(DEFAULT_EXPRESSION)}
      onPaste={text => setExpression(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel label="Expression">
          <div className="flex flex-col gap-1 px-4 py-3 overflow-auto">
            <input
              type="text"
              value={expression}
              onChange={e => setExpression(e.target.value)}
              placeholder="*/15 9-17 * * 1-5"
              spellCheck={false}
              className="w-full bg-white/5 rounded px-3 py-2 font-mono text-sm text-neutral-300 outline-none"
            />
            <div className="mt-2 flex flex-col divide-y divide-white/5">
              {FIELD_DEFS.map((def, i) => (
                <FieldBuilder
                  key={def.label}
                  label={def.label}
                  raw={fieldRaw[i]}
                  min={def.min}
                  max={def.max}
                  onChange={raw => updateField(i, raw)}
                />
              ))}
            </div>
          </div>
        </Panel>

        <Panel
          label="Result"
          actions={
            result.valid ? (
              <div className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle className="w-3 h-3" />
                <span className="text-[10px]">Valid</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[10px]">Invalid</span>
              </div>
            )
          }
        >
          {!result.valid ? (
            <div className="flex-1 flex flex-col gap-2 px-4 py-3">
              {result.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400 leading-relaxed">{err}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 px-4 py-3 overflow-auto">
              <p className="text-sm text-neutral-300 leading-relaxed">{result.description}</p>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 mb-2">Next runs</p>
                <ul className="space-y-1">
                  {nextRuns.map((run, i) => (
                    <li key={i} className="text-sm font-mono text-neutral-400">
                      {run.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
