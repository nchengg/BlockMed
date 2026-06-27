export default function BigShip({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 900 320"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: "visible" }}
    >
      {/* Hull */}
      <path d="M60 220 L840 220 L800 280 L100 280 Z" fill="#0D2137" stroke="#1A4060" strokeWidth="1.5" />
      <path d="M60 220 L80 180 L820 180 L840 220 Z" fill="#0A1E30" stroke="#1A4060" strokeWidth="1" />

      {/* Deck containers - row 1 */}
      <rect x="100" y="130" width="60" height="50" rx="3" fill="#8B1A1A" stroke="#6B1414" strokeWidth="1" />
      <rect x="168" y="130" width="60" height="50" rx="3" fill="#1A4A7A" stroke="#143860" strokeWidth="1" />
      <rect x="236" y="130" width="60" height="50" rx="3" fill="#2A6A2A" stroke="#1E4E1E" strokeWidth="1" />
      <rect x="304" y="130" width="60" height="50" rx="3" fill="#8B1A1A" stroke="#6B1414" strokeWidth="1" />
      <rect x="372" y="130" width="60" height="50" rx="3" fill="#1A4A7A" stroke="#143860" strokeWidth="1" />
      <rect x="440" y="130" width="60" height="50" rx="3" fill="#8B1A1A" stroke="#6B1414" strokeWidth="1" />
      <rect x="508" y="130" width="60" height="50" rx="3" fill="#2A6A2A" stroke="#1E4E1E" strokeWidth="1" />

      {/* Deck containers - row 2 */}
      <rect x="100" y="82" width="60" height="46" rx="3" fill="#1A4A7A" stroke="#143860" strokeWidth="1" />
      <rect x="168" y="82" width="60" height="46" rx="3" fill="#8B1A1A" stroke="#6B1414" strokeWidth="1" />
      <rect x="236" y="82" width="60" height="46" rx="3" fill="#1A4A7A" stroke="#143860" strokeWidth="1" />
      <rect x="304" y="82" width="60" height="46" rx="3" fill="#2A6A2A" stroke="#1E4E1E" strokeWidth="1" />
      <rect x="372" y="82" width="60" height="46" rx="3" fill="#8B1A1A" stroke="#6B1414" strokeWidth="1" />
      <rect x="440" y="82" width="60" height="46" rx="3" fill="#2A6A2A" stroke="#1E4E1E" strokeWidth="1" />

      {/* Bridge tower */}
      <rect x="660" y="70" width="120" height="120" rx="4" fill="#0D2540" stroke="#1A4060" strokeWidth="1.5" />
      <rect x="670" y="50" width="100" height="25" rx="3" fill="#0A1E30" stroke="#1A4060" strokeWidth="1" />
      {/* Bridge windows */}
      <rect x="675" y="85" width="20" height="14" rx="2" fill="#2D7DD2" opacity="0.7" />
      <rect x="702" y="85" width="20" height="14" rx="2" fill="#2D7DD2" opacity="0.7" />
      <rect x="729" y="85" width="20" height="14" rx="2" fill="#2D7DD2" opacity="0.5" />
      <rect x="756" y="85" width="16" height="14" rx="2" fill="#2D7DD2" opacity="0.6" />

      {/* Funnel */}
      <rect x="700" y="30" width="28" height="24" rx="4" fill="#1A3A5C" stroke="#2D5A8A" strokeWidth="1" />
      {/* Smoke */}
      <ellipse cx="714" cy="22" rx="5" ry="8" fill="#8899BB" opacity="0.15">
        <animateTransform attributeName="transform" type="translate" values="0,0;-2,-12;0,0" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0.05;0.15" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="714" cy="10" rx="7" ry="10" fill="#8899BB" opacity="0.08">
        <animateTransform attributeName="transform" type="translate" values="0,0;-4,-18;0,0" dur="4s" repeatCount="indefinite" />
      </ellipse>

      {/* Waterline reflection */}
      <path d="M60 285 L840 285 L800 300 L100 300 Z" fill="#061020" opacity="0.6" />

      {/* Anchor chain */}
      <line x1="130" y1="280" x2="130" y2="310" stroke="#1A4060" strokeWidth="2" />
    </svg>
  );
}
