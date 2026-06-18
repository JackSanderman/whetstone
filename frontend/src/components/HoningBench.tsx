'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { LIMITS, Piece } from '@/lib/contract';
import { WalletState } from '@/hooks/useWallet';
import { TxState } from '@/hooks/useTransaction';
import { shortAddress, statusMeta } from '@/lib/format';
import { ScoreSpine } from './ScoreSpine';
import { ConsensusStage } from './ConsensusStage';
import { AttemptRow } from './AttemptRow';

interface HoningBenchProps {
  pieces: Piece[];
  selected: Piece | null;
  wallet: WalletState;
  temperTx: TxState;
  temperingId: string | null;
  freshAttemptN: number | null;
  onSelect: (id: string) => void;
  onTemper: (piece: Piece, draft: string) => void;
}

// The hero IS the live chain data: the active piece's honing bench, dominated
// by a giant rising score numeral against the vertical seal-bar spine.
export function HoningBench({
  pieces,
  selected,
  wallet,
  temperTx,
  temperingId,
  freshAttemptN,
  onSelect,
  onTemper,
}: HoningBenchProps) {
  const [draft, setDraft] = useState('');

  const tempering =
    !!selected &&
    temperingId === selected.id &&
    ['wallet', 'submitted', 'consensus'].includes(temperTx.phase);

  // While honing, ride the live leader-peek score; otherwise show best.
  const heroScore = useMemo(() => {
    if (tempering && temperTx.draft) return temperTx.draft.score;
    return selected?.best_score ?? 0;
  }, [tempering, temperTx.draft, selected]);

  const draftOk = draft.trim().length >= LIMITS.draft.min && draft.trim().length <= LIMITS.draft.max;

  if (!selected) return null;

  const meta = statusMeta(selected.status);
  const sealed = selected.status === 'SEALED';
  const lineage = [...selected.attempts].reverse(); // newest first for display

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftOk || tempering) return;
    onTemper(selected, draft.trim());
    setDraft('');
  };

  return (
    <section id="bench" className="px-6 py-12" aria-label="The honing bench">
      <div className="mx-auto w-full max-w-6xl">
        {/* piece switcher */}
        {pieces.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Pieces on the bench">
            {pieces.map((p) => {
              const active = p.id === selected.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelect(p.id)}
                  className={`flex items-center gap-2 rounded-sm border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? 'border-hone bg-hone/10 text-chalk'
                      : 'border-[var(--hairline)] text-ash hover:text-chalk'
                  }`}
                >
                  {p.status === 'SEALED' && <Lock className="h-3 w-3 text-spark" aria-hidden />}
                  <span className="max-w-[160px] truncate">{p.title}</span>
                  <span className="numeral text-[10px] text-faint">{p.best_score}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_minmax(0,0.85fr)]">
          {/* left: identity + giant numeral + spine */}
          <div className="raised bevel relative overflow-hidden rounded-md p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <span
                className="stencil rounded-sm px-2 py-0.5 text-[10px] tracking-[0.18em]"
                style={{ color: meta.color, background: 'rgba(255,255,255,0.04)' }}
              >
                {meta.label}
              </span>
              <span className="font-mono text-[11px] text-faint">{selected.id}</span>
            </div>

            <h2 className="mt-4 text-3xl leading-none text-chalk sm:text-4xl">{selected.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ash">{selected.craft_target}</p>

            <hr className="rule-machined my-7" />

            <ScoreSpine
              score={heroScore}
              bar={selected.bar}
              live={tempering}
              sealed={sealed}
              label={
                tempering && temperTx.draft
                  ? 'leader peek, unsettled'
                  : sealed
                    ? 'sealed at best'
                    : `best of ${selected.attempt_count} draft${selected.attempt_count === 1 ? '' : 's'}`
              }
            />

            <div className="mt-6 flex items-center justify-between border-t border-[var(--hairline)] pt-4 font-mono text-[11px] text-faint">
              <span>maker {shortAddress(selected.maker, 4)}</span>
              <span>seal bar {selected.bar}</span>
            </div>

            <AnimatePresence>
              {sealed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pointer-events-none absolute right-6 top-1/2 z-10"
                >
                  <div className="seal-stamp flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-spark text-spark">
                    <Lock className="h-5 w-5" aria-hidden />
                    <span className="stencil mt-1 text-[10px] tracking-[0.2em]">SEALED</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* right: temper form or consensus stage */}
          <div className="flex flex-col gap-4">
            {tempering ? (
              <ConsensusStage state={temperTx} />
            ) : sealed ? (
              <div className="inset rounded-md p-6 text-center">
                <Lock className="mx-auto h-6 w-6 text-spark" aria-hidden />
                <p className="mt-3 text-base text-chalk">This piece is sealed</p>
                <p className="mt-2 text-sm text-ash">
                  A draft cleared the bar at {selected.best_score} and locked the lineage. Sealed work
                  cannot be tempered further.
                </p>
              </div>
            ) : !wallet.address ? (
              <div className="inset rounded-md p-6 text-center">
                <p className="text-sm text-ash">Connect a wallet to temper a draft for this piece.</p>
                <button
                  type="button"
                  onClick={wallet.connect}
                  disabled={wallet.connecting}
                  className="mt-4 rounded-sm bg-hone px-5 py-2.5 text-sm font-bold text-[#04121c] transition-colors hover:bg-[#6bcdff] disabled:opacity-60"
                >
                  {wallet.connecting ? 'Connecting' : 'Connect wallet'}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="inset rounded-md p-5">
                <label htmlFor="temper-draft" className="eyebrow">
                  Temper a draft
                </label>
                <textarea
                  id="temper-draft"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={LIMITS.draft.max}
                  rows={7}
                  placeholder="Submit your refined draft. The Master Assessor scores it against the craft target under consensus."
                  className="mt-2 w-full resize-y rounded-sm border border-[var(--hairline-strong)] bg-[var(--bg)] px-3 py-2.5 text-sm leading-relaxed text-chalk placeholder:text-faint focus:border-hone"
                  aria-describedby="temper-count"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span id="temper-count" className="font-mono text-[11px] text-faint">
                    {draft.trim().length}/{LIMITS.draft.max}
                  </span>
                  <button
                    type="submit"
                    disabled={!draftOk}
                    className="rounded-sm bg-hone px-5 py-2.5 text-sm font-bold text-[#04121c] transition-colors hover:bg-[#6bcdff] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Hone it
                  </button>
                </div>
              </form>
            )}

            {/* the climbing attempt-lineage timeline */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="eyebrow">Attempt lineage</span>
                <span className="font-mono text-[11px] text-faint">
                  {selected.attempt_count} total
                </span>
              </div>
              {lineage.length === 0 ? (
                <p className="inset rounded-md p-5 text-sm text-ash">
                  No drafts yet. The first temper opens the lineage and sets the score to beat.
                </p>
              ) : (
                <div className="space-y-3">
                  {lineage.map((a, i) => {
                    // prev in chronological order is the next item in this reversed list
                    const prev = lineage[i + 1]?.score ?? null;
                    return (
                      <AttemptRow
                        key={`${selected.id}-${a.n}`}
                        attempt={a}
                        prevScore={prev}
                        fresh={a.n === freshAttemptN}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
