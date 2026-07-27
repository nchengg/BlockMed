'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function RoleChoiceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        gsap.fromTo(innerRef.current,
          { opacity: 0, y: 32 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
          }
        );
      });
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: 'var(--bg-mid)',
        padding: 'clamp(64px, 12vw, 128px) 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div ref={innerRef} style={{ opacity: 0, maxWidth: 720, width: '100%', textAlign: 'center' }}>
        <h2 style={{
          fontSize: 'clamp(34px, 5.5vw, 56px)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          marginBottom: 48,
        }}>
          Start as a buyer or seller.
        </h2>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/login?email=buyer@meridian.demo"
            style={{
              flex: '1 1 260px',
              maxWidth: 320,
              padding: '28px 32px',
              borderRadius: 8,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border, #27272A)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              textAlign: 'left',
              transition: 'border-color 0.2s',
              display: 'block',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, #27272A)'; }}
          >
            <span style={{ fontSize: 17, fontWeight: 600 }}>Continue as Buyer</span>
            <span style={{ display: 'block', marginTop: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
              Lock funds and start a deal.
            </span>
          </Link>

          <Link
            href="/login?email=seller@solaris.demo"
            style={{
              flex: '1 1 260px',
              maxWidth: 320,
              padding: '28px 32px',
              borderRadius: 8,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border, #27272A)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              textAlign: 'left',
              transition: 'border-color 0.2s',
              display: 'block',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, #27272A)'; }}
          >
            <span style={{ fontSize: 17, fontWeight: 600 }}>Continue as Seller</span>
            <span style={{ display: 'block', marginTop: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
              Upload documents and get paid.
            </span>
          </Link>
        </div>

        <p style={{ marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
          Admin, developer or platform?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
          {' '}·{' '}
          <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Create an account
          </Link>
        </p>

        {/* Second entry point — Dan's Dashboard: a parallel surface that rebuilds the
            deal journey in product order (create a deal first). Separate from the
            main dashboard above; same escrow backend underneath. */}
        <div
          style={{
            marginTop: 56,
            paddingTop: 40,
            borderTop: '1px solid var(--border, #27272A)',
          }}
        >
          <h3
            style={{
              fontSize: 'clamp(20px, 2.6vw, 26px)',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}
          >
            Dan&apos;s Dashboard
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
            A separate workspace. Start with an empty dashboard.
          </p>

          <Link
            href="/dan"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'var(--accent)';
              el.style.color = '#0A0A0B';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'transparent';
              el.style.color = 'var(--accent)';
            }}
          >
            Log in to Dan&apos;s Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
