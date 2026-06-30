import { useState } from 'react';
import { Copy, Trash2, ClipboardPaste, Check } from 'lucide-react';

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  outputValue?: string;
  onClear?: () => void;
  onPaste?: (text: string) => void;
}

export default function ToolLayout({
  title,
  description,
  children,
  outputValue,
  onClear,
  onPaste,
}: ToolLayoutProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!outputValue) return;
    try {
      await navigator.clipboard.writeText(outputValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable
    }
  };

  const handlePaste = async () => {
    if (!onPaste) return;
    try {
      const text = await navigator.clipboard.readText();
      onPaste(text);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight leading-none">{title}</h1>
          <p className="text-xs text-neutral-600 mt-1.5">{description}</p>
        </div>

        <div className="flex items-center gap-1.5 ml-4">
          {onPaste && (
            <ActionButton onClick={handlePaste} title="Paste from clipboard">
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste</span>
            </ActionButton>
          )}
          {onClear && (
            <ActionButton onClick={onClear} title="Clear all">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </ActionButton>
          )}
          {outputValue !== undefined && (
            <ActionButton onClick={handleCopy} title="Copy output" accent={copied}>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </ActionButton>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  title,
  accent = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
        accent
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : 'bg-white/[0.04] border-white/5 text-neutral-500 hover:bg-white/[0.08] hover:text-neutral-300',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function Panel({
  label,
  children,
  actions,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={['flex flex-col bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden', className].join(' ')}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">{label}</span>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
}
