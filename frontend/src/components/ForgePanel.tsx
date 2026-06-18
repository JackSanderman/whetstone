'use client';

import { useState } from 'react';
import { Plug } from 'lucide-react';
import { LIMITS } from '@/lib/contract';
import { WalletState } from '@/hooks/useWallet';

interface ForgePanelProps {
  wallet: WalletState;
  busy: boolean;
  onForge: (title: string, craftTarget: string) => void;
}

// Forge a new piece: name + craft target. Deterministic write, no consensus.
export function ForgePanel({ wallet, busy, onForge }: ForgePanelProps) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');

  const titleOk = title.trim().length >= LIMITS.title.min && title.trim().length <= LIMITS.title.max;
  const targetOk =
    target.trim().length >= LIMITS.target.min && target.trim().length <= LIMITS.target.max;
  const ready = titleOk && targetOk && !busy;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    onForge(title.trim(), target.trim());
    setTitle('');
    setTarget('');
  };

  return (
    <section
      id="forge"
      className="border-b border-[var(--hairline)] px-6 py-16"
      aria-label="Forge a new piece"
    >
      <div className="mx-auto w-full max-w-3xl">
        <span className="eyebrow">Set fresh stock</span>
        <h2 className="mt-3 text-3xl text-chalk sm:text-4xl">Forge a piece</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ash">
          Name what you are making and state the craft target precisely. The sharper the target, the
          sharper the assessor can judge each draft against it.
        </p>
        <hr className="rule-machined my-8" />

        {!wallet.address ? (
          <div className="machined rounded-md p-6 text-center">
            <p className="text-sm text-ash">Connect a wallet to forge a piece on the bench.</p>
            <button
              type="button"
              onClick={wallet.connect}
              disabled={wallet.connecting}
              className="mt-4 inline-flex items-center gap-2 rounded-sm bg-hone px-5 py-2.5 text-sm font-bold text-[#04121c] transition-colors hover:bg-[#6bcdff] disabled:opacity-60"
            >
              <Plug className="h-4 w-4" aria-hidden />
              {wallet.connecting ? 'Connecting' : 'Connect wallet'}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="forge-title" className="eyebrow">
                Piece title
              </label>
              <input
                id="forge-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={LIMITS.title.max}
                placeholder="e.g. Haiku for first frost"
                className="mt-2 w-full rounded-sm border border-[var(--hairline-strong)] bg-[var(--groove)] px-3 py-2.5 text-base text-chalk placeholder:text-faint focus:border-hone"
                aria-describedby="forge-title-count"
              />
              <p id="forge-title-count" className="mt-1 text-right font-mono text-[11px] text-faint">
                {title.trim().length}/{LIMITS.title.max}
              </p>
            </div>

            <div>
              <label htmlFor="forge-target" className="eyebrow">
                Craft target
              </label>
              <textarea
                id="forge-target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                maxLength={LIMITS.target.max}
                rows={3}
                placeholder="What must a finished draft achieve? Be specific about form, tone, and constraints."
                className="mt-2 w-full resize-y rounded-sm border border-[var(--hairline-strong)] bg-[var(--groove)] px-3 py-2.5 text-base leading-relaxed text-chalk placeholder:text-faint focus:border-hone"
                aria-describedby="forge-target-count"
              />
              <p id="forge-target-count" className="mt-1 text-right font-mono text-[11px] text-faint">
                {target.trim().length}/{LIMITS.target.max}
              </p>
            </div>

            <button
              type="submit"
              disabled={!ready}
              className="inline-flex items-center gap-2 rounded-sm bg-hone px-6 py-3 text-sm font-bold text-[#04121c] transition-colors hover:bg-[#6bcdff] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? 'Forging' : 'Forge piece'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
