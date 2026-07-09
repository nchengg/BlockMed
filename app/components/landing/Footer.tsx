export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-mid)',
      borderTop: '1px solid var(--border)',
      padding: '32px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 16,
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>© 2026 Blockmediary.</span>
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
