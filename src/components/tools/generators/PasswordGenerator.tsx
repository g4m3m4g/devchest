import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { generatePassword, buildCharset, calculateEntropyBits, classifyStrength } from '../../../lib/password';
import type { PasswordOptions, PasswordStrength } from '../../../lib/password';
import ToolLayout from '../../layout/ToolLayout';

const STRENGTH_STYLES: Record<PasswordStrength, { label: string; bar: string; text: string }> = {
  weak: { label: 'Weak', bar: 'bg-red-500', text: 'text-red-400' },
  fair: { label: 'Fair', bar: 'bg-amber-500', text: 'text-amber-400' },
  strong: { label: 'Strong', bar: 'bg-blue-500', text: 'text-blue-400' },
  'very-strong': { label: 'Very Strong', bar: 'bg-emerald-500', text: 'text-emerald-400' },
};

export default function PasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [password, setPassword] = useState('');

  const charsetSize = buildCharset(options).length;
  const canGenerate = charsetSize > 0;
  const entropyBits = password ? calculateEntropyBits(options.length, charsetSize) : 0;
  const strength = classifyStrength(entropyBits);

  const generate = useCallback(() => {
    if (!canGenerate) return;
    setPassword(generatePassword(options));
  }, [options, canGenerate]);

  const toggle = (key: keyof Omit<PasswordOptions, 'length'>) => {
    setOptions(o => ({ ...o, [key]: !o[key] }));
  };

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate strong random passwords with configurable length and character sets, with an entropy readout."
      outputValue={password}
      onClear={() => setPassword('')}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Length</label>
            <input
              type="number"
              min={4}
              max={128}
              value={options.length}
              onChange={e => setOptions(o => ({ ...o, length: Math.max(4, Math.min(128, Number(e.target.value))) }))}
              className="w-16 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500/40 text-center"
            />
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={options.uppercase}
              onChange={() => toggle('uppercase')}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Uppercase</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={options.lowercase}
              onChange={() => toggle('lowercase')}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Lowercase</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={options.digits}
              onChange={() => toggle('digits')}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Digits</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={options.symbols}
              onChange={() => toggle('symbols')}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Symbols</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={options.excludeAmbiguous}
              onChange={() => toggle('excludeAmbiguous')}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Exclude ambiguous</span>
          </label>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={generate}
              disabled={!canGenerate}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-neutral-700 disabled:cursor-not-allowed text-white transition-all"
            >
              <RefreshCw className="w-3 h-3" />Generate
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5">
          {!password ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-neutral-700">
                  {canGenerate ? 'Click Generate to produce a password' : 'Enable at least one character set'}
                </p>
                <p className="text-[10px] text-neutral-800 mt-1">cryptographically random</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-6 px-6 py-8">
              <span
                data-testid="generated-password"
                className="font-mono text-2xl text-neutral-200 select-all break-all text-center"
              >
                {password}
              </span>

              <div className="w-full max-w-sm flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-medium">
                  <span className="text-neutral-500">{entropyBits.toFixed(1)} bits</span>
                  <span className={STRENGTH_STYLES[strength].text}>{STRENGTH_STYLES[strength].label}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={['h-full rounded-full transition-all', STRENGTH_STYLES[strength].bar].join(' ')}
                    style={{ width: `${Math.min(100, (entropyBits / 100) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
