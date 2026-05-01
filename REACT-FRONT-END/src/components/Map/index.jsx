import { lazy, Suspense } from 'react';

// Lazy load OpenStreetMap component for better performance
// 100% FREE - No API key required, no sign-up, unlimited usage
const OpenStreetMap = lazy(() => import('./OpenStreetMap'));

/**
 * Lazy-loaded OpenStreetMap wrapper with loading fallback
 */
export default function Map(props) {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <OpenStreetMap {...props} />
    </Suspense>
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
