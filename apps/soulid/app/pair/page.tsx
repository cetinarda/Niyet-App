'use client';

import { useEffect, useState } from 'react';
import { CosmicBackground } from '@/components/CosmicBackground';
import { PairAvatars } from '@/components/PairAvatars';
import { useSoulStore } from '@/lib/store';
import { listReports } from '@/lib/supabase/reports';
import { readSakinAvatar } from '@/lib/sakin-bridge';
import type { GalacticReport } from '@/lib/types';
import { useNav } from '@/lib/nav';
import { useT } from '@/lib/i18n';

/**
 * EŞLEŞME EKRANI: Keşfet'ten SoulID'ye girildiğinde açılan ilk ekran.
 *
 * Neden karne değil de bu: kullanıcının kendi kimliği Sakin köprüsüyle zaten
 * biliniyor (ad, doğum tarihi/saati/yeri). O yüzden burada tek eksik ikinci
 * kişi; ekran da tam olarak onu soruyor. Karneye ve diğer bölümlere menüden
 * (☰) ulaşılır, "Atla" da oraya götürür.
 */
export default function PairPage() {
  const { t, locale } = useT();
  const nav = useNav();
  const storeReport = useSoulStore((s) => s.report);
  const [me, setMe] = useState<GalacticReport | null>(storeReport);
  const [photo, setPhoto] = useState<string | null>(null);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setPhoto(readSakinAvatar());
    if (!storeReport) {
      listReports().then((r) => { if (r[0]) setMe(r[0]); }).catch(() => {}).finally(() => setHydrated(true));
    } else {
      setHydrated(true);
    }
  }, [storeReport]);

  // Kendi karnesi yoksa (Sakin'de doğum bilgisi hiç girilmemiş) eşleştirecek
  // bir kimlik de yok: boş daire göstermek yerine doğum formuna yönlendir.
  useEffect(() => {
    if (hydrated && !me) nav.push('/birth');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, me]);

  const mySun = me?.chart.planets.find((p) => p.name === 'Sun')?.sign ?? null;
  const firstName = (me?.birth.fullName || '').trim().split(/\s+/)[0];

  return (
    <div className="relative min-h-[100dvh]">
      <CosmicBackground variant="aurora" />
      <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-6 pb-10 pt-14 font-brand">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.45em] text-gold">{t('pair.kicker')}</p>
          <h1 className="mt-4 text-[26px] font-medium leading-tight text-ink">{t('pair.title')}</h1>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">{t('pair.subtitle')}</p>
        </div>

        <div className="mt-14">
          <PairAvatars
            meLabel={firstName || t('pair.you')}
            meSign={mySun}
            mePhoto={photo}
            otherLabel={t('pair.partner')}
            onAdd={() => nav.push('/pair/add')}
            addLabel={t('pair.add')}
          />
        </div>

        <button
          type="button"
          onClick={() => nav.push('/pair/add')}
          className="mt-14 w-full rounded-full border border-gold/50 bg-gold/[0.07] py-4 text-[12px] uppercase tracking-[0.3em] text-gold transition-colors hover:bg-gold/[0.12]"
          style={{ WebkitAppearance: 'none', appearance: 'none' }}
        >
          {t('pair.add')}
        </button>

        {/* ATLA: uyuma bakmak istemeyen kullanıcı burada tıkanmasın. Ana sayfaya
            DEĞİL, bölüm listesine gider (kullanıcı kararı): oradan karnesine,
            bağlanma stiline, geçmişine tek dokunuşla ulaşır. */}
        <button
          type="button"
          onClick={() => nav.push('/menu')}
          className="mx-auto mt-6 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-faint transition-colors hover:text-muted"
          style={{ WebkitAppearance: 'none', appearance: 'none', background: 'none', border: 0 }}
        >
          {t('pair.skip')}
        </button>

        <p className="mt-auto pt-10 text-center text-[10px] leading-relaxed text-faint">
          {locale === 'tr'
            ? 'Doğum bilgileri yalnızca cihazında hesaplanır.'
            : 'Birth details are computed on your device only.'}
        </p>
      </div>
    </div>
  );
}
