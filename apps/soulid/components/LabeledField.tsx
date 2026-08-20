'use client';

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useT } from '@/lib/i18n';

// Tüm formlarda TEK etiketli-alan bileşeni. Etiket stili tek yerde.
const LABEL = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-faint';
// Manuel sayı girişi — iOS'ta wheel/scroll picker YERİNE elle yazma (sakin.life
// tarzı). text-base=16px iOS zoom'unu önler; center hizalı, sade.
const NUM_INPUT =
  'input-surface h-[56px] w-full rounded-2xl border border-panelBorder px-2 text-center text-base text-ink placeholder:text-faint/70 focus:border-gold/70 focus:outline-none';

const pad2 = (n: number) => String(n).padStart(2, '0');
// Üst sınır — statik export'ta dinamik Date istemiyoruz; makul bir tavan yeter.
const MAX_YEAR = 2100;

export function LabeledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      {children}
    </label>
  );
}

/**
 * Tarih — ELLE giriş (Gün / Ay / Yıl). Native wheel picker'da tarih kolayca
 * kayıyordu (yanlış Ay burcu şikâyetinin kök sebebi). Üç ayrı numara alanı
 * hem net hem locale-bağımsız. Alan dolunca imleç OTOMATİK sonraki kutuya geçer.
 * Değer 'yyyy-mm-dd' olarak emit edilir.
 */
export function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { locale } = useT();
  const tr = locale === 'tr';
  const [d, setD] = useState('');
  const [m, setM] = useState('');
  const [y, setY] = useState('');
  const applied = useRef(false);
  const rDay = useRef<HTMLInputElement>(null);
  const rMon = useRef<HTMLInputElement>(null);
  const rYear = useRef<HTMLInputElement>(null);

  // Prefill/düzenleme: value ilk dolduğunda alanlara bir kez yansıt.
  useEffect(() => {
    if (applied.current || !value) return;
    const [py, pm, pd] = value.split('-');
    if (py && pm && pd) {
      setY(py);
      setM(String(Number(pm)));
      setD(String(Number(pd)));
      applied.current = true;
    }
  }, [value]);

  function emit(nd: string, nm: string, ny: string) {
    const di = Number(nd);
    const mi = Number(nm);
    const yi = Number(ny);
    const ok =
      !!nd && !!nm && ny.length === 4 &&
      di >= 1 && di <= 31 && mi >= 1 && mi <= 12 && yi >= 1900 && yi <= MAX_YEAR;
    onChange(ok ? `${ny}-${pad2(mi)}-${pad2(di)}` : '');
  }

  // Alan dolunca görsel sıradaki kutuya geç.
  const order: RefObject<HTMLInputElement | null>[] = tr ? [rDay, rMon, rYear] : [rMon, rDay, rYear];
  const advance = (from: RefObject<HTMLInputElement | null>) => {
    const i = order.indexOf(from);
    if (i >= 0 && i < order.length - 1) order[i + 1]!.current?.focus();
  };

  const onD = (v: string) => { const s = v.replace(/\D/g, '').slice(0, 2); setD(s); emit(s, m, y); if (s.length === 2) advance(rDay); };
  const onM = (v: string) => { const s = v.replace(/\D/g, '').slice(0, 2); setM(s); emit(d, s, y); if (s.length === 2) advance(rMon); };
  const onY = (v: string) => { const s = v.replace(/\D/g, '').slice(0, 4); setY(s); emit(d, m, s); };

  const dayF = (
    <input key="d" ref={rDay} inputMode="numeric" value={d} onChange={(e) => onD(e.target.value)}
      placeholder={tr ? 'Gün' : 'Day'} aria-label={tr ? 'Gün' : 'Day'} className={NUM_INPUT} />
  );
  const monF = (
    <input key="m" ref={rMon} inputMode="numeric" value={m} onChange={(e) => onM(e.target.value)}
      placeholder={tr ? 'Ay' : 'Mon'} aria-label={tr ? 'Ay' : 'Month'} className={NUM_INPUT} />
  );
  const yearF = (
    <input key="y" ref={rYear} inputMode="numeric" value={y} onChange={(e) => onY(e.target.value)}
      placeholder={tr ? 'Yıl' : 'Year'} aria-label={tr ? 'Yıl' : 'Year'} className={NUM_INPUT} />
  );

  return (
    <div>
      <span className={LABEL}>{label}</span>
      <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-2">
        {tr ? [dayF, monF, yearF] : [monF, dayF, yearF]}
      </div>
    </div>
  );
}

/**
 * Saat — ELLE giriş (Saat : Dakika) + "biliniyor" onayı. Saat dolunca imleç
 * otomatik dakikaya geçer. Değer 'HH:MM' olarak emit edilir.
 */
export function TimeKnownField({
  label,
  value,
  onChange,
  known,
  onKnownChange,
  knownLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  known: boolean;
  onKnownChange: (b: boolean) => void;
  knownLabel: string;
}) {
  const [h, setH] = useState('');
  const [min, setMin] = useState('');
  const applied = useRef(false);
  const rMin = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (applied.current || !value) return;
    const [ph, pm] = value.split(':');
    if (ph != null && pm != null) {
      setH(String(Number(ph)));
      setMin(pad2(Number(pm)));
      applied.current = true;
    }
  }, [value]);

  function emit(nh: string, nm: string) {
    const hi = Number(nh);
    const mi = Number(nm);
    const ok = nh !== '' && nm !== '' && hi >= 0 && hi <= 23 && mi >= 0 && mi <= 59;
    onChange(ok ? `${pad2(hi)}:${pad2(mi)}` : '');
  }
  const onH = (v: string) => { const s = v.replace(/\D/g, '').slice(0, 2); setH(s); emit(s, min); if (s.length === 2) rMin.current?.focus(); };
  const onMin = (v: string) => { const s = v.replace(/\D/g, '').slice(0, 2); setMin(s); emit(h, s); };

  return (
    <div>
      <span className={LABEL}>{label}</span>
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
        <input inputMode="numeric" value={h} disabled={!known} onChange={(e) => onH(e.target.value)}
          placeholder="00" aria-label="Saat" className={`${NUM_INPUT} disabled:opacity-40`} />
        <input ref={rMin} inputMode="numeric" value={min} disabled={!known} onChange={(e) => onMin(e.target.value)}
          placeholder="00" aria-label="Dakika" className={`${NUM_INPUT} disabled:opacity-40`} />
        <label className="flex h-[56px] cursor-pointer items-center gap-2 rounded-2xl border border-panelBorder px-4">
          <input type="checkbox" checked={known} onChange={(e) => onKnownChange(e.target.checked)}
            className="h-5 w-5 accent-gold" />
          <span className="whitespace-nowrap text-xs text-muted">{knownLabel}</span>
        </label>
      </div>
    </div>
  );
}
