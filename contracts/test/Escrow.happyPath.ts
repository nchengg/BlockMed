import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { getAddress } from "viem";
import {
  deployFixture,
  createDemoDeal,
  fundDemoDeal,
  DEAL_ID,
  AMOUNT,
  State,
} from "./helpers.js";

const { viem } = await network.getOrCreate();

describe("Escrow — happy path (TR-3.8)", () => {
  it("walks createDeal → deposit → recordVerdict → release and pays the seller", async () => {
    const f = await deployFixture(viem);

    // createDeal: Draft → Agreed, deal recorded
    await createDemoDeal(f);
    assert.equal(await f.escrow.read.state([DEAL_ID]), State.Agreed);
    const [buyer, seller, amount] = await f.escrow.read.deals([DEAL_ID]);
    assert.equal(getAddress(buyer), getAddress(f.buyer.account.address));
    assert.equal(getAddress(seller), getAddress(f.seller.account.address));
    assert.equal(amount, AMOUNT);

    // deposit: Agreed → Funded, contract custodies the funds (AP-3)
    await fundDemoDeal(f);
    assert.equal(await f.escrow.read.state([DEAL_ID]), State.Funded);
    assert.equal(await f.usdc.read.balanceOf([f.escrow.address]), AMOUNT);
    assert.equal(await f.usdc.read.balanceOf([f.buyer.account.address]), 0n);

    // recordVerdict (releaser): Funded → ReleasePending
    await f.escrow.write.recordVerdict([DEAL_ID], {
      account: f.releaser.account,
    });
    assert.equal(await f.escrow.read.state([DEAL_ID]), State.ReleasePending);

    // release: ReleasePending → Released, seller balance increases by amount
    await f.escrow.write.release([DEAL_ID], { account: f.seller.account });
    assert.equal(await f.escrow.read.state([DEAL_ID]), State.Released);
    assert.equal(
      await f.usdc.read.balanceOf([f.seller.account.address]),
      AMOUNT,
    );
    assert.equal(await f.usdc.read.balanceOf([f.escrow.address]), 0n);
  });
});
