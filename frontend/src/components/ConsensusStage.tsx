'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { TxState } from '@/hooks/useTransaction';
import { EXPLORER } from '@/lib/contract';
import { shortAddress } from '@/lib/format';

// The signature screen: while validators deliberate (1-5+ min), stage the
// honing through submission -> assessor drafting -> validators re-running ->
// seal, with the leader-draft peek streaming the score and flaws.
const STAGES = [
  { key: 'submit', title: 'Submission', note: 'Your draft is on its way to the bench.' },
  { key: 'draft', title: 'Assessor drafting', note: 'The Master Assessor scores the craftsmanship.' },
  { key: 'rerun', title: 'Validators re-running', note: 'Validators independently re-score and compare.' },
  { key: 'seal', title: 'Settle', note: 'The landed score is written to the lineage.' },
] as const;

function stageIndex(state: TxState): number {
  if (state.phase === 'wallet') return 0;
  if (state.phase === 'submitted') return 0;
  if (state.phase === 'confirmed') return 3;
  // consensus phase: advance with live status
  const s = state.liveStatus;
  if (state.draft) return 2;
  if (s === 'PROPOSING' || s === 'PENDING' || s === '') return 1;
  if (s === 'COMMITTING' || s === 'REVEALING') return 2;
  return 1;
}

export function ConsensusStage({ state }: { state: TxState }) {
  const active = stageIndex(state);
  const draft = state.draft;

  return (
    <div className="inset rounded-md p-5">
      <div className="flex items-center justify-between">
        <span className="eyebrow">The bench is honing</span>
        {state.liveStatus && (
          <span className="numeral text-[11px] text-hone">{state.liveStatus}</span>
        )}
      </div>

      <ol className="mt-4 space-y-2.5" aria-label="Consensus progress">
        {STAGES.map((stg, i) => {
          const done = i < active || state.phase === 'confirmed';
          const current = i === active && state.phase !== 'confirmed';
          return (
            <li key={stg.key} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${
                  done
                    ? 'border-hone bg-hone/15 text-hone'
                    : current
                      ? 'border-hone text-hone'
                      : 'border-[var(--hairline-strong)] text-faint'
                }`}
              >
                {done ? (
                  <Check className="h-3 w-3" aria-hidden />
                ) : current ? (
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                ) : (
                  <span className="numeral text-[10px]">{i + 1}</span>
                )}
              </span>
              <div className="min-w-0">
                <p className={`stencil text-sm ${current || done ? 'text-chalk' : 'text-ash'}`}>
                  {stg.title}
                </p>
                <p className="text-xs text-ash">{stg.note}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {state.hash && (
        <a
          href={`${EXPLORER}/tx/${state.hash}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block font-mono text-[11px] text-hone hover:underline"
        >
          tx {shortAddress(state.hash, 6)}
        </a>
      )}

      {/* leader-draft peek: the streaming score and flaws */}
      <AnimatePresence>
        {draft && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden border-t border-[var(--hairline)] pt-4"
          >
            <div className="flex items-baseline gap-2">
              <span className="eyebrow">Leader peek</span>
              <span className="numeral text-3xl text-hone">{draft.score}</span>
              <span className="numeral text-xs text-faint">/100 (unsettled)</span>
            </div>
            {draft.flaws.length > 0 && (
              <ul className="mt-2 space-y-1">
                {draft.flaws.map((f, i) => (
                  <li key={i} className="flex gap-2 text-xs text-ash">
                    <span className="text-spark" aria-hidden>
                      &middot;
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            )}
            {draft.directive && (
              <p className="mt-2 text-xs italic text-steel">Next: {draft.directive}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
