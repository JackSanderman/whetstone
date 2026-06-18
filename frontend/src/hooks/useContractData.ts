'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPieces, fetchStats, Piece, Stats } from '@/lib/contract';

const POLL_MS = 90_000;

interface Classified {
  message: string;
  diagnostic: boolean;
}

function classifyError(e: unknown): Classified {
  const msg = String(e);
  if (/contract not found|execution reverted|no contract|not found/i.test(msg)) {
    return {
      message: 'No bench is recorded at the configured address on Bradbury.',
      diagnostic: true,
    };
  }
  if (/rate limit|429|too many/i.test(msg)) {
    return { message: 'The bench is rate limiting reads. Retrying shortly.', diagnostic: false };
  }
  return {
    message: 'The bench ledger is unreachable. Check your connection and retry.',
    diagnostic: false,
  };
}

function deriveStats(pieces: Piece[]): Stats {
  let attempts = 0;
  let sealed = 0;
  for (const p of pieces) {
    attempts += p.attempt_count;
    if (p.status === 'SEALED') sealed += 1;
  }
  return { pieces: pieces.length, attempts, sealed };
}

export interface BenchData {
  pieces: Piece[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  diagnostic: boolean;
  refresh: () => Promise<void>;
  setBusy: (busy: boolean) => void;
}

export function useBenchData(): BenchData {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState(false);

  const alive = useRef(true);
  const busy = useRef(false);

  const load = useCallback(async () => {
    try {
      // One authoritative read per cycle; the contract counter is preferred,
      // with a client-side derivation as a resilient fallback.
      const [ps, st] = await Promise.all([fetchPieces(0), fetchStats().catch(() => null)]);
      if (!alive.current) return;
      setPieces(ps);
      setStats(st ?? deriveStats(ps));
      setError(null);
      setDiagnostic(false);
    } catch (e) {
      if (!alive.current) return;
      const c = classifyError(e);
      setError(c.message);
      setDiagnostic(c.diagnostic);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const setBusy = useCallback((b: boolean) => {
    busy.current = b;
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    const id = setInterval(() => {
      if (busy.current) return; // pause polling entirely while a tx is in flight
      load();
    }, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [load]);

  return { pieces, stats, loading, error, diagnostic, refresh, setBusy };
}
