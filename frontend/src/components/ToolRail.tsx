'use client';

import { WalletState } from '@/hooks/useWallet';
import { WalletControl } from './WalletControl';

// The slim LEFT vertical tool-rail: the mark at the top, the wallet control at
// the foot. This is the app-shell header, deliberately not a top bar.
export function ToolRail({ wallet }: { wallet: WalletState }) {
  return (
    <div className="flex h-full flex-col items-center justify-between border-r border-[var(--hairline)] bg-[var(--machined)] py-5">
      <div className="flex flex-col items-center gap-3">
        <a
          href="#bench"
          className="group flex flex-col items-center"
          aria-label="WHETSTONE, jump to the bench"
        >
          {/* the mark: a honed edge angle */}
          <span className="relative flex h-10 w-10 items-center justify-center rounded-sm bg-[var(--groove)] bevel">
            <span className="block h-5 w-5 rotate-45 border-b-2 border-r-2 border-hone" aria-hidden />
          </span>
        </a>
        <span
          className="stencil text-[10px] tracking-[0.18em] text-ash"
          style={{ writingMode: 'vertical-rl' }}
        >
          WHETSTONE
        </span>
      </div>

      <div
        className="numeral hidden text-[9px] tracking-tight text-faint sm:block"
        style={{ writingMode: 'vertical-rl' }}
        aria-hidden
      >
        HONING BENCH
      </div>

      <WalletControl wallet={wallet} />
    </div>
  );
}
