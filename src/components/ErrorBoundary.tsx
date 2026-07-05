import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Blox Upgrader]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-deep px-6 text-center text-white">
          <h1 className="font-display text-2xl font-bold text-gold">Algo salió mal</h1>
          <p className="max-w-md text-sm text-white/60">
            Recarga la página con <kbd className="rounded bg-white/10 px-1.5 py-0.5">Ctrl+Shift+R</kbd>
            {' '}para limpiar la caché del navegador.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-gold px-6 py-2.5 font-display text-sm font-bold text-black"
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
