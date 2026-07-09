'use client';
import { useEffect, useRef } from 'react';

const steps = [
  { number: '01', title: 'Agree terms upfront', body: 'Buyer and seller agree the deal and required documents.' },
  { number: '02', title: 'Buyer locks payment', body: 'The buyer locks the agreed amount before shipment.' },
  { number: '03', title: 'Seller uploads documents', body: 'The seller uploads the invoice and trade documents.' },
  { number: '04', title: 'Funds release when documents match', body: 'If the documents match the deal terms, payment is released.' },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        if (lineRef.current) {
          gsap.fromTo(lineRef.current,
            { scaleX: 0 },
            {
              scaleX: 1, duration: 0.9, ease: 'power2.out', transformOrigin: 'left center',
              scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
            }
          );
        }

        stepRefs.current.forEach((step, i) => {
          if (!step) return;
          gsap.fromTo(step,
            { opacity: 0, y: 24 },
            {
              opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
              scrollTrigger: { trigger: step, start: 'top 85%' },
              delay: i * 0.1,
            }
          );
        });
      });
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: 'var(--bg-deep)',
        padding: 'clamp(64px, 12vw, 128px) 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p className="section-label" style={{ marginBottom: 16, textAlign: 'center' }}>
          HOW IT WORKS
        </p>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 48,
            marginTop: 64,
          }}
          className="how-it-works-grid"
        >
          {/* connector line — desktop only, spans between step numbers */}
          <div
            ref={lineRef}
            style={{
              position: 'absolute',
              top: 20,
              left: '6%',
              right: '6%',
              height: 1,
              background: 'var(--border, #27272A)',
              transform: 'scaleX(0)',
              display: 'none',
            }}
            className="how-it-works-line"
          />

          {steps.map((step, i) => (
            <div
              key={i}
              ref={el => { stepRefs.current[i] = el; }}
              style={{ opacity: 0, flex: '1 1 0', textAlign: 'left', position: 'relative' }}
            >
              <div style={{
                fontFamily: 'monospace',
                fontSize: 15,
                color: 'var(--accent)',
                fontWeight: 600,
                marginBottom: 20,
              }}>
                {step.number}
              </div>
              <h3 style={{
                fontSize: 19,
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 10,
                letterSpacing: '-0.01em',
              }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 280 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .how-it-works-grid {
            flex-direction: row !important;
            gap: 32px !important;
          }
          .how-it-works-line {
            display: block !important;
          }
        }
      `}</style>
    </section>
  );
}
