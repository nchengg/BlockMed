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

describe("Escrow — access control (TR-3.8)", () => {
  it("rejects createDeal from a non-releaser", async () => {
    const f = await deployFixture(viem);
    await assert.rejects(
      f.escrow.write.createDeal(
        [DEAL_ID, f.buyer.account.address, f.seller.account.address, AMOUNT],
        { account: f.outsider.account },
      ),
      /AccessControlUnauthorizedAccount/,
    );
  });

  it("rejects recordVerdict from a non-releaser", async () => {
    const f = await deployFixture(viem);
    await createDemoDeal(f);
    await fundDemoDeal(f);
    await assert.rejects(
      f.escrow.write.recordVerdict([DEAL_ID], { account: f.outsider.account }),
      /AccessControlUnauthorizedAccount/,
    );
    // admin holds DEFAULT_ADMIN_ROLE but not RELEASER_ROLE — must also be rejected
    await assert.rejects(
      f.escrow.write.recordVerdict([DEAL_ID], { account: f.admin.account }),
      /AccessControlUnauthorizedAccount/,
    );
  });

  it("rejects deposit from anyone but the recorded buyer", async () => {
    const f = await deployFixture(viem);
    await createDemoDeal(f);
    await assert.rejects(
      f.escrow.write.deposit([DEAL_ID], { account: f.outsider.account }),
      /NotBuyer/,
    );
    await assert.rejects(
      f.escrow.write.deposit([DEAL_ID], { account: f.seller.account }),
      /NotBuyer/,
    );
  });

  it("rejects refund from an account with neither releaser nor admin role", async () => {
    const f = await deployFixture(viem);
    await createDemoDeal(f);
    await fundDemoDeal(f);
    await assert.rejects(
      f.escrow.write.refund([DEAL_ID], { account: f.outsider.account }),
      /NotAuthorised/,
    );
    await assert.rejects(
      f.escrow.write.refund([DEAL_ID], { account: f.buyer.account }),
      /NotAuthorised/,
    );
  });

  it("rejects pause/unpause from a non-admin", async () => {
    const f = await deployFixture(viem);
    await assert.rejects(
      f.escrow.write.pause({ account: f.releaser.account }),
      /AccessControlUnauthorizedAccount/,
    );
    await f.escrow.write.pause({ account: f.admin.account });
    await assert.rejects(
      f.escrow.write.unpause({ account: f.outsider.account }),
      /AccessControlUnauthorizedAccount/,
    );
  });

  it("lets the admin rotate the releaser key (TR-3.2-roles)", async () => {
    const f = await deployFixture(viem);
    const RELEASER_ROLE = await f.escrow.read.RELEASER_ROLE();

    await f.escrow.write.revokeRole(
      [RELEASER_ROLE, f.releaser.account.address],
      { account: f.admin.account },
    );
    await f.escrow.write.grantRole([RELEASER_ROLE, f.outsider.account.address], {
      account: f.admin.account,
    });

    // old key rejected, new key works
    await assert.rejects(
      f.escrow.write.createDeal(
        [DEAL_ID, f.buyer.account.address, f.seller.account.address, AMOUNT],
        { account: f.releaser.account },
      ),
      /AccessControlUnauthorizedAccount/,
    );
    await f.escrow.write.createDeal(
      [DEAL_ID, f.buyer.account.address, f.seller.account.address, AMOUNT],
      { account: f.outsider.account },
    );
    assert.equal(await f.escrow.read.state([DEAL_ID]), State.Agreed);
  });
});
