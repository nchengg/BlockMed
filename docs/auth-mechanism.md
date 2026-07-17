# Blockmediary — Authentication Mechanism (Q18 Design)

**Product:** Blockmediary — programmable documentary escrow for SME cross-border trade
**Team:** Transakt (BEEM063 Hackathon, Exeter MSc FinTech)
**Document status:** Draft v0.1 — design spec resolving TRD §12 **Q18**
**Last updated:** 2026-07-11
**Owner lane:** CTO / platform architecture

---

## 0. Document control

| Field | Value |
|-------|-------|
| Purpose | Decide and specify the **real authentication mechanism** for Blockmediary's off-chain API and web app, closing TRD §12 **Q18** ("API auth mechanism — JWT vs SIWE vs both"). |
| Authority | Subordinate to the [TRD](technical-requirements.md) and [BRD](business-requirements.md). Realises **TR-6.2.4** (authentication) and **TR-6.2.5** (authorization); the *integration model* itself (AP-9, full-API-integration) is already **settled** — only the auth *mechanism* was open. |
| Scope | The off-chain HTTP API (`/api/escrow/*` today, `/api/deals/*` in the full product), the web app's session model, and how on-chain wallet signing relates to API identity. **Out of scope:** the partner **API-key** scheme for FR-19 (already specified in TR-6.2.4, revisited only where it touches sessions), contract-level roles (§4.2, unchanged), and KYC identity proofing (FR-7). |
| Status of code today | The app auth is **mock/soft** and explicitly **"not a security boundary"** (`app/lib/authStore.tsx`, `app/lib/escrow/actor.ts`). This document is the plan to replace it before any non-local deployment. |

### Source material (read for grounding)

- **TRD** — §12 Q18 (line ~550), Q5 (line ~527); **AP-9** (full-API-integration); **TR-6.2.3** (MVP unauthenticated caveat); **TR-6.2.4–6.2.7** (authN, deal-scoped authZ, transport hardening, API as sole mutation surface); **TR-6.3** (client/wallet, wagmi + SIWE); **TR-4.1.4 / TR-6.3.4** (role-agnostic onboarding, all party roles); **TR-8.1** (key management, the top risk).
- **App code** — `app/lib/authStore.tsx` (account/role/hat model), `app/lib/escrow/actor.ts` (the soft gate), `app/lib/escrow/client.ts` (`actorFrom`), `app/app/api/escrow/*` (the lifecycle routes), `app/components/auth/RequireParty.tsx` (client-side view guard), `app/lib/escrow/chain.ts` (server-held keys).

---

## 1. The problem — today's gate is client-supplied and soft

The current app has a **complete role/hat model but zero enforcement**. Identity is asserted by the client and trusted verbatim by the server.

### 1.1 How it works today

1. **Login is a mock lookup.** `authStore.login(email)` finds a seeded account by email — **no password, no credential, no server round-trip** (`authStore.tsx:235`). The account (carrying `type` = `admin | developer | client` and, for clients, `hats` = `buyer | seller | platform`) is the source of truth for role, held entirely in React state + `localStorage`.
2. **The wallet is faked and optional.** `connectWallet()` attaches a random hex string; ownership is never proven (`authStore.tsx:288`). The model is deliberately **account-first, wallet-second** — an account with no wallet is fully valid (the platform/intermediary case).
3. **The client tells the server who it is.** For each mutating call, `actorFrom(account, activeHat)` (`client.ts`) serialises the account into an `actor` object and posts it in the request body.
4. **The server trusts the body.** `readActor(body)` (`actor.ts:35`) reads `actor` straight off the JSON. `requireHat` / `requireStaff` / `requireOperator` then gate on `actor.type` / `actor.hat` — but **anonymous calls are soft-allowed** (`if (!actor || actor.type === undefined) return null`), and even a supplied actor is **whatever the caller typed**. A `curl` with `{"actor":{"type":"client","hat":"buyer"}}` passes every check.
5. **`RequireParty`** (`RequireParty.tsx`) is **client-side routing only** — it redirects the browser; it protects no data.

Every one of these is annotated in-code as **"NOT a security boundary … real enforcement must resolve the account server-side from a verified credential/signature (SIWE vs JWT — TRD Q18, still open)."** The soft gate exists to keep the demo's parties honest and to produce a truthful audit trail — nothing more.

### 1.2 Why this must change before any non-local deployment

- **AP-9 / TR-6.2.4** require every off-chain route to **authenticate before any other processing**. Today there is no authentication at all.
- **The releaser-signing path is the sharp edge.** `POST /api/escrow/submit-bol`, on a `Compliant` verdict, makes the platform's `recordVerdict` call with a **server-held key** (`Funded → ReleasePending`, after which release is permissionless and unstoppable). Today the only thing stopping an anonymous caller from triggering that is a hard **localhost/chainId-31337 guard** (`assertLocalReleaser`) that returns `501` off-chain. That guard is a *tripwire, not authorization* — it makes the endpoint safe only by making it non-functional in production. Real auth is the precondition for the endpoint to exist at all outside localhost (TR-8.1.2: releaser-key misuse is the **top security risk**).
- **Data isolation is unenforced.** TR-6.2.5 requires deal-scoped authZ (a buyer acts only on *their* deals). With a client-supplied actor there is no server-trusted identity to scope against.

**Conclusion:** we need a server-verified identity on every mutating request, mapping to the existing account/role/hat model, replacing the `actor.ts` soft gate with a real one at the same seam.

---

## 2. Options analysis

The constraint that drives the decision (TRD Q5 → Q18): **onboarding supports all party roles**, and the **platform/intermediary may have no wallet**. So the mechanism must authenticate three distinct populations:

| Population | Has a wallet? | Needs to sign on-chain? | Example |
|-----------|---------------|--------------------------|---------|
| **Buyer / Seller** (principals) | Yes | Yes — `approve`/`deposit` (buyer), can trigger `release` | Meridian Imports, Solaris Textiles |
| **Platform / intermediary** (initiator) | **Often not** — coordinates, never deposits/releases (TR-6.2.5) | No | TradeBridge Platform (`acc-platform`, `wallet: null`) |
| **Admin / developer** (staff) | No (staff, not a trade party) | No | Blockmediary Ops, Blockmediary Dev |

Any wallet-only mechanism structurally **cannot cover rows 2 and 3**. That single fact decides most of the analysis below.

### Option A — Pure SIWE (Sign-In With Ethereum, EIP-4361)

The user proves control of a wallet address by signing a structured challenge; the server verifies the signature and issues a session.

| | |
|---|---|
| **Buyer/seller** | ✅ Ideal. They already connect a wallet for `approve`/`deposit` (TR-6.3.2), so proving control of that address is zero extra ceremony and ties the API identity to the **exact address that signs on-chain** — the strongest possible binding for a principal. |
| **Platform/intermediary** | ❌ **Blocked.** A wallet-less coordinator has no address to sign with. Forcing one contradicts the account-first model and TR-6.2.5's "may have no wallet". |
| **Admin/developer** | ❌ **Blocked / wrong tool.** Staff are not trade parties; issuing them wallets purely to log in is ceremony with no custody meaning, and couples an internal console to a crypto UX. |
| **Verdict** | Strong for principals, **cannot serve the whole population**. Rejected as the *sole* mechanism — exactly the gap TR-6.2.4 and the Q18 note call out. |

### Option B — Pure JWT / session (email+password or OIDC → signed token)

Classic account login; server issues a short-lived signed token (or opaque session) carried in an httpOnly cookie.

| | |
|---|---|
| **Buyer/seller** | ⚠️ Works, but leaves a **gap**: the account's login credential is *not* cryptographically tied to the wallet that signs on-chain. Nothing in the auth layer proves "the account acting as buyer controls the address funding the escrow." That binding has to be added anyway (see §3.4). |
| **Platform/intermediary** | ✅ Natural fit — an account with a role and no wallet. |
| **Admin/developer** | ✅ Natural fit — standard staff login, ideally behind SSO/OIDC. |
| **Verdict** | Covers **everyone**, matches the account-first model 1:1, and is the only thing that can serve staff and wallet-less parties. But on its own it under-secures the principal↔wallet binding. |

### Option C — **BOTH: session/JWT as the backbone, SIWE as a login + wallet-linking method** ✅ recommended

One **unified session layer** (httpOnly cookie → signed token) is the API's authentication boundary for *every* route and *every* role. Accounts obtain that session through **one of several login methods**:

- **SIWE** for wallet-holders (buyer/seller) — the signature both authenticates *and* proves/links the wallet in one step.
- **Email+password (or OIDC/SSO)** for wallet-less platform accounts and staff.

The session is the same shape regardless of method; downstream authZ never cares *how* you logged in, only *who* you are and *what role/hat* you hold. Wallet linkage becomes an **attribute on the account** (already the model — `authStore` `WalletLink`), proven via SIWE, not the session mechanism itself.

| | |
|---|---|
| **Buyer/seller** | ✅ SIWE login → session; the signed address is recorded as the account's linked wallet (account-first, wallet-second preserved). Best-of-both: crypto-native UX **and** a uniform session. |
| **Platform/intermediary** | ✅ Email/OIDC login → identical session, `wallet: null`, role scoped to initiation/coordination. |
| **Admin/developer** | ✅ Email/OIDC (ideally SSO) → identical session, staff role. |
| **Cost** | One session layer + two login adapters. Modest extra surface vs. Option B; far less than maintaining two parallel identity systems. |
| **Verdict** | **Covers the whole population, preserves the existing model, and closes the wallet-binding gap** by making SIWE the wallet-proof rather than an alternative universe. |

**Recommendation:** **Option C — a single JWT/session backbone with SIWE as a login method and the wallet-linking proof.** This is exactly what the Q18 note foresaw ("SIWE pairs naturally with the existing wallet UX … JWT/sessions needed anyway for reviewer/compliance roles with no wallet") and what Q5's all-roles resolution forces.

---

## 3. Recommended architecture

### 3.1 Identity, sessions, tokens

- **Session boundary = httpOnly, Secure, `SameSite=Lax` cookie** holding a short-lived signed **session token** (JWT or opaque server-session; see §6 open sub-decision). The cookie is set by the server on login and is the **only** thing the API trusts. The client never reads it and never sends an `actor` body again.
- **Token claims (minimum):** `sub` (accountId), `type` (`admin|developer|client`), `hats` (client sub-roles), `wallet` (linked address or null), `iat`/`exp`. Short TTL (~15 min) with a rotating **refresh** path; role/hat changes take effect within a token lifetime.
- **The token is authoritative for role; the client is not.** This is the whole point: `type` and `hats` come from the server's account record at login, signed into the token — not from a request body.

### 3.2 Login methods → one session

```
                 ┌── SIWE (EIP-4361) ──────────┐
  buyer/seller ──┤  nonce → sign → verify sig  ├──┐
                 └── link/confirm wallet ───────┘  │
                                                    ├─► issue session cookie ─► API trusts it
  platform  ─────── email+password / OIDC ─────────┤
  staff     ─────── OIDC / SSO ────────────────────┘
```

- **SIWE flow:** `GET /api/auth/nonce` → client signs an EIP-4361 message including that nonce → `POST /api/auth/siwe` with `{message, signature}` → server verifies, finds-or-links the account for that address, issues the session. The verified address is written to the account's `wallet` field (proof, not a faked string).
- **Password/OIDC flow:** standard; issues the identical session.

### 3.3 Where the server enforces role + hat (replacing the soft gate)

Enforcement moves **entirely server-side** and sits at the same seam the soft gate occupies today — `app/lib/escrow/actor.ts`. The function signatures barely change; the **source of the actor** changes from "request body" to "verified session."

**Every mutating route runs this order (TR-6.2.4 mandates authN first):**

```
authenticate (read+verify session cookie) → resolve account server-side
  → authorize (role + hat + deal-scope) → validate (Zod) → business logic → audit
```

Concretely, `actor.ts` is rewritten so that instead of `readActor(body)` it exposes `requireSession(req)` that:

1. reads and verifies the session cookie (rejects → `401`, generic body, no leakage — TR-6.2.4);
2. loads the account/role/hat from the **server-trusted** token (never the body);
3. keeps the existing `requireHat(actor, 'buyer'|'seller')`, `requireStaff`, `requireOperator` predicates **unchanged in spirit** — but now they gate a *verified* actor, and the **anonymous soft-allow branch is deleted** (no session ⇒ `401`, full stop).

The per-action role map already encoded in the routes is correct and is retained:

| Route | Server-enforced requirement |
|-------|------------------------------|
| `propose` | client wearing **seller** hat |
| `agree` / `fund` | client wearing **buyer** hat, **and deal-scoped** to the recorded buyer |
| `submit-bol` | client wearing **seller** hat for submission; the **`recordVerdict` signing** step additionally requires the **operator/platform** identity (§5) |
| `release` | intentionally **permissionless** (contract design, TR-8.1.3) — no party gate; identity still recorded for audit |
| `reset` | **staff** (admin/developer) only — demo control |

### 3.4 Mapping onto the existing account model (`authStore`)

The mock store is already shaped correctly; only the *trust source* changes.

| `authStore` concept | Mock today | Real (this design) |
|---------------------|------------|--------------------|
| `Account.type` / `hats` | React state from a seeded list | Server DB record; signed into the session token |
| `login(email)` | password-less lookup | SIWE **or** password/OIDC → server verifies → sets cookie; client `useAuth()` reads *derived* session, not authority |
| `wallet` (WalletLink) | faked random address | address **proven via SIWE**, stored on the account (account-first, wallet-second unchanged) |
| `connectWallet()` | attaches fake string | triggers a SIWE sign to **prove and link** the address to the already-authenticated account |
| `RequireParty` (client) | the "gate" | **downgraded to UX only** — it hides views for a nicer experience; it is explicitly *not* relied on. The real gate is server-side. |
| `impersonate` (dev view-as) | client-only preview | must become a **server-issued scoped session** with audit logging, or stay a read-only client convenience that the API refuses to honour for mutations |

Because "the rest of the app only reads `useAuth()`" (as the store's own TODO notes), swapping the authority underneath `useAuth()` leaves the component tree largely untouched — the big change is on the server.

### 3.5 How `/api/escrow/*` should verify identity server-side

- **Delete `actor` from request bodies.** `client.ts`'s `actorFrom()` and the `{ ...body, actor }` merge go away; the browser just posts the domain payload with `credentials: 'include'` so the cookie rides along.
- **Each route calls `requireSession(req)` first**, then the existing `requireHat/requireStaff/requireOperator` predicate against the verified actor, then Zod validation, then chain/store work, then audit.
- **Audit attribution gets stronger, not weaker.** Today `appendAudit({ accountId: actor?.accountId })` records a *claimed* id; after this change it records the *verified* `sub` — finally making the ledger's attribution promise (TR-6.2.5, TR-5.4) real.
- **Deal-scoping (TR-6.2.5):** once identity is trusted, `fund`/`agree`/`propose` additionally check the session account matches the deal's recorded buyer/seller before acting (`403` otherwise). This is net-new (the single-deal demo store has no per-deal party binding yet — see §6).

---

## 4. Migration path (no big-bang rewrite)

The design deliberately targets the **existing seam** so migration is incremental and each step is independently shippable.

**The seam:** `app/lib/escrow/actor.ts` is the single server-side choke point every mutating route already funnels through (`readActor` + `requireHat/Staff/Operator`). Replacing what lives *behind* those function names swaps mock for real without touching route bodies.

**Step 0 — (today).** Soft gate + client `actor` + localhost releaser tripwire. Safe only on localhost. ✅ shipped.

**Step 1 — Session issuance, dual-read.** Add `/api/auth/*` (nonce, siwe, login, logout, me) and cookie issuance. Keep routes working with the body `actor` *and* start reading the cookie when present. No behaviour change for the demo; the plumbing lands.

**Step 2 — Flip the trust source.** Change `actor.ts` to resolve the actor from the **verified session**, ignoring the body. Delete the **anonymous soft-allow** branch (`type === undefined → 401`). At this point the API is genuinely authenticated. `RequireParty` stays as UX. This is the security-critical commit.

**Step 3 — Wallet proof.** Replace `connectWallet()`'s fake address with a real SIWE sign that proves and links the wallet to the account. Buyer/seller `login` can now be SIWE end-to-end.

**Step 4 — Deal-scoped authZ + real releaser.** Add per-deal party binding to the store, enforce deal-scope in `fund/agree/propose`, and move `recordVerdict` behind verified **operator** identity + a **server-secret releaser key** — at which point `assertLocalReleaser`'s chainId tripwire can be **lifted** (replaced by real auth, not removed blindly). This is the gate to any public/testnet deployment (TR-6.2.4–7, TR-8.1).

**Step 5 — Hardening.** Rate-limiting, strict CORS allowlist, CSRF defence (§5), refresh-token rotation, staff SSO, impersonation audit. Completes TR-6.2.6.

Each step is a small PR; the app keeps running throughout. Nothing requires rewriting the account model, the routes' role map, or the component tree.

---

## 5. Security notes

- **The releaser-signing route is why server-side auth is non-negotiable.** `submit-bol` → `recordVerdict` moves a deal to `ReleasePending`, after which release is **permissionless and unstoppable** (TR-8.1.2/8.1.3). Compromise of that trigger is the **top-rated risk** in the TRD. Today only the localhost tripwire stands in for auth. Under this design the trigger requires a **verified operator/platform session** *and* the releaser key is a **server secret** (`RELEASER_PRIVATE_KEY`, env-only, never in the bundle/logs — TR-8.1, §9.1). Auth and key-secrecy are complementary: auth decides *who may ask*, key-secrecy ensures *only the server can sign*.
- **Token storage — httpOnly cookies, not `localStorage`.** The mock keeps session in `localStorage` (fine for a fake). Real tokens must be **httpOnly + Secure + SameSite** cookies so XSS cannot exfiltrate them. `localStorage` tokens are readable by any injected script — unacceptable for a fund-moving surface.
- **CSRF.** Cookie-borne auth means the API needs CSRF defence: `SameSite=Lax/Strict` on the session cookie (blocks the common cross-site POST), plus a **double-submit CSRF token** or an **`Origin`/`Referer` allowlist check** on all mutating routes. Strict CORS (never `*` on authenticated routes — TR-6.2.6) is the partner: keep the browser API same-origin, gate any cross-origin caller through the FR-19 API-key path, not cookies.
- **SIWE-specific:** server-issued, single-use, expiring **nonce** (prevents replay); verify the **domain/chainId/issued-at** fields of the EIP-4361 message (prevents a signature captured on another dapp being replayed here); rate-limit the verify endpoint.
- **Generic failures, typed errors.** `401` for unauthenticated with a **generic body** (no "user not found" vs "bad password" leakage), `403` for authenticated-but-unauthorized (TR-6.2.4/6.6). Log repeated auth failures for monitoring — the releaser-adjacent routes are the highest-value target (TR-6.2.6, §9.1).
- **Impersonation ("dev view-as").** Currently a client-only preview. If it survives into production it must be a **server-issued, scoped, audited** session — never a client flag the API trusts — and must be **read-only** (the API refuses impersonated mutations). Otherwise it is a privilege-escalation backdoor.

---

## 6. Open sub-decisions to raise with the team

1. **Stateless JWT vs. server-side sessions.** JWTs are simple and stateless but hard to revoke before expiry; opaque server sessions revoke instantly but need a session store. **Lean:** short-TTL JWT + refresh, with a small revocation list for the releaser-adjacent (operator/staff) roles. Confirm.
2. **Staff identity provider.** Roll-our-own email+password vs. OIDC/SSO (Google Workspace / Auth0 / Clerk) for admin/developer. **Lean:** OIDC — staff auth is not where we want to hand-roll crypto. Confirm provider.
3. **Is SIWE the *only* login for principals, or also email+password?** SIWE binds identity to the funding wallet (strong) but excludes a buyer who wants to log in before linking a wallet. **Lean:** allow account-first email login, require a linked+proven wallet before any *on-chain* action. Confirm.
4. **Per-deal party binding in the store.** Deal-scoped authZ (TR-6.2.5) needs the store to record each deal's buyer/seller accountId — the single-deal demo store doesn't yet. Sequence this with the multi-deal work (FR-18).
5. **Platform/intermediary rights boundary.** Confirm the scope: initiation/coordination only, **never** deposit/approve/release (TR-6.2.5). Encode as an explicit allow-list, not "everything a client can do minus wallet."
6. **When does `assertLocalReleaser` get lifted?** It must be replaced by real operator-auth + server-secret key **in the same change**, gated on Step 4 above — never removed on its own. Agree the ordering so the tripwire is never dropped before its replacement lands.
7. **Partner API-key scheme (FR-19) interaction.** TR-6.2.4 already specifies header-borne, hashed, rotatable API keys for service/partner access. Confirm these are a **parallel** auth path (no cookies, no CSRF concern) and never mint a browser session.

---

*End — this document resolves the mechanism half of TRD §12 Q18. The integration model (AP-9) and role model (Q5) are already settled; on team sign-off, mark Q18 resolved and update TR-6.2.4 to name the chosen mechanism.*
