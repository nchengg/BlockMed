'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

// Unsplash photos for background cameos
const FORTUNE500_URL =
  'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=800&q=75';
const SMALL_BOAT_URL =
  'https://images.unsplash.com/photo-1542809665-21a8657b97f3?auto=format&fit=crop&w=600&q=75';

export default function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
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
        background: 'linear-gradient(180deg, var(--bg-deep) 0%, #020810 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ships side by side in background — equals now */}
      <div style={{
        position: 'absolute',
        bottom: '8%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 32,
        opacity: 0.07,
        pointerEvents: 'none',
        width: '80vw',
        maxWidth: 700,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FORTUNE500_URL} alt="" style={{ flex: '1 1 55%', width: '55%', height: 'auto', borderRadius: 6, objectFit: 'cover' }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SMALL_BOAT_URL} alt="" style={{ flex: '1 1 40%', width: '40%', height: 'auto', borderRadius: 6, objectFit: 'cover' }} />
      </div>

      {/* Stars */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            borderRadius: '50%',
            background: 'white',
            opacity: Math.random() * 0.5 + 0.05,
            top: `${Math.random() * 70}%`,
            left: `${Math.random() * 100}%`,
          }} />
        ))}
      </div>

      <div ref={contentRef} style={{ position: 'relative', zIndex: 1, opacity: 0 }}>
        <p className="section-label" style={{ marginBottom: 20 }}>GET STARTED</p>
        <h2 className="scene-headline" style={{ maxWidth: 700, margin: '0 auto' }}>
          Trade finance, finally<br />built for the small guy.
        </h2>
        <p className="scene-subline" style={{ margin: '24px auto 40px' }}>
          Join the buyers and sellers who have moved on from the old system.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/buyer"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              borderRadius: 9999,
              background: 'var(--accent-blue)',
              color: 'white',
              fontSize: 18,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.opacity = '0.88'; (e.target as HTMLElement).style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '1'; (e.target as HTMLElement).style.transform = 'scale(1)'; }}
          >
            I&apos;m a Buyer
          </Link>
          <Link
            href="/seller"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              borderRadius: 9999,
              border: '1.5px solid var(--accent-blue)',
              color: 'var(--text-primary)',
              fontSize: 18,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = 'var(--accent-blue)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}
          >
            I&apos;m a Seller
          </Link>
        </div>
      </div>
    </section>
  );
}
