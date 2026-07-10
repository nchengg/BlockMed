import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import {
  deployFixture,
  createDemoDeal,
  fundDemoDeal,
  DEAL_ID,
  State,
} from "./helpers.js";

const { viem } = await network.getOrCreate();

describe("Escrow — admin cancel (TR-3.4)", () => {
  it("admin can cancel an Agreed (unfunded) deal", async () => {
    const f = await deployFixture(viem);
    await createDemoDeal(f);
    await f.escrow.write.cancel([DEAL_ID], { account: f.admin.account });
    assert.equal(await f.escrow.read.state([DEAL_ID]), State.Cancelled);
  });

  it("rejects cancel from non-admins (incl. the releaser and the parties)", async () => {
    const f = await deployFixture(viem);
    await createDemoDeal(f);
    for (const who of [f.releaser, f.buyer, f.seller, f.outsider]) {
      await assert.rejects(
        f.escrow.write.cancel([DEAL_ID], { account: who.account }),
        /AccessControlUnauthorizedAccount/,
      );
    }
  });

  it("cannot cancel once funded — locked money is never cancellable out from under the parties", async () => {
    const f = await deployFixture(viem);
    await createDemoDeal(f);
    await fundDemoDeal(f);
    await assert.rejects(
      f.escrow.write.cancel([DEAL_ID], { account: f.admin.account }),
      /InvalidState/,
    );
    // ...and likewise from ReleasePending
    await f.escrow.write.recordVerdict([DEAL_ID], { account: f.releaser.account });
    await assert.rejects(
      f.escrow.write.cancel([DEAL_ID], { account: f.admin.account }),
      /InvalidState/,
    );
  });

  it("cannot cancel an uncreated (Draft) deal", async () => {
    const f = await deployFixture(viem);
    await assert.rejects(
      f.escrow.write.cancel([DEAL_ID], { account: f.admin.account }),
      /InvalidState/,
    );
  });

  it("Cancelled is terminal: the buyer cannot deposit into a cancelled deal", async () => {
    const f = await deployFixture(viem);
    await createDemoDeal(f);
    await f.escrow.write.cancel([DEAL_ID], { account: f.admin.account });
    await f.usdc.write.mint([f.buyer.account.address, 100_000_000n]);
    await f.usdc.write.approve([f.escrow.address, 100_000_000n], {
      account: f.buyer.account,
    });
    await assert.rejects(
      f.escrow.write.deposit([DEAL_ID], { account: f.buyer.account }),
      /InvalidState/,
    );
  });

  it("cancel works while paused (incident response: pause first, then unwind unfunded deals)", async () => {
    const f = await deployFixture(viem);
    await createDemoDeal(f);
    await f.escrow.write.pause({ account: f.admin.account });
    await f.escrow.write.cancel([DEAL_ID], { account: f.admin.account });
    assert.equal(await f.escrow.read.state([DEAL_ID]), State.Cancelled);
  });
});
