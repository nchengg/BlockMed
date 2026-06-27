'use client';
import { useEffect, useRef } from 'react';

const steps = [
  {
    number: '01',
    icon: '🔒',
    title: 'Buyer locks funds',
    body: 'The buyer deposits USDC into a smart contract escrow. The seller sees the funds are locked before shipping a single item.',
  },
  {
    number: '02',
    icon: '📦',
    title: 'Seller ships & submits docs',
    body: 'Once the goods are shipped, the seller uploads the trade documents — starting with a commercial invoice.',
  },
  {
    number: '03',
    icon: '✅',
    title: 'AI verifies. Funds release.',
    body: "Blockmediary's AI checks the documents against the agreed terms. On compliance, funds release to the seller automatically.",
  },
];

export default function HowItWorksSection() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        cardsRef.current.forEach((card, i) => {
          if (!card) return;
          gsap.fromTo(card,
            { opacity: 0, y: 40 },
            {
              opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
              scrollTrigger: { trigger: card, start: 'top 80%' },
              delay: i * 0.12,
            }
          );
        });
      });
    });
  }, []);

  return (
    <section style={{
      background: 'var(--bg-surface)',
      padding: '120px 24px',
      textAlign: 'center',
    }}>
      <p className="section-label" style={{ marginBottom: 16 }}>HOW IT WORKS</p>
      <h2 style={{
        fontSize: 'clamp(28px, 4vw, 48px)',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: 64,
      }}>
        Three steps. No banks. No waiting.
      </h2>

      <div style={{
        display: 'flex',
        gap: 24,
        justifyContent: 'center',
        flexWrap: 'wrap',
        maxWidth: 1000,
        margin: '0 auto',
      }}>
        {steps.map((step, i) => (
          <div
            key={i}
            ref={el => { cardsRef.current[i] = el; }}
            style={{
              flex: '1 1 280px',
              maxWidth: 300,
              background: 'var(--bg-mid)',
              border: '1px solid rgba(45,125,210,0.15)',
              borderRadius: 16,
              padding: '36px 28px',
              textAlign: 'left',
              opacity: 0,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <span style={{ fontSize: 32 }}>{step.icon}</span>
              <span style={{ fontSize: 13, color: 'var(--accent-blue)', fontWeight: 600, letterSpacing: '0.05em' }}>
                {step.number}
              </span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
              {step.title}
            </h3>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
