/**
 * SoulProfile marka işareti — kare çerçeve + iki nokta (iki ruh).
 * Logo ile birebir tutarlı, inline SVG. currentColor kullanır.
 */
export function BrandMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect
        x="14"
        y="14"
        width="72"
        height="72"
        rx="6"
        stroke="currentColor"
        strokeWidth="6"
        opacity="0.95"
      />
      <circle cx="36" cy="50" r="8" fill="currentColor" />
      <circle cx="64" cy="50" r="8" fill="currentColor" />
    </svg>
  );
}
