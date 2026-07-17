const steps = [
  'Connect wallet',
  'Enter deal amount',
  'Review release terms',
  'Approve & deposit',
  'Confirmation',
];

export function Stepper({ step }: { step: number }) {
  return (
    <>
      {/* Desktop — vertical stepper */}
      <aside
        className="buyer-stepper-vertical"
        style={{
          width: 220,
          flexShrink: 0,
          padding: '48px 24px',
          display: 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((label, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div key={label} style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      background: done ? 'var(--success)' : active ? 'var(--accent)' : 'transparent',
                      border: `2px solid ${done ? 'var(--success)' : active ? 'var(--accent)' : 'var(--border)'}`,
                      color: done || active ? '#0A0A0B' : 'var(--text-muted)',
                    }}
                  >
                    {done ? '✓' : n}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ width: 1, flex: 1, minHeight: 32, background: done ? 'var(--success)' : 'var(--border)' }} />
                  )}
                </div>
                <div style={{ paddingBottom: 32 }}>
                  <span style={{ fontSize: 14, color: active ? 'var(--text-primary)' : done ? 'var(--text-secondary)' : 'var(--text-muted)', fontWeight: active ? 600 : 400 }}>
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Mobile — horizontal progress bar */}
      <div
        className="buyer-stepper-horizontal"
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i + 1 <= step ? 'var(--accent)' : 'var(--border)',
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{steps[step - 1]}</span>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .buyer-stepper-vertical { display: block !important; }
          .buyer-stepper-horizontal { display: none !important; }
        }
      `}</style>
    </>
  );
}
