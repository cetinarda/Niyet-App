import { PageLayout, Section, Bullet } from '@/components/PageLayout';

export const metadata = { title: 'Veri Hakların — SoulProfile' };

export default function DataRights() {
  return (
    <PageLayout
      kicker="VERİ HAKLARIN"
      title="Verin sana ait — KVKK & GDPR"
      intro="Her kullanıcı kendi verisinin sahibidir. SoulProfile, KVKK (6698 sayılı Kanun) ve GDPR çerçevesinde aşağıdaki hakları teminat altına alır."
    >
      <Section heading="Haklarınız">
        <Bullet>Hangi verilerinin işlendiğini öğrenme</Bullet>
        <Bullet>İşlenme amacını ve verilerin nereye aktarıldığını öğrenme</Bullet>
        <Bullet>Eksik veya yanlış işlenmişse düzeltilmesini isteme</Bullet>
        <Bullet>Silinmesini veya yok edilmesini isteme</Bullet>
        <Bullet>İşlemenin durdurulmasını veya kısıtlanmasını isteme</Bullet>
        <Bullet>Otomatik karar verme süreçlerine itiraz etme</Bullet>
        <Bullet>Verilerin başka bir hizmete taşınmasını talep etme (JSON portability)</Bullet>
      </Section>

      <Section heading="Nasıl Talep Açılır">
        <p>
          Uygulama içinden: Profil → Gizlilik → "Verilerimi indir" veya "Hesabımı sil".
        </p>
        <p>
          E-posta ile: cetinarda@gmail.com adresine kayıtlı e-postandan talebini yazarsın.
        </p>
      </Section>

      <Section heading="Yanıt Süresi">
        <p>
          KVKK kapsamında en geç 30 gün, GDPR kapsamında en geç 1 ay içinde sana yanıt veririz.
        </p>
      </Section>

      <Section heading="Şikâyet Hakkın">
        <p>
          Türkiye'de Kişisel Verileri Koruma Kurumu'na (KVKK), AB'de ilgili ulusal veri koruma
          otoritesine şikâyette bulunma hakkın saklıdır.
        </p>
      </Section>
    </PageLayout>
  );
}
