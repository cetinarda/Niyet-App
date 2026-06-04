import { CenterKey } from './centers';

export interface ChannelInfo {
  id: string;            // ör: '1-8'
  gates: [number, number];
  centers: [CenterKey, CenterKey];
  name: string;
  shortDesc: string;
  circuit: 'Bireysel' | 'Kabilesel' | 'Kollektif';
}

export const CHANNELS: ChannelInfo[] = [
  { id: '1-8', gates: [1, 8], centers: ['g', 'throat'], name: 'İlhamın Kanalı', shortDesc: 'Yaratıcı rol modeli; kendine has bir ifadeyi dünyaya taşır.', circuit: 'Bireysel' },
  { id: '2-14', gates: [2, 14], centers: ['g', 'sacral'], name: 'Anahtarın Bekçisi', shortDesc: 'Yön ve kaynaklar; doğru iş enerjisini doğru yöne kanalize eder.', circuit: 'Bireysel' },
  { id: '3-60', gates: [3, 60], centers: ['sacral', 'root'], name: 'Mutasyon Kanalı', shortDesc: 'Sınırlamadan başlatma; yeniyi kabızlıktan değil, yapıdan çıkarmak.', circuit: 'Bireysel' },
  { id: '4-63', gates: [4, 63], centers: ['ajna', 'head'], name: 'Mantık Kanalı', shortDesc: 'Şüpheden cevaba; düşünmeyi kanıtlama yoluyla yapı kurma.', circuit: 'Kollektif' },
  { id: '5-15', gates: [5, 15], centers: ['sacral', 'g'], name: 'Ritm Kanalı', shortDesc: 'Doğal akışı tutmak; yaşam döngüsünün ritmine uyumlanma.', circuit: 'Kollektif' },
  { id: '6-59', gates: [6, 59], centers: ['solarPlexus', 'sacral'], name: 'Mahremiyet / Çiftleşme', shortDesc: 'İlişki kurma ve üreme; bedensel bariyerlerin açılması.', circuit: 'Kabilesel' },
  { id: '7-31', gates: [7, 31], centers: ['g', 'throat'], name: 'Alfa Kanalı', shortDesc: 'Etkileyici liderlik; "iyisi/kötüsü için" demokratik öncülük.', circuit: 'Kollektif' },
  { id: '9-52', gates: [9, 52], centers: ['sacral', 'root'], name: 'Konsantrasyon Kanalı', shortDesc: 'Detaya odaklanma gücü; uzun süreli sabit dikkat.', circuit: 'Kollektif' },
  { id: '10-20', gates: [10, 20], centers: ['g', 'throat'], name: 'Uyanış Kanalı', shortDesc: 'Şimdi anına bağlı kendine sadakat; "ben kendimim" beyanı.', circuit: 'Bireysel' },
  { id: '10-34', gates: [10, 34], centers: ['g', 'sacral'], name: 'Keşif Kanalı', shortDesc: 'Kendin olmayı yaşama gücü; otantik varoluşa enerji verme.', circuit: 'Bireysel' },
  { id: '10-57', gates: [10, 57], centers: ['g', 'spleen'], name: 'Kusursuz Form / Hayatta Kalma', shortDesc: 'Sezgisel kendine sevgi; bedeni hayatta tutan iç ses.', circuit: 'Bireysel' },
  { id: '11-56', gates: [11, 56], centers: ['ajna', 'throat'], name: 'Merak Kanalı', shortDesc: 'Hikaye anlatımı; bir fikri etkileyici biçimde sunma.', circuit: 'Kollektif' },
  { id: '12-22', gates: [12, 22], centers: ['throat', 'solarPlexus'], name: 'Açıklık Kanalı', shortDesc: 'Doğru anda söz alma; sosyal ifade için ruh hali kanalı.', circuit: 'Bireysel' },
  { id: '13-33', gates: [13, 33], centers: ['g', 'throat'], name: 'Mütedeyin Tanık', shortDesc: 'Geçmişi hatırlama ve aktarma; tanıklık eden ses.', circuit: 'Kollektif' },
  { id: '16-48', gates: [16, 48], centers: ['throat', 'spleen'], name: 'Yetenek / Dalga Boyu', shortDesc: 'Derinliği coşkuyla buluşturmak; ustalığın yeteneğe akışı.', circuit: 'Kollektif' },
  { id: '17-62', gates: [17, 62], centers: ['ajna', 'throat'], name: 'Kabul / Düzenleme', shortDesc: 'Detaylarla görüşü ifade etme; örgütsel bilgiyi paylaşma.', circuit: 'Kollektif' },
  { id: '18-58', gates: [18, 58], centers: ['spleen', 'root'], name: 'Yargı / Düzeltme', shortDesc: 'Yaşamdan zevk almak için iyileştirme arzusu; yapısal eleştiri.', circuit: 'Kollektif' },
  { id: '19-49', gates: [19, 49], centers: ['root', 'solarPlexus'], name: 'Sentez Kanalı', shortDesc: 'İhtiyaçların ve ilkelerin bir araya gelmesi; topluluğun kalbi.', circuit: 'Kabilesel' },
  { id: '20-34', gates: [20, 34], centers: ['throat', 'sacral'], name: 'Karizma Kanalı', shortDesc: 'Şu an meşgul olunan işin gücü; sözle eylemin birliği.', circuit: 'Bireysel' },
  { id: '20-57', gates: [20, 57], centers: ['throat', 'spleen'], name: 'Beyin Dalgası', shortDesc: 'Anlık sezgisel ifade; sezgiyi söze döken nadir kanal.', circuit: 'Bireysel' },
  { id: '21-45', gates: [21, 45], centers: ['heart', 'throat'], name: 'Para Hattı', shortDesc: 'Materyal dünyada yönetici; kaynaklar üzerinde söz sahibi olma.', circuit: 'Kabilesel' },
  { id: '23-43', gates: [23, 43], centers: ['throat', 'ajna'], name: 'Yapılandırma / Bireysellik', shortDesc: 'Bilineni kırma; özgün sezgiyi anlaşılır biçimde sunma.', circuit: 'Bireysel' },
  { id: '24-61', gates: [24, 61], centers: ['ajna', 'head'], name: 'Farkındalık Kanalı', shortDesc: 'Sessiz düşünüş; bilinmeyenden anlam çıkaran düşünce.', circuit: 'Bireysel' },
  { id: '25-51', gates: [25, 51], centers: ['g', 'heart'], name: 'İnisiyasyon Kanalı', shortDesc: 'Şok ile büyük açılma; "ilki olma" potansiyeli.', circuit: 'Bireysel' },
  { id: '26-44', gates: [26, 44], centers: ['heart', 'spleen'], name: 'Teslim Olma Kanalı', shortDesc: 'Geçmişin dersini iletme; mesaja ego gücü vermek.', circuit: 'Kabilesel' },
  { id: '27-50', gates: [27, 50], centers: ['sacral', 'spleen'], name: 'Koruma Kanalı', shortDesc: 'Bakım ve değerleri koruma; topluluğun bekçisi.', circuit: 'Kabilesel' },
  { id: '28-38', gates: [28, 38], centers: ['spleen', 'root'], name: 'Mücadele Kanalı', shortDesc: 'Anlam için savaşmak; amaç bulma yolculuğu.', circuit: 'Bireysel' },
  { id: '29-46', gates: [29, 46], centers: ['sacral', 'g'], name: 'Keşif / Başarı', shortDesc: 'Bedeni hayata teslim etme; doğru zamanda doğru yerde olma.', circuit: 'Kollektif' },
  { id: '30-41', gates: [30, 41], centers: ['solarPlexus', 'root'], name: 'Tanıma Kanalı', shortDesc: 'Yeni deneyime hayal kurma enerjisi; arzunun başlatıcı sesi.', circuit: 'Kollektif' },
  { id: '32-54', gates: [32, 54], centers: ['spleen', 'root'], name: 'Dönüşüm Kanalı', shortDesc: 'Hırstan kalıcılık çıkarma; yükselişe içsel sezgiyle yön verme.', circuit: 'Kabilesel' },
  { id: '34-57', gates: [34, 57], centers: ['sacral', 'spleen'], name: 'Güç Kanalı', shortDesc: 'Sezgi ile gücün birliği; arkaik bilgeliğin saf hali.', circuit: 'Bireysel' },
  { id: '35-36', gates: [35, 36], centers: ['throat', 'solarPlexus'], name: 'Geçicilik Kanalı', shortDesc: 'Yeni deneyim açlığı; "her şeyi denemek" güdüsü.', circuit: 'Kollektif' },
  { id: '37-40', gates: [37, 40], centers: ['solarPlexus', 'heart'], name: 'Topluluk Kanalı', shortDesc: 'Pazarlık ve ait olma; aileyi/topluluğu birleştiren bağ.', circuit: 'Kabilesel' },
  { id: '39-55', gates: [39, 55], centers: ['root', 'solarPlexus'], name: 'Duygulanım Kanalı', shortDesc: 'Bolluğun ruh hali; sanat, müzik ve duygunun kaynağı.', circuit: 'Bireysel' },
  { id: '42-53', gates: [42, 53], centers: ['sacral', 'root'], name: 'Olgunluk Kanalı', shortDesc: 'Döngüleri başlatıp tamamlama; süreçleri sonuna kadar yaşama.', circuit: 'Kollektif' },
  { id: '47-64', gates: [47, 64], centers: ['ajna', 'head'], name: 'Soyutlama Kanalı', shortDesc: 'Geçmişin imgelerini anlama; düşünsel bilmece çözme.', circuit: 'Kollektif' },
];

export function findChannel(g1: number, g2: number): ChannelInfo | undefined {
  return CHANNELS.find(
    c =>
      (c.gates[0] === g1 && c.gates[1] === g2) ||
      (c.gates[0] === g2 && c.gates[1] === g1)
  );
}
