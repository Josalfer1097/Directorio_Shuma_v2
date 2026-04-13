"use client";

import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center bg-bg-surface border border-border-subtle rounded-xl">
          <h2 className="text-xl font-neuropol text-text-primary mb-4">Algo salió mal</h2>
          <p className="text-text-muted font-dm-sans">No pudimos cargar este componente.</p>
          <button
            className="mt-4 px-4 py-2 bg-irid-a text-white rounded-full font-neuropol text-xs"
            onClick={() => this.setState({ hasError: false })}
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
