'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { scoreBand, clampPct } from '@/lib/format';

interface ScoreSpineProps {
  score: number;        // the numeral to render large
  bar: number;          // seal bar threshold
  live?: boolean;       // pulsing while honing
  sealed?: boolean;     // amber seal tone
  label?: string;       // small caption under the numeral
}

// The hero device: a GIANT kinetic score numeral riding a vertical seal-bar
// spine. The fill climbs to the score, the bar shows the seal threshold.
export function ScoreSpine({ score, bar, live, sealed, label }: ScoreSpineProps) {
  const reduce = useReducedMotion();
  const pct = clampPct(score);
  const band = scoreBand(score);
  const numeralColor = sealed ? 'var(--spark)' : band.color;

  return (
    <div className="flex items-stretch gap-5">
      {/* vertical seal-bar spine */}
      <div className="relative w-12 shrink-0 self-stretch sm:w-16">
        <div className="spine relative h-full w-full overflow-hidden rounded-sm">
          <motion.div
            className="absolute inset-x-0 bottom-0"
            style={{
              background: sealed
                ? 'linear-gradient(0deg, rgba(255,176,32,0.5), rgba(255,176,32,0.12))'
                : 'linear-gradient(0deg, rgba(76,194,255,0.5), rgba(76,194,255,0.1))',
            }}
            initial={{ height: 0 }}
            animate={{ height: `${pct}%` }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 60, damping: 18 }}
          />
          {/* seal-bar threshold marker */}
          <div
            className="absolute inset-x-0 flex items-center"
            style={{ bottom: `${clampPct(bar)}%` }}
            aria-hidden
          >
            <div className="h-px w-full bg-[var(--spark)] opacity-70" />
          </div>
        </div>
        <span
          className="numeral absolute -right-1 translate-x-full text-[9px] text-spark"
          style={{ bottom: `${clampPct(bar)}%` }}
          aria-hidden
        >
          {bar}
        </span>
      </div>

      {/* giant rising numeral */}
      <div className="min-w-0 flex-1">
        <div className="flex items-end gap-2">
          <motion.span
            key={score}
            className={`numeral text-[24vw] leading-[0.8] sm:text-[150px] lg:text-[180px] ${live && !reduce ? 'pulse-soft' : ''}`}
            style={{ color: numeralColor }}
            initial={reduce ? false : { opacity: 0.4, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            aria-hidden
          >
            {Math.round(pct)}
          </motion.span>
          <span className="numeral mb-6 text-2xl text-faint" aria-hidden>
            /100
          </span>
        </div>
        <p className="sr-only">Current best score {Math.round(pct)} out of 100.</p>
        {label && (
          <p className="stencil mt-1 text-xs tracking-[0.2em]" style={{ color: numeralColor }}>
            {label}
          </p>
        )}
      </div>
    </div>
  );
}
