import Link from 'next/link';

export function Header({ step, totalSteps }: { step: number; totalSteps: number }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(10,10,11,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <Link href="/" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', textDecoration: 'none' }}>
        Blockmediary
      </Link>
      <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)' }}>
        Step {step} of {totalSteps}
      </span>
    </header>
  );
}
