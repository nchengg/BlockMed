"use client";

import { useCallback, useEffect, useState } from "react";
import type { DealTerms, AuditEntry } from "@/lib/store";
import type { RuleResult } from "@/lib/rules";

interface Status {
  ok: boolean;
  error?: string;
  addresses?: Record<string, string>;
  balances?: { buyer: string; seller: string; escrow: string };
  dealId?: string | null;
  terms?: DealTerms | null;
  state?: string | null;
  audit?: AuditEntry[];
}

interface VerdictResult {
  verdict: "Compliant" | "Discrepant";
  rules: RuleResult[];
}

const STEPS = ["Propose", "Agree", "Fund", "Bill of Lading", "Release", "Done"];

const plus30 = () => {
  const d = new Date(Date.now() + 30 * 86400_000);
  return d.toISOString().slice(0, 10);
};

export default function Demo() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<VerdictResult | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/status");
      setStatus(await res.json());
    } catch {
      setStatus({ ok: false, error: "App server unreachable" });
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, [refresh]);

  const act = async (path: string, body?: unknown): Promise<Record<string, unknown> | null> => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Request failed");
        return null;
      }
      await refresh();
      return json;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  if (!status) return <Shell><p className="text-zinc-400">Loading…</p></Shell>;
  if (!status.ok) {
    return (
      <Shell>
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-300">Local chain not reachable</h2>
          <p className="text-sm text-red-200/80">{status.error}</p>
          <p className="mt-3 text-sm text-zinc-400">
            Start it with <code className="rounded bg-zinc-800 px-1">npx hardhat node</code> then{" "}
            <code className="rounded bg-zinc-800 px-1">npx hardhat run scripts/deploy-local.ts --network localhost</code>{" "}
            (both in <code className="rounded bg-zinc-800 px-1">contracts/</code>).
          </p>
        </div>
      </Shell>
    );
  }

  // Derive the current step from off-chain terms + on-chain state
  const stepIndex = !status.terms
    ? 0
    : !status.dealId
      ? 1
      : status.state === "Agreed"
        ? 2
        : status.state === "Funded"
          ? 3
          : status.state === "ReleasePending"
            ? 4
            : 5;

  return (
    <Shell>
      {/* Balances + on-chain state strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Buyer wallet" value={`${status.balances!.buyer} USDC`} accent="text-sky-300" />
        <Stat label="Escrow contract" value={`${status.balances!.escrow} USDC`} accent="text-amber-300" />
        <Stat label="Seller wallet" value={`${status.balances!.seller} USDC`} accent="text-emerald-300" />
        <Stat label="On-chain state" value={status.state ?? "— (no deal yet)"} accent="text-violet-300" />
      </div>

      {/* Stepper */}
      <ol className="mb-8 flex flex-wrap gap-2 text-xs">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`rounded-full border px-3 py-1 ${
              i === stepIndex
                ? "border-violet-500 bg-violet-500/20 text-violet-200"
                : i < stepIndex
                  ? "border-emerald-700 bg-emerald-900/30 text-emerald-300"
                  : "border-zinc-700 text-zinc-500"
            }`}
          >
            {i < stepIndex ? "✓ " : `${i + 1}. `}
            {s}
          </li>
        ))}
      </ol>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-950/40 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {stepIndex === 0 && <ProposeStep busy={busy} onSubmit={(t) => act("/api/propose", t)} />}
      {stepIndex === 1 && <AgreeStep busy={busy} terms={status.terms!} onAgree={() => act("/api/agree")} />}
      {stepIndex === 2 && <FundStep busy={busy} terms={status.terms!} onFund={() => act("/api/fund")} />}
      {stepIndex === 3 && (
        <BolStep
          busy={busy}
          terms={status.terms!}
          verdict={verdict}
          onSubmit={async (f) => setVerdict((await act("/api/submit-bol", f)) as VerdictResult | null)}
        />
      )}
      {stepIndex === 4 && <ReleaseStep busy={busy} terms={status.terms!} onRelease={() => act("/api/release")} />}
      {stepIndex === 5 && (
        <DoneStep
          terms={status.terms!}
          state={status.state!}
          onReset={() => {
            setVerdict(null);
            act("/api/reset");
          }}
        />
      )}

      {/* Audit timeline */}
      {status.audit && status.audit.length > 0 && (
        <section className="mt-10">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Audit trail
          </h3>
          <ul className="space-y-2">
            {status.audit.map((e, i) => (
              <li key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm">
                <div className="flex flex-wrap items-baseline gap-2">
                  <ActorBadge actor={e.actor} />
                  <span className="text-zinc-200">{e.action}</span>
                  <span className="ml-auto text-xs text-zinc-500">{new Date(e.ts).toLocaleTimeString()}</span>
                </div>
                {e.detail && <p className="mt-1 text-xs text-zinc-400">{e.detail}</p>}
                {e.txHash && (
                  <p className="mt-1 truncate font-mono text-xs text-zinc-500">tx {e.txHash}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-10 flex items-center justify-between border-t border-zinc-800 pt-4 text-xs text-zinc-500">
        <span>
          Local Hardhat chain · Escrow{" "}
          <span className="font-mono">{status.addresses?.escrow?.slice(0, 10)}…</span> · test funds only
        </span>
        <button onClick={() => { setVerdict(null); act("/api/reset"); }} className="text-zinc-400 underline hover:text-zinc-200">
          Start over
        </button>
      </footer>
    </Shell>
  );
}

/* ---------- steps ---------- */

function ProposeStep({ busy, onSubmit }: { busy: boolean; onSubmit: (t: DealTerms) => void }) {
  const [t, setT] = useState<DealTerms>({
    goods: "Cotton textiles — one 40ft container",
    amountUsdc: "2500.00",
    sellerName: "Acme Textiles FZE",
    buyerName: "Birmingham Imports Ltd",
    shipmentDeadline: plus30(),
  });
  return (
    <StepCard
      role="SELLER"
      roleClass="bg-emerald-900/40 text-emerald-300 border-emerald-700"
      title="Propose the escrow terms"
      blurb="You're the exporter. Set the terms of the deal — these become the rulebook the bill of lading is checked against later. Nothing touches the chain yet."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Goods" value={t.goods} onChange={(v) => setT({ ...t, goods: v })} />
        <Field label="Amount (USDC)" value={t.amountUsdc} onChange={(v) => setT({ ...t, amountUsdc: v })} />
        <Field label="Seller (shipper) legal name" value={t.sellerName} onChange={(v) => setT({ ...t, sellerName: v })} />
        <Field label="Buyer (consignee) legal name" value={t.buyerName} onChange={(v) => setT({ ...t, buyerName: v })} />
        <Field label="Shipment deadline" type="date" value={t.shipmentDeadline} onChange={(v) => setT({ ...t, shipmentDeadline: v })} />
      </div>
      <ActionButton busy={busy} onClick={() => onSubmit(t)}>Send proposal to buyer</ActionButton>
    </StepCard>
  );
}

function AgreeStep({ busy, terms, onAgree }: { busy: boolean; terms: DealTerms; onAgree: () => void }) {
  return (
    <StepCard
      role="BUYER"
      roleClass="bg-sky-900/40 text-sky-300 border-sky-700"
      title="Review and agree"
      blurb="You're the importer. The seller proposed these terms. Agreeing registers the deal on-chain (createDeal, signed by the platform's releaser key) — but no money moves yet."
    >
      <TermsTable terms={terms} />
      <ActionButton busy={busy} onClick={onAgree}>Agree — register deal on-chain</ActionButton>
    </StepCard>
  );
}

function FundStep({ busy, terms, onFund }: { busy: boolean; terms: DealTerms; onFund: () => void }) {
  return (
    <StepCard
      role="BUYER"
      roleClass="bg-sky-900/40 text-sky-300 border-sky-700"
      title="Lock the funds"
      blurb={`Deposit ${terms.amountUsdc} USDC into the escrow contract. Two transactions: an exact-amount approve, then the deposit. Watch the balance strip — your wallet goes down, the escrow goes up, and the seller can see the money is locked before shipping.`}
    >
      <ActionButton busy={busy} onClick={onFund}>Approve + Deposit {terms.amountUsdc} USDC</ActionButton>
    </StepCard>
  );
}

function BolStep({
  busy,
  terms,
  verdict,
  onSubmit,
}: {
  busy: boolean;
  terms: DealTerms;
  verdict: VerdictResult | null;
  onSubmit: (f: Record<string, string>) => void;
}) {
  const [f, setF] = useState({
    blNumber: "MAEU-2260714",
    shipperName: terms.sellerName,
    consigneeName: terms.buyerName,
    amountUsdc: terms.amountUsdc,
    shipmentDate: new Date().toISOString().slice(0, 10),
  });
  return (
    <StepCard
      role="SELLER"
      roleClass="bg-emerald-900/40 text-emerald-300 border-emerald-700"
      title="Ship the goods and submit the bill of lading"
      blurb="Funds are locked — safe to ship. Enter the B/L details; the rules engine checks every field against the agreed terms in code (no AI, no rounding). All rules pass → the verdict is recorded on-chain. Tip: change the amount or a name to see a Discrepant verdict — the money won't move."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="B/L number" value={f.blNumber} onChange={(v) => setF({ ...f, blNumber: v })} />
        <Field label="Shipment date" type="date" value={f.shipmentDate} onChange={(v) => setF({ ...f, shipmentDate: v })} />
        <Field label="Shipper name" value={f.shipperName} onChange={(v) => setF({ ...f, shipperName: v })} />
        <Field label="Consignee name" value={f.consigneeName} onChange={(v) => setF({ ...f, consigneeName: v })} />
        <Field label="Amount on B/L (USDC)" value={f.amountUsdc} onChange={(v) => setF({ ...f, amountUsdc: v })} />
      </div>
      <ActionButton busy={busy} onClick={() => onSubmit(f)}>Submit for verification</ActionButton>
      {verdict && (
        <div className={`mt-4 rounded-lg border p-4 ${verdict.verdict === "Compliant" ? "border-emerald-700 bg-emerald-950/40" : "border-amber-700 bg-amber-950/40"}`}>
          <p className={`mb-2 font-semibold ${verdict.verdict === "Compliant" ? "text-emerald-300" : "text-amber-300"}`}>
            Verdict: {verdict.verdict}
            {verdict.verdict === "Discrepant" && " — fix the fields and resubmit"}
          </p>
          <ul className="space-y-1 text-xs">
            {verdict.rules.map((r) => (
              <li key={r.rule} className={r.pass ? "text-emerald-300/80" : "text-amber-300"}>
                {r.pass ? "✓" : "✗"} {r.rule}
                {!r.pass && <span className="text-zinc-400"> — expected {r.expected}, got {r.actual}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </StepCard>
  );
}

function ReleaseStep({ busy, terms, onRelease }: { busy: boolean; terms: DealTerms; onRelease: () => void }) {
  return (
    <StepCard
      role="ANYONE"
      roleClass="bg-violet-900/40 text-violet-300 border-violet-700"
      title="Release the funds"
      blurb={`The verdict is on-chain: release is now permissionless — anyone (here, the seller) can trigger it, and nobody can block it. The contract pays the recorded seller ${terms.amountUsdc} USDC.`}
    >
      <ActionButton busy={busy} onClick={onRelease}>Release {terms.amountUsdc} USDC to seller</ActionButton>
    </StepCard>
  );
}

function DoneStep({ terms, state, onReset }: { terms: DealTerms; state: string; onReset: () => void }) {
  return (
    <StepCard
      role="DONE"
      roleClass="bg-emerald-900/40 text-emerald-300 border-emerald-700"
      title={state === "Released" ? "Escrow complete — seller paid" : `Deal ended: ${state}`}
      blurb={
        state === "Released"
          ? `${terms.amountUsdc} USDC moved from the escrow contract to the seller's wallet. The full journey — proposal, agreement, funding, document check, release — is in the audit trail below, with a transaction hash for every on-chain action.`
          : "This deal reached a terminal state."
      }
    >
      <ActionButton busy={false} onClick={onReset}>Run the demo again</ActionButton>
    </StepCard>
  );
}

/* ---------- small components ---------- */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold">
          Blockmediary <span className="font-normal text-zinc-400">· escrow demo</span>
        </h1>
        <p className="mb-8 mt-1 text-sm text-zinc-400">
          A guided walk through the documentary escrow: seller proposes, buyer agrees and funds,
          seller ships and submits the bill of lading, the contract pays out.
        </p>
        {children}
      </div>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-1 truncate text-sm font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function StepCard({
  role,
  roleClass,
  title,
  blurb,
  children,
}: {
  role: string;
  roleClass: string;
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <span className={`mb-3 inline-block rounded-full border px-3 py-0.5 text-xs font-bold tracking-wide ${roleClass}`}>
        You are acting as: {role}
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mb-5 mt-1 text-sm leading-relaxed text-zinc-400">{blurb}</p>
      {children}
    </section>
  );
}

function TermsTable({ terms }: { terms: DealTerms }) {
  const rows: [string, string][] = [
    ["Goods", terms.goods],
    ["Amount", `${terms.amountUsdc} USDC`],
    ["Seller (shipper)", terms.sellerName],
    ["Buyer (consignee)", terms.buyerName],
    ["Ship by", terms.shipmentDeadline],
  ];
  return (
    <table className="mb-4 w-full text-sm">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b border-zinc-800/60 last:border-0">
            <td className="py-2 pr-4 text-zinc-500">{k}</td>
            <td className="py-2 font-medium text-zinc-200">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs text-zinc-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-violet-500"
      />
    </label>
  );
}

function ActionButton({ busy, onClick, children }: { busy: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="mt-4 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-50"
    >
      {busy ? "Signing transaction…" : children}
    </button>
  );
}

function ActorBadge({ actor }: { actor: string }) {
  const styles: Record<string, string> = {
    seller: "bg-emerald-900/50 text-emerald-300",
    buyer: "bg-sky-900/50 text-sky-300",
    platform: "bg-violet-900/50 text-violet-300",
    anyone: "bg-zinc-800 text-zinc-300",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${styles[actor] ?? styles.anyone}`}>
      {actor}
    </span>
  );
}
