'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, X, XCircle } from 'lucide-react';
import { EXPLORER } from '@/lib/contract';

export type ToastKind = 'loading' | 'success' | 'error';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
  hash?: string;
}

let counter = 0;

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<ToastItem, 'id'>) => {
      const id = ++counter;
      setToasts((cur) => [...cur, { ...t, id }]);
      if (t.kind !== 'loading') setTimeout(() => dismiss(id), 8000);
      return id;
    },
    [dismiss],
  );

  const update = useCallback((id: number, patch: Partial<Omit<ToastItem, 'id'>>) => {
    setToasts((cur) => cur.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    if (patch.kind && patch.kind !== 'loading') setTimeout(() => dismiss(id), 8000);
  }, [dismiss]);

  return { toasts, push, update, dismiss };
}

const ICON = {
  loading: <Loader2 className="h-4 w-4 animate-spin text-hone" aria-hidden />,
  success: <CheckCircle2 className="h-4 w-4 text-spark" aria-hidden />,
  error: <XCircle className="h-4 w-4 text-[#ff6a6a]" aria-hidden />,
};

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-[min(92vw,360px)] flex-col gap-2"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 32, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 32, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="raised bevel pointer-events-auto rounded-md p-3"
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0">{ICON[t.kind]}</span>
              <div className="min-w-0 flex-1">
                <p className="stencil text-sm text-chalk">{t.title}</p>
                {t.message && <p className="mt-0.5 text-xs leading-snug text-ash">{t.message}</p>}
                {t.hash && (
                  <a
                    href={`${EXPLORER}/tx/${t.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block font-mono text-[11px] text-hone hover:underline"
                  >
                    View on explorer
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                className="shrink-0 text-faint transition-colors hover:text-chalk"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
