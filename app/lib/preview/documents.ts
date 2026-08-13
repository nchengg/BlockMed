'use client';

export type PreviewDocumentStatus = 'Pending' | 'Sent' | 'Received';
export type PreviewDocument = { id: string; name: string; status: PreviewDocumentStatus };

const STORAGE_KEY = 'blockmediary.preview-documents';
const documentNames = [
  ['commercial-invoice', 'Commercial invoice'], ['packing-list', 'Packing list'],
  ['weight-list', 'Weight list'], ['bill-of-lading', 'Bill of lading'],
  ['certificate-of-origin', 'Certificate of origin'],
] as const;
const defaults: Record<string, PreviewDocumentStatus[]> = {
  'DEMO-IZMIR-TEXTILES': ['Received', 'Received', 'Sent', 'Sent', 'Pending'],
  'DEMO-SHENZHEN-ELECTRONICS': ['Received', 'Received', 'Received', 'Received', 'Sent'],
  'DEMO-COLOMBIA-COFFEE': ['Pending', 'Pending', 'Pending', 'Pending', 'Pending'],
};

function stored(): Record<string, Record<string, PreviewDocumentStatus>> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, Record<string, PreviewDocumentStatus>>; } catch { return {}; }
}

export function previewDocuments(dealId: string): PreviewDocument[] {
  const saved = stored()[dealId] ?? {};
  const initial = defaults[dealId] ?? defaults['DEMO-IZMIR-TEXTILES'];
  return documentNames.map(([id, name], index) => ({ id, name, status: saved[id] ?? initial[index] }));
}

export function savePreviewDocumentStatus(dealId: string, documentId: string, status: PreviewDocumentStatus): void {
  if (typeof window === 'undefined') return;
  const all = stored();
  all[dealId] = { ...(all[dealId] ?? {}), [documentId]: status };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function previewDocumentCounts(dealId: string): Record<PreviewDocumentStatus, number> {
  return previewDocuments(dealId).reduce<Record<PreviewDocumentStatus, number>>((counts, document) => {
    counts[document.status] += 1;
    return counts;
  }, { Pending: 0, Sent: 0, Received: 0 });
}
