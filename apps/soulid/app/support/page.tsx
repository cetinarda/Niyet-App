import { PageLayout, Section, Bullet } from '@/components/PageLayout';

export const metadata = { title: 'Destek — SoulProfile' };

export default function Support() {
  return (
    <PageLayout
      kicker="DESTEK"
      title="Buradayız"
      intro="Sıkça sorulan sorular ve bize ulaşman için bilgiler."
    >
      <Section heading="Sıkça Sorulanlar">
        <Bullet>
          <strong>Doğum saatimi bilmiyorum, sorun olur mu?</strong> Hayır. Yükselen Burç ve Human
          Design otoritesi tam doğru olmayabilir; karnenin geri kalanı çalışır. Form'da "Saat
          biliniyor" anahtarını kapat.
        </Bullet>
        <Bullet>
          <strong>Verim güvende mi?</strong> Evet. Doğum verin EU bölgesinde şifreli saklanır,
          istediğin zaman silinir.
        </Bullet>
        <Bullet>
          <strong>Aboneliğimi nasıl iptal ederim?</strong> iOS: Ayarlar → Apple ID → Abonelikler.
          Web: Profil → Abonelik → İptal.
        </Bullet>
        <Bullet>
          <strong>Karnem yanlış mı çıktı?</strong> Doğum tarihi/saati/yeri girişini kontrol et.
          Yer otokompletinden seçtiğin koordinat ve saat dilimi kritik.
        </Bullet>
        <Bullet>
          <strong>İade alabilir miyim?</strong> Web ödemelerinde 14 gün cayma hakkın var.
          App Store/Play satın alımlarında platform politikaları geçerli.
        </Bullet>
      </Section>

      <Section heading="Bize Ulaş">
        <p>Her konuda (genel, gizlilik/veri talepleri, yasal, iş birliği, basın) bize yazabilirsin. Yanıt süremiz iş günleri içinde 24 saatten azdır.</p>
        <Bullet>
          <strong>E-posta:</strong>{' '}
          <a className="text-gold underline" href="mailto:cetinarda@gmail.com">cetinarda@gmail.com</a>
        </Bullet>
      </Section>
    </PageLayout>
  );
}
