export default function JerseySVG({
  primary = '#15803D',
  secondary = '#22C55E',
  number = '10',
  name = 'PLAYER',
  size = 200,
  pattern = 'solid',
}) {
  const id = `j-${primary.replace('#', '')}-${secondary.replace('#', '')}`;
  return (
    <svg viewBox="0 0 220 240" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }}>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary} stopOpacity="1" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`sheen-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <clipPath id={`clip-${id}`}>
          <path d="M 52 215 L 52 98 L 18 84 L 8 55 L 42 44 L 62 72 L 70 64 Q 110 50 150 64 L 158 72 L 178 44 L 212 55 L 202 84 L 168 98 L 168 215 Z" />
        </clipPath>
      </defs>

      {/* Jersey body */}
      <path
        d="M 52 215 L 52 98 L 18 84 L 8 55 L 42 44 L 62 72 L 70 64 Q 110 50 150 64 L 158 72 L 178 44 L 212 55 L 202 84 L 168 98 L 168 215 Z"
        fill={`url(#grad-${id})`}
      />

      {/* Stripes pattern */}
      {pattern === 'stripes' && (
        <g clipPath={`url(#clip-${id})`}>
          {[0,24,48,72,96,120,144,168,192].map(x => (
            <rect key={x} x={x} y="0" width="12" height="240" fill={secondary} opacity="0.22" />
          ))}
        </g>
      )}

      {/* Gradient pattern */}
      {pattern === 'gradient' && (
        <g clipPath={`url(#clip-${id})`}>
          <rect x="0" y="0" width="220" height="240" fill={secondary} opacity="0.12" />
          <path d="M 52 215 L 52 98 L 168 98 L 168 215 Z" fill={secondary} opacity="0.1" />
        </g>
      )}

      {/* Sheen overlay */}
      <path
        d="M 52 215 L 52 98 L 18 84 L 8 55 L 42 44 L 62 72 L 70 64 Q 110 50 150 64 L 158 72 L 178 44 L 212 55 L 202 84 L 168 98 L 168 215 Z"
        fill={`url(#sheen-${id})`}
      />

      {/* Collar */}
      <path
        d="M 70 64 Q 90 82 110 84 Q 130 82 150 64 Q 135 72 110 74 Q 85 72 70 64 Z"
        fill={secondary}
        opacity="0.9"
      />

      {/* Shoulder seams */}
      <line x1="52" y1="98" x2="70" y2="64" stroke={secondary} strokeWidth="2" opacity="0.4" />
      <line x1="168" y1="98" x2="150" y2="64" stroke={secondary} strokeWidth="2" opacity="0.4" />

      {/* Side panel accents */}
      <path d="M 52 98 L 52 215 L 72 215 L 72 98 Z" fill={secondary} opacity="0.15" />
      <path d="M 148 98 L 148 215 L 168 215 L 168 98 Z" fill={secondary} opacity="0.15" />

      {/* Bottom hem stripe */}
      <rect x="52" y="205" width="116" height="10" rx="0" fill={secondary} opacity="0.3" />

      {/* Number */}
      <text
        x="110"
        y="168"
        textAnchor="middle"
        fontSize="72"
        fontWeight="900"
        fontFamily="'Arial Black', Arial, sans-serif"
        fill={secondary}
        opacity="0.95"
        letterSpacing="-2"
      >{number}</text>

      {/* Name */}
      <text
        x="110"
        y="197"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
        fill={secondary}
        opacity="0.7"
        letterSpacing="3"
      >{name.toUpperCase()}</text>
    </svg>
  );
}
