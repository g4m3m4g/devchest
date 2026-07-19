import { useState, useMemo } from 'react';
import { hexToRgb, rgbToHex, mixColors, contrastRatio, wcagLevel } from '../../../lib/colorMath';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const inputClass = 'flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40';
const outputClass = 'flex-1 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-emerald-400 placeholder-neutral-800 outline-none';

export default function ColorMathTool() {
  const [colorA, setColorA] = useState('#3b82f6');
  const [colorB, setColorB] = useState('#f97316');
  const [ratio, setRatio] = useState('0.5');
  const [largeText, setLargeText] = useState(false);

  const result = useMemo(() => {
    try {
      const a = hexToRgb(colorA);
      const b = hexToRgb(colorB);
      const mixed = mixColors(a, b, Number(ratio));
      const ratioValue = contrastRatio(a, b);
      const wcag = wcagLevel(ratioValue, largeText);
      return {
        mixedHex: rgbToHex(mixed),
        ratioValue,
        wcag,
        error: null,
      };
    } catch (err) {
      return { mixedHex: '', ratioValue: null, wcag: null, error: (err as Error).message };
    }
  }, [colorA, colorB, ratio, largeText]);

  return (
    <ToolLayout
      title="Color Math"
      description="Mix two colors, and check WCAG contrast ratio and pass/fail levels."
      outputValue={result.mixedHex}
      onClear={() => { setColorA(''); setColorB(''); }}
    >
      <div className="flex flex-col gap-4 h-full">
        <Panel label="Colors" className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <label htmlFor="color-a" className="w-32 text-xs text-neutral-500 shrink-0">Color A</label>
              <input
                id="color-a"
                aria-label="Color A"
                type="text"
                value={colorA}
                onChange={e => setColorA(e.target.value)}
                placeholder="#3b82f6"
                className={inputClass}
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="color-b" className="w-32 text-xs text-neutral-500 shrink-0">Color B</label>
              <input
                id="color-b"
                aria-label="Color B"
                type="text"
                value={colorB}
                onChange={e => setColorB(e.target.value)}
                placeholder="#f97316"
                className={inputClass}
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="color-ratio" className="w-32 text-xs text-neutral-500 shrink-0">Mix ratio</label>
              <input
                id="color-ratio"
                aria-label="Mix ratio"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={ratio}
                onChange={e => setRatio(e.target.value)}
                className="flex-1"
              />
              <span className="text-xs text-neutral-500 w-10 text-right">{ratio}</span>
            </div>

            <label className="flex items-center gap-2 text-xs text-neutral-500">
              <input
                type="checkbox"
                aria-label="Large text"
                checked={largeText}
                onChange={e => setLargeText(e.target.checked)}
              />
              Large text (18pt+/14pt bold+)
            </label>
          </div>
        </Panel>

        <Panel label="Result" className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <label htmlFor="mixed-color" className="w-32 text-xs text-neutral-500 shrink-0">Mixed color</label>
              <input
                id="mixed-color"
                aria-label="Mixed color"
                type="text"
                value={result.mixedHex}
                readOnly
                placeholder="—"
                className={outputClass}
              />
              {result.mixedHex && (
                <div className="w-8 h-8 rounded-md border border-white/10 shrink-0" style={{ backgroundColor: result.mixedHex }} />
              )}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="contrast-ratio" className="w-32 text-xs text-neutral-500 shrink-0">Contrast ratio</label>
              <input
                id="contrast-ratio"
                aria-label="Contrast ratio"
                type="text"
                value={result.ratioValue !== null ? `${result.ratioValue.toFixed(2)}:1` : ''}
                readOnly
                placeholder="—"
                className={outputClass}
              />
            </div>

            {result.wcag && (
              <div className="flex items-center gap-2 pl-[8.5rem]">
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${result.wcag.aa ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  AA {result.wcag.aa ? 'Pass' : 'Fail'}
                </span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${result.wcag.aaa ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  AAA {result.wcag.aaa ? 'Pass' : 'Fail'}
                </span>
              </div>
            )}
          </div>
        </Panel>

        {result.error && (
          <p className="shrink-0 text-xs text-red-400 px-1">{result.error}</p>
        )}
      </div>
    </ToolLayout>
  );
}
