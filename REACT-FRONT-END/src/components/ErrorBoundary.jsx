/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI.
 * Prevents the entire app from crashing due to unhandled errors.
 */

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // In production, you could send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
          color: '#fff',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            maxWidth: '500px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem',
            }}>⚠️</div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}>
              Something went wrong
            </h1>
            <p style={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.8)',
              marginBottom: '2rem',
            }}>
              The application encountered an unexpected error. Please try refreshing the page.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details style={{
                textAlign: 'left',
                background: 'rgba(0,0,0,0.3)',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                maxHeight: '200px',
                overflow: 'auto',
              }}>
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Error Details (Dev Only)
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#14b8a6',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.target.style.background = '#0d9488'}
              onMouseOut={(e) => e.target.style.background = '#14b8a6'}
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
