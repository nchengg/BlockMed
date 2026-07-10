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

describe("Escrow — refund escape hatch (TR-3.8)", () => {
  it("lets the admin refund a Funded deal back to the buyer", async () => {
    const f = await deployFixture(viem);
    await createDemoDeal(f);
    await fundDemoDeal(f);
    assert.equal(await f.usdc.read.balanceOf([f.buyer.account.address]), 0n);

    await f.escrow.write.refund([DEAL_ID], { account: f.admin.account });

    assert.equal(await f.escrow.read.state([DEAL_ID]), State.Refunded);
    assert.equal(
      await f.usdc.read.balanceOf([f.buyer.account.address]),
      AMOUNT,
    );
    assert.equal(await f.usdc.read.balanceOf([f.escrow.address]), 0n);
  });

  it("lets the releaser refund a Funded deal", async () => {
    const f = await deployFixture(viem);
    await createDemoDeal(f);
    await fundDemoDeal(f);

    await f.escrow.write.refund([DEAL_ID], { account: f.releaser.account });

    assert.equal(await f.escrow.read.state([DEAL_ID]), State.Refunded);
    assert.equal(
      await f.usdc.read.balanceOf([f.buyer.account.address]),
      AMOUNT,
    );
  });

  it("Refunded is terminal — no deposit, verdict, release, or second refund", async () => {
    const f = await deployFixture(viem);
    await createDemoDeal(f);
    await fundDemoDeal(f);
    await f.escrow.write.refund([DEAL_ID], { account: f.admin.account });

    await assert.rejects(
      f.escrow.write.deposit([DEAL_ID], { account: f.buyer.account }),
      /InvalidState/,
    );
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
  });
});
