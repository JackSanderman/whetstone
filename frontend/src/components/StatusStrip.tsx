'use client';

import { motion } from 'framer-motion';
import { Stats } from '@/lib/contract';
import { formatFigure } from '@/lib/format';

interface StatusStripProps {
  stats: Stats | null;
  walletLabel: string;
  onChain: boolean;
  connected: boolean;
}

const ITEMS: { key: keyof Stats; label: string }[] = [
  { key: 'pieces', label: 'pieces forged' },
  { key: 'attempts', label: 'drafts honed' },
  { key: 'sealed', label: 'sealed works' },
];

// Top status section: a row of live, chain-derived figures plus the connection
// read. This is the first thing on the page, before the bench.
export function StatusStrip({ stats, walletLabel, onChain, connected }: StatusStripProps) {
  return (
    <section
      className="border-b border-[var(--hairline)] px-6 py-4"
      aria-label="Bench status"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {ITEMS.map((it) => (
            <div key={it.key} className="flex items-baseline gap-2">
              <motion.span
                key={stats ? stats[it.key] : -1}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="numeral text-2xl text-chalk"
              >
                {stats ? formatFigure(stats[it.key]) : '--'}
              </motion.span>
              <span className="eyebrow">{it.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span
            className={`h-2 w-2 rounded-full ${connected && onChain ? 'bg-hone' : connected ? 'bg-spark' : 'bg-faint'}`}
            aria-hidden
          />
          <span className="text-ash">
            {connected ? (onChain ? walletLabel : 'wrong network') : 'wallet idle'}
          </span>
        </div>
      </div>
    </section>
  );
}
