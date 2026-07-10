import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import {
  deployFixture,
  createDemoDeal,
  fundDemoDeal,
  DEAL_ID,
  AMOUNT,
  State,
} from "./helpers.js";

const { viem } = await network.getOrCreate();

async function toReleasePending(f: any) {
  await createDemoDeal(f);
  await fundDemoDeal(f);
  await f.escrow.write.recordVerdict([DEAL_ID], {
    account: f.releaser.account,
  });
}

describe("Escrow — permissionless release & pause backstop (TR-3.8)", () => {
  it("lets an uninvolved third party trigger release from ReleasePending", async () => {
    const f = await deployFixture(viem);
    await toReleasePending(f);

    // outsider holds no role and is not a deal party — release must still succeed,
    // and must still pay the recorded seller, not the caller
    await f.escrow.write.release([DEAL_ID], { account: f.outsider.account });

    assert.equal(await f.escrow.read.state([DEAL_ID]), State.Released);
    assert.equal(
      await f.usdc.read.balanceOf([f.seller.account.address]),
      AMOUNT,
    );
    assert.equal(
      await f.usdc.read.balanceOf([f.outsider.account.address]),
      0n,
    );
  });

  it("pause halts every fund-moving function — including third-party release", async () => {
    const f = await deployFixture(viem);
    await toReleasePending(f);
    await f.escrow.write.pause({ account: f.admin.account });

    // the backstop test the TRD calls out: pause MUST stop an in-flight
    // permissionless release, or the emergency control is unverified
    await assert.rejects(
      f.escrow.write.release([DEAL_ID], { account: f.outsider.account }),
      /EnforcedPause/,
    );
    await assert.rejects(
      f.escrow.write.refund([DEAL_ID], { account: f.admin.account }),
      /EnforcedPause/,
    );

    // deposit blocked too (fresh deal held at Agreed)
    const f2 = await deployFixture(viem);
    await createDemoDeal(f2);
    await f2.escrow.write.pause({ account: f2.admin.account });
    await f2.usdc.write.mint([f2.buyer.account.address, AMOUNT]);
    await f2.usdc.write.approve([f2.escrow.address, AMOUNT], {
      account: f2.buyer.account,
    });
    await assert.rejects(
      f2.escrow.write.deposit([DEAL_ID], { account: f2.buyer.account }),
      /EnforcedPause/,
    );
  });

  it("unpause restores release and the seller is paid", async () => {
    const f = await deployFixture(viem);
    await toReleasePending(f);
    await f.escrow.write.pause({ account: f.admin.account });
    await f.escrow.write.unpause({ account: f.admin.account });

    await f.escrow.write.release([DEAL_ID], { account: f.outsider.account });
    assert.equal(await f.escrow.read.state([DEAL_ID]), State.Released);
    assert.equal(
      await f.usdc.read.balanceOf([f.seller.account.address]),
      AMOUNT,
    );
  });
});
