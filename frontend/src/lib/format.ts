import { PieceStatus } from './contract';

export function shortAddress(addr: string | null | undefined, size = 4): string {
  if (!addr) return '';
  const a = String(addr);
  if (a.length <= size * 2 + 2) return a;
  return `${a.slice(0, size + 2)}\u2026${a.slice(-size)}`;
}

export function formatFigure(n: number): string {
  if (!Number.isFinite(n)) return '0';
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

export function sameAddress(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

export interface StatusMeta {
  color: string;
  label: string;
}

export const STATUS_META: Record<PieceStatus, StatusMeta> = {
  OPEN: { color: 'var(--hone)', label: 'On the bench' },
  SEALED: { color: 'var(--spark)', label: 'Sealed' },
};

export function statusMeta(s: PieceStatus): StatusMeta {
  return STATUS_META[s] ?? STATUS_META.OPEN;
}

// Score band -> qualitative honing read, used for the kinetic numeral tone.
export function scoreBand(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'seal-ready', color: 'var(--spark)' };
  if (score >= 70) return { label: 'keen', color: 'var(--hone)' };
  if (score >= 45) return { label: 'taking edge', color: 'var(--steel)' };
  return { label: 'rough stock', color: 'var(--ash)' };
}

export function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
