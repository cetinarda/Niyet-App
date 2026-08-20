import type { Chart, HumanDesign, Mission, Numerology } from '../types';
import { NORTH_NODE_GUIDE } from '../content/astrology-content';
import { LIFE_PATH_MEANINGS } from '../content/numerology-content';

export function buildMissions(
  chart: Chart,
  numerology: Numerology,
  humanDesign: HumanDesign,
): Mission[] {
  const nn = chart.planets.find((p) => p.name === 'NorthNode')!;
  const lp = LIFE_PATH_MEANINGS[numerology.lifePath];

  const hdMission = (() => {
    switch (humanDesign.type) {
      case 'Manifestor':
        return {
          title: 'Bilgilendirerek Başlat',
          description:
            'Yeni yolları açan ruhsun. Adım atmadan önce çevreni bilgilendir; bu, manifesto enerjini özgür bırakır.',
        };
      case 'Generator':
        return {
          title: 'Sakral Yanıtı Onurlandır',
          description:
            'Bedenin doğru bildiğine güven. Sakral evet/hayır seni doğru çalışmaya, doğru insanlara taşır.',
        };
      case 'ManifestingGenerator':
        return {
          title: 'Çoklu Yetenekleri Bütünle',
          description:
            'Atlamadan, sıkışmadan çoklu izlere açıksın. Yanıt geldikten sonra hızla bilgilendirip ilerle.',
        };
      case 'Projector':
        return {
          title: 'Davet Bekle ve Tanın',
          description:
            'Görmek için doğdun. Bilgeliğini paylaşmadan önce davet bekle; tanınma geldiğinde meyve verir.',
        };
      case 'Reflector':
        return {
          title: 'Ay Döngüsüne Güven',
          description:
            'Sen kolektifin aynasısın. Önemli kararları 28 günlük Ay döngüsü içinde olgunlaştır.',
        };
    }
  })();

  return [
    {
      title: `Kuzey Düğüm Görevi: ${nn.sign}`,
      description: NORTH_NODE_GUIDE[nn.sign],
    },
    {
      title: `Yaşam Yolu ${numerology.lifePath} — ${lp?.title}`,
      description: lp?.summary ?? '',
    },
    hdMission,
  ];
}
