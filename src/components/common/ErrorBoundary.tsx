import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Shown in the fallback so the user knows what failed, e.g. "the visualizer". */
  area?: string;
  /** Changing this resets the boundary — pass the selected problem id so picking a different
   *  problem clears an error caused by the previous one. */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

/**
 * Catches render and lifecycle errors so one bad algorithm cannot white-screen the whole app.
 *
 * This matters here specifically because every problem ships a hand-written run() step
 * generator. A single one throwing — or a lazily-loaded chunk failing to fetch — previously
 * took down the entire page with no way back.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prev: Props) {
    // A new problem selected means the previous failure is no longer relevant.
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No telemetry in this app, so the console is the only record. Keep it, it is what a
    // bug report will be pasted from.
    console.error(`[SDETPrep] error in ${this.props.area ?? 'the app'}:`, error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isChunkError = /Loading chunk|dynamically imported module|Failed to fetch/i.test(
      error.message
    );

    return (
      <div className="p-4">
        <div className="max-w-xl mx-auto bg-slate-800 border border-red-500/30 rounded-xl p-5">
          <h2 className="text-lg font-bold text-red-300 mb-2">
            {isChunkError ? 'Could not load that part of the app' : `Something broke in ${this.props.area ?? 'the app'}`}
          </h2>
          <p className="text-sm text-slate-300 mb-3">
            {isChunkError
              ? 'A code chunk failed to download. That is usually a stale tab after a new deploy, or a flaky connection — reloading fixes it.'
              : 'The rest of the app is still fine. Pick a different problem from the sidebar, or reload.'}
          </p>
          <pre className="text-xs text-red-200/70 bg-slate-900/60 rounded-lg p-3 mb-3 overflow-x-auto whitespace-pre-wrap">
            {error.message}
          </pre>
          <div className="flex gap-2">
            <button
              onClick={() => this.setState({ error: null })}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
