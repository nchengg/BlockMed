'use client';
import { useState } from 'react';
import Link from 'next/link';
import { demoDocuments, type Role } from '@/data/dashboardDemo';
import { useDeal, type DocumentStatus } from '@/lib/dealStore';
import { Card, EyebrowLabel, StatusPill } from '../ui';

export function DocumentsTab({ role }: { role: Role }) {
  const { deal } = useDeal();
  const [selectedId, setSelectedId] = useState('commercial-invoice');
  const selected = demoDocuments.find(d => d.id === selectedId)!;
  const isInvoice = selected.id === 'commercial-invoice';
  // Extracted fields only make sense to show once the (simulated) check has
  // actually looked at the document — not while it's still uploading.
  const showExtractedFields = ['checking', 'verified', 'failed', 'manual_review'].includes(deal.documentStatus);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 20 }} className="dashboard-documents-grid">
      <Card style={{ padding: 0, overflow: 'hidden', alignSelf: 'start' }}>
        <div style={{ padding: '24px 24px 8px' }}>
          <EyebrowLabel>REQUIRED DOCUMENTS</EyebrowLabel>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -6 }}>
            Demo only — statuses below are simulated, not a real document pipeline.
          </p>
        </div>
        <div>
          {demoDocuments.map(doc => {
            const active = doc.id === selectedId;
            const disabled = doc.status === 'coming_next';
            return (
              <button
                key={doc.id}
                disabled={disabled}
                onClick={() => setSelectedId(doc.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '16px 24px',
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  border: 'none',
                  borderTop: '1px solid var(--border)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.55 : 1,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {doc.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {doc.status === 'required_mvp' ? 'Required for MVP' : 'Coming next'}
                  </div>
                </div>
                {doc.status === 'required_mvp' ? (
                  <DocStatusPill status={deal.documentStatus} />
                ) : (
                  <StatusPill label="Coming next" tone="pending" dot={false} />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card>
          <EyebrowLabel>DOCUMENT DETAIL</EyebrowLabel>
          {isInvoice && showExtractedFields ? (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
                {selected.name}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selected.extractedFields?.map(f => (
                  <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{f.value}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 14 }}>
                Fields shown are simulated for this demo — no real document parsing occurs.
              </p>
            </>
          ) : isInvoice && deal.documentStatus === 'uploading' ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              The seller is uploading this document now (simulated).
            </p>
          ) : isInvoice && deal.documentStatus === 'received' ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Document received — the check will start shortly.
            </p>
          ) : isInvoice ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Waiting for the seller to upload the commercial invoice.
            </p>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              This document type isn&apos;t part of the MVP yet — upload and extraction will be available in a future release.
            </p>
          )}
        </Card>

        {isInvoice && deal.documentStatus === 'failed' && (
          <Card style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <StatusPill label="Discrepancy detected" tone="error" />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {deal.discrepancyReason ?? "Invoice amount doesn't match escrow amount."}
            </p>
            <div style={{ marginTop: 14 }}>
              <DiscrepancyCta role={role} />
            </div>
          </Card>
        )}

        {isInvoice && deal.documentStatus === 'manual_review' && (
          <Card style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <StatusPill label="Manual review" tone="accent" />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
              A human reviewer needs to confirm this document before payment can release.
            </p>
          </Card>
        )}
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .dashboard-documents-grid {
            grid-template-columns: 340px 1fr !important;
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
}

// Role-specific response to a discrepancy, per spec: the seller can act
// (re-upload), the buyer waits, and the operator reviews. Only the seller's
// path is routable in this frontend-only demo.
function DiscrepancyCta({ role }: { role: Role }) {
  if (role === 'seller') {
    return (
      <Link
        href="/seller"
        style={{
          display: 'inline-block',
          padding: '9px 18px',
          borderRadius: 6,
          background: 'var(--accent)',
          color: '#0A0A0B',
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Re-upload document
      </Link>
    );
  }
  if (role === 'operator') {
    return (
      <button
        disabled
        title="Demo only — not wired to a backend"
        style={{
          padding: '9px 18px',
          borderRadius: 6,
          background: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'not-allowed',
          opacity: 0.85,
        }}
      >
        Review discrepancy
      </button>
    );
  }
  // buyer
  return (
    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
      Wait for correction — the seller has been asked to re-upload a corrected invoice.
    </p>
  );
}

function DocStatusPill({ status }: { status: DocumentStatus }) {
  switch (status) {
    case 'not_uploaded':
      return <StatusPill label="Waiting" tone="pending" />;
    case 'uploading':
      return <StatusPill label="Uploading" tone="accent" />;
    case 'received':
      return <StatusPill label="Received" tone="accent" />;
    case 'checking':
      return <StatusPill label="Checking" tone="accent" />;
    case 'verified':
      return <StatusPill label="Verified" tone="success" />;
    case 'failed':
      return <StatusPill label="Discrepancy" tone="error" />;
    case 'manual_review':
      return <StatusPill label="Manual review" tone="accent" />;
  }
}
