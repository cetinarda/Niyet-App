import { CenterKey } from './centers';

export interface ChannelInfo {
  id: string;            // ör: '1-8'
  gates: [number, number];
  centers: [CenterKey, CenterKey];
  name: string;
  nameEn?: string;
  shortDesc: string;
  shortDescEn?: string;
  circuit: 'Bireysel' | 'Kabilesel' | 'Kolektif';
}

export const CHANNELS: ChannelInfo[] = [
  { id: '1-8', gates: [1, 8], centers: ['g', 'throat'], name: 'İlhamın Kanalı', nameEn: 'The Channel of Inspiration', shortDesc: 'Yaratıcı rol modeli; kendine has bir ifadeyi dünyaya taşır.', shortDescEn: 'A creative role model; carries a unique expression out into the world.', circuit: 'Bireysel' },
  { id: '2-14', gates: [2, 14], centers: ['g', 'sacral'], name: 'Anahtarın Bekçisi', nameEn: 'The Keeper of the Keys', shortDesc: 'Yön ve kaynaklar; doğru iş enerjisini doğru yöne kanalize eder.', shortDescEn: 'Direction and resources; channels the right work energy in the right direction.', circuit: 'Bireysel' },
  { id: '3-60', gates: [3, 60], centers: ['sacral', 'root'], name: 'Mutasyon Kanalı', nameEn: 'The Channel of Mutation', shortDesc: 'Sınırlamadan başlatma; yeniyi kabızlıktan değil, yapıdan çıkarmak.', shortDescEn: 'Initiating from limitation; bringing forth the new out of structure rather than stagnation.', circuit: 'Bireysel' },
  { id: '4-63', gates: [4, 63], centers: ['ajna', 'head'], name: 'Mantık Kanalı', nameEn: 'The Channel of Logic', shortDesc: 'Şüpheden cevaba; düşünmeyi kanıtlama yoluyla yapı kurma.', shortDescEn: 'From doubt to answer; building structure by proving out one\'s thinking.', circuit: 'Kolektif' },
  { id: '5-15', gates: [5, 15], centers: ['sacral', 'g'], name: 'Ritim Kanalı', nameEn: 'The Channel of Rhythm', shortDesc: 'Doğal akışı tutmak; yaşam döngüsünün ritmine uyumlanma.', shortDescEn: 'Holding the natural flow; attuning to the rhythm of the life cycle.', circuit: 'Kolektif' },
  { id: '6-59', gates: [6, 59], centers: ['solarPlexus', 'sacral'], name: 'Mahremiyet / Çiftleşme', nameEn: 'Intimacy / Mating', shortDesc: 'İlişki kurma ve üreme; bedensel bariyerlerin açılması.', shortDescEn: 'Bonding and reproduction; the opening of bodily barriers.', circuit: 'Kabilesel' },
  { id: '7-31', gates: [7, 31], centers: ['g', 'throat'], name: 'Alfa Kanalı', nameEn: 'The Alpha Channel', shortDesc: 'Etkileyici liderlik; "iyisi/kötüsü için" demokratik öncülük.', shortDescEn: 'Influential leadership; democratic guidance \'for better or worse\'.', circuit: 'Kolektif' },
  { id: '9-52', gates: [9, 52], centers: ['sacral', 'root'], name: 'Konsantrasyon Kanalı', nameEn: 'The Channel of Concentration', shortDesc: 'Detaya odaklanma gücü; uzun süreli sabit dikkat.', shortDescEn: 'The power to focus on detail; sustained, steady attention.', circuit: 'Kolektif' },
  { id: '10-20', gates: [10, 20], centers: ['g', 'throat'], name: 'Uyanış Kanalı', nameEn: 'The Channel of Awakening', shortDesc: 'Şimdi anına bağlı kendine sadakat; "ben kendimim" beyanı.', shortDescEn: 'Self-loyalty anchored in the now; the declaration \'I am myself\'.', circuit: 'Bireysel' },
  { id: '10-34', gates: [10, 34], centers: ['g', 'sacral'], name: 'Keşif Kanalı', nameEn: 'The Channel of Exploration', shortDesc: 'Kendin olmayı yaşama gücü; otantik varoluşa enerji verme.', shortDescEn: 'The power to live as yourself; energizing authentic existence.', circuit: 'Bireysel' },
  { id: '10-57', gates: [10, 57], centers: ['g', 'spleen'], name: 'Kusursuz Form / Hayatta Kalma', nameEn: 'Perfected Form / Survival', shortDesc: 'Sezgisel kendine sevgi; bedeni hayatta tutan iç ses.', shortDescEn: 'Intuitive self-love; the inner voice that keeps the body alive.', circuit: 'Bireysel' },
  { id: '11-56', gates: [11, 56], centers: ['ajna', 'throat'], name: 'Merak Kanalı', nameEn: 'The Channel of Curiosity', shortDesc: 'Hikaye anlatımı; bir fikri etkileyici biçimde sunma.', shortDescEn: 'Storytelling; presenting an idea in a compelling way.', circuit: 'Kolektif' },
  { id: '12-22', gates: [12, 22], centers: ['throat', 'solarPlexus'], name: 'Açıklık Kanalı', nameEn: 'The Channel of Openness', shortDesc: 'Doğru anda söz alma; sosyal ifade için ruh hali kanalı.', shortDescEn: 'Speaking at the right moment; the mood channel for social expression.', circuit: 'Bireysel' },
  { id: '13-33', gates: [13, 33], centers: ['g', 'throat'], name: 'Mütedeyin Tanık', nameEn: 'The Prodigal Witness', shortDesc: 'Geçmişi hatırlama ve aktarma; tanıklık eden ses.', shortDescEn: 'Remembering and relaying the past; the voice that bears witness.', circuit: 'Kolektif' },
  { id: '16-48', gates: [16, 48], centers: ['throat', 'spleen'], name: 'Yetenek / Dalga Boyu', nameEn: 'Talent / The Wavelength', shortDesc: 'Derinliği coşkuyla buluşturmak; ustalığın yeteneğe akışı.', shortDescEn: 'Joining depth with enthusiasm; the flow of mastery into talent.', circuit: 'Kolektif' },
  { id: '17-62', gates: [17, 62], centers: ['ajna', 'throat'], name: 'Kabul / Düzenleme', nameEn: 'Acceptance / Organization', shortDesc: 'Detaylarla görüşü ifade etme; örgütsel bilgiyi paylaşma.', shortDescEn: 'Expressing an opinion with detail; sharing organizational knowledge.', circuit: 'Kolektif' },
  { id: '18-58', gates: [18, 58], centers: ['spleen', 'root'], name: 'Yargı / Düzeltme', nameEn: 'Judgment / Correction', shortDesc: 'Yaşamdan zevk almak için iyileştirme arzusu; yapısal eleştiri.', shortDescEn: 'The drive to improve for the joy of life; structural criticism.', circuit: 'Kolektif' },
  { id: '19-49', gates: [19, 49], centers: ['root', 'solarPlexus'], name: 'Sentez Kanalı', nameEn: 'The Channel of Synthesis', shortDesc: 'İhtiyaçların ve ilkelerin bir araya gelmesi; topluluğun kalbi.', shortDescEn: 'The meeting of needs and principles; the heart of community.', circuit: 'Kabilesel' },
  { id: '20-34', gates: [20, 34], centers: ['throat', 'sacral'], name: 'Karizma Kanalı', nameEn: 'The Channel of Charisma', shortDesc: 'Şu an meşgul olunan işin gücü; sözle eylemin birliği.', shortDescEn: 'The power of what one is doing now; the union of word and action.', circuit: 'Bireysel' },
  { id: '20-57', gates: [20, 57], centers: ['throat', 'spleen'], name: 'Beyin Dalgası', nameEn: 'The Brainwave', shortDesc: 'Anlık sezgisel ifade; sezgiyi söze döken nadir kanal.', shortDescEn: 'Instant intuitive expression; the rare channel that turns intuition into speech.', circuit: 'Bireysel' },
  { id: '21-45', gates: [21, 45], centers: ['heart', 'throat'], name: 'Para Hattı', nameEn: 'The Money Line', shortDesc: 'Materyal dünyada yönetici; kaynaklar üzerinde söz sahibi olma.', shortDescEn: 'Steward of the material world; having a say over resources.', circuit: 'Kabilesel' },
  { id: '23-43', gates: [23, 43], centers: ['throat', 'ajna'], name: 'Yapılandırma / Bireysellik', nameEn: 'Structuring / Individuality', shortDesc: 'Bilineni kırma; özgün sezgiyi anlaşılır biçimde sunma.', shortDescEn: 'Breaking with the known; presenting original insight in an understandable way.', circuit: 'Bireysel' },
  { id: '24-61', gates: [24, 61], centers: ['ajna', 'head'], name: 'Farkındalık Kanalı', nameEn: 'The Channel of Awareness', shortDesc: 'Sessiz düşünüş; bilinmeyenden anlam çıkaran düşünce.', shortDescEn: 'Silent contemplation; thought that draws meaning from the unknown.', circuit: 'Bireysel' },
  { id: '25-51', gates: [25, 51], centers: ['g', 'heart'], name: 'İnisiyasyon Kanalı', nameEn: 'The Channel of Initiation', shortDesc: 'Şok ile büyük açılma; "ilki olma" potansiyeli.', shortDescEn: 'A great opening through shock; the potential to be \'the first\'.', circuit: 'Bireysel' },
  { id: '26-44', gates: [26, 44], centers: ['heart', 'spleen'], name: 'Teslim Olma Kanalı', nameEn: 'The Channel of Surrender', shortDesc: 'Geçmişin dersini iletme; mesaja ego gücü vermek.', shortDescEn: 'Conveying the lesson of the past; lending ego power to the message.', circuit: 'Kabilesel' },
  { id: '27-50', gates: [27, 50], centers: ['sacral', 'spleen'], name: 'Koruma Kanalı', nameEn: 'The Channel of Preservation', shortDesc: 'Bakım ve değerleri koruma; topluluğun bekçisi.', shortDescEn: 'Caring for and guarding values; the keeper of the community.', circuit: 'Kabilesel' },
  { id: '28-38', gates: [28, 38], centers: ['spleen', 'root'], name: 'Mücadele Kanalı', nameEn: 'The Channel of Struggle', shortDesc: 'Anlam için savaşmak; amaç bulma yolculuğu.', shortDescEn: 'Fighting for meaning; the journey of finding purpose.', circuit: 'Bireysel' },
  { id: '29-46', gates: [29, 46], centers: ['sacral', 'g'], name: 'Keşif / Başarı', nameEn: 'Discovery / Success', shortDesc: 'Bedeni hayata teslim etme; doğru zamanda doğru yerde olma.', shortDescEn: 'Surrendering the body to life; being in the right place at the right time.', circuit: 'Kolektif' },
  { id: '30-41', gates: [30, 41], centers: ['solarPlexus', 'root'], name: 'Tanıma Kanalı', nameEn: 'The Channel of Recognition', shortDesc: 'Yeni deneyime hayal kurma enerjisi; arzunun başlatıcı sesi.', shortDescEn: 'The dreaming energy toward new experience; the initiating voice of desire.', circuit: 'Kolektif' },
  { id: '32-54', gates: [32, 54], centers: ['spleen', 'root'], name: 'Dönüşüm Kanalı', nameEn: 'The Channel of Transformation', shortDesc: 'Hırstan kalıcılık çıkarma; yükselişe içsel sezgiyle yön verme.', shortDescEn: 'Drawing endurance from ambition; guiding the rise with inner intuition.', circuit: 'Kabilesel' },
  { id: '34-57', gates: [34, 57], centers: ['sacral', 'spleen'], name: 'Güç Kanalı', nameEn: 'The Channel of Power', shortDesc: 'Sezgi ile gücün birliği; arkaik bilgeliğin saf hali.', shortDescEn: 'The union of intuition and power; the pure state of archaic wisdom.', circuit: 'Bireysel' },
  { id: '35-36', gates: [35, 36], centers: ['throat', 'solarPlexus'], name: 'Geçicilik Kanalı', nameEn: 'The Channel of Transitoriness', shortDesc: 'Yeni deneyim açlığı; "her şeyi denemek" güdüsü.', shortDescEn: 'A hunger for new experience; the urge to \'try everything\'.', circuit: 'Kolektif' },
  { id: '37-40', gates: [37, 40], centers: ['solarPlexus', 'heart'], name: 'Topluluk Kanalı', nameEn: 'The Channel of Community', shortDesc: 'Pazarlık ve ait olma; aileyi/topluluğu birleştiren bağ.', shortDescEn: 'Bargaining and belonging; the bond that unites family and community.', circuit: 'Kabilesel' },
  { id: '39-55', gates: [39, 55], centers: ['root', 'solarPlexus'], name: 'Duygulanım Kanalı', nameEn: 'The Channel of Emoting', shortDesc: 'Bolluğun ruh hali; sanat, müzik ve duygunun kaynağı.', shortDescEn: 'The mood of abundance; the source of art, music and emotion.', circuit: 'Bireysel' },
  { id: '42-53', gates: [42, 53], centers: ['sacral', 'root'], name: 'Olgunluk Kanalı', nameEn: 'The Channel of Maturation', shortDesc: 'Döngüleri başlatıp tamamlama; süreçleri sonuna kadar yaşama.', shortDescEn: 'Beginning and completing cycles; living processes through to the end.', circuit: 'Kolektif' },
  { id: '47-64', gates: [47, 64], centers: ['ajna', 'head'], name: 'Soyutlama Kanalı', nameEn: 'The Channel of Abstraction', shortDesc: 'Geçmişin imgelerini anlama; düşünsel bilmece çözme.', shortDescEn: 'Making sense of images from the past; solving mental puzzles.', circuit: 'Kolektif' },
];

export function findChannel(g1: number, g2: number): ChannelInfo | undefined {
  return CHANNELS.find(
    c =>
      (c.gates[0] === g1 && c.gates[1] === g2) ||
      (c.gates[0] === g2 && c.gates[1] === g1)
  );
}
