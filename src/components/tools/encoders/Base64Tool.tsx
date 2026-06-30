import { useState, useRef } from 'react';
import { ImageIcon, Upload } from 'lucide-react';
import { encodeBase64, decodeBase64 } from '../../../lib/base64';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Mode = 'encode' | 'decode';

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const output = input
    ? mode === 'encode'
      ? encodeBase64(input)
      : decodeBase64(input)
    : '';

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setImageDataUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setImageDataUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <ToolLayout
      title="Base64 Encoder / Decoder"
      description="Encode text to Base64 or decode Base64 back to text. Drag an image to generate a Data URL."
      outputValue={imageDataUrl || output}
      onClear={() => { setInput(''); setImageDataUrl(''); }}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1 self-start shrink-0">
          {(['encode', 'decode'] as Mode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={[
                'px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all',
                mode === m
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300',
              ].join(' ')}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label={mode === 'encode' ? 'Plain Text' : 'Base64 String'}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode…' : 'Paste Base64 string to decode…'}
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <div className="flex flex-col gap-4 min-h-0">
            <Panel label={mode === 'encode' ? 'Base64 Output' : 'Decoded Text'} className="flex-1">
              <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
                {output || <span className="text-neutral-800">Output will appear here…</span>}
              </pre>
            </Panel>

            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={[
                'shrink-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed cursor-pointer transition-all p-4',
                isDragging
                  ? 'border-blue-500/50 bg-blue-500/5'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
              ].join(' ')}
              style={{ minHeight: '100px' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
              {imageDataUrl ? (
                <img src={imageDataUrl} alt="Preview" className="max-h-16 max-w-full rounded-lg object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                    {isDragging
                      ? <Upload className="w-4 h-4 text-blue-400" />
                      : <ImageIcon className="w-4 h-4 text-neutral-700" />}
                  </div>
                  <p className="text-[10px] text-neutral-700 text-center">Drop an image to get its Data URL</p>
                </>
              )}
            </div>

            {imageDataUrl && (
              <Panel label="Image Data URL" className="shrink-0">
                <pre className="px-4 py-3 font-mono text-[10px] text-neutral-500 overflow-auto max-h-20 whitespace-pre-wrap break-all leading-relaxed">
                  {imageDataUrl.slice(0, 200)}{imageDataUrl.length > 200 ? '…' : ''}
                </pre>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
