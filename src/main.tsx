import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
    try {
      fetch("/api/supabase/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          error: error.message || String(error), 
          context: { stack: error.stack, componentStack: errorInfo.componentStack } 
        })
      });
    } catch (e) {
      console.error("Error logging failed:", e);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          background: '#040408',
          color: '#FF5A00',
          fontFamily: 'sans-serif',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 90, 0, 0.1)',
            border: '1px solid rgba(255, 90, 0, 0.2)',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '640px',
            width: '100%'
          }}>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px' }}>Erreur d'initialisation de l'application</h1>
            <p style={{ color: '#E4E4E7', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
              Une exception a été détectée lors du chargement. Pourriez-vous essayer de réinitialiser le cache local de votre navigateur ?
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#A1A1AA',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: '24px',
              fontFamily: 'monospace'
            }}>
              <strong>Détail :</strong> {this.state.error?.toString()}
              <br /><br />
              <strong>Composant :</strong>
              <pre style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                style={{
                  padding: '10px 20px',
                  background: '#FF5A00',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                Réinitialiser le cache et Recharger
              </button>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#E4E4E7',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                Actualiser
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
