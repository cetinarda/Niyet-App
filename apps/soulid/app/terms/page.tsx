import { PageLayout, Section, Bullet } from '@/components/PageLayout';

export const metadata = { title: 'Kullanım Koşulları — SoulProfile' };

export default function Terms() {
  return (
    <PageLayout
      kicker="KULLANIM KOŞULLARI"
      title="Aramızdaki anlaşma"
      intro="SoulProfile'ı kullanarak aşağıdaki koşulları kabul etmiş sayılırsın. Son güncelleme: 19 Mayıs 2026."
    >
      <Section heading="Hizmetin Niteliği">
        <p>
          SoulProfile; astroloji, Human Design ve numeroloji içeriklerini farkındalık ve kendini
          keşif amacıyla sunan bir uygulamadır. <strong>Tıbbi, psikiyatrik, hukuki veya finansal
          tavsiye değildir.</strong>
        </p>
        <p>
          Karnedeki yorumlar sembolik dildedir; karar verme süreçlerinde profesyonel destek almayı
          ihmal etme.
        </p>
      </Section>

      <Section heading="Hesap ve Yaş Koşulu">
        <Bullet>16 yaşın altındaysan SoulProfile'ı kullanma.</Bullet>
        <Bullet>Doğum bilgilerini doğru girmek senin sorumluluğun. Yanlış veri yanlış karneye yol açar.</Bullet>
        <Bullet>Hesabını korumak (şifre/cihaz erişimi) sana aittir.</Bullet>
      </Section>

      <Section heading="Abonelikler">
        <p>
          Premium abonelikler haftalık, aylık veya yıllık olarak Apple App Store, Google Play veya
          Stripe üzerinden faturalanır. Otomatik yenilenir; iptal etmek için ilgili mağaza/portal
          ayarlarını kullan. Periyot bittikten sonra erişim sonlanır.
        </p>
      </Section>

      <Section heading="Fikri Mülkiyet">
        <p>
          Uygulama içeriği, karne tasarımı, yıldız ırkı arketipleri ve metin şablonları SoulProfile'a
          aittir. Kendi karneni paylaşma hakkın saklıdır.
        </p>
      </Section>

      <Section heading="Yasaklı Kullanım">
        <Bullet>Başkalarının verilerini izinsiz girmek</Bullet>
        <Bullet>Otomatik araçlarla scraping yapmak</Bullet>
        <Bullet>API'yi tersine mühendislikle çoğaltmak</Bullet>
      </Section>

      <Section heading="Sorumluluk Sınırı">
        <p>
          SoulProfile içerikleri "olduğu gibi" sunulur. Yorumların doğruluğu, eksiksizliği veya
          herhangi bir sonuca uygunluğu garanti edilmez. Yasanın izin verdiği azami ölçüde,
          kullanımdan kaynaklanan dolaylı zararlardan sorumlu değiliz.
        </p>
      </Section>

      <Section heading="Uygulanacak Hukuk">
        <p>
          Bu sözleşmeye Türkiye Cumhuriyeti yasaları uygulanır. Anlaşmazlıklarda İstanbul Anadolu
          mahkemeleri ve icra daireleri yetkilidir. AB kullanıcıları için tüketici mevzuatından
          doğan haklar saklıdır.
        </p>
      </Section>
    </PageLayout>
  );
}
