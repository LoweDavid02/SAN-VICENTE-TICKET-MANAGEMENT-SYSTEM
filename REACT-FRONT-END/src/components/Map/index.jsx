import React, { lazy, Suspense } from 'react';
import { AlertCircle } from 'lucide-react';

// Lazy load OpenStreetMap component for better performance
// 100% FREE - No API key required, no sign-up, unlimited usage
const OpenStreetMap = lazy(() => import('./OpenStreetMap.jsx'));

/**
 * Lazy-loaded OpenStreetMap wrapper with loading fallback
 */
export default function Map(props) {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <MapErrorBoundary>
        <OpenStreetMap {...props} />
      </MapErrorBoundary>
    </Suspense>
  );
}

/**
 * Error boundary for map loading failures
 */
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Map loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <MapErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

/**
 * Error fallback component
 */
function MapErrorFallback({ error }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <AlertCircle size={32} color="#ef4444" />
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>
            Map failed to load
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            Please refresh the page to try again
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8,
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#14b8a6',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#0d9488'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#14b8a6'}
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

/**
 * Loading fallback component
 */
function MapLoadingFallback() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.2)',
            borderTopColor: '#14b8a6',
            animation: 'spin 0.65s linear infinite',
          }}
        />
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
          Loading map...
        </span>
      </div>
    </div>
  );
}
