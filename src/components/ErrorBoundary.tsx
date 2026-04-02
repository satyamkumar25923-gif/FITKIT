import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends (Component as any) {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 bg-red-500/10 rounded-full mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Something went wrong</h1>
          <p className="text-zinc-500 text-sm max-w-xs mb-8">
            The application encountered an unexpected error. This might be due to a connection issue or a data mismatch.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-2xl uppercase italic tracking-tighter hover:bg-orange-500 hover:text-white transition-all"
          >
            <RefreshCcw className="w-4 h-4" /> Reload App
          </button>
          {process.env.NODE_ENV !== "production" && (
            <pre className="mt-8 p-4 bg-zinc-900 rounded-xl text-left text-[10px] text-zinc-600 max-w-full overflow-auto border border-zinc-800">
              {this.state.error?.message}
            </pre>
          )}
        </div>
      );
    }

    return (this as any).props.children;
  }
}
