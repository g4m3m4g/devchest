import { useState, useMemo } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { toRoman, fromRoman } from '../../../lib/romanNumeral';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const inputClass = 'flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40';
const outputClass = 'flex-1 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-emerald-400 placeholder-neutral-800 outline-none';

export default function RomanNumeralConverterTool() {
  const [toRomanDirection, setToRomanDirection] = useState(true);
  const [number, setNumber] = useState('1994');
  const [roman, setRoman] = useState('MCMXCIV');

  const result = useMemo(() => {
    try {
      if (toRomanDirection) {
        if (number.trim() === '') return { value: '', error: null };
        return { value: toRoman(Number(number)), error: null };
      }
      if (roman.trim() === '') return { value: '', error: null };
      return { value: String(fromRoman(roman)), error: null };
    } catch (err) {
      return { value: '', error: (err as Error).message };
    }
  }, [toRomanDirection, number, roman]);

  const displayedRoman = toRomanDirection ? result.value : roman;
  const displayedNumber = toRomanDirection ? number : result.value;

  return (
    <ToolLayout
      title="Roman Numeral Converter"
      description="Convert between Arabic numbers and Roman numerals (1–3999)."
      outputValue={result.value}
      onClear={() => { setNumber(''); setRoman(''); }}
    >
      <div className="flex flex-col gap-4 h-full">
        <Panel label="Conversion" className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <label htmlFor="roman-number" className="w-32 text-xs text-neutral-500 shrink-0">Number</label>
              <input
                id="roman-number"
                aria-label="Number"
                type="text"
                value={displayedNumber}
                onChange={e => setNumber(e.target.value)}
                readOnly={!toRomanDirection}
                placeholder="1994"
                className={toRomanDirection ? inputClass : outputClass}
              />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                aria-label="Swap direction"
                title="Swap direction"
                onClick={() => setToRomanDirection(v => !v)}
                className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 rotate-90" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="roman-value" className="w-32 text-xs text-neutral-500 shrink-0">Roman numeral</label>
              <input
                id="roman-value"
                aria-label="Roman numeral"
                type="text"
                value={displayedRoman}
                onChange={e => setRoman(e.target.value)}
                readOnly={toRomanDirection}
                placeholder="MCMXCIV"
                className={toRomanDirection ? outputClass : inputClass}
              />
            </div>
          </div>
        </Panel>

        {result.error && (
          <p className="shrink-0 text-xs text-red-400 px-1">{result.error}</p>
        )}
      </div>
    </ToolLayout>
  );
}
