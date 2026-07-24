"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { KioskErrorView } from "./kiosk-error-view";

/**
 * Manual class-based error boundary for the kiosk page.
 *
 * This is an ADDITIONAL safety net on top of Next.js's app/quiosco/error.tsx.
 * On Safari/WebKit the framework-level error overlay has not been surfacing
 * anything, so we also catch render/lifecycle errors here and paint the same
 * dependency-free diagnostic screen ourselves.
 */
interface State {
  error: Error | null;
}

export class KioskErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log with clear context so it stands out in any console that IS working.
    console.error("[quiosco] Error capturado por KioskErrorBoundary:", error);
    console.error("[quiosco] componentStack:", info.componentStack);
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <KioskErrorView
          title="Error de render en el modo quiosco"
          message={error.message}
          stack={error.stack ?? String(error)}
          onRetry={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}
