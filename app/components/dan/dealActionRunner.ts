// One dispatcher for every lifecycle action a deal can trigger, shared by the
// deals list and the deal page so both drive the API identically.
import {
  acceptDeal, fund, submitDocuments, approveRelease, objectToRelease,
  finaliseRelease, release, refund, withdrawObjection, type ActorCtx,
} from '@/lib/escrow/client';
import type { PostFundAction } from './DealActions';
import { fundWithWallet, type FundProgress } from '@/lib/escrow/fundWithWallet';
import { hasWallet } from '@/lib/wallet/browser';

export type DealAction = 'accept' | 'decline' | 'fund' | PostFundAction;

export type ActionResult = {
  ok: boolean;
  error?: string;
  verdict?: string;
  rules?: { rule: string; pass: boolean }[];
};

/** What the runner needs beyond the API actor: whether to use the user's wallet. */
export type DealActor = ActorCtx & {
  walletLinked?: boolean;
  onFundProgress?: (p: FundProgress) => void;
};

export async function runDealAction(
  dealId: string,
  action: DealAction,
  actor: DealActor,
): Promise<ActionResult> {
  if (action === 'accept') return acceptDeal(dealId, actor);
  if (action === 'decline') return acceptDeal(dealId, actor, { decline: true });
  // Funding goes through the buyer's own wallet when one is linked: the money
  // is theirs, so the signature should be theirs. Falls back to the server-signed
  // path for deals bound to the shared demo wallets (and when no wallet is
  // present), so older deals and the no-MetaMask demo keep working.
  if (action === 'fund') {
    if (actor.walletLinked && hasWallet()) {
      const r = await fundWithWallet(dealId, actor.onFundProgress);
      return r.ok ? { ok: true } : { ok: false, error: r.error };
    }
    return fund(dealId, actor);
  }
  switch (action.kind) {
    case 'submit-documents': return submitDocuments(dealId, action.pack, actor);
    case 'approve-release': return approveRelease(dealId, actor);
    case 'object': return objectToRelease(dealId, action.ground, action.detail, actor);
    case 'finalise-release': return finaliseRelease(dealId, actor);
    case 'release': return release(dealId, actor);
    case 'refund': return refund(dealId, actor, action.reason);
    case 'withdraw-objection': return withdrawObjection(dealId, actor, action.reason);
  }
}
