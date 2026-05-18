/**
 * SanVicenteLogo — SVG logo for BLINKED, Apalit, Pampanga.
 *
 * Color scheme extracted from the official barangay seal:
 *   Deep green  : #1a7a2e  (outer ring)
 *   Bright green: #22a83a  (ring highlight)
 *   Orange      : #f5a623  (inner circle)
 *   Red         : #cc1f1f  (accent)
 *   Dark navy   : #0d1b2a  (outer border)
 *   White       : #ffffff  (text / contrast)
 */

export default function SanVicenteLogo({ size = 40, className = '', style = {} }) {
  const r = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* ── Outer dark border ring ── */}
      <circle cx="50" cy="50" r="49" fill="#0d1b2a" />

      {/* ── Green main ring ── */}
      <circle cx="50" cy="50" r="46" fill="#1a7a2e" />

      {/* ── Inner green ring (lighter) ── */}
      <circle cx="50" cy="50" r="38" fill="#22a83a" />

      {/* ── Orange center circle ── */}
      <circle cx="50" cy="50" r="30" fill="#f5a623" />

      {/* ── Radial sun rays on orange ── */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 50 + 18 * Math.cos(rad);
        const y1 = 50 + 18 * Math.sin(rad);
        const x2 = 50 + 28 * Math.cos(rad);
        const y2 = 50 + 28 * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#e8890a"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        );
      })}

      {/* ── Stylised "SV" monogram in center ── */}
      {/* S */}
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontWeight="900"
        fontSize="22"
        fill="#0d1b2a"
        letterSpacing="-1"
      >
        SV
      </text>

      {/* ── White arc text top: "SAN VICENTE" ── */}
      <defs>
        <path
          id="topArc"
          d="M 14,50 A 36,36 0 0,1 86,50"
        />
        <path
          id="bottomArc"
          d="M 18,54 A 32,32 0 0,0 82,54"
        />
      </defs>

      {/* Top arc label */}
      <text fontSize="7.5" fontWeight="800" fill="#ffffff" fontFamily="Arial, sans-serif" letterSpacing="1.5">
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">
          SAN VICENTE
        </textPath>
      </text>

      {/* Bottom arc label */}
      <text fontSize="6" fontWeight="700" fill="#ffffff" fontFamily="Arial, sans-serif" letterSpacing="1">
        <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
          APALIT · PAMPANGA
        </textPath>
      </text>

      {/* ── Small dot accents on green ring ── */}
      {[45, 135, 225, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = 50 + 42 * Math.cos(rad);
        const y = 50 + 42 * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r="2" fill="#ffffff" opacity="0.7" />;
      })}
    </svg>
  );
}
