'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

const PLATE_A = '/landing/landing-plate-a-global-trade.png';
const PLATE_B = '/landing/landing-plate-b-sme-boat.png';
const PLATE_C = '/landing/landing-plate-c-operator-documents.png';

type Beat = {
  copy: string[];
  accent?: boolean;
};

const beats: Beat[] = [
  { copy: ['Global trade is beautiful.'] },
  { copy: ['But not for SMEs.'] },
  { copy: ['They ship first and hope payment arrives.'] },
  { copy: ['Letters of credit solve this problem.'] },
  { copy: ['But SMEs are locked out.'] },
  { copy: ['Blockmediary.', 'Global trade for SMEs.'], accent: true },
];

export default function ScrollStorySection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const plateARef = useRef<HTMLDivElement>(null);
  const plateBRef = useRef<HTMLDivElement>(null);
  const plateCRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const [jsReady, setJsReady] = useState(false);

  useEffect(() => {
    // Standard "has mounted on the client" flag, used only to avoid a blank
    // flash before the plate images attach — can't know this during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJsReady(true);
    if (reducedMotion) return;

    let ctx: { revert: () => void } | null = null;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: trackRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.2,
            },
          });

          // Plate A holds, then crossfades into Plate B (~ across beats 2-3)
          gsap.set(plateARef.current, { opacity: 1, scale: 1 });
          gsap.set(plateBRef.current, { opacity: 0, scale: 1.06 });
          gsap.set(plateCRef.current, { opacity: 0, scale: 1.06 });

          tl.to(plateARef.current, { opacity: 0, scale: 0.96, duration: 1.2, ease: 'power2.out' }, 1.4);
          tl.to(plateBRef.current, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 1.4);

          tl.to(plateBRef.current, { opacity: 0, scale: 0.96, duration: 1.2, ease: 'power2.out' }, 3.4);
          tl.to(plateCRef.current, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 3.4);

          // gentle continuous pan/zoom while each plate is dominant
          tl.to(plateARef.current, { scale: 1.04, duration: 1.4, ease: 'none' }, 0);
          tl.to(plateBRef.current, { scale: 1.1, duration: 2.0, ease: 'none' }, 1.4);
          tl.to(plateCRef.current, { scale: 1.08, duration: 2.6, ease: 'none' }, 3.4);

          // darken for final brand reveal
          tl.to(scrimRef.current, { opacity: 0.55, duration: 0.8, ease: 'power2.out' }, 5.2);

          // text beats — each fades in, holds, fades out
          const beatWindows: [number, number][] = [
            [0.2, 1.3],
            [1.4, 2.1],
            [2.2, 3.3],
            [3.4, 4.1],
            [4.2, 5.1],
            [5.3, 6.0],
          ];

          beatWindows.forEach(([inAt, outAt], i) => {
            const el = beatRefs.current[i];
            if (!el) return;
            tl.fromTo(el,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
              inAt
            );
            tl.to(el, { opacity: 0, y: -14, duration: 0.4, ease: 'power2.out' }, outAt);
          });
        }, trackRef);
      });
    });

    return () => { ctx?.revert(); };
  }, [reducedMotion]);

  // Reduced-motion / no-JS fallback: stack beats as static scroll sections over Plate A
  if (reducedMotion) {
    return (
      <div>
        {beats.map((beat, i) => (
          <section
            key={i}
            style={{
              minHeight: '70vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '64px 24px',
              background: `linear-gradient(180deg, rgba(10,10,11,0.55), rgba(10,10,11,0.85)), url(${i < 2 ? PLATE_A : i < 5 ? PLATE_B : PLATE_C}) center/cover no-repeat`,
            }}
          >
            <div>
              {beat.copy.map((line, li) => (
                <h2
                  key={li}
                  style={{
                    fontSize: beat.accent ? 'clamp(40px, 7vw, 84px)' : 'clamp(28px, 4.5vw, 52px)',
                    fontWeight: beat.accent ? 800 : 700,
                    color: beat.accent ? 'var(--accent)' : '#FAFAFA',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                  }}
                >
                  {line}
                </h2>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div ref={trackRef} style={{ height: '600vh' }}>
      <section
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          background: '#000',
        }}
      >
        {/* ── Image plates ── */}
        <div ref={plateARef} style={plateStyle(PLATE_A)} />
        <div ref={plateBRef} style={plateStyle(PLATE_B)} />
        <div ref={plateCRef} style={plateStyle(PLATE_C)} />

        {/* fallback static image if JS hasn't attached yet, avoids blank flash */}
        {!jsReady && (
          <div style={plateStyle(PLATE_A)} />
        )}

        {/* ── Scrim for contrast + final brand reveal darken ── */}
        <div
          ref={scrimRef}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.55) 100%)',
            opacity: 1,
            pointerEvents: 'none',
          }}
        />

        {/* ── Wordmark ── */}
        <div style={{
          position: 'absolute',
          top: 32,
          left: 40,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: 'rgba(250,250,250,0.75)',
          zIndex: 10,
        }}>
          Blockmediary
        </div>

        {/* ── Story text beats ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
          pointerEvents: 'none',
        }}>
          {beats.map((beat, i) => (
            <div
              key={i}
              ref={el => { beatRefs.current[i] = el; }}
              style={{ position: 'absolute', textAlign: 'center', opacity: 0, padding: '0 24px' }}
            >
              {beat.copy.map((line, li) => (
                <h2
                  key={li}
                  style={{
                    fontSize: beat.accent ? 'clamp(44px, 8vw, 96px)' : 'clamp(30px, 5vw, 60px)',
                    fontWeight: beat.accent ? 800 : 700,
                    lineHeight: beat.accent ? 1.0 : 1.15,
                    letterSpacing: '-0.02em',
                    color: beat.accent ? 'var(--accent)' : '#fff',
                    maxWidth: 760,
                    margin: '0 auto',
                  }}
                >
                  {line}
                </h2>
              ))}
            </div>
          ))}
        </div>

        {/* ── Scroll indicator ── */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: 0.5,
        }}>
          <span style={{ fontSize: 10, letterSpacing: '0.2em', color: '#fff' }}>SCROLL</span>
          <div style={{ width: 1, height: 36, background: 'linear-gradient(180deg,#fff,transparent)' }} />
        </div>
      </section>
    </div>
  );
}

function plateStyle(url: string): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transformOrigin: 'center center',
    willChange: 'opacity, transform',
  };
}
