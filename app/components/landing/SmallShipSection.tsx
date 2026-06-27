'use client';
import { useEffect, useRef } from 'react';

// Unsplash: Ian Taylor — large container ship side view (id: jOqJbvo1P9g)
const FORTUNE500_URL =
  'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=1200&q=85';
// Unsplash: Guilherme Stecanella — lone fishing boat on open ocean (id: Qyf06F2Paog)
const SMALL_BOAT_URL =
  'https://images.unsplash.com/photo-1542809665-21a8657b97f3?auto=format&fit=crop&w=900&q=85';

export default function SmallShipSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bigShipRef = useRef<HTMLDivElement>(null);
  const smallShipRef = useRef<HTMLDivElement>(null);
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

        // Big ship: starts dominant in frame, shrinks + drifts to top-left
        tl.fromTo(
          bigShipRef.current,
          { scale: 1, x: '0%', y: '0%', opacity: 0.95 },
          { scale: 0.28, x: '-62vw', y: '-30vh', opacity: 0.7, ease: 'power2.inOut' },
          0
        );

        // Small boat: rises from below into centre
        tl.fromTo(
          smallShipRef.current,
          { y: '80px', opacity: 0, scale: 0.9 },
          { y: '0px', opacity: 1, scale: 1, ease: 'power2.out', duration: 0.5 },
          0.2
        );

        // Text fades in
        tl.fromTo(
          textRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, ease: 'power2.out', duration: 0.4 },
          0.45
        );
      });
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #020810 0%, #051020 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Big ship — starts full-frame, then shrinks to corner as you scroll */}
      <div
        ref={bigShipRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(680px, 80vw)',
          willChange: 'transform',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FORTUNE500_URL}
          alt="Large container ship — Fortune 500"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: 8,
            display: 'block',
            boxShadow: '0 8px 60px rgba(0,0,0,0.6)',
          }}
        />
        <span
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: 10,
            fontSize: 11,
            color: 'rgba(136,153,187,0.7)',
            letterSpacing: '0.15em',
          }}
        >
          FORTUNE 500
        </span>
      </div>

      {/* Small boat — rises to centre stage */}
      <div
        ref={smallShipRef}
        style={{
          position: 'absolute',
          bottom: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(420px, 65vw)',
          opacity: 0,
          willChange: 'transform',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SMALL_BOAT_URL}
          alt="Small fishing boat alone on the ocean — You"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: 8,
            display: 'block',
            boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
          }}
        />
        <span
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: 10,
            fontSize: 13,
            color: 'rgba(136,153,187,0.8)',
            letterSpacing: '0.15em',
          }}
        >
          YOU
        </span>
      </div>

      {/* Text overlay */}
      <div
        ref={textRef}
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          opacity: 0,
          width: '90%',
          maxWidth: 680,
          zIndex: 2,
        }}
      >
        <p className="section-label" style={{ marginBottom: 20 }}>THE PROBLEM</p>
        <h2 className="scene-headline">
          You were left to figure<br />it out alone.
        </h2>
        <p className="scene-subline" style={{ margin: '24px auto 0' }}>
          No bank guarantee. No payment protection. Just trust — and hope the buyer pays.
        </p>
      </div>
    </section>
  );
}
