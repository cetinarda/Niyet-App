import { CosmicBackground } from './CosmicBackground';

type Props = {
  kicker?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  variant?: 'galaxy' | 'cosmic' | 'aurora';
};

export function PageLayout({ kicker, title, intro, children, variant = 'cosmic' }: Props) {
  return (
    <div className="relative min-h-[80vh] py-20 md:py-28">
      <CosmicBackground variant={variant} />
      <div className="mx-auto max-w-2xl px-6">
        {kicker ? (
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.5em] text-gold/80">{kicker}</p>
        ) : null}
        <h1 className="font-display text-4xl leading-[1.15] text-ink md:text-5xl">{title}</h1>
        {intro ? (
          <p className="mt-6 text-[15px] leading-[1.85] text-muted md:text-[17px]">{intro}</p>
        ) : null}
        <div className="mt-14 space-y-8">{children}</div>
      </div>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="card-surface rounded-3xl border border-panelBorder p-7 md:p-8">
      <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.3em] text-gold">{heading}</h2>
      <div className="space-y-4 text-[15px] leading-[1.85] text-ink">{children}</div>
    </section>
  );
}

export function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-1 text-xs text-gold">✦</span>
      <p className="flex-1 text-[14px] leading-[1.8] text-muted">{children}</p>
    </div>
  );
}
