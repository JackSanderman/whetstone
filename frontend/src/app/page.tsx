'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { forgePiece, Piece, temper as temperDraft } from '@/lib/contract';
import { useBenchData } from '@/hooks/useContractData';
import { useTransaction } from '@/hooks/useTransaction';
import { useWallet } from '@/hooks/useWallet';
import { shortAddress } from '@/lib/format';
import { ToolRail } from '@/components/ToolRail';
import { StatusStrip } from '@/components/StatusStrip';
import { HoningBench } from '@/components/HoningBench';
import { ForgePanel } from '@/components/ForgePanel';
import { HoningRite } from '@/components/HoningRite';
import { SealedGallery } from '@/components/SealedGallery';
import { Footer } from '@/components/Footer';
import { DataErrorBoundary } from '@/components/DataErrorBoundary';
import { ErrorState } from '@/components/ErrorState';
import { EmptyBench } from '@/components/EmptyState';
import { BenchSkeleton } from '@/components/Skeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ToastStack, useToasts } from '@/components/Toast';

type PendingKind = 'forge' | 'temper';
interface Pending {
  kind: PendingKind;
  run: () => void;
}

const CONFIRM_BODY =
  'This submits a transaction on Bradbury Testnet. Network fees apply. Continue?';

function scrollTo(id: string) {
  if (typeof document === 'undefined') return;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Page() {
  const wallet = useWallet();
  const toasts = useToasts();
  const bench = useBenchData();

  const forgeTx = useTransaction();
  const temperTx = useTransaction();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [temperingId, setTemperingId] = useState<string | null>(null);
  const [freshAttemptN, setFreshAttemptN] = useState<number | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  const selected = useMemo(
    () => bench.pieces.find((p) => p.id === selectedId) ?? null,
    [bench.pieces, selectedId],
  );

  // Select the most recent OPEN piece once the bench first loads, else newest.
  useEffect(() => {
    if (selectedId && bench.pieces.some((p) => p.id === selectedId)) return;
    if (bench.pieces.length === 0) return;
    const open = bench.pieces.find((p) => p.status === 'OPEN');
    setSelectedId((open ?? bench.pieces[0]).id);
  }, [bench.pieces, selectedId]);

  const selectPiece = useCallback((id: string) => {
    setSelectedId(id);
    scrollTo('bench');
  }, []);

  // ---- write orchestration (confirm, then run) ---------------------------

  const runForge = useCallback(
    (title: string, target: string) => {
      if (!wallet.address) return;
      const id = toasts.push({
        kind: 'loading',
        title: 'Forging the piece',
        message: 'Confirm the signature in your wallet.',
      });
      forgeTx.run({
        account: wallet.address,
        send: (client) => forgePiece(client, title, target),
        onBusy: bench.setBusy,
        onConfirmed: () => {
          toasts.update(id, {
            kind: 'success',
            title: 'Piece forged',
            message: 'Fresh stock is on the bench, ready to temper.',
            hash: forgeTx.state.hash ?? undefined,
          });
          wallet.refreshBalance();
          bench.refresh();
          scrollTo('bench');
        },
      });
    },
    [wallet, toasts, forgeTx, bench],
  );

  const runTemper = useCallback(
    (piece: Piece, draft: string) => {
      if (!wallet.address) return;
      setTemperingId(piece.id);
      setSelectedId(piece.id);
      setFreshAttemptN(null);
      const nextN = piece.attempt_count + 1;
      scrollTo('bench');
      const id = toasts.push({
        kind: 'loading',
        title: 'The assessor is honing',
        message: 'The Master Assessor scores under consensus. This can take minutes.',
      });
      temperTx.run({
        account: wallet.address,
        send: (client) => temperDraft(client, piece.id, draft),
        onBusy: bench.setBusy,
        onConfirmed: (_status, draft2) => {
          const sealed = (draft2?.score ?? 0) >= piece.bar && (draft2?.score ?? 0) > piece.best_score;
          toasts.update(id, {
            kind: 'success',
            title: sealed ? 'The piece is sealed' : 'Draft scored',
            message: sealed
              ? 'A draft cleared the seal bar and locked the lineage.'
              : 'The score landed on the lineage. Refine and hone again.',
            hash: temperTx.state.hash ?? undefined,
          });
          setFreshAttemptN(nextN);
          wallet.refreshBalance();
          bench.refresh();
        },
      });
    },
    [wallet, toasts, temperTx, bench],
  );

  const requestConfirm = useCallback((kind: PendingKind, run: () => void) => {
    setPending({ kind, run });
  }, []);

  const handleForge = useCallback(
    (title: string, target: string) => requestConfirm('forge', () => runForge(title, target)),
    [requestConfirm, runForge],
  );
  const handleTemper = useCallback(
    (piece: Piece, draft: string) => requestConfirm('temper', () => runTemper(piece, draft)),
    [requestConfirm, runTemper],
  );

  const forgeBusy = ['wallet', 'submitted', 'consensus'].includes(forgeTx.state.phase);
  const temperBusy = ['wallet', 'submitted', 'consensus'].includes(temperTx.state.phase);
  const anyBusy = forgeBusy || temperBusy;

  // ---- surface tx errors as toasts ---------------------------------------

  useTxError(forgeTx.state.phase, forgeTx.state.error, (msg) =>
    toasts.push({ kind: 'error', title: 'Forge failed', message: msg }),
  );
  useTxError(temperTx.state.phase, temperTx.state.error, (msg) => {
    setTemperingId(null);
    toasts.push({ kind: 'error', title: 'Honing failed', message: msg });
  });

  const walletLabel = wallet.address ? shortAddress(wallet.address, 4) : '';

  return (
    <div className="grid min-h-screen grid-cols-[var(--rail-w)_minmax(0,1fr)]">
      <a href="#bench" className="skip-link">
        Skip to the bench
      </a>

      {/* left vertical tool-rail (the app-shell header) */}
      <div className="sticky top-0 h-screen">
        <ToolRail wallet={wallet} />
      </div>

      <main className="min-w-0">
        <StatusStrip
          stats={bench.stats}
          walletLabel={walletLabel}
          onChain={wallet.onChain}
          connected={!!wallet.address}
        />

        <DataErrorBoundary>
          {bench.error ? (
            <div className="px-6 py-12">
              <div className="mx-auto w-full max-w-6xl">
                <ErrorState
                  message={bench.error}
                  diagnostic={bench.diagnostic}
                  onRetry={bench.refresh}
                />
              </div>
            </div>
          ) : bench.loading && bench.pieces.length === 0 ? (
            <div className="px-6 py-12">
              <div className="mx-auto w-full max-w-6xl">
                <BenchSkeleton />
              </div>
            </div>
          ) : bench.pieces.length === 0 ? (
            <div className="px-6 py-16">
              <div className="mx-auto w-full max-w-3xl">
                <EmptyBench onForge={() => scrollTo('forge')} />
              </div>
            </div>
          ) : (
            <HoningBench
              pieces={bench.pieces}
              selected={selected}
              wallet={wallet}
              temperTx={temperTx.state}
              temperingId={temperingId}
              freshAttemptN={freshAttemptN}
              onSelect={selectPiece}
              onTemper={handleTemper}
            />
          )}
        </DataErrorBoundary>

        <ForgePanel wallet={wallet} busy={forgeBusy} onForge={handleForge} />

        <HoningRite />

        <DataErrorBoundary>
          <SealedGallery pieces={bench.pieces} onOpen={selectPiece} />
        </DataErrorBoundary>

        <Footer />
      </main>

      <ConfirmDialog
        open={pending !== null}
        title={pending?.kind === 'temper' ? 'Hone this draft' : 'Forge this piece'}
        body={CONFIRM_BODY}
        confirmLabel="Submit to the bench"
        busy={anyBusy}
        onConfirm={() => {
          pending?.run();
          setPending(null);
        }}
        onClose={() => setPending(null)}
      />

      <ToastStack toasts={toasts.toasts} onDismiss={toasts.dismiss} />
    </div>
  );
}

// Fire a callback once when a transaction transitions into the error phase.
function useTxError(phase: string, error: string | null, onError: (msg: string) => void) {
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (phase === 'error' && error && error !== last.current) {
      last.current = error;
      onError(error);
    }
    if (phase !== 'error') last.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, error]);
}
