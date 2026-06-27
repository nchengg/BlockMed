'use client';
import { useEffect, useRef } from 'react';

export default function RevealSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<SVGSVGElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        gsap.fromTo(lockRef.current,
          { scale: 0.5, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.4)',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
          }
        );

        gsap.fromTo(linesRef.current,
          { opacity: 0 },
          {
            opacity: 1, duration: 0.6, delay: 0.4,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
          }
        );

        gsap.fromTo(textRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.7, delay: 0.3, ease: 'power2.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
          }
        );
      });
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, var(--ocean-dark) 0%, var(--bg-deep) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
      }}
    >
      {/* Graphic: buyer — lock — seller */}
      <div
        ref={linesRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          marginBottom: 64,
          opacity: 0,
        }}
      >
        {/* Buyer */}
        <div style={{ textAlign: 'center', width: 120 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '1.5px solid var(--accent-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 10px',
            color: 'var(--accent-blue)', fontSize: 20,
          }}>💼</div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>BUYER</span>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Locks funds</p>
        </div>

        {/* Line */}
        <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, var(--accent-blue), transparent)' }} />

        {/* Lock icon */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            inset: -20,
            borderRadius: '50%',
            background: 'var(--accent-glow)',
            filter: 'blur(16px)',
          }} />
          <svg
            ref={lockRef}
            width="80"
            height="80"
            viewBox="0 0 80 80"
            style={{ position: 'relative', opacity: 0 }}
          >
            <circle cx="40" cy="40" r="38" fill="none" stroke="var(--accent-blue)" strokeWidth="1.5" />
            {/* Lock body */}
            <rect x="24" y="38" width="32" height="22" rx="4" fill="none" stroke="var(--accent-blue)" strokeWidth="1.8" />
            {/* Lock shackle */}
            <path d="M28 38 V30 C28 21 52 21 52 30 V38" fill="none" stroke="var(--accent-blue)" strokeWidth="1.8" strokeLinecap="round" />
            {/* Keyhole */}
            <circle cx="40" cy="48" r="3" fill="var(--accent-blue)" />
            <rect x="38.5" y="50" width="3" height="5" rx="1" fill="var(--accent-blue)" />
          </svg>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--accent-blue)', letterSpacing: '0.1em' }}>BLOCKMEDIARY</span>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Verifies</p>
          </div>
        </div>

        {/* Line */}
        <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, var(--accent-blue))' }} />

        {/* Seller */}
        <div style={{ textAlign: 'center', width: 120 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '1.5px solid var(--accent-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 10px',
            color: 'var(--accent-blue)', fontSize: 20,
          }}>🚢</div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>SELLER</span>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Ships + submits docs</p>
        </div>
      </div>

      {/* Text */}
      <div ref={textRef} style={{ opacity: 0 }}>
        <p className="section-label" style={{ marginBottom: 20 }}>INTRODUCING BLOCKMEDIARY</p>
        <h2 className="scene-headline" style={{ maxWidth: 700, margin: '0 auto' }}>
          Not anymore.
        </h2>
        <p className="scene-subline" style={{ margin: '24px auto 0' }}>
          The same payment protection as a Letter of Credit — without the bank, the fees, or the paperwork.
        </p>
      </div>
    </section>
  );
}
