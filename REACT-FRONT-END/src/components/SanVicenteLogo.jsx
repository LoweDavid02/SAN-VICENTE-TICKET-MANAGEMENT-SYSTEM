/**
 * SanVicenteLogo — BLINKED logo component
 * Uses the official BLINKED.png logo image
 */

import blinkedLogo from '../assets/BLINKED.png';

export default function SanVicenteLogo({ size = 40, className = '', style = {} }) {
  return (
    <img
      src={blinkedLogo}
      alt="BLINKED Logo"
      width={size}
      height={size}
      className={className}
      style={{
        objectFit: 'contain',
        ...style
      }}
    />
  );
}
