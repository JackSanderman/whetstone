'use client';

import { Lock } from 'lucide-react';
import { Piece } from '@/lib/contract';
import { shortAddress } from '@/lib/format';

interface SealedGalleryProps {
  pieces: Piece[];
  onOpen: (id: string) => void;
}

// A gallery of sealed works: pieces that cleared the bar and locked immutable.
export function SealedGallery({ pieces, onOpen }: SealedGalleryProps) {
  const sealed = pieces.filter((p) => p.status === 'SEALED');

  return (
    <section
      id="sealed"
      className="border-b border-[var(--hairline)] px-6 py-16"
      aria-label="Sealed works gallery"
    >
      <div className="mx-auto w-full max-w-6xl">
        <span className="eyebrow">The gallery</span>
        <h2 className="mt-3 text-3xl text-chalk sm:text-4xl">Sealed works</h2>
        <hr className="rule-machined my-8" />

        {sealed.length === 0 ? (
          <p className="text-sm text-ash">
            No piece has cleared the seal bar yet. The first one to land a draft above its bar and
            beat its own best will be stamped here for good.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sealed.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onOpen(p.id)}
                className="raised group rounded-md p-5 text-left transition-colors hover:border-[var(--spark)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg leading-tight text-chalk">{p.title}</h3>
                  <Lock className="h-4 w-4 shrink-0 text-spark" aria-hidden />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-ash">{p.craft_target}</p>
                <div className="mt-4 flex items-baseline justify-between border-t border-[var(--hairline)] pt-3">
                  <span className="numeral text-3xl text-spark">{p.best_score}</span>
                  <span className="font-mono text-[11px] text-faint">
                    {p.attempt_count} draft{p.attempt_count === 1 ? '' : 's'} &middot;{' '}
                    {shortAddress(p.maker, 3)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
