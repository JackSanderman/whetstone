'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Attempt } from '@/lib/contract';
import { clampPct, scoreBand } from '@/lib/format';

interface AttemptRowProps {
  attempt: Attempt;
  prevScore: number | null;  // score of the prior attempt, for the delta chip
  fresh?: boolean;           // just landed: flash it in
}

// A HORIZONTAL attempt-lineage row: ordinal, draft snippet, score-delta chip,
// and a mini meter. Stacked, these form a climbing timeline rather than a grid.
export function AttemptRow({ attempt, prevScore, fresh }: AttemptRowProps) {
  const reduce = useReducedMotion();
  const band = scoreBand(attempt.score);
  const delta = prevScore === null ? null : attempt.score - prevScore;
  const pct = clampPct(attempt.score);

  return (
    <motion.article
      layout
      initial={fresh && !reduce ? { opacity: 0, x: -16 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className={`raised relative rounded-md p-4 ${fresh && attempt.sealed ? 'spark-ring' : ''}`}
    >
      <div className="flex items-stretch gap-4">
        {/* ordinal + score numeral */}
        <div className="flex w-16 shrink-0 flex-col items-center justify-center border-r border-[var(--hairline)] pr-3">
          <span className="numeral text-[10px] text-faint">#{attempt.n}</span>
          <span
            className="numeral text-3xl leading-none"
            style={{ color: attempt.sealed ? 'var(--spark)' : band.color }}
          >
            {attempt.score}
          </span>
        </div>

        {/* draft snippet + flaws/directive */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {delta !== null && (
              <span
                className={`numeral rounded-sm px-1.5 py-0.5 text-[10px] ${
                  delta > 0
                    ? 'bg-hone/12 text-hone'
                    : delta < 0
                      ? 'bg-[#ff6a6a]/12 text-[#ff8a8a]'
                      : 'bg-white/5 text-ash'
                }`}
                title="Change from the previous attempt"
              >
                {delta > 0 ? `+${delta}` : delta}
              </span>
            )}
            {attempt.sealed && (
              <span className="stencil rounded-sm bg-spark/15 px-1.5 py-0.5 text-[10px] tracking-[0.16em] text-spark">
                SEALED
              </span>
            )}
            <span className="stencil text-[10px] tracking-[0.18em]" style={{ color: band.color }}>
              {band.label}
            </span>
          </div>

          <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-steel">{attempt.draft}</p>

          {attempt.flaws.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {attempt.flaws.map((f, i) => (
                <span
                  key={i}
                  className="rounded-sm border border-[var(--hairline)] px-1.5 py-0.5 text-[11px] text-ash"
                >
                  {f}
                </span>
              ))}
            </div>
          )}

          {attempt.directive && (
            <p className="mt-2 text-xs italic text-ash">
              <span className="not-italic text-faint">directive:</span> {attempt.directive}
            </p>
          )}

          {/* mini meter */}
          <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[var(--groove)]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: attempt.sealed ? 'var(--spark)' : band.color }}
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
