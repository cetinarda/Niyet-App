import clsx from 'clsx';

type Variant = 'galaxy' | 'cosmic' | 'aurora';

type Props = {
  variant?: Variant;
  className?: string;
};

const BG: Record<Variant, string> = {
  galaxy: 'bg-galaxy',
  cosmic: 'bg-cosmic',
  aurora: 'bg-aurora',
};

export function CosmicBackground({ variant = 'galaxy', className }: Props) {
  return (
    <div
      aria-hidden
      className={clsx(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden nebula-glow',
        BG[variant],
        'opacity-70', // sayfa zemini zaten kendi nebula vignette'ine sahip — daha sakin overlay
        className,
      )}
    >
      <div className="starfield" />
    </div>
  );
}
