import { useState, useMemo } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { UNIT_CATEGORIES, convert } from '../../../lib/unitConverter';
import type { UnitCategoryId } from '../../../lib/unitConverter';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const selectClass = 'flex-1 bg-white/5 border border-white/5 text-neutral-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/40';

export default function UnitConverterTool() {
  const [categoryId, setCategoryId] = useState<UnitCategoryId>('length');
  const category = useMemo(() => UNIT_CATEGORIES.find(c => c.id === categoryId)!, [categoryId]);

  const [fromUnit, setFromUnit] = useState(category.units[0].id);
  const [toUnit, setToUnit] = useState(category.units[1].id);
  const [value, setValue] = useState('1');

  const handleCategoryChange = (id: UnitCategoryId) => {
    const nextCategory = UNIT_CATEGORIES.find(c => c.id === id)!;
    setCategoryId(id);
    setFromUnit(nextCategory.units[0].id);
    setToUnit(nextCategory.units[1].id);
  };

  const result = useMemo(() => {
    if (value.trim() === '' || Number.isNaN(Number(value))) return '';
    const converted = convert(Number(value), fromUnit, toUnit, categoryId);
    return Number.isFinite(converted) ? trimTrailingZeros(converted) : '';
  }, [value, fromUnit, toUnit, categoryId]);

  return (
    <ToolLayout
      title="Unit Converter"
      description="Convert between length, weight, temperature, area, and volume units."
      outputValue={result}
      onClear={() => setValue('')}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-2">
          <label htmlFor="unit-category" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 shrink-0">
            Category
          </label>
          <select
            id="unit-category"
            aria-label="Category"
            value={categoryId}
            onChange={e => handleCategoryChange(e.target.value as UnitCategoryId)}
            className={selectClass}
          >
            {UNIT_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <Panel label="Convert" className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <label htmlFor="unit-value" className="sr-only">Value</label>
              <input
                id="unit-value"
                aria-label="Value"
                type="number"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Enter a value…"
                className="w-40 bg-white/5 border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40"
              />
              <select
                aria-label="From unit"
                value={fromUnit}
                onChange={e => setFromUnit(e.target.value)}
                className={selectClass}
              >
                {category.units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              title="Swap units"
              onClick={() => { setFromUnit(toUnit); setToUnit(fromUnit); }}
              className="self-center w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/5 text-neutral-500 hover:bg-white/[0.08] hover:text-neutral-300 transition-all"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 rotate-90" />
            </button>

            <div className="flex items-center gap-2">
              <label htmlFor="unit-result" className="sr-only">Result</label>
              <input
                id="unit-result"
                aria-label="Result"
                type="text"
                value={result}
                readOnly
                placeholder="—"
                className="w-40 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-emerald-400 placeholder-neutral-800 outline-none"
              />
              <select
                aria-label="To unit"
                value={toUnit}
                onChange={e => setToUnit(e.target.value)}
                className={selectClass}
              >
                {category.units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
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
