'use client';
// Company onboarding (KYB) — the fields a trade escrow legally needs before a
// company can move money.
//
// Sourced from docs/document-templates.md: DOC-15 Certificate of Incorporation,
// DOC-17 UBO/PSC register, DOC-18 signatory passport, DOC-19 source of funds.
//
// PROOF OF CONCEPT. Every field is self-declared and nothing is verified — no
// registry lookup, no sanctions screening, no document upload. The UI says so
// plainly rather than implying otherwise, because a form that looks like
// compliance but isn't is worse than one that admits what it is.
import { useCallback, useEffect, useState } from 'react';
import { CONTROL_CONDITIONS, COMPANY_TYPES } from '@/lib/kyb/psc';

type Person = {
  fullName: string;
  nationality: string;
  birthMonthYear: string;
  countryOfResidence: string;
  controlCondition: string;
  controlDetail: string;
};

const emptyPerson = (): Person => ({
  fullName: '', nationality: '', birthMonthYear: '',
  countryOfResidence: '', controlCondition: 'shares_over_25', controlDetail: '',
});

type Form = Record<string, string | boolean>;

const iso = (v: unknown) => (typeof v === 'string' && v ? v.slice(0, 10) : '');

export function KybForm() {
  const [form, setForm] = useState<Form>({});
  const [people, setPeople] = useState<Person[]>([]);
  const [status, setStatus] = useState<string>('incomplete');
  const [gaps, setGaps] = useState<{ field: string; label: string }[]>([]);
  const [expired, setExpired] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch('/api/kyb', { cache: 'no-store' });
    const j = await r.json();
    if (!j.ok) { setReady(true); return; }
    const a = j.account;
    setForm({
      registrationNumber: a.registrationNumber ?? '',
      companyType: a.companyType ?? '',
      jurisdiction: a.jurisdiction ?? '',
      issuingAuthority: a.issuingAuthority ?? '',
      incorporationDate: iso(a.incorporationDate),
      signatoryName: a.signatoryName ?? '',
      signatoryNationality: a.signatoryNationality ?? '',
      signatoryDob: iso(a.signatoryDob),
      signatoryPassportExpiry: iso(a.signatoryPassportExpiry),
      fundsSourceNature: a.fundsSourceNature ?? '',
      fundsSourceCountry: a.fundsSourceCountry ?? '',
      declaredNotCriminalFunds: !!a.declaredNotCriminalFunds,
      declaredNoSanctions: !!a.declaredNoSanctions,
    });
    setPeople(
      (a.peopleOfControl ?? []).map((p: Record<string, string>) => ({
        fullName: p.fullName ?? '', nationality: p.nationality ?? '',
        birthMonthYear: p.birthMonthYear ?? '', countryOfResidence: p.countryOfResidence ?? '',
        controlCondition: p.controlCondition ?? 'shares_over_25', controlDetail: p.controlDetail ?? '',
      })),
    );
    setStatus(a.kybStatus ?? 'incomplete');
    setGaps(j.gaps ?? []);
    setExpired(!!j.passportExpired);
    setReady(true);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const save = useCallback(async () => {
    setBusy(true); setNote(null);
    try {
      const r = await fetch('/api/kyb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, peopleOfControl: people }),
      });
      const j = await r.json();
      if (!j.ok) { setNote(j.error ?? 'Could not save.'); return; }
      setStatus(j.kybStatus); setGaps(j.gaps ?? []); setExpired(!!j.passportExpired);
      setNote(j.kybStatus === 'attested' ? 'Onboarding complete.' : 'Saved — some details are still missing.');
    } finally { setBusy(false); }
  }, [form, people]);

  if (!ready) return <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading…</p>;

  const label: React.CSSProperties = {
    display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 5,
  };
  const input: React.CSSProperties = {
    width: '100%', padding: '9px 11px', borderRadius: 6, fontSize: 14,
    background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-primary)',
  };
  const grid: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14,
  };
  const card: React.CSSProperties = {
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 10, padding: 20, marginBottom: 16,
  };

  const field = (key: string, text: string, type = 'text') => (
    <div>
      <label style={label} htmlFor={key}>{text}</label>
      <input
        id={key} type={type} style={input} value={String(form[key] ?? '')}
        onChange={e => set(key, e.target.value)}
      />
    </div>
  );

  return (
    <div>
      {/* Say what this is before the user fills anything in. */}
      <div style={{ ...card, borderColor: 'var(--accent)' }}>
        <div className="section-label" style={{ marginBottom: 8 }}>COMPANY ONBOARDING</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          A trade escrow has to know who it is moving money for. These are the fields required
          under UK MLR 2017 and the equivalent UAE regime, taken from the document register.
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: '10px 0 0' }}>
          <strong style={{ color: 'var(--accent)' }}>Proof of concept:</strong> everything you enter
          is self-declared. Nothing is checked against Companies House, a free-zone registrar, or a
          sanctions list. Completing this marks the company <em>attested</em> — not verified.
        </p>
      </div>

      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: '5px 11px', borderRadius: 20,
          background: status === 'attested' ? 'var(--accent-dim)' : 'transparent',
          border: `1px solid ${status === 'attested' ? 'var(--accent)' : 'var(--border)'}`,
          color: status === 'attested' ? 'var(--accent)' : 'var(--text-muted)',
        }}>
          {status === 'attested' ? 'ATTESTED' : 'INCOMPLETE'}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {status === 'attested'
            ? 'This company can enter deals.'
            : `${gaps.length} item${gaps.length === 1 ? '' : 's'} still needed before this company can trade.`}
        </span>
      </div>

      {expired && (
        <div style={{ ...card, borderColor: '#F87171' }}>
          <strong style={{ color: '#F87171', fontSize: 13 }}>Passport expired.</strong>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 6 }}>
            An expired passport is not valid identity evidence, so this company cannot trade
            until it is replaced.
          </span>
        </div>
      )}

      {/* DOC-15 */}
      <div style={card}>
        <div className="section-label" style={{ marginBottom: 14 }}>COMPANY IDENTITY</div>
        <div style={grid}>
          {field('registrationNumber', 'Registration number')}
          <div>
            <label style={label} htmlFor="companyType">Company type</label>
            <select id="companyType" style={input} value={String(form.companyType ?? '')}
              onChange={e => set('companyType', e.target.value)}>
              <option value="">Select…</option>
              {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {field('jurisdiction', 'Registered jurisdiction')}
          {field('issuingAuthority', 'Issuing authority')}
          {field('incorporationDate', 'Date of incorporation', 'date')}
        </div>
      </div>

      {/* DOC-18 */}
      <div style={card}>
        <div className="section-label" style={{ marginBottom: 6 }}>AUTHORISED SIGNATORY</div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.6 }}>
          The individual who can commit this company to a deal. Names must match their passport.
        </p>
        <div style={grid}>
          {field('signatoryName', 'Full name (as on passport)')}
          {field('signatoryNationality', 'Nationality')}
          {field('signatoryDob', 'Date of birth', 'date')}
          {field('signatoryPassportExpiry', 'Passport expiry', 'date')}
        </div>
      </div>

      {/* DOC-17 */}
      <div style={card}>
        <div className="section-label" style={{ marginBottom: 6 }}>PEOPLE WITH SIGNIFICANT CONTROL</div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.6 }}>
          Anyone who ultimately owns or controls the company — over 25% of shares or voting rights,
          or equivalent control. Sanctions screening runs against these people, not the company name.
          Date of birth is month and year only, as on the public register.
        </p>

        {people.map((p, i) => (
          <div key={i} style={{
            border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 12,
          }}>
            <div style={grid}>
              <div>
                <label style={label}>Full name</label>
                <input style={input} value={p.fullName}
                  onChange={e => setPeople(ps => ps.map((x, j) => j === i ? { ...x, fullName: e.target.value } : x))} />
              </div>
              <div>
                <label style={label}>Nationality</label>
                <input style={input} value={p.nationality}
                  onChange={e => setPeople(ps => ps.map((x, j) => j === i ? { ...x, nationality: e.target.value } : x))} />
              </div>
              <div>
                <label style={label}>Birth month and year</label>
                <input style={input} type="month" value={p.birthMonthYear}
                  onChange={e => setPeople(ps => ps.map((x, j) => j === i ? { ...x, birthMonthYear: e.target.value } : x))} />
              </div>
              <div>
                <label style={label}>Country of residence</label>
                <input style={input} value={p.countryOfResidence}
                  onChange={e => setPeople(ps => ps.map((x, j) => j === i ? { ...x, countryOfResidence: e.target.value } : x))} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={label}>Nature of control</label>
              <select style={input} value={p.controlCondition}
                onChange={e => setPeople(ps => ps.map((x, j) => j === i ? { ...x, controlCondition: e.target.value } : x))}>
                {CONTROL_CONDITIONS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={label}>Detail (optional) — e.g. &ldquo;holds 40% of shares&rdquo;</label>
              <input style={input} value={p.controlDetail}
                onChange={e => setPeople(ps => ps.map((x, j) => j === i ? { ...x, controlDetail: e.target.value } : x))} />
            </div>
            <button
              onClick={() => setPeople(ps => ps.filter((_, j) => j !== i))}
              style={{
                marginTop: 12, background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 6, padding: '6px 12px', fontSize: 12,
                color: 'var(--text-secondary)', cursor: 'pointer',
              }}
            >Remove</button>
          </div>
        ))}

        <button
          onClick={() => setPeople(ps => [...ps, emptyPerson()])}
          style={{
            background: 'transparent', border: '1px solid var(--border)', borderRadius: 6,
            padding: '9px 14px', fontSize: 13, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer',
          }}
        >Add person</button>
      </div>

      {/* DOC-19 */}
      <div style={card}>
        <div className="section-label" style={{ marginBottom: 14 }}>SOURCE OF FUNDS</div>
        <div style={grid}>
          {field('fundsSourceNature', 'Nature of business generating the funds')}
          {field('fundsSourceCountry', 'Country of origin of funds')}
        </div>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['declaredNotCriminalFunds', 'I declare that the funds used are not derived from criminal activity.'],
            ['declaredNoSanctions', 'I declare that no sanctions designations apply to this company, its signatory, or its beneficial owners.'],
          ].map(([key, text]) => (
            <label key={key} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox" checked={!!form[key]} style={{ marginTop: 3 }}
                onChange={e => set(key, e.target.checked)}
              />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{text}</span>
            </label>
          ))}
        </div>
      </div>

      {gaps.length > 0 && (
        <div style={card}>
          <div className="section-label" style={{ marginBottom: 10 }}>STILL NEEDED</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            {gaps.map(g => <li key={g.field}>{g.label}</li>)}
          </ul>
        </div>
      )}

      <button
        onClick={() => { void save(); }}
        disabled={busy}
        style={{
          padding: '11px 22px', borderRadius: 6, fontSize: 14, fontWeight: 600,
          background: 'var(--accent)', color: '#0A0A0B', border: 'none',
          cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1,
        }}
      >{busy ? 'Saving…' : 'Save onboarding details'}</button>

      {note && <span style={{ marginLeft: 14, fontSize: 13, color: 'var(--accent)' }}>{note}</span>}
    </div>
  );
}
