import { useState, useMemo } from 'react';
import { simplifyRatio, resolveHeight } from '../../../lib/aspectRatio';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const inputClass = 'flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40';
const resultClass = 'flex-1 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-emerald-400 placeholder-neutral-800 outline-none';

export default function AspectRatioCalculatorTool() {
  const [width, setWidth] = useState('1920');
  const [height, setHeight] = useState('1080');

  const [ratioW, setRatioW] = useState('16');
  const [ratioH, setRatioH] = useState('9');
  const [targetWidth, setTargetWidth] = useState('1920');

  const simplified = useMemo(() => {
    const w = Number(width);
    const h = Number(height);
    if (width.trim() === '' || height.trim() === '' || Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0) return '';
    const { w: rw, h: rh } = simplifyRatio(w, h);
    return `${rw}:${rh}`;
  }, [width, height]);

  const resolvedHeight = useMemo(() => {
    const rw = Number(ratioW);
    const rh = Number(ratioH);
    const tw = Number(targetWidth);
    if (ratioW.trim() === '' || ratioH.trim() === '' || targetWidth.trim() === '' || rw <= 0 || rh <= 0 || Number.isNaN(tw)) return '';
    return trimTrailingZeros(resolveHeight(tw, rw, rh));
  }, [ratioW, ratioH, targetWidth]);

  const summary = `${width}x${height} = ${simplified}\n${targetWidth} wide at ${ratioW}:${ratioH} = height ${resolvedHeight}`;

  return (
    <ToolLayout
      title="Aspect Ratio Calculator"
      description="Simplify a width/height ratio and solve for a missing dimension."
      outputValue={summary}
      onClear={() => { setWidth(''); setHeight(''); setRatioW(''); setRatioH(''); setTargetWidth(''); }}
    >
      <div className="flex flex-col gap-4 h-full">
        <Panel label="Simplify a Ratio" className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <label htmlFor="ratio-width" className="w-24 text-xs text-neutral-500 shrink-0">Width</label>
              <input
                id="ratio-width"
                aria-label="Width"
                type="number"
                value={width}
                onChange={e => setWidth(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="ratio-height" className="w-24 text-xs text-neutral-500 shrink-0">Height</label>
              <input
                id="ratio-height"
                aria-label="Height"
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="simplified-ratio" className="w-24 text-xs text-neutral-500 shrink-0">Ratio</label>
              <input
                id="simplified-ratio"
                aria-label="Simplified ratio"
                type="text"
                value={simplified}
                readOnly
                placeholder="—"
                className={resultClass}
              />
            </div>
          </div>
        </Panel>

        <Panel label="Solve for a Dimension" className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <label htmlFor="target-ratio-w" className="w-24 text-xs text-neutral-500 shrink-0">Ratio width</label>
              <input
                id="target-ratio-w"
                aria-label="Ratio width"
                type="number"
                value={ratioW}
                onChange={e => setRatioW(e.target.value)}
                placeholder="16"
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="target-ratio-h" className="w-24 text-xs text-neutral-500 shrink-0">Ratio height</label>
              <input
                id="target-ratio-h"
                aria-label="Ratio height"
                type="number"
                value={ratioH}
                onChange={e => setRatioH(e.target.value)}
                placeholder="9"
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="target-width" className="w-24 text-xs text-neutral-500 shrink-0">Target width</label>
              <input
                id="target-width"
                aria-label="Target width"
                type="number"
                value={targetWidth}
                onChange={e => setTargetWidth(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="resolved-height" className="w-24 text-xs text-neutral-500 shrink-0">Resolved height</label>
              <input
                id="resolved-height"
                aria-label="Resolved height"
                type="text"
                value={resolvedHeight}
                readOnly
                placeholder="—"
                className={resultClass}
              />
            </div>
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}

function trimTrailingZeros(n: number): string {
  return n.toFixed(6).replace(/\.?0+$/, '');
}
