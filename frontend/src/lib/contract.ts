import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

// WHETSTONE contract on GenLayer Bradbury Testnet.
// ---------------------------------------------------------------------------
// PARENT: overwrite the placeholder below with the real deployed address after
// deploy, then rebuild. This is the ONLY address placeholder in the frontend.
export const CONTRACT_ADDRESS =
  '0x7C077de2eAE9a6ac9c6F6088b7cD1eCddE63C293' as const;
export const DEPLOY_TX =
  '0xb0c2e6dc7ea9c8d34470a3c6b299d2f68c26d29f85d0a97d4a66ea35faadf496' as const;
// ---------------------------------------------------------------------------
export const EXPLORER = 'https://explorer-bradbury.genlayer.com';
export const FAUCET = 'https://testnet-faucet.genlayer.foundation/';

// Typed as string so the literal equality check below does not trip TS2367
// once a real, non-zero address is wired in by the parent.
const ZERO: string = '0x0000000000000000000000000000000000000000';
export const IS_DEPLOYED: boolean = (CONTRACT_ADDRESS as string) !== ZERO;

export const readClient = createClient({ chain: testnetBradbury });

export const makeWalletClient = (account: `0x${string}`) =>
  createClient({ chain: testnetBradbury, account });

export type WalletClient = ReturnType<typeof makeWalletClient>;

const ADDRESS = CONTRACT_ADDRESS as `0x${string}`;

// ---- char limits mirrored from the contract -----------------------------

export const LIMITS = {
  title: { min: 1, max: 80 },
  target: { min: 1, max: 280 },
  draft: { min: 1, max: 600 },
} as const;

export const SEAL_BAR = 85;

// ---- shapes returned by the contract views -------------------------------

export type PieceStatus = 'OPEN' | 'SEALED';

export interface Attempt {
  n: number;
  score: number;
  draft: string;
  flaws: string[];
  directive: string;
  sealed: boolean;
}

export interface Piece {
  id: string;
  title: string;
  craft_target: string;
  bar: number;
  best_score: number;
  status: PieceStatus;
  maker: string;
  created: number;
  attempt_count: number;
  attempts: Attempt[];
}

export interface Stats {
  pieces: number;
  attempts: number;
  sealed: number;
}

// ---- resilient reads -----------------------------------------------------

export async function withRpcRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      // "not found" covers a contract/tx the RPC has not indexed yet.
      if (!/rate limit|429|timeout|network|fetch|too many|not found/i.test(String(e))) throw e;
      // backoff: 2.5s, 5s, 10s, 20s
      await new Promise((r) => setTimeout(r, 2500 * 2 ** i));
    }
  }
  throw last;
}

function toRecord<T>(value: unknown): T {
  if (value instanceof Map) {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of value.entries()) obj[String(k)] = normalize(v);
    return obj as T;
  }
  return value as T;
}

function normalize(value: unknown): unknown {
  if (value instanceof Map) return toRecord(value);
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === 'bigint') return value.toString();
  return value;
}

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  const n = Number(String(v ?? '0'));
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return String(v ?? '');
}

function strList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => str(x)).filter((s) => s.length > 0);
  return [];
}

function asStatus(v: unknown): PieceStatus {
  return str(v).toUpperCase() === 'SEALED' ? 'SEALED' : 'OPEN';
}

function asAttempt(raw: unknown): Attempt {
  const r = toRecord<Record<string, unknown>>(raw);
  return {
    n: num(r.n),
    score: num(r.score),
    draft: str(r.draft),
    flaws: strList(r.flaws).slice(0, 3),
    directive: str(r.directive),
    sealed: Boolean(r.sealed),
  };
}

function asPiece(raw: unknown): Piece {
  const r = toRecord<Record<string, unknown>>(raw);
  const attempts = Array.isArray(r.attempts) ? r.attempts.map(asAttempt) : [];
  return {
    id: str(r.id),
    title: str(r.title),
    craft_target: str(r.craft_target),
    bar: r.bar !== undefined ? num(r.bar) : SEAL_BAR,
    best_score: num(r.best_score),
    status: asStatus(r.status),
    maker: str(r.maker),
    created: num(r.created),
    attempt_count: num(r.attempt_count),
    attempts,
  };
}

export async function fetchPieces(start = 0): Promise<Piece[]> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_pieces', args: [start] }),
  );
  const arr = (normalize(raw) as unknown[]) ?? [];
  return arr.map(asPiece);
}

export async function fetchPiece(id: string): Promise<Piece | null> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_piece', args: [id] }),
  );
  const r = toRecord<Record<string, unknown>>(normalize(raw));
  if (!r || !r.id) return null;
  return asPiece(r);
}

export async function fetchStats(): Promise<Stats> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_stats', args: [] }),
  );
  const r = toRecord<Record<string, unknown>>(normalize(raw));
  return {
    pieces: num(r.pieces),
    attempts: num(r.attempts),
    sealed: num(r.sealed),
  };
}

// ---- writes --------------------------------------------------------------

export function forgePiece(client: WalletClient, title: string, craftTarget: string) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'forge_piece',
    args: [title, craftTarget],
    value: 0n,
  });
}

export function temper(client: WalletClient, pieceId: string, draft: string) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'temper',
    args: [pieceId, draft],
    value: 0n,
  });
}

// ---- transaction polling -------------------------------------------------

const STATUS_NAME: Record<string, string> = {
  '1': 'PENDING',
  '2': 'PROPOSING',
  '3': 'COMMITTING',
  '4': 'REVEALING',
  '5': 'ACCEPTED',
  '6': 'UNDETERMINED',
  '7': 'FINALIZED',
  '8': 'CANCELED',
  '12': 'VALIDATORS_TIMEOUT',
  '13': 'LEADER_TIMEOUT',
};

export const statusName = (s: unknown): string =>
  STATUS_NAME[String(s)] ?? String(s ?? 'PENDING').toUpperCase();

// LEADER_TIMEOUT / VALIDATORS_TIMEOUT are intentionally absent: the network
// rotates the leader and retries, so keep polling through them.
const TERMINAL = new Set(['ACCEPTED', 'FINALIZED', 'UNDETERMINED', 'CANCELED']);

export interface LeaderDraft {
  score: number;
  flaws: string[];
  directive: string;
}

function pick(obj: unknown, key: string): unknown {
  if (obj instanceof Map) return obj.get(key);
  if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[key];
  return undefined;
}

// Peek at the leader's streamed assessment so the bench can show the score and
// flaws while validators are still deliberating.
export function extractLeaderDraft(tx: unknown): LeaderDraft | null {
  try {
    const receipts = pick(pick(tx, 'consensus_data'), 'leader_receipt');
    const first = Array.isArray(receipts) ? receipts[0] : receipts;
    const b64 = pick(pick(first, 'eq_outputs'), '0');
    if (typeof b64 !== 'string' || b64.length === 0) return null;
    const text = atob(b64);
    for (let i = text.length - 1; i >= 0; i--) {
      if (text[i] !== '{') continue;
      try {
        const obj = JSON.parse(text.slice(i)) as Record<string, unknown>;
        if (obj && typeof obj === 'object' && 'score' in obj) {
          return {
            score: num(obj.score),
            flaws: strList(obj.flaws).slice(0, 3),
            directive: obj.directive !== undefined ? str(obj.directive) : '',
          };
        }
      } catch {
        /* keep scanning toward the start for a parseable object */
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function pollUntilDecided(
  client: WalletClient,
  hash: `0x${string}`,
  onUpdate?: (status: string, draft: LeaderDraft | null) => void,
): Promise<{ status: string; draft: LeaderDraft | null }> {
  let draft: LeaderDraft | null = null;
  for (let i = 0; i < 150; i++) {
    const tx = await client
      .getTransaction({ hash } as Parameters<typeof client.getTransaction>[0])
      .catch(() => null);
    const status = statusName(tx ? (tx as { status?: unknown }).status : 'PENDING');
    draft = extractLeaderDraft(tx) ?? draft;
    onUpdate?.(status, draft);
    if (TERMINAL.has(status)) return { status, draft };
    await new Promise((r) => setTimeout(r, 8000));
  }
  return { status: 'TIMEOUT', draft };
}
