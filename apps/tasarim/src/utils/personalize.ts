// =============================================================
// KİŞİSELLEŞTİRME MOTORU — "herkese aynı yorum" sorununun çözümü.
// Tamamen deterministik + offline: kullanıcının GERÇEK harita verisini
// (asılı kapılar, tip, yetki, kanallar, transitler) metinle çaprazlar.
// AI katmanı (ReportScreen) hata/offline durumunda buraya düşer.
// =============================================================
import { HumanDesignChart, longitudeToGate, getActivationsByCenter } from './humanDesign';
import { allPositions, julianDay } from './ephemeris';
import { CENTERS, CenterKey } from '../data/centers';
import { GATES } from '../data/gates';
import { CHANNELS } from '../data/channels';
import { HDType } from '../data/types';
import { AuthorityKey } from '../data/authorities';

type Lang = 'tr' | 'en';
const L = (lang: Lang, tr: string, en: string) => (lang === 'en' ? en : tr);

// ---- Harita parmak izi: rotasyon seed'i + AI önbellek anahtarı ----
export function chartHash(chart: HumanDesignChart): number {
  let h = 0;
  const mix = (n: number) => { h = (h * 31 + n) % 1000000007; };
  for (const a of chart.personality) mix(a.gate * 6 + a.line);
  for (const a of chart.design) mix(a.gate * 6 + a.line + 400);
  mix(chart.profile.length * 7);
  mix(chart.type.length * 13);
  mix(chart.authority.length * 17);
  return h;
}

// ---- Tanımsız merkezdeki "asılı" kapılar (merkez açık ama kapı aktif) ----
export function hangingGates(chart: HumanDesignChart, center: CenterKey): number[] {
  const acts = getActivationsByCenter(chart, center);
  const set = new Set<number>();
  for (const a of [...acts.personality, ...acts.design]) set.add(a.gate);
  return Array.from(set).sort((a, b) => a - b);
}

// Asılı kapının kanal ortağı (elektromanyetik çekim): kapıyı taşıyan kanalın diğer ucu.
function partnerOf(gate: number): { partner: number; channelName: string; channelNameEn: string } | null {
  const ch = CHANNELS.find(c => c.gates[0] === gate || c.gates[1] === gate);
  if (!ch) return null;
  const partner = ch.gates[0] === gate ? ch.gates[1] : ch.gates[0];
  return { partner, channelName: ch.name, channelNameEn: (ch as any).nameEn || ch.name };
}

// ---- İçerik matrisleri ----
// 9 merkez × 5 tip: tanımsız merkezin O TİPTE nasıl yaşandığı (kısa, ikinci tekil).
const TYPE_CENTER: Record<CenterKey, Record<HDType, { tr: string; en: string }>> = {
  head: {
    'Manifestor':            { tr: 'Başlatma dürtün, kafandaki yabancı sorulardan değil kendi kıvılcımından gelmeli — soru sana ait mi, önce onu sor.', en: 'Your urge to initiate should come from your own spark, not from borrowed questions — first ask whether the question is even yours.' },
    'Jeneratör':             { tr: 'Sakral enerjin, cevaplamak zorunda olmadığın sorulara kolayca kiralanır — yanıt vermeden önce bedeninin "uh-huh"ını bekle.', en: 'Your sacral energy is easily rented out to questions you never had to answer — wait for your body\'s response before committing.' },
    'Manifesting Jeneratör': { tr: 'Hızın, başkasının merakını kendi görevin sanmana yol açabilir — adım atmadan önce sorunun seni gerçekten çekip çekmediğine bak.', en: 'Your speed can make someone else\'s curiosity feel like your mission — check if the question truly pulls you before you leap.' },
    'Projektör':             { tr: 'Herkesin zihinsel baskısını derinlemesine görürsün; ama davet edilmediğin soruları çözmek senin işin değil.', en: 'You see everyone\'s mental pressure deeply; but solving questions you weren\'t invited into is not your job.' },
    'Reflektör':             { tr: 'Odadaki tüm zihinsel baskıyı aynalarsın — kalabalıktan çıkınca hangi soruların buharlaştığına dikkat et: onlar hiç senin değildi.', en: 'You mirror all the mental pressure in the room — notice which questions evaporate once you leave: those were never yours.' },
  },
  ajna: {
    'Manifestor':            { tr: 'Fikrini ilan etmeden önce "emin görünme" zorunluluğunu bırak; gücün kesinlikte değil, harekete geçirdiğin şeyde.', en: 'Drop the need to sound certain before you announce; your power is in what you set in motion, not in certainty.' },
    'Jeneratör':             { tr: 'Kavramlar sende akışkandır; karar anında zihnine değil, sakral yanıtına dön — zihin gerekçeyi sonra bulur.', en: 'Concepts stay fluid in you; at decision time return to your sacral response, not your mind — the mind finds reasons later.' },
    'Manifesting Jeneratör': { tr: 'Bir görüşten diğerine hızla geçebilmen kusur değil; sabit fikir taklidi yapmak seni yavaşlatır.', en: 'Shifting quickly between views is not a flaw; imitating a fixed opinion is what slows you down.' },
    'Projektör':             { tr: 'Farklı zihinleri okuyup sentezlersin; ama görüşünü ancak sorulduğunda paylaştığında kıymeti duyulur.', en: 'You read and synthesize different minds; your view lands only when it is asked for.' },
    'Reflektör':             { tr: 'Bugün kesin görünen fikir yarın değişebilir — sende bu bilgeliktir, kararsızlık değil.', en: 'What seems certain today may shift tomorrow — in you that is wisdom, not indecision.' },
  },
  throat: {
    'Manifestor':            { tr: 'Sözün etki yaratır; ama tanımsız boğazın konuşma sırasını kalabalığa kaptırabilir — duyurunu kendi zamanlamanla yap.', en: 'Your word creates impact; yet an open throat can hand the mic to the crowd — make your announcements on your own timing.' },
    'Jeneratör':             { tr: 'Dikkat çekmek için konuşma baskısı sende yorgunluk yapar; doğru soru geldiğinde sesin kendiliğinden açılır.', en: 'Talking to attract attention drains you; when the right question comes, your voice opens on its own.' },
    'Manifesting Jeneratör': { tr: 'Sesin, o an kiminle olduğuna göre renk değiştirir — bu esneklik sahnede hediye, pazarlıkta dikkat ister.', en: 'Your voice changes color with whoever you\'re with — a gift on stage, something to watch in negotiation.' },
    'Projektör':             { tr: 'Görünmek için konuşmak seni tüketir; tanınmak istediğin yerde önce sessizliğinle fark edilirsin.', en: 'Speaking to be seen exhausts you; where you want recognition, your silence is noticed first.' },
    'Reflektör':             { tr: 'Topluluğun sesi senden geçer; hangi cümlelerin sana ait olmadığını gün sonunda ayıkla.', en: 'The community\'s voice passes through you; at day\'s end, sort out which sentences were never yours.' },
  },
  g: {
    'Manifestor':            { tr: 'Yönünü çevrene göre ayarlamak zorunda değilsin; bulunduğun yer kimliğini değiştirir — mekânı bilinçli seç, gerisi akar.', en: 'You need not calibrate your direction to others; place shifts your identity — choose your environment consciously and the rest flows.' },
    'Jeneratör':             { tr: '"Ben kimim?" sorusunun tek cevabı olmasını bekleme; doğru insanlar ve doğru mekân, kim olduğunu sana yansıtır.', en: 'Stop waiting for one final answer to "who am I?"; right people and right places reflect you back to yourself.' },
    'Manifesting Jeneratör': { tr: 'Çok kimlikli görünmen dağınıklık değil; her ortamda farklı bir yüzünün parlaması senin çokluğun.', en: 'Seeming multi-identitied is not scattered; a different face shining in each setting is your multiplicity.' },
    'Projektör':             { tr: 'Sevgiyi ve yönü başkalarında derinlemesine görürsün; kendi yönün için doğru davetin mekânına güven.', en: 'You see love and direction deeply in others; for your own direction, trust the place of the right invitation.' },
    'Reflektör':             { tr: 'Yer senin için kader kadar önemli: yanlış mekân kimliğini bulanıklaştırır, doğru mekân seni sana gösterir.', en: 'Place is destiny for you: the wrong location blurs your identity, the right one shows you to yourself.' },
  },
  heart: {
    'Manifestor':            { tr: 'Kanıtlamak için söz verme; etkin zaten görünür. Verdiğin her sözün bedelini iraden değil bedenin öder.', en: 'Don\'t promise to prove yourself; your impact is already visible. Every vow is paid by your body, not your will.' },
    'Jeneratör':             { tr: 'Değerini çalışarak ispatlama tuzağına dikkat: yanıt vermediğin işlerde harcanan irade, tükenmişliğin kısa yoludur.', en: 'Beware proving your worth through work: willpower spent on tasks you never responded to is the short road to burnout.' },
    'Manifesting Jeneratör': { tr: 'Hız + kanıtlama isteği birleşince fazla söz verirsin; sözü azalt, gösterme ihtiyacını bırak.', en: 'Speed plus the urge to prove makes you over-promise; promise less, drop the need to demonstrate.' },
    'Projektör':             { tr: 'Değerin üretkenlikle ölçülmez; kendini kanıtlamak için çalıştıkça görünmez olursun — tersini dene.', en: 'Your worth is not measured by output; the more you work to prove it, the more invisible you become — try the reverse.' },
    'Reflektör':             { tr: 'Çevrendeki hırsı kendi eksiğin sanma; o yarış senin değil, sadece içinden geçiyor.', en: 'Don\'t mistake ambient ambition for your own lack; that race isn\'t yours, it merely passes through.' },
  },
  solarPlexus: {
    'Manifestor':            { tr: 'Başkalarının duygu dalgası kararlarını tetiklememeli; fırtınada duyuru yapma, dalga geçsin.', en: 'Others\' emotional waves shouldn\'t trigger your moves; don\'t announce in a storm, let the wave pass.' },
    'Jeneratör':             { tr: 'Duyguyu emer ve büyütürsün; "bu his kimin?" sorusu, yanıtından önce sorulacak ilk soru.', en: 'You absorb and amplify feeling; "whose emotion is this?" comes before any response.' },
    'Manifesting Jeneratör': { tr: 'Coşkuyu kapıp hemen harekete dönüştürme eğilimin var — duygu sende misafir, kararların ev sahibi olmasın.', en: 'You tend to catch excitement and act at once — emotion is a guest in you; don\'t let it host your decisions.' },
    'Projektör':             { tr: 'Ortamın duygusunu herkesten önce okursun; o duyguyu yönetmek değil, sadece bilmek senin işin.', en: 'You read the room\'s emotion before anyone; your job is to know it, not to manage it.' },
    'Reflektör':             { tr: 'Duygusal hava durumunu aynalarsın; berraklık için ayın döngüsüne ve kendi başına kaldığın saatlere güven.', en: 'You mirror the emotional weather; for clarity trust the moon\'s cycle and your hours alone.' },
  },
  sacral: {
    'Manifestor':            { tr: 'Çalışma enerjin dalgalıdır; jeneratörlerin ritmine yetişmeye çalışmak seni kırar — kısa yoğun atılımlar senin doğan.', en: 'Your work energy comes in waves; chasing generator rhythm breaks you — short intense bursts are your nature.' },
    'Jeneratör':             { tr: '', en: '' },
    'Manifesting Jeneratör': { tr: '', en: '' },
    'Projektör':             { tr: 'Ne zaman duracağını bilmek en büyük pratiğin: enerji sende üretilmez, ödünç alınır — iade saatini sen belirle.', en: 'Knowing when to stop is your core practice: energy isn\'t produced in you, it\'s borrowed — set the return time yourself.' },
    'Reflektör':             { tr: 'Kalabalık iş ortamlarında herkesin iş temposunu yansıtırsın; dinlenmeyi takvime yazmadan bırakma.', en: 'In busy workplaces you reflect everyone\'s tempo; never leave rest off the calendar.' },
  },
  spleen: {
    'Manifestor':            { tr: 'Korku sende gelip geçici bir sinyaldir; güvende hissetmek için başkalarına tutunma, sezgin anlıktır — anında dinle.', en: 'Fear is a passing signal in you; don\'t cling to others for safety — your intuition is instantaneous, hear it in the instant.' },
    'Jeneratör':             { tr: 'Sağlıksız olana alışkanlıkla tutunabilirsin ("kötü ama tanıdık"); bırakmak güvensizlik değil, hijyendir.', en: 'You can cling to the unhealthy out of habit ("bad but familiar"); letting go is hygiene, not insecurity.' },
    'Manifesting Jeneratör': { tr: 'Hızın, bedenin ince uyarılarını bastırabilir; ani "dur" hissi geldiğinde pazarlık etme.', en: 'Your speed can drown the body\'s subtle warnings; when the sudden "stop" comes, don\'t negotiate.' },
    'Projektör':             { tr: 'Başkalarının korkularını üstlenip "tedbir" sanma; hangi endişenin sana girdiğini akşam ayıkla.', en: 'Don\'t adopt others\' fears as "prudence"; each evening, sort which worries entered you.' },
    'Reflektör':             { tr: 'İyi hissetmediğin mekân seni gerçekten hasta edebilir; ortam hijyeni senin ilacın.', en: 'A place that feels off can literally sicken you; environmental hygiene is your medicine.' },
  },
  root: {
    'Manifestor':            { tr: 'Aciliyet baskısı seni erken başlatmasın; senin gücün zamanlamada — stres bitince de dünya dönüyor.', en: 'Urgency pressure shouldn\'t launch you early; your power is timing — the world keeps turning after the stress passes.' },
    'Jeneratör':             { tr: '"Bitir de kurtul" diye hızlanmak sakralını körleştirir; baskı azaldığında hâlâ evet diyorsan o iş senindir.', en: 'Rushing to "finish and be free" numbs your sacral; if it\'s still a yes when pressure drops, the task is yours.' },
    'Manifesting Jeneratör': { tr: 'Adrenalinle iş bitirmek sana doğal gelir ama baskı bitince gelen boşluğa yeni acele doldurma.', en: 'Finishing on adrenaline feels natural, but don\'t fill the post-pressure void with new haste.' },
    'Projektör':             { tr: 'Başkalarının aciliyeti senin ajandanı yönetmesin; "hemen" kelimesini duyduğunda bir nefeslik mesafe koy.', en: 'Others\' urgency shouldn\'t run your agenda; when you hear "now", place one breath of distance.' },
    'Reflektör':             { tr: 'Ortamdaki stresi bünyene alıp "benim telaşım" sanma; yavaşlık senin süper gücün.', en: 'Don\'t absorb ambient stress as "my rush"; slowness is your superpower.' },
  },
};

// Yetki dokunuşu: açık merkez baskısıyla karar anında ne yapmalı (8 yetki).
const AUTH_RESET: Record<AuthorityKey, { tr: string; en: string }> = {
  'emotional':      { tr: 'Duygusal dalgan geçmeden bu baskıyla ilgili karar verme — bir gece bekle, berraklık sabah gelir.', en: 'Don\'t decide about this pressure mid-wave — sleep on it; clarity comes with the morning.' },
  'sacral':         { tr: 'Baskıyı hissettiğinde kendine sesli sor: "Bunu ben mi istiyorum?" Bedenden gelen ilk sese güven.', en: 'When the pressure hits, ask out loud: "Do I want this?" Trust the body\'s first sound.' },
  'splenic':        { tr: 'İlk saniyedeki ince his kararındır; baskı büyüdüyse o an çoktan geçmiştir — yeni bir an bekle.', en: 'The subtle first-second feeling is your answer; if pressure has grown, that moment passed — await a fresh one.' },
  'ego':            { tr: '"Bunun için gerçekten enerjim/kaynağım var mı?" — kalbin evet demiyorsa baskı seni bağlamaz.', en: '"Do I truly have the energy/resources for this?" — if the heart says no, the pressure has no claim on you.' },
  'self-projected': { tr: 'Bu baskıyı güvendiğin birine SESLİ anlat; kendi sesinde yön duyulur, zihninde değil.', en: 'Speak this pressure ALOUD to someone you trust; direction is heard in your own voice, not your head.' },
  'mental':         { tr: 'Farklı ortamlarda, farklı insanlarla konuşarak tart; karar tek sohbette değil, yankıların toplamında netleşir.', en: 'Weigh it across settings and people; clarity arrives in the sum of echoes, not one conversation.' },
  'lunar':          { tr: 'Büyük kararı ay döngüsüne yay: 28 gün boyunca aynı soru nasıl değişiyor, izle.', en: 'Stretch the decision across a moon cycle: watch how the same question shifts over 28 days.' },
  'none':           { tr: 'Ortamını değiştir ve soruyu yeniden duy; sana ait olmayan baskı, yeni mekânda dökülür.', en: 'Change your environment and hear the question again; pressure that isn\'t yours falls away in a new place.' },
};

// Tamamen açık merkez (asılı kapı yok): daha nadir, daha akışkan deneyim.
const OPEN_FULL: Record<CenterKey, { tr: string; en: string }> = {
  head:        { tr: 'Kafan tamamen açık: ilhamın belirli bir temaya sabitlenmemiş. Hangi sorunun kıymetli olduğunu ortamından değil, tekrar tekrar sana dönüşünden anlarsın.', en: 'Your head is completely open: inspiration isn\'t fixed to one theme. A question\'s worth shows by how it keeps returning to you, not by the room\'s noise.' },
  ajna:        { tr: 'Ajnan tamamen açık: hiçbir düşünce biçimine bağlı değilsin — her kavramı deneyebilir, hiçbirine hapsolmazsın.', en: 'Your ajna is completely open: bound to no way of thinking — you can try every concept and be imprisoned by none.' },
  throat:      { tr: 'Boğazın tamamen açık: sesin ortamla şekillenir. Konuşmadan önce "bunu kim söylüyor?" diye içeriden dinle.', en: 'Your throat is completely open: your voice takes the room\'s shape. Before speaking, listen inward: "who is saying this?"' },
  g:           { tr: 'G merkezin tamamen açık: kimliğin bir kalıba mühürlenmemiş. Mekân ve insan seçimin, pusulanın ta kendisi.', en: 'Your G is completely open: identity unsealed by any mold. Your choice of place and people is the compass itself.' },
  heart:       { tr: 'Kalp merkezin tamamen açık: değerin kanıt istemez. Söz vermeden yaşamak sende zayıflık değil, ustalıktır.', en: 'Your heart is completely open: your worth needs no proof. Living promise-light is mastery in you, not weakness.' },
  solarPlexus: { tr: 'Duygusal merkezin tamamen açık: odadaki hissi katıksız yansıtırsın — bu, duyguların yalancısı değil, en saf barometresi olmak demek.', en: 'Your emotional center is completely open: you reflect the room\'s feeling undiluted — the purest barometer, not a fraud of feeling.' },
  sacral:      { tr: 'Sakralın tamamen açık: enerji sende üretilmez, akar. Ne kadarının yeteceğini ancak dinlenmiş halin bilir.', en: 'Your sacral is completely open: energy flows through, not from, you. Only your rested self knows how much is enough.' },
  spleen:      { tr: 'Dalağın tamamen açık: korkuları büyütmeden tanıyabilirsin — hiçbiri sende kök salmak zorunda değil.', en: 'Your spleen is completely open: you can meet fears without feeding them — none has to take root in you.' },
  root:        { tr: 'Kök merkezin tamamen açık: stres sende üretilmez, ziyaret eder. Kapıyı açık tutmak zorunda değilsin.', en: 'Your root is completely open: stress visits you, it isn\'t made in you. You don\'t have to keep the door open.' },
};

// ---- Tanımsız merkez için kişisel ek satırlar (ChartScreen + rapor) ----
export function undefinedCenterExtras(chart: HumanDesignChart, center: CenterKey, lang: Lang): string[] {
  const out: string[] = [];
  const gates = hangingGates(chart, center);
  if (gates.length > 0) {
    const g = gates[0];
    const gi: any = (GATES as any)[g];
    if (gi) {
      const name = lang === 'en' ? (gi.nameEn || gi.name) : gi.name;
      const theme = lang === 'en' ? (gi.themeEn || gi.theme) : gi.theme;
      out.push(L(lang,
        `Bu merkez sende boş değil: ${g}. kapı (${name}) burada asılı duruyor. Baskıyı en çok şu temada tanırsın: ${theme}`,
        `This center isn't empty in you: gate ${g} (${name}) hangs here. You\'ll recognize the pressure most in this theme: ${theme}`));
      const p = partnerOf(g);
      if (p && !chart.activeGates.has(p.partner)) {
        const pi: any = (GATES as any)[p.partner];
        const pName = pi ? (lang === 'en' ? (pi.nameEn || pi.name) : pi.name) : String(p.partner);
        out.push(L(lang,
          `${g}. kapın, insanlarda ${p.partner}. kapıyı (${pName}) arar — ${p.channelName} kanalını tamamlayan kişiler sana mıknatıs gibi gelir; bu çekimi bilerek yaşa.`,
          `Your gate ${g} seeks gate ${p.partner} (${pName}) in others — people completing the ${p.channelNameEn} channel feel magnetic to you; live that pull knowingly.`));
      }
      if (gates.length > 1) {
        out.push(L(lang,
          `Ayrıca ${gates.slice(1).join(', ')}. kapıların da burada asılı — bu merkezin dersleri sende çok sesli işler.`,
          `Gates ${gates.slice(1).join(', ')} also hang here — this center\'s lessons run polyphonic in you.`));
      }
    }
  } else {
    out.push(L(lang, OPEN_FULL[center].tr, OPEN_FULL[center].en));
  }
  const tc = TYPE_CENTER[center]?.[chart.type];
  if (tc && tc.tr) out.push(L(lang, tc.tr, tc.en));
  return out;
}

// ---- Haritaya özgü "söndürme" ritüelleri (rapor) ----
export function personalResets(chart: HumanDesignChart, lang: Lang): string[] {
  const out: string[] = [];
  const h = chartHash(chart);
  // 1) Yetki ritüeli — karar anı sıfırlaması
  const ar = AUTH_RESET[chart.authority];
  if (ar) out.push(L(lang, ar.tr, ar.en));
  // 2) Asılı kapı hediyesi — en dolu tanımsız merkezden
  const undef = (Object.keys(CENTERS) as CenterKey[]).filter(k => !chart.definedCenters.has(k));
  const withGates = undef.map(k => ({ k, g: hangingGates(chart, k) })).filter(x => x.g.length > 0);
  if (withGates.length > 0) {
    const sel = withGates[h % withGates.length];
    const g = sel.g[h % sel.g.length];
    const gi: any = (GATES as any)[g];
    if (gi) {
      const gift = lang === 'en' ? (gi.giftEn || gi.gift) : gi.gift;
      const cName = lang === 'en' ? ((CENTERS[sel.k] as any).nameEn || CENTERS[sel.k].name) : CENTERS[sel.k].name;
      out.push(L(lang,
        `${cName} baskısı yandığında ${g}. kapının hediyesine dön: ${gift}`,
        `When the ${cName} pressure lights up, return to gate ${g}\'s gift: ${gift}`));
    }
  }
  // 3) Kanal çapası — tanımlı gücüne dönüş
  if (chart.activeChannels.length > 0) {
    const ch = chart.activeChannels[h % chart.activeChannels.length];
    const chName = lang === 'en' ? ((ch as any).nameEn || ch.name) : ch.name;
    const chDesc = lang === 'en' ? ((ch as any).shortDescEn || ch.shortDesc) : ch.shortDesc;
    out.push(L(lang,
      `Çapan: ${ch.id} ${chName}. Kaybolduğunda buraya dön — ${chDesc}`,
      `Your anchor: ${ch.id} ${chName}. When lost, return here — ${chDesc}`));
  }
  return out;
}

// ---- Bugünün kişisel transit vurgusu (HomeScreen) ----
export function todaysHighlight(chart: HumanDesignChart, now: Date, lang: Lang): { title: string; body: string } | null {
  try {
    const pos = allPositions(julianDay(now));
    const transitGates = new Set<number>();
    for (const key of Object.keys(pos) as (keyof typeof pos)[]) transitGates.add(longitudeToGate(pos[key]).gate);
    const dayN = Math.floor(now.getTime() / 86400000);
    const seed = dayN + chartHash(chart);

    // a) Geçici kanal: transit kapı, kullanıcının aktif kapısının ortağını tamamlıyor
    const completions: { userGate: number; transitGate: number; name: string; nameEn: string }[] = [];
    for (const ug of Array.from(chart.activeGates)) {
      const p = partnerOf(ug);
      if (p && !chart.activeGates.has(p.partner) && transitGates.has(p.partner)) {
        const ch = CHANNELS.find(c => (c.gates[0] === ug && c.gates[1] === p.partner) || (c.gates[1] === ug && c.gates[0] === p.partner));
        if (ch) completions.push({ userGate: ug, transitGate: p.partner, name: ch.name, nameEn: (ch as any).nameEn || ch.name });
      }
    }
    if (completions.length > 0) {
      const c = completions[seed % completions.length];
      return {
        title: L(lang, 'Bugün gökyüzü seni tamamlıyor', 'Today the sky completes you'),
        body: L(lang,
          `Transit ${c.transitGate}. kapı, senin ${c.userGate}. kapınla birleşip ${c.name} kanalını geçici olarak sende akıtıyor — normalde başkalarında aradığın bu frekans bugün içinde.`,
          `Transit gate ${c.transitGate} joins your gate ${c.userGate}, letting the ${c.nameEn} channel flow in you for now — the frequency you usually seek in others is inside you today.`),
      };
    }
    // b) Aynı kapı vurgusu: gökyüzü, senin aktif kapılarından birinde
    const overlaps = Array.from(chart.activeGates).filter(g => transitGates.has(g));
    if (overlaps.length > 0) {
      const g = overlaps[seed % overlaps.length];
      const gi: any = (GATES as any)[g];
      const name = gi ? (lang === 'en' ? (gi.nameEn || gi.name) : gi.name) : String(g);
      const theme = gi ? (lang === 'en' ? (gi.themeEn || gi.theme) : gi.theme) : '';
      return {
        title: L(lang, 'Bugün kapın gökyüzünde de açık', 'Your gate is open in the sky today'),
        body: L(lang,
          `${g}. kapın (${name}) bugün transitte de aktif — bu tema çifte güçle çalışıyor: ${theme}`,
          `Your gate ${g} (${name}) is also active in transit — this theme runs at double strength today: ${theme}`),
      };
    }
    return null;
  } catch { return null; }
}
