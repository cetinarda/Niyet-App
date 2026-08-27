'use client';

import { useNav } from '@/lib/nav';
import { useState } from 'react';
import { PageLayout, Section, Bullet } from '@/components/PageLayout';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MotionToggle } from '@/components/MotionToggle';
import { useSoulStore } from '@/lib/store';
import { purgeAccount } from '@/lib/supabase/reports';

export default function Settings() {
  const nav = useNav();
  const report = useSoulStore((s) => s.report);
  const reset = useSoulStore((s) => s.reset);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function exportData() {
    if (!report) {
      alert('Henüz veri yok.');
      return;
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `soulprofile-export-${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function deleteData() {
    setDeleting(true);
    setDeleteError(null);
    const result = await purgeAccount();
    if (!result.ok) {
      setDeleteError(result.error ?? 'Silme başarısız');
      setDeleting(false);
      return;
    }
    reset();
    setConfirming(false);
    setDeleting(false);
    nav.replace('/');
  }

  return (
    <PageLayout
      kicker="AYARLAR"
      title="Verin senin kontrolünde"
      intro="Karneni indir, hesabını sil, abonelikleri yönet. Tüm hakların KVKK + GDPR çerçevesinde korunur."
    >
      <Section heading="Görünüm">
        <p>Uygulamanın temasını seç. "Sistem" cihazının ayarına uyar.</p>
        <div className="mt-2">
          <ThemeToggle />
        </div>
      </Section>

      <Section heading="Erişilebilirlik · Hareket">
        <p>
          Animasyonları azaltmak gözünü yorduğun an hayatını kolaylaştırır. Cihazın
          ayarını okuyabiliriz; istersen elle de seçebilirsin.
        </p>
        <div className="mt-2">
          <MotionToggle />
        </div>
      </Section>

      <Section heading="Verilerini İndir">
        <p>
          Karneni JSON formatında indir. İçeriğinde tüm sistemlerden çıkan değerler ve AI
          anlatın bulunur. Bu dosya başka bir hizmete taşımak veya saklamak için kullanılabilir.
        </p>
        <button
          type="button"
          onClick={exportData}
          className="mt-2 inline-block rounded-full border border-gold/50 px-5 py-2 text-sm font-bold text-gold hover:bg-gold/10"
        >
          ⬇ JSON İndir
        </button>
      </Section>

      <Section heading="Verilerini Sil">
        <p>
          Hesabını sildiğinde: bu cihazdaki tüm SoulProfile verisi, sunucudaki karne kayıtların,
          ödeme yetki kayıtların ve yüklediğin fotoğraflar kalıcı olarak silinir. Bu işlem geri
          alınamaz (KVKK / GDPR Art.17 — unutulma hakkı).
        </p>
        {deleteError ? (
          <p className="mt-2 rounded-lg border border-danger/40 bg-danger/10 p-2.5 text-[12px] text-danger">
            {deleteError}
          </p>
        ) : null}
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-2 inline-block rounded-full border border-danger/50 px-5 py-2 text-sm font-bold text-danger hover:bg-danger/10"
          >
            ✕ Hesabımı / Verimi Sil
          </button>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={deleteData}
              disabled={deleting}
              className="rounded-full bg-danger px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {deleting ? 'Siliniyor...' : 'Evet, hepsini sil'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="rounded-full border border-panelBorder px-5 py-2 text-sm text-muted disabled:opacity-60"
            >
              Vazgeç
            </button>
          </div>
        )}
      </Section>

      <Section heading="Abonelik Yönetimi">
        <Bullet>
          iOS: Ayarlar → Apple ID → Abonelikler → SoulProfile
        </Bullet>
        <Bullet>
          Web (Stripe): Yakında bu sayfada "müşteri portalı" linki çıkacak. O sırada
          cetinarda@gmail.com adresine yaz, ekibimiz seninle ilgilenir.
        </Bullet>
      </Section>

      <Section heading="Gizliliğin">
        <p>
          Hangi verileri topladığımız, nasıl sakladığımız ve haklarının tamamı{' '}
          <a className="text-gold underline" href="/privacy">Gizlilik Politikası</a> ve{' '}
          <a className="text-gold underline" href="/data">Veri Hakları</a> sayfalarında.
        </p>
      </Section>
    </PageLayout>
  );
}
