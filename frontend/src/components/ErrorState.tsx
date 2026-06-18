'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';
import { CONTRACT_ADDRESS, EXPLORER } from '@/lib/contract';

interface ErrorStateProps {
  message: string;
  diagnostic?: boolean;
  onRetry: () => void;
}

export function ErrorState({ message, diagnostic, onRetry }: ErrorStateProps) {
  return (
    <div className="raised rounded-md p-8 text-center" role="alert">
      <AlertTriangle className="mx-auto h-7 w-7 text-spark" aria-hidden />
      <p className="mt-4 text-base text-chalk">{message}</p>
      {diagnostic && (
        <p className="mx-auto mt-2 max-w-md font-mono text-xs leading-relaxed text-ash">
          Configured bench address {CONTRACT_ADDRESS}. If a deploy is pending, this resolves once
          the address is wired in and the site is rebuilt.
        </p>
      )}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-sm bg-hone px-4 py-2 text-sm font-bold text-[#04121c] transition-colors hover:bg-[#6bcdff]"
        >
          <RotateCw className="h-4 w-4" aria-hidden />
          Re-read the bench
        </button>
        <a
          href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-hone hover:underline"
        >
          Inspect on explorer
        </a>
      </div>
    </div>
  );
}
