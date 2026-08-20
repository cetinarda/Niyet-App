import { PageLayout, Section, Bullet } from '@/components/PageLayout';

export const metadata = { title: 'Hakkımızda — SoulProfile' };

export default function About() {
  return (
    <PageLayout
      kicker="HAKKIMIZDA"
      title="Doğduğunda yıldızlar sana ne söylüyordu?"
      intro="SoulProfile, doğum verilerinden 9 farklı sistemi sentezleyen bir kozmik kimlik aynasıdır. Tek bir karne — bir hayata sığacak büyüklükte."
    >
      <Section heading="Vizyonumuz">
        <p>
          Kimliğin yalnızca bir burç değil. Hem Güneş'in, hem Ay'ın, hem Kuzey ve Güney Düğümün,
          hem Human Design tipin, hem Yaşam Yolu sayın, hem Vedik nakshatran, hem Maya Kin'in,
          hem Norse runun, hem Tarot doğum kartların ve hem de yıldız hattının birbiriyle konuşan
          bir bütünsün. SoulProfile bu sentezi tek bir kişisel karnede gösterir.
        </p>
      </Section>

      <Section heading="9 Sistemin Sentezi">
        <Bullet>Batı Astrolojisi — Güneş, Ay, Yükselen, 10 gezegen, Kuzey/Güney Ay Düğümü, 12 ev</Bullet>
        <Bullet>Vedik Nakshatra — Lahiri ayanamsa ile Ay'ın 27 yıldız evi + 4 pada</Bullet>
        <Bullet>Çin Zodyak — 12 hayvan × 5 element × Yin/Yang, CNY tabanlı</Bullet>
        <Bullet>Maya Tzolkin — 260 günlük takvim, Kin numarası (20 mühür × 13 ton)</Bullet>
        <Bullet>Norse Doğum Runu — Elder Futhark 24 rune</Bullet>
        <Bullet>Tarot Doğum Kartı — Kişilik + Ruh, Mary K. Greer formülü</Bullet>
        <Bullet>Human Design — Tip, Strateji, Otorite, Profil, Enkarnasyon kapısı</Bullet>
        <Bullet>Numeroloji — Yaşam Yolu (master 11/22/33), İfade, Ruh Arzusu, Kişisel Yıl</Bullet>
        <Bullet>Yıldız Irkı (Starseed) — 10 galaktik arketipten dominant olan</Bullet>
      </Section>

      <Section heading="Karnen Ne İçerir">
        <Bullet>3D solar sistem — gerçek gezegen dokuları, döndürülebilir Dünya, tıklanabilir gezegenler</Bullet>
        <Bullet>Yıldız Yaşam Ağacı — doğumundan bugüne tüm gezegenlerin izi, animasyonlu</Bullet>
        <Bullet>Klasik astroloji çarkı — 12 burç + 12 ev + gezegen pozisyonları</Bullet>
        <Bullet>Karakter Stat kartı — 10 yetenek (Güç, Sezgi, Dayanıklılık, Yaratıcılık, Şefkat, Hız, Şifa, Manifestasyon, Bilgelik, Karizma)</Bullet>
        <Bullet>AI Kozmik Anlatın — Ruhun Hikâyesi, Bilgelikleri ve Gölgeleri dahil 7 bölüm</Bullet>
        <Bullet>11 kavram için tıklanabilir derin detay kartları</Bullet>
        <Bullet>Paylaşılabilir karne görseli — fotoğrafınla birlikte, 9:16 storyformat</Bullet>
      </Section>

      <Section heading="Vaatlerimiz">
        <Bullet>Verin sende kalır. Hesabını silebilir, JSON olarak indirebilirsin.</Bullet>
        <Bullet>Uydurma falcılık yapmayız; tüm hesaplamalar astronomik olarak tutarlıdır.</Bullet>
        <Bullet>Tıbbi, psikolojik, hukuki veya finansal tavsiye değildir. Sembolik dilde kalır.</Bullet>
        <Bullet>16 yaş altına yöneltilmez.</Bullet>
        <Bullet>Yapay zekâ üretimli metinler özenle prompt'lanır; "kötü huy" tonu yoktur, davet tonu vardır.</Bullet>
      </Section>

      <Section heading="Ne YAPMIYORUZ">
        <p>
          SoulProfile bir doğum verisi sentezleyicisi. Sakinleşme uygulaması, meditasyon rehberi,
          terapi aracı veya günlük niyet/nefes pratiği uygulaması değil. Daily check-in,
          breathwork, mantra koleksiyonu, fal yorumu, psychic chat veya astrolog danışmanlık
          hizmeti SUNMUYORUZ. Tek odak: doğum verisinden gelen kalıcı kozmik kimliğin.
        </p>
      </Section>

      <Section heading="Yapım">
        <p>
          Saf JavaScript astronomi motoru ile gezegen pozisyonları cihazında hesaplanır. 64 Human
          Design kapısı + 36 kanal + 9 merkez tam entegre. Pythagorean numeroloji master sayıları
          korur. Anthropic Claude API ile şefkatli Türkçe anlatım üretilir; API erişimi yoksa
          karne yine tam çıkar (fallback metinler).
        </p>
      </Section>
    </PageLayout>
  );
}
