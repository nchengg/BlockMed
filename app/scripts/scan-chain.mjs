// A minimal block explorer for the local Hardhat chain.
//
// The local node is a bare JSON-RPC endpoint with no web UI, and public
// explorers (Basescan et al) cannot see 127.0.0.1 — so audit-trail hashes have
// nothing to link to during the demo. This walks every block, decodes each
// call against the Escrow and MockUSDC ABIs, and prints it in reading order.
//
// Read-only: it sends no transactions and changes nothing.
//
//   node scripts/scan-chain.mjs            # all activity
//   node scripts/scan-chain.mjs 0x5bf3…    # only one deal's transactions
import { createPublicClient, http, formatUnits, decodeFunctionData } from 'viem';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const dep = JSON.parse(readFileSync(path.join(root, '..', 'contracts', 'deployments', 'local.json'), 'utf8'));
const escrowAbi = JSON.parse(readFileSync(path.join(root, 'lib/escrow/abi/Escrow.json'), 'utf8')).abi;
const usdcAbi = JSON.parse(readFileSync(path.join(root, 'lib/escrow/abi/MockUSDC.json'), 'utf8')).abi;

const filter = process.argv[2]?.toLowerCase();
const pc = createPublicClient({ transport: http(dep.rpcUrl) });

/** Addresses are unreadable; the demo only has four that matter. */
function label(address) {
  if (!address) return '(deploy)';
  const known = Object.entries(dep.accounts).find(([, v]) => v.toLowerCase() === address.toLowerCase());
  if (known) return known[0];
  if (address.toLowerCase() === dep.escrow.toLowerCase()) return 'Escrow';
  if (address.toLowerCase() === dep.usdc.toLowerCase()) return 'USDC';
  return address.slice(0, 10) + '…';
}

/** Amounts are 6-decimal USDC minor units; deal ids are bytes32. */
function renderArg(a) {
  if (typeof a === 'bigint') return formatUnits(a, 6);
  if (typeof a === 'string' && a.length === 42 && a.startsWith('0x')) return label(a);
  if (typeof a === 'string' && a.length === 66) return a.slice(0, 10) + '…';
  return String(a);
}

function decode(tx) {
  if (!tx.to) return { text: '(contract deployment)', raw: '' };
  const abi = tx.to.toLowerCase() === dep.escrow.toLowerCase() ? escrowAbi
    : tx.to.toLowerCase() === dep.usdc.toLowerCase() ? usdcAbi : null;
  if (!abi || tx.input === '0x') return { text: '(plain transfer)', raw: '' };
  try {
    const d = decodeFunctionData({ abi, data: tx.input });
    return {
      text: `${d.functionName}(${(d.args ?? []).map(renderArg).join(', ')})`,
      raw: (d.args ?? []).map(String).join(' '),
    };
  } catch {
    return { text: `unrecognised call (${tx.input.slice(0, 10)})`, raw: '' };
  }
}

const latest = Number(await pc.getBlockNumber());
let shown = 0;

console.log(`\nLocal chain @ ${dep.rpcUrl} — ${latest} blocks`);
console.log(`Escrow ${dep.escrow}\nUSDC   ${dep.usdc}\n`);

for (let n = 1; n <= latest; n++) {
  const block = await pc.getBlock({ blockNumber: BigInt(n), includeTransactions: true });
  for (const tx of block.transactions) {
    const { text, raw } = decode(tx);
    // Filter on the raw args so a partial deal id still matches.
    if (filter && !raw.toLowerCase().includes(filter) && !tx.hash.toLowerCase().includes(filter)) continue;
    const receipt = await pc.getTransactionReceipt({ hash: tx.hash });
    const mark = receipt.status === 'success' ? ' ' : '✗';
    const time = new Date(Number(block.timestamp) * 1000).toISOString().slice(11, 19);
    console.log(`${mark} #${String(n).padStart(3)}  ${time}  ${label(tx.from).padEnd(9)} → ${label(tx.to).padEnd(8)} ${text}`);
    console.log(`       ${tx.hash}`);
    shown++;
  }
}

if (filter && shown === 0) console.log(`No transactions matching "${filter}".`);

console.log('\nUSDC balances:');
for (const [name, addr] of Object.entries({ ...dep.accounts, escrow: dep.escrow })) {
  const bal = await pc.readContract({ address: dep.usdc, abi: usdcAbi, functionName: 'balanceOf', args: [addr] });
  console.log(`  ${name.padEnd(9)} ${formatUnits(bal, 6).padStart(12)} USDC`);
}
console.log('');
