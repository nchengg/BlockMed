// One dispatcher for every lifecycle action a deal can trigger, shared by the
// deals list and the deal page so both drive the API identically.
import {
  acceptDeal, fund, submitBol, approveRelease, objectToRelease,
  finaliseRelease, release, refund, withdrawObjection, type ActorCtx,
} from '@/lib/escrow/client';
import type { PostFundAction } from './DealActions';

export type DealAction = 'accept' | 'decline' | 'fund' | PostFundAction;

export type ActionResult = {
  ok: boolean;
  error?: string;
  verdict?: string;
  rules?: { rule: string; pass: boolean }[];
};

export async function runDealAction(
  dealId: string,
  action: DealAction,
  actor: ActorCtx,
): Promise<ActionResult> {
  if (action === 'accept') return acceptDeal(dealId, actor);
  if (action === 'decline') return acceptDeal(dealId, actor, { decline: true });
  if (action === 'fund') return fund(dealId, actor);
  switch (action.kind) {
    case 'submit-bol': return submitBol(dealId, action.fields, actor);
    case 'approve-release': return approveRelease(dealId, actor);
    case 'object': return objectToRelease(dealId, action.ground, action.detail, actor);
    case 'finalise-release': return finaliseRelease(dealId, actor);
    case 'release': return release(dealId, actor);
    case 'refund': return refund(dealId, actor, action.reason);
    case 'withdraw-objection': return withdrawObjection(dealId, actor, action.reason);
  }
}
