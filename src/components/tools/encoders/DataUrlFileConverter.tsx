import { useState, useRef, useMemo } from 'react';
import { Upload, FileUp, Download } from 'lucide-react';
import { parseDataUrl, base64ByteLength, formatBytes, suggestFileName } from '../../../lib/dataUrl';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Mode = 'toDataUrl' | 'toFile';

interface LoadedFile {
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
}

export default function DataUrlFileConverter() {
  const [mode, setMode] = useState<Mode>('toDataUrl');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<LoadedFile | null>(null);
  const [dataUrlInput, setDataUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => (dataUrlInput.trim() ? parseDataUrl(dataUrlInput.trim()) : null), [dataUrlInput]);
  const parseError = dataUrlInput.trim() && !parsed;

  const loadFile = (selected: File | undefined) => {
    if (!selected) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFile({
        name: selected.name,
        mimeType: selected.type || 'application/octet-stream',
        size: selected.size,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    loadFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadFile(e.target.files?.[0]);
  };

  const handleDownload = () => {
    if (!parsed) return;
    const dataUrl = parsed.isBase64
      ? `data:${parsed.mimeType};base64,${parsed.data}`
      : `data:${parsed.mimeType},${parsed.data}`;

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = suggestFileName(parsed.mimeType);
    a.click();
  };

  const decodedSize = parsed
    ? parsed.isBase64
      ? base64ByteLength(parsed.data)
      : decodeURIComponent(parsed.data).length
    : 0;

  const isImagePreview = parsed?.mimeType.startsWith('image/');

  return (
    <ToolLayout
      title="Data URL ↔ File Converter"
      description="Convert a file to a Data URL, or decode a Data URL back into a downloadable file."
      outputValue={mode === 'toDataUrl' ? file?.dataUrl : undefined}
      onClear={() => { setFile(null); setDataUrlInput(''); }}
      onPaste={mode === 'toFile' ? text => setDataUrlInput(text) : undefined}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1 self-start shrink-0">
          {([
            { id: 'toDataUrl', label: 'File → Data URL' },
            { id: 'toFile', label: 'Data URL → File' },
          ] as { id: Mode; label: string }[]).map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={[
                'px-4 py-1.5 text-xs font-medium rounded-lg transition-all',
                mode === m.id
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300',
              ].join(' ')}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'toDataUrl' ? (
          <div className="flex flex-col gap-4 flex-1 min-h-0">
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={[
                'shrink-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed cursor-pointer transition-all p-6',
                isDragging
                  ? 'border-blue-500/50 bg-blue-500/5'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
              ].join(' ')}
              style={{ minHeight: '140px' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                {isDragging
                  ? <Upload className="w-4 h-4 text-blue-400" />
                  : <FileUp className="w-4 h-4 text-neutral-700" />}
              </div>
              <p className="text-xs text-neutral-600 text-center">
                {file ? file.name : 'Drop any file here, or click to choose one'}
              </p>
            </div>

            {file && (
              <>
                <div className="shrink-0 flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <span className="font-mono text-sm text-emerald-400">{file.mimeType}</span>
                  <span className="text-xs text-neutral-500">{formatBytes(file.size)}</span>
                </div>

                <Panel label="Data URL Output" className="flex-1 min-h-0">
                  <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
                    {file.dataUrl}
                  </pre>
                </Panel>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <Panel label="Data URL Input">
              <textarea
                value={dataUrlInput}
                onChange={e => setDataUrlInput(e.target.value)}
                placeholder="Paste a data:... URL to decode…"
                spellCheck={false}
                className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed break-all"
              />
            </Panel>

            <div className="flex flex-col gap-4 min-h-0">
              {parseError && (
                <Panel label="Result" className="flex-1">
                  <p className="px-4 py-3 text-sm text-red-400">Not a valid data URL.</p>
                </Panel>
              )}

              {parsed && (
                <>
                  <div className="shrink-0 flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <span className="font-mono text-sm text-emerald-400">{parsed.mimeType}</span>
                    <span className="text-xs text-neutral-500">{formatBytes(decodedSize)}</span>
                  </div>

                  <Panel label="Preview" className="flex-1 min-h-0">
                    <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-4">
                      {isImagePreview ? (
                        <img src={dataUrlInput.trim()} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
                      ) : (
                        <p className="text-xs text-neutral-600 text-center">No preview available for {parsed.mimeType}.</p>
                      )}
                    </div>
                  </Panel>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </>
              )}

              {!parsed && !parseError && (
                <Panel label="Result" className="flex-1">
                  <p className="px-4 py-3 text-sm text-neutral-600">Paste a data URL to decode it.</p>
                </Panel>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
