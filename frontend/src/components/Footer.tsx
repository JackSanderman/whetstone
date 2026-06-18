'use client';

import { CONTRACT_ADDRESS, EXPLORER, FAUCET, IS_DEPLOYED } from '@/lib/contract';
import { shortAddress } from '@/lib/format';

// A SINGLE one-line mono status strip: network, contract, faucet. No columns.
export function Footer() {
  return (
    <footer className="border-t border-[var(--hairline)] bg-[var(--machined)] px-6 py-3">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px] text-faint">
        <span className="text-ash">WHETSTONE</span>
        <span aria-hidden>/</span>
        <span>net: GenLayer Bradbury (4221)</span>
        <span aria-hidden>/</span>
        <span>
          bench:{' '}
          {IS_DEPLOYED ? (
            <a
              href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="text-hone hover:underline"
            >
              {shortAddress(CONTRACT_ADDRESS, 6)}
            </a>
          ) : (
            <span className="text-spark">awaiting deploy</span>
          )}
        </span>
        <span aria-hidden>/</span>
        <a href={FAUCET} target="_blank" rel="noreferrer" className="text-hone hover:underline">
          faucet
        </a>
      </div>
    </footer>
  );
}
