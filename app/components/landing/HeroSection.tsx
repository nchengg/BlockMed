'use client';
import { useEffect, useRef } from 'react';

// Unsplash: Venti Views — aerial container ship cutting through teal ocean (id: FPKnAO-CF6M)
const BIG_SHIP_URL =
  'https://images.unsplash.com/photo-1585713181935-d5f622cc2415?auto=format&fit=crop&w=2000&q=85';

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=140%',
            scrub: 1.4,
            pin: true,
          },
        });

        // Photo slowly zooms in and drifts — cinematic parallax
        tl.fromTo(
          photoRef.current,
          { scale: 1.08, y: 0 },
          { scale: 1.22, y: -60, ease: 'none' },
          0
        );

        // Text fades in then out as you scroll past
        tl.fromTo(
          textRef.current,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, ease: 'power2.out', duration: 0.35 },
          0.05
        );
        tl.to(
          textRef.current,
          { opacity: 0, y: -20, ease: 'power2.in', duration: 0.3 },
          0.7
        );
      });
    });

    return () => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger: ST }) => {
        ST.getAll().forEach(t => t.kill());
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: '#020810',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Full-bleed photo with parallax */}
      <div
        ref={photoRef}
        style={{
          position: 'absolute',
          inset: 0,
          willChange: 'transform',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BIG_SHIP_URL}
          alt="Large container ship cutting through deep teal ocean — aerial view"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
          }}
        />
        {/* Dark overlay so text reads cleanly */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(2,8,16,0.55) 0%, rgba(2,8,16,0.25) 50%, rgba(2,8,16,0.7) 100%)',
          }}
        />
      </div>

      {/* Text overlay */}
      <div
        ref={textRef}
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          opacity: 0,
          width: '90%',
          maxWidth: 720,
          marginTop: '-8vh',
        }}
      >
        <p className="section-label" style={{ marginBottom: 20 }}>TRADE FINANCE TODAY</p>
        <h1 className="scene-headline">
          Letters of Credit were<br />built for them.
        </h1>
        <p className="scene-subline" style={{ margin: '24px auto 0' }}>
          The system that moves $2 trillion in global trade was designed for corporations — not for you.
        </p>
      </div>

      {/* Scroll hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: 0.45,
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-secondary)' }}>
          SCROLL
        </span>
        <div
          style={{
            width: 1,
            height: 40,
            background: 'linear-gradient(180deg, var(--text-secondary), transparent)',
          }}
        />
      </div>
    </section>
  );
}
