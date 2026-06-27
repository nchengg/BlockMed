export default function Footer() {
  return (
    <footer style={{
      background: '#020810',
      borderTop: '1px solid rgba(45,125,210,0.1)',
      padding: '32px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 16,
    }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Blockmediary</span>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>© 2026 Blockmediary. Built on Base.</span>
      <div style={{ display: 'flex', gap: 24 }}>
        {['Privacy', 'Terms', 'GitHub'].map(link => (
          <a key={link} href="#" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
}
