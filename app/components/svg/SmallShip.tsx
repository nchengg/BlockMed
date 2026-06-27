export default function SmallShip({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: "visible" }}
    >
      {/* Hull */}
      <path d="M20 130 L400 130 L370 170 L50 170 Z" fill="#0D2137" stroke="#1A4060" strokeWidth="1.5" />
      <path d="M20 130 L35 105 L385 105 L400 130 Z" fill="#0A1E30" stroke="#1A4060" strokeWidth="1" />

      {/* Small cargo hold */}
      <rect x="60" y="70" width="80" height="38" rx="3" fill="#0A1E30" stroke="#1A4060" strokeWidth="1" />
      <rect x="70" y="75" width="60" height="28" rx="2" fill="#061020" />

      {/* A couple of small containers */}
      <rect x="165" y="78" width="42" height="30" rx="2" fill="#8B1A1A" stroke="#6B1414" strokeWidth="1" />
      <rect x="215" y="78" width="42" height="30" rx="2" fill="#1A4A7A" stroke="#143860" strokeWidth="1" />

      {/* Bridge - smaller, more modest */}
      <rect x="295" y="55" width="75" height="55" rx="3" fill="#0D2540" stroke="#1A4060" strokeWidth="1.5" />
      <rect x="300" y="42" width="65" height="16" rx="2" fill="#0A1E30" stroke="#1A4060" strokeWidth="1" />
      {/* Windows */}
      <rect x="305" y="65" width="16" height="10" rx="1" fill="#2D7DD2" opacity="0.6" />
      <rect x="328" y="65" width="16" height="10" rx="1" fill="#2D7DD2" opacity="0.5" />
      <rect x="351" y="65" width="12" height="10" rx="1" fill="#F0F4FF" opacity="0.3" />

      {/* Small funnel */}
      <rect x="318" y="26" width="18" height="18" rx="3" fill="#1A3A5C" stroke="#2D5A8A" strokeWidth="1" />
      {/* Smoke - thinner */}
      <ellipse cx="327" cy="18" rx="3" ry="6" fill="#8899BB" opacity="0.12">
        <animateTransform attributeName="transform" type="translate" values="0,0;-1,-8;0,0" dur="3.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.12;0.04;0.12" dur="3.5s" repeatCount="indefinite" />
      </ellipse>

      {/* Silhouette figure on bridge */}
      <ellipse cx="340" cy="57" rx="4" ry="5" fill="#8899BB" opacity="0.6" />
      <rect x="337" y="62" width="6" height="8" rx="1" fill="#8899BB" opacity="0.5" />

      {/* Warm light on deck */}
      <ellipse cx="210" cy="108" rx="40" ry="6" fill="#FFB347" opacity="0.06" />
    </svg>
  );
}
