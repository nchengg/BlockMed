import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { keccak256, toHex } from "viem";
import {
  deployFixture,
  createDemoDeal,
  fundDemoDeal,
  DEAL_ID,
  AMOUNT,
  State,
} from "./helpers.js";

const { viem } = await network.getOrCreate();

describe("Escrow — state guards & creation validation (TR-3.3, TR-3.7)", () => {
  it("rejects createDeal with zero amount, same party, or a used dealId", async () => {
    const f = await deployFixture(viem);

    await assert.rejects(
      f.escrow.write.createDeal(
        [DEAL_ID, f.buyer.account.address, f.seller.account.address, 0n],
        { account: f.releaser.account },
      ),
      /ZeroAmount/,
    );
    await assert.rejects(
      f.escrow.write.createDeal(
        [DEAL_ID, f.buyer.account.address, f.buyer.account.address, AMOUNT],
        { account: f.releaser.account },
      ),
      /SameParty/,
    );

    await createDemoDeal(f);
    await assert.rejects(createDemoDeal(f), /DealExists/);
  });

  it("rejects every transition attempted from the wrong state", async () => {
    const f = await deployFixture(viem);
    const unknownDeal = keccak256(toHex("no-such-deal"));

    // Draft (uncreated): deposit / recordVerdict / release / refund all invalid
    await assert.rejects(
      f.escrow.write.deposit([unknownDeal], { account: f.buyer.account }),
      /InvalidState/,
    );
    await assert.rejects(
      f.escrow.write.recordVerdict([unknownDeal], {
        account: f.releaser.account,
      }),
      /InvalidState/,
    );
    await assert.rejects(
      f.escrow.write.release([unknownDeal], { account: f.outsider.account }),
      /InvalidState/,
    );
    await assert.rejects(
      f.escrow.write.refund([unknownDeal], { account: f.admin.account }),
      /InvalidState/,
    );

    // Agreed: recordVerdict / release / refund invalid before funding
    await createDemoDeal(f);
    await assert.rejects(
      f.escrow.write.recordVerdict([DEAL_ID], { account: f.releaser.account }),
      /InvalidState/,
    );
    await assert.rejects(
      f.escrow.write.release([DEAL_ID], { account: f.seller.account }),
      /InvalidState/,
    );
    await assert.rejects(
      f.escrow.write.refund([DEAL_ID], { account: f.admin.account }),
      /InvalidState/,
    );

    // Funded: release invalid without a recorded verdict; double deposit invalid
    await fundDemoDeal(f);
    await assert.rejects(
      f.escrow.write.release([DEAL_ID], { account: f.seller.account }),
      /InvalidState/,
    );
    await assert.rejects(
      f.escrow.write.deposit([DEAL_ID], { account: f.buyer.account }),
      /InvalidState/,
    );

    // ReleasePending: refund invalid (verdict is the point of no return, AP-7);
    // duplicate recordVerdict invalid (idempotency backstop, TR-4.6.5)
    await f.escrow.write.recordVerdict([DEAL_ID], {
      account: f.releaser.account,
    });
    await assert.rejects(
      f.escrow.write.refund([DEAL_ID], { account: f.admin.account }),
      /InvalidState/,
    );
    await assert.rejects(
      f.escrow.write.recordVerdict([DEAL_ID], { account: f.releaser.account }),
      /InvalidState/,
    );

    // Released is terminal: no second release, no refund
    await f.escrow.write.release([DEAL_ID], { account: f.seller.account });
    await assert.rejects(
      f.escrow.write.release([DEAL_ID], { account: f.seller.account }),
      /InvalidState/,
    );
    await assert.rejects(
      f.escrow.write.refund([DEAL_ID], { account: f.admin.account }),
      /InvalidState/,
    );
  });
});
