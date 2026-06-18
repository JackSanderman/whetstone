'use client';

import { Hammer } from 'lucide-react';

// Bespoke empty state in whetstone's own voice. Not "No items yet."
export function EmptyBench({ onForge }: { onForge: () => void }) {
  return (
    <div className="machined rounded-md p-10 text-center">
      <Hammer className="mx-auto h-8 w-8 text-hone" aria-hidden />
      <h3 className="mt-4 text-2xl text-chalk">The bench is bare stock</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ash">
        Nothing has been forged here yet. Name a piece, set the craft target you are honing toward,
        and the stone is ready. Each draft you temper gets scored under consensus until one clears
        the seal bar.
      </p>
      <button
        type="button"
        onClick={onForge}
        className="mt-6 inline-flex items-center gap-2 rounded-sm bg-hone px-5 py-2.5 text-sm font-bold text-[#04121c] transition-colors hover:bg-[#6bcdff]"
      >
        Forge the first piece
      </button>
    </div>
  );
}
