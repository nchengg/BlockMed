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
      </div>
    </section>
  );
}
