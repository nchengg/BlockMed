'use client';
// Sign in / create account for Dan's surface.
//
// Signup asks for the company identity a trade-finance product actually needs —
// legal name, registration number, registered address, contact. These are the
// fields KYB screening (FR-7) requires before funding in the full product, so
// the form is not throwaway.
//
// Wallets are deliberately absent: the model is account-first, wallet-second.
// A platform or intermediary may never hold one.
import { useState } from 'react';
import { useSession } from '@/lib/auth/useSession';
import { validateSignup, hasErrors, type SignupInput, type FieldErrors } from '@/lib/auth/validate';

export function AuthForms() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
        {mode === 'signin' ? 'Sign in' : 'Create your company account'}
      </h1>
      <p style={{ margin: '10px 0 24px', fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        {mode === 'signin'
          ? 'Deals are addressed between companies — sign in to see the ones you are party to.'
          : 'Your company details are used to identify you to counterparties, and are what compliance screening needs before funds move.'}
      </p>

      {mode === 'signin' ? <SignInForm /> : <SignUpForm />}

      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
        {mode === 'signin' ? "Don't have an account? " : 'Already registered? '}
        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          style={{
            background: 'none', border: 'none', padding: 0, font: 'inherit',
            color: 'var(--accent)', fontWeight: 600, cursor: 'pointer',
          }}
        >
          {mode === 'signin' ? 'Create one' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}

function SignInForm() {
  const { login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await login(email, password);
    if (!r.ok) setError(r.error ?? 'Could not sign in.');
    setBusy(false);
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 380 }}>
      {error && <ErrorBanner>{error}</ErrorBanner>}
      <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
      <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
      <Submit busy={busy}>Sign in</Submit>
    </form>
  );
}

const EMPTY: SignupInput = {
  email: '', password: '', companyName: '', registrationNumber: '', country: '',
  addressLine1: '', addressLine2: '', city: '', postcode: '', contactName: '',
};

function SignUpForm() {
  const { signup } = useSession();
  const [f, setF] = useState<SignupInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  const set = (k: keyof SignupInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate client-side for immediate feedback; the server validates again
    // with the same rules, since this check is trivially bypassed.
    const local = validateSignup(f);
    if (hasErrors(local)) { setErrors(local); return; }

    setBusy(true);
    setErrors({});
    const r = await signup(f);
    if (!r.ok) setErrors(r.errors ?? {});
    setBusy(false);
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <fieldset style={FIELDSET}>
        <legend style={LEGEND}>SIGN-IN DETAILS</legend>
        <div style={GRID}>
          <Field label="Email" type="email" value={f.email} onChange={set('email')} error={errors.email} autoComplete="email" />
          <Field
            label="Password" type="password" value={f.password} onChange={set('password')}
            error={errors.password} autoComplete="new-password" hint="At least 10 characters, including a number."
          />
        </div>
      </fieldset>

      <fieldset style={FIELDSET}>
        <legend style={LEGEND}>COMPANY</legend>
        <div style={GRID}>
          <Field label="Legal name" value={f.companyName} onChange={set('companyName')} error={errors.companyName} placeholder="Solaris Textiles Co." />
          <Field label="Registration number (optional)" value={f.registrationNumber ?? ''} onChange={set('registrationNumber')} />
          <Field label="Contact name" value={f.contactName} onChange={set('contactName')} error={errors.contactName} />
          <Field label="Country" value={f.country} onChange={set('country')} error={errors.country} />
        </div>
      </fieldset>

      <fieldset style={FIELDSET}>
        <legend style={LEGEND}>REGISTERED ADDRESS</legend>
        <div style={GRID}>
          <Field label="Address line 1" value={f.addressLine1} onChange={set('addressLine1')} error={errors.addressLine1} />
          <Field label="Address line 2 (optional)" value={f.addressLine2 ?? ''} onChange={set('addressLine2')} />
          <Field label="City" value={f.city} onChange={set('city')} error={errors.city} />
          <Field label="Postcode" value={f.postcode} onChange={set('postcode')} error={errors.postcode} />
        </div>
      </fieldset>

      <Submit busy={busy}>Create account</Submit>
    </form>
  );
}

/* ── presentation ── */

const FIELDSET: React.CSSProperties = {
  border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px 18px', margin: 0,
};
const LEGEND: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--accent)', padding: '0 6px',
};
const GRID: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14,
};

function Field({ label, error, hint, ...rest }: {
  label: string; error?: string; hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{label}</span>
      <input
        {...rest}
        style={{
          width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: 13, boxSizing: 'border-box',
          background: 'var(--bg-deep)', color: 'var(--text-primary)',
          border: `1px solid ${error ? '#f87171' : 'var(--border)'}`,
        }}
      />
      {error
        ? <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: '#f87171' }}>{error}</span>
        : hint
          ? <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>{hint}</span>
          : null}
    </label>
  );
}

function Submit({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit" disabled={busy}
      style={{
        alignSelf: 'flex-start', padding: '11px 22px', borderRadius: 6, fontSize: 14, fontWeight: 600,
        background: 'var(--accent)', color: '#0A0A0B', border: 'none',
        cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
      }}
    >{busy ? 'Working…' : children}</button>
  );
}

function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 13, padding: '10px 14px', borderRadius: 6,
      color: '#f87171', border: '1px solid #f87171', background: 'var(--bg-surface)',
    }}>{children}</div>
  );
}
