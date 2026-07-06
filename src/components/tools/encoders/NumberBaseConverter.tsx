import { useState } from 'react';
import { convertAll, type NumberBase, type AllBases } from '../../../lib/numberBase';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const EMPTY: AllBases = { binary: '', octal: '', decimal: '', hex: '' };

const FIELDS: { key: keyof AllBases; base: NumberBase; label: string; placeholder: string }[] = [
  { key: 'binary', base: 2, label: 'Binary', placeholder: '11111111' },
  { key: 'octal', base: 8, label: 'Octal', placeholder: '377' },
  { key: 'decimal', base: 10, label: 'Decimal', placeholder: '255' },
  { key: 'hex', base: 16, label: 'Hex', placeholder: 'ff' },
];

export default function NumberBaseConverter() {
  const [values, setValues] = useState<AllBases>(EMPTY);
  const [error, setError] = useState<{ key: keyof AllBases; message: string } | null>(null);

  const handleChange = (key: keyof AllBases, base: NumberBase, raw: string) => {
    if (raw.trim() === '') {
      setValues(EMPTY);
      setError(null);
      return;
    }
    try {
      const all = convertAll(raw, base);
      setValues({ ...all, [key]: raw });
      setError(null);
    } catch (e) {
      setValues(v => ({ ...v, [key]: raw }));
      setError({ key, message: e instanceof Error ? e.message : 'Invalid number' });
    }
  };

  const handleClear = () => {
    setValues(EMPTY);
    setError(null);
  };

  return (
    <ToolLayout
      title="Number Base Converter"
      description="Convert integers between binary, octal, decimal, and hexadecimal — edit any field to update the rest."
      outputValue={values.decimal}
      onClear={handleClear}
      onPaste={text => handleChange('decimal', 10, text)}
    >
      <div className="flex flex-col gap-3 h-full">
        {FIELDS.map(({ key, base, label, placeholder }) => (
          <Panel key={key} label={label}>
            <input
              type="text"
              value={values[key]}
              onChange={e => handleChange(key, base, e.target.value)}
              placeholder={placeholder}
              spellCheck={false}
              className="w-full bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none"
            />
            {error?.key === key && (
              <p className="px-4 pb-3 font-mono text-xs text-red-400">{error.message}</p>
            )}
          </Panel>
        ))}
      </div>
    </ToolLayout>
  );
}
