'use client';
import { useRef, useState } from 'react';
import { sellerDemo } from '@/data/sellerDemo';
import { useDeal } from '@/lib/dealStore';
import { Card, EyebrowLabel } from '@/components/dashboard/ui';

// Local, pre-upload UI states (no file yet / file staged) live only in this
// component. Once an upload attempt actually starts, we mirror progress into
// the shared deal store so /dashboard can reflect the same simulated states.
type ZoneState = 'empty' | 'dragging' | 'wrong_type' | 'added' | 'uploading' | 'upload_failed' | 'received';

export function Step2UploadDocuments({ onSubmitted }: { onSubmitted: () => void }) {
  const { startUpload, markUploadFailed, markReceived } = useDeal();
  const [state, setState] = useState<ZoneState>('empty');
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAccepted = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    return sellerDemo.acceptedFormats.includes(ext);
  };

  const handleFile = (f: File) => {
    if (!isAccepted(f.name)) {
      setState('wrong_type');
      return;
    }
    setFile({ name: f.name, size: formatSize(f.size) });
    setState('added');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => (prev === 'dragging' ? 'empty' : prev));
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const removeFile = () => {
    setFile(null);
    setState('empty');
  };

  const submit = () => {
    if (!file) return;
    setState('uploading');
    setProgress(0);
    startUpload();
    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 14, 100));
    }, 130);

    setTimeout(() => {
      clearInterval(interval);
      // First submit attempt simulates a failed upload (network blip) so the
      // retry state is demonstrable — this is a frontend-only simulation.
      if (nextAttempt === 1) {
        setState('upload_failed');
        markUploadFailed();
      } else {
        setProgress(100);
        markReceived();
        setState('received');
        setTimeout(onSubmitted, 700);
      }
    }, 1150);
  };

  return (
    <div>
      <EyebrowLabel>SELLER</EyebrowLabel>
      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)', marginBottom: 12 }}>
        Upload your commercial invoice.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
        Accepted formats: PDF, PNG, JPG. Blockmediary checks the invoice against the deal terms.
      </p>

      <Card>
        {state === 'added' || state === 'uploading' || state === 'upload_failed' || state === 'received' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderRadius: 8, background: 'var(--bg-mid)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <FileIcon />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file?.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{file?.size}</div>
                </div>
              </div>
              {state === 'added' && (
                <button onClick={removeFile} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }} aria-label="Remove file">
                  ✕
                </button>
              )}
              {state === 'received' && (
                <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, whiteSpace: 'nowrap' }}>Received ✓</span>
              )}
            </div>

            {state === 'uploading' && (
              <div style={{ marginTop: 14 }}>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-mid)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', transition: 'width 0.13s linear' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Uploading… (simulated)</div>
              </div>
            )}

            {state === 'upload_failed' && (
              <div style={{ marginTop: 14, fontSize: 13, color: 'var(--error)' }}>
                Upload failed — retry
              </div>
            )}

            {state === 'received' && (
              <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-secondary)' }}>
                Document received. Starting the check…
              </div>
            )}
          </div>
        ) : (
          <div
            onDragOver={e => { e.preventDefault(); setState('dragging'); }}
            onDragLeave={() => setState('empty')}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `1.5px dashed ${state === 'dragging' ? 'var(--accent)' : 'var(--border)'}`,
              background: state === 'dragging' ? 'var(--accent-dim)' : 'transparent',
              borderRadius: 8,
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <UploadIcon active={state === 'dragging'} />
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
              Drop file or click to browse
            </div>
            {state === 'wrong_type' && (
              <div style={{ fontSize: 13, color: 'var(--error)', marginTop: 12 }}>Unsupported file type</div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = '';
              }}
            />
          </div>
        )}

        <button
          onClick={submit}
          disabled={state !== 'added' && state !== 'upload_failed'}
          style={{
            width: '100%',
            marginTop: 20,
            padding: '14px 20px',
            borderRadius: 8,
            border: 'none',
            fontSize: 15,
            fontWeight: 600,
            cursor: state === 'added' || state === 'upload_failed' ? 'pointer' : 'not-allowed',
            background: state === 'added' || state === 'upload_failed' ? 'var(--accent)' : 'var(--bg-mid)',
            color: state === 'added' || state === 'upload_failed' ? '#0A0A0B' : 'var(--text-muted)',
            opacity: state === 'uploading' || state === 'received' ? 0.7 : 1,
          }}
        >
          {state === 'upload_failed' ? 'Retry' : state === 'received' ? 'Received' : 'Submit for document check'}
        </button>
      </Card>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
        Demo only — this upload and document check are simulated in the browser. No file leaves your device and no real AI verification runs.
      </p>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function UploadIcon({ active }: { active: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.6">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
