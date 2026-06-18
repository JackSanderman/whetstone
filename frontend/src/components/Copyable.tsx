'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyableProps {
  value: string;
  display?: string;
  label?: string;
  className?: string;
}

export function Copyable({ value, display, label, className }: CopyableProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard may be blocked; ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`group inline-flex items-center gap-1.5 font-mono text-xs text-ash transition-colors hover:text-chalk ${className ?? ''}`}
      aria-label={label ? `Copy ${label}` : `Copy ${value}`}
      title={copied ? 'Copied' : 'Copy'}
    >
      <span className="truncate">{display ?? value}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-hone" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" aria-hidden />
      )}
    </button>
  );
}
