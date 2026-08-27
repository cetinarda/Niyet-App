// Tek kaynak — tüm form inputları aynı görünür. iOS-safe:
//  - text-base = 16px → iOS focus'ta zoom + reflow YOK (taşma sebebiydi)
//  - .form-input global CSS'i appearance-none + min-w-0 + box-border verir
//    (date/time native inputları artık container'ı taşırmıyor)

export const FORM_INPUT =
  'form-input input-surface w-full rounded-2xl border border-panelBorder px-5 text-base text-ink placeholder:text-faint focus:border-gold/70 focus:outline-none';

// Birincil (gold) ve ikincil (cosmic) buton — sayfalar arası tutarlı boyut.
export const BTN_PRIMARY =
  'flex w-full items-center justify-center gap-2.5 rounded-full bg-gold py-4 text-[15px] font-bold tracking-wide text-[#1a0a40] shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60';

export const BTN_COSMIC =
  'flex w-full items-center justify-center gap-2.5 rounded-full bg-cosmic py-4 text-[15px] font-bold tracking-wide text-white shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60';
