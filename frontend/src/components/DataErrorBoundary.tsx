'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { EXPLORER, CONTRACT_ADDRESS } from '@/lib/contract';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class DataErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="raised rounded-md p-8 text-center" role="alert">
          <AlertTriangle className="mx-auto h-7 w-7 text-spark" aria-hidden />
          <p className="mt-4 text-base text-chalk">A panel of the bench failed to render.</p>
          <p className="mx-auto mt-2 max-w-md font-mono text-xs leading-relaxed text-ash">
            {String(this.state.error.message).slice(0, 200)}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.reset}
              className="inline-flex items-center gap-2 rounded-sm bg-hone px-4 py-2 text-sm font-bold text-[#04121c] transition-colors hover:bg-[#6bcdff]"
            >
              <RotateCw className="h-4 w-4" aria-hidden />
              Retry
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
    return this.props.children;
  }
}
