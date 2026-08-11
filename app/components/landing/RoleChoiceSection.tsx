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
        gsap.fromTo(
          innerRef.current,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
          },
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
        <h2
          style={{
            fontSize: 'clamp(34px, 5.5vw, 56px)',
            fontWeight: 700,
            letterSpacing: 0,
            color: 'var(--text-primary)',
            marginBottom: 16,
          }}
        >
          Open your trade workspace.
        </h2>

        <p
          style={{
            maxWidth: 560,
            margin: '0 auto 28px',
            fontSize: 16,
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
          }}
        >
          One dashboard for every company. Create deals, review documents, track funding,
          and manage release from the same place.
        </p>

        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 52,
            padding: '0 28px',
            borderRadius: 8,
            background: 'var(--accent)',
            color: '#0A0A0B',
            textDecoration: 'none',
            fontSize: 15,
            fontWeight: 750,
          }}
        >
          Open dashboard
        </Link>
      </div>
    </section>
  );
}
