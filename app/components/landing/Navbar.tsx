'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        background: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(45,125,210,0.1)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-8px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        pointerEvents: visible ? 'all' : 'none',
      }}
    >
      <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        Blockmediary
      </span>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link
          href="/buyer"
          style={{
            fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)',
            textDecoration: 'none', padding: '8px 16px',
            transition: 'color 0.2s',
          }}
        >
          I&apos;m a Buyer
        </Link>
        <Link
          href="/seller"
          style={{
            fontSize: 14, fontWeight: 600, color: 'white',
            textDecoration: 'none', padding: '8px 20px',
            background: 'var(--accent-blue)',
            borderRadius: 9999,
            transition: 'opacity 0.2s',
          }}
        >
          I&apos;m a Seller
        </Link>
      </div>
    </nav>
  );
}
