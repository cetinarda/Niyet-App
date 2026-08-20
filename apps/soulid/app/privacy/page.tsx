import { PageLayout, Section, Bullet } from '@/components/PageLayout';

export const metadata = { title: 'Gizlilik Politikası — SoulProfile' };

export default function Privacy() {
  return (
    <PageLayout
      kicker="GİZLİLİK POLİTİKASI"
      title="Senin verin sana ait"
      intro="Bu politika SoulProfile'ın doğum bilgilerini, fotoğrafını ve uygulama içi etkileşimlerini nasıl topladığını, sakladığını ve sildiğini açıklar. Son güncelleme: 19 Mayıs 2026."
    >
      <Section heading="Topladığımız Veriler">
        <p>Karneni üretebilmek için aşağıdaki verileri topluyoruz:</p>
        <Bullet>Tam adın (karne başlığı için)</Bullet>
        <Bullet>Doğum tarihi, doğum saati ve doğum yeri (gezegen pozisyonları + Human Design için zorunlu)</Bullet>
        <Bullet>İsteğe bağlı profil fotoğrafı (karne görseline basılır)</Bullet>
        <Bullet>Anonimleştirilmiş kullanım analitikleri</Bullet>
      </Section>

      <Section heading="Verini Neden Topluyoruz">
        <p>
          Astrolojik harita, Kuzey/Güney Ay Düğümü, Human Design tipi ve numerolojin için bu veriler
          zorunlu. Hesaplamalar tarayıcında yapılır. Karne kaydedilirken Supabase üzerinde şifreli
          olarak senin hesabına bağlı tutulur.
        </p>
      </Section>

      <Section heading="Üçüncü Taraflar">
        <Bullet>
          <strong>Anthropic Claude API:</strong> Anlatım metni üretirken karne özetin gönderilir.
          Anthropic varsayılan olarak verini eğitim için kullanmaz.
        </Bullet>
        <Bullet>
          <strong>AI görsel servisi (OpenAI):</strong> Yalnızca &quot;AI ile karaktere dönüştür&quot;
          butonuna bastığında profil fotoğrafın karakter portresi üretilmesi için gönderilir.
          Bu işlem otomatik değildir; butona basmazsan fotoğrafın cihazından çıkmaz. Üretilen
          portre cihazında saklanır.
        </Bullet>
        <Bullet>
          <strong>Supabase:</strong> Hesap, doğum bilgisi ve karne kayıtları için. EU bölgesinde
          barındırılır.
        </Bullet>
        <Bullet>
          <strong>Open-Meteo Geocoding:</strong> Doğum yeri adından koordinat ve saat dilimi
          almak için.
        </Bullet>
        <Bullet>
          <strong>Stripe / Apple / RevenueCat:</strong> Premium aboneliklerin yönetimi için (yalnız
          ödeme yaparsan).
        </Bullet>
      </Section>

      <Section heading="Saklama Süresi">
        <p>
          Hesabın aktif kaldığı sürece verin saklanır. Hesabını sildiğinde tüm doğum bilgilerin ve
          karnelerin 30 gün içinde kalıcı olarak silinir. Yedeklerden tamamen kaldırılma 90 günü
          bulabilir.
        </p>
      </Section>

      <Section heading="Hakların (KVKK + GDPR)">
        <Bullet>İşlenen verilere erişim ve kopya talep etme</Bullet>
        <Bullet>Düzeltme talep etme</Bullet>
        <Bullet>Silinmesini talep etme ("unutulma hakkı")</Bullet>
        <Bullet>İşlemenin kısıtlanmasını talep etme</Bullet>
        <Bullet>Veri taşınabilirliği (JSON export)</Bullet>
        <Bullet>İtirazda bulunma</Bullet>
        <p className="text-sm text-muted">Talepler için: cetinarda@gmail.com</p>
      </Section>

      <Section heading="Çocukların Verileri">
        <p>
          SoulProfile 16 yaş altı kullanıcılar için tasarlanmamıştır. 16 yaş altı bir kullanıcının
          veri sağladığını fark edersek, derhal silinir.
        </p>
      </Section>

      <Section heading="Çerezler">
        <p>
          Web sürümünde yalnızca zorunlu çerezler (oturum ve tercih) kullanılır. Anonim analitik
          çerezler için ilk ziyarette rızanı sorarız; reddedersen yüklemeyiz. Ödeme akışında Stripe
          kendi çerezlerini kullanır. Tarayıcı ayarlarından tümünü silebilirsin.
        </p>
      </Section>
    </PageLayout>
  );
}
