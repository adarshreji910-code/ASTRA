import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SpaceVerse caught an unhandled error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white p-6">
          <div className="glass-panel p-8 rounded-2xl max-w-md text-center border border-white/20">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h2 className="text-xl font-bold mb-2">Cosmic Signal Interrupted</h2>
            <p className="text-sm text-slate-400 mb-6">
              A temporary display anomaly occurred. Click below to reconnect to the Solar System.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-sm cursor-pointer transition shadow-lg shadow-sky-500/20"
            >
              Reconnect to SpaceVerse
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
