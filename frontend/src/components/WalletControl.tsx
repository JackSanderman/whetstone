'use client';

import { motion } from 'framer-motion';
import { Plug, Power, TriangleAlert } from 'lucide-react';
import { WalletState } from '@/hooks/useWallet';
import { shortAddress } from '@/lib/format';

// Compact wallet control that lives at the foot of the vertical tool-rail.
export function WalletControl({ wallet }: { wallet: WalletState }) {
  if (!wallet.address) {
    return (
      <div className="flex flex-col items-center gap-2">
        <motion.button
          type="button"
          onClick={wallet.connect}
          disabled={wallet.connecting}
          whileTap={{ scale: 0.94 }}
          className="flex h-11 w-11 items-center justify-center rounded-sm bg-hone text-[#04121c] transition-colors hover:bg-[#6bcdff] disabled:opacity-60"
          aria-label="Connect wallet"
          title="Connect wallet"
        >
          <Plug className="h-5 w-5" aria-hidden />
        </motion.button>
        {wallet.error && (
          <span className="max-w-[64px] text-center text-[9px] leading-tight text-[#ff8a8a]">
            {wallet.error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      {!wallet.onChain && (
        <span title="Wrong network" aria-label="Wrong network">
          <TriangleAlert className="h-4 w-4 text-spark" aria-hidden />
        </span>
      )}
      <span
        className="numeral text-[10px] leading-none text-hone"
        title={wallet.address}
        aria-label={`Connected wallet ${wallet.address}`}
      >
        {shortAddress(wallet.address, 2)}
      </span>
      {wallet.balance !== null && (
        <span className="numeral text-[9px] leading-none text-ash" title="GEN balance">
          {wallet.balance}
        </span>
      )}
      <button
        type="button"
        onClick={wallet.disconnect}
        className="mt-0.5 text-faint transition-colors hover:text-chalk"
        aria-label="Disconnect wallet"
        title="Disconnect"
      >
        <Power className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
