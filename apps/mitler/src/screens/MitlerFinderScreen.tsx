import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { useData, Archetype, Myth, ImageItem } from '../data/loader';
import { MitlerDetailScreen, MitlerEntry, Kind } from './MitlerDetailScreen';
import { calcLifePath } from '../utils/numerology';
import { useLanguage } from '../i18n/useLanguage';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Weight { trait: string; value: number }
interface Option { text: string; weights: Weight[]; element?: string }
interface Question { q: string; emoji: string; options: Option[] }
type Mode = 'intro' | 'quiz' | 'needsProfile' | 'result';

interface FinderResult {
  archetype: Archetype;
  myth: Myth;
  image: ImageItem;
  reason: string;
}

// ─── Quiz data ─────────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    q: 'Doğada hangi ortam seni çağırıyor?',
    emoji: '⊕',
    options: [
      { text: 'Dağlar ve açık gökyüzü', element: 'hava',
        weights: [{ trait: 'özgürlük', value: 2 }, { trait: 'vizyon', value: 2 }, { trait: 'yüksek bakış', value: 2 }] },
      { text: 'Orman ve ıssız toprak', element: 'toprak',
        weights: [{ trait: 'güç', value: 2 }, { trait: 'istikrar', value: 2 }, { trait: 'kök', value: 2 }] },
      { text: 'Nehir, deniz, derin sular', element: 'su',
        weights: [{ trait: 'akış', value: 2 }, { trait: 'bilinçdışı', value: 2 }, { trait: 'dönüşüm', value: 2 }] },
      { text: 'Sıcak alev ve ateş', element: 'ateş',
        weights: [{ trait: 'cesaret', value: 2 }, { trait: 'tutku', value: 2 }, { trait: 'dönüşüm', value: 2 }] },
    ],
  },
  {
    q: 'Zor bir karar anında tepkin nedir?',
    emoji: '↯',
    options: [
      { text: 'Dur, gözlemle, anlamlandır',
        weights: [{ trait: 'bilgelik', value: 3 }, { trait: 'sezgi', value: 2 }, { trait: 'derinlik', value: 2 }] },
      { text: 'Cesaretle harekete geç',
        weights: [{ trait: 'kahraman', value: 3 }, { trait: 'cesaret', value: 2 }, { trait: 'irade', value: 2 }] },
      { text: 'Bakım veren olarak başkasını koru',
        weights: [{ trait: 'şefkat', value: 3 }, { trait: 'sevgi', value: 2 }, { trait: 'beslenme', value: 2 }] },
      { text: 'Kuralı kır, yeni bir yol aç',
        weights: [{ trait: 'asilik', value: 3 }, { trait: 'mizah', value: 2 }, { trait: 'kuralı kırmak', value: 2 }] },
    ],
  },
  {
    q: 'Seni en iyi anlatan sözcük hangisi?',
    emoji: '✺',
    options: [
      { text: 'Yaratıcı',
        weights: [{ trait: 'yaratım', value: 3 }, { trait: 'ifade', value: 2 }, { trait: 'sanat', value: 2 }] },
      { text: 'Bilge',
        weights: [{ trait: 'bilgelik', value: 3 }, { trait: 'içgörü', value: 2 }, { trait: 'mentor', value: 2 }] },
      { text: 'Aşık',
        weights: [{ trait: 'sevgi', value: 3 }, { trait: 'tutku', value: 3 }, { trait: 'adanma', value: 2 }] },
      { text: 'Asi',
        weights: [{ trait: 'başkaldırı', value: 3 }, { trait: 'özgürlük', value: 2 }, { trait: 'değişim', value: 2 }] },
    ],
  },
  {
    q: 'Bir grupta hangi rolü üstlenirsin?',
    emoji: '☾',
    options: [
      { text: 'Lider ve yön gösteren',
        weights: [{ trait: 'liderlik', value: 3 }, { trait: 'sorumluluk', value: 2 }, { trait: 'vizyon', value: 2 }] },
      { text: 'Arabulucu ve dengeleyici',
        weights: [{ trait: 'denge', value: 3 }, { trait: 'arabuluculuk', value: 2 }, { trait: 'uyum', value: 2 }] },
      { text: 'İlham veren yaratıcı',
        weights: [{ trait: 'yaratım', value: 3 }, { trait: 'ilham', value: 2 }, { trait: 'estetik', value: 2 }] },
      { text: 'Gözlemleyen analizci',
        weights: [{ trait: 'içgörü', value: 3 }, { trait: 'derinlik', value: 2 }, { trait: 'gözlem', value: 2 }] },
    ],
  },
  {
    q: 'En büyük gücün nedir?',
    emoji: '△',
    options: [
      { text: 'Sezgi ve içgüdü',
        weights: [{ trait: 'sezgi', value: 3 }, { trait: 'bilinçaltı', value: 2 }, { trait: 'derinlik', value: 2 }] },
      { text: 'Sabır ve dayanıklılık',
        weights: [{ trait: 'sabır', value: 3 }, { trait: 'dayanıklılık', value: 2 }, { trait: 'istikrar', value: 2 }] },
      { text: 'Zekâ ve esneklik',
        weights: [{ trait: 'zekâ', value: 3 }, { trait: 'oyun', value: 2 }, { trait: 'uyum', value: 2 }] },
      { text: 'Cesaret ve tutku',
        weights: [{ trait: 'cesaret', value: 3 }, { trait: 'tutku', value: 3 }, { trait: 'irade', value: 2 }] },
    ],
  },
  {
    q: 'İçinde en çok hangi yara konuşur?',
    emoji: '☀',
    options: [
      { text: 'Terk edilmişlik, yalnızlık',
        weights: [{ trait: 'yetim', value: 3 }, { trait: 'kayıp', value: 2 }, { trait: 'sürgün', value: 2 }] },
      { text: 'Yetersizlik, görünmemek',
        weights: [{ trait: 'maske', value: 3 }, { trait: 'gölge', value: 2 }, { trait: 'utanç', value: 2 }] },
      { text: 'Kontrolü kaybetmek',
        weights: [{ trait: 'kontrol', value: 3 }, { trait: 'sınır', value: 2 }, { trait: 'disiplin', value: 2 }] },
      { text: 'Anlamsızlık, derin boşluk',
        weights: [{ trait: 'arayış', value: 3 }, { trait: 'bilgelik', value: 2 }, { trait: 'manevi', value: 2 }] },
    ],
  },
  {
    q: 'İçinde uyumayan, hep çağıran şey hangisi?',
    emoji: '◈',
    options: [
      { text: 'Bütünleşme — kayıp parçaları toplamak',
        weights: [{ trait: 'self', value: 3 }, { trait: 'bütünlük', value: 3 }, { trait: 'merkez', value: 2 }] },
      { text: 'Dönüşüm — eskiyi yakıp yenisini doğurmak',
        weights: [{ trait: 'dönüşüm', value: 3 }, { trait: 'yeniden doğuş', value: 3 }, { trait: 'ölüm-doğuş', value: 2 }] },
      { text: 'İfade — içtekini görünür kılmak',
        weights: [{ trait: 'yaratım', value: 3 }, { trait: 'ifade', value: 2 }, { trait: 'sanat', value: 2 }] },
      { text: 'Hizmet — kendinden büyüğüne adanmak',
        weights: [{ trait: 'aziz', value: 3 }, { trait: 'adanma', value: 2 }, { trait: 'şifa', value: 2 }] },
    ],
  },
];

// ─── Matching algorithms ───────────────────────────────────────────────────────

function normalizeWord(s: string): string {
  return s.toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');
}

function scoreEntry<T extends { name: string; element?: string; keywords?: string[]; category?: string; culture?: string }>(
  pool: T[],
  traits: Record<string, number>,
  elements: Record<string, number>,
): T {
  let best = pool[0];
  let bestScore = -1;
  for (const item of pool) {
    let score = item.element ? (elements[item.element] || 0) : 0;
    const blob = normalizeWord(
      [item.name, ...(item.keywords || []), item.category || '', item.culture || ''].join(' ')
    );
    for (const [k, v] of Object.entries(traits)) {
      if (blob.includes(normalizeWord(k))) score += v;
    }
    if (score > bestScore) { bestScore = score; best = item; }
  }
  return best;
}

function findByQuiz(
  picks: Option[],
  archetypesData: Archetype[],
  mythsData: Myth[],
  imagesData: ImageItem[],
): FinderResult {
  const traits: Record<string, number> = {};
  const elements: Record<string, number> = {};
  for (const p of picks) {
    for (const { trait, value } of p.weights) traits[trait] = (traits[trait] || 0) + value;
    if (p.element) elements[p.element] = (elements[p.element] || 0) + 3;
  }
  return {
    archetype: scoreEntry(archetypesData, traits, elements),
    myth:      scoreEntry(mythsData,      traits, elements),
    image:     scoreEntry(imagesData,     traits, elements),
    reason:    'Cevaplarındaki enerji örüntüsü',
  };
}

function findByBirth(
  day: number, month: number, year: number,
  hour: number | undefined, city: string | undefined,
  archetypesData: Archetype[],
  mythsData: Myth[],
  imagesData: ImageItem[],
): FinderResult {
  const traits: Record<string, number> = {};
  const elements: Record<string, number> = {};

  const seasonEl: Record<number, string> = {
    1:'su',2:'su',3:'hava',4:'hava',5:'hava',
    6:'ateş',7:'ateş',8:'ateş',9:'toprak',10:'toprak',11:'toprak',12:'su',
  };
  elements[seasonEl[month]] = 5;

  const birthDate = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const lifePath = calcLifePath(birthDate);

  const lifePathTraits: Record<number, string[]> = {
    1:  ['liderlik','cesaret','özgürlük'],
    2:  ['denge','sezgi','arabuluculuk'],
    3:  ['yaratım','ifade','sanat'],
    4:  ['istikrar','disiplin','sabır'],
    5:  ['özgürlük','değişim','yolculuk'],
    6:  ['şefkat','sevgi','beslenme'],
    7:  ['bilgelik','derinlik','arayış'],
    8:  ['güç','dönüşüm','adanma'],
    9:  ['bilgelik','şefkat','dönüşüm'],
    11: ['sezgi','ilham','manevi'],
    22: ['vizyon','yaratım','liderlik'],
    33: ['şefkat','adanma','şifa'],
  };
  for (const t of (lifePathTraits[lifePath] || [])) traits[t] = (traits[t] || 0) + 3;

  const dg = Math.min(Math.ceil(day / 8), 4);
  const dayTraits: Record<number, string[]> = {
    1: ['kahraman','cesaret','liderlik'],
    2: ['sezgi','derinlik','bilgelik'],
    3: ['dönüşüm','yeniden doğuş','değişim'],
    4: ['sevgi','şefkat','beslenme'],
  };
  for (const t of (dayTraits[dg] || [])) traits[t] = (traits[t] || 0) + 2;

  const HOUR_RANGES = [
    { min: 0,  max: 5,  traits: ['gölge','bilinçaltı','sezgi','derinlik'], label: 'gece' },
    { min: 6,  max: 11, traits: ['kahraman','cesaret','irade','yaratım'],  label: 'sabah' },
    { min: 12, max: 17, traits: ['liderlik','güç','vizyon','self'],        label: 'öğlen' },
    { min: 18, max: 23, traits: ['dönüşüm','bilgelik','şefkat','aziz'],    label: 'akşam' },
  ];
  let hourLabel = '';
  if (hour !== undefined) {
    const hr = HOUR_RANGES.find(r => hour >= r.min && hour <= r.max)!;
    for (const t of hr.traits) traits[t] = (traits[t] || 0) + 3;
    hourLabel = hr.label;
  }

  const SEASON_NAMES: Record<string, string> = { hava:'ilkbahar', ateş:'yaz', toprak:'sonbahar', su:'kış' };
  const seasonName = SEASON_NAMES[seasonEl[month]];
  const reason = [
    `Hayat Yolu ${lifePath}`,
    `${seasonName.charAt(0).toUpperCase() + seasonName.slice(1)} doğumundan gelen ${seasonEl[month]} enerjisi`,
    hourLabel ? `${hourLabel} saati` : '',
    city && city.trim() ? `${city.trim()} izi` : '',
  ].filter(Boolean).join(' · ');

  return {
    archetype: scoreEntry(archetypesData, traits, elements),
    myth:      scoreEntry(mythsData,      traits, elements),
    image:     scoreEntry(imagesData,     traits, elements),
    reason,
  };
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  embedded?: boolean;
  /**
   * Birth data is owned by the Profile screen. Finder reads it via these
   * props and never re-prompts. If the date is missing, the "natal" mode
   * shows a redirect panel instead of an input form.
   */
  profileBirthDate?: string;
  profileBirthHour?: number;
  profileBirthCity?: string;
  onGoToProfile?: () => void;
}

export function MitlerFinderScreen({
  onClose,
  embedded,
  profileBirthDate,
  profileBirthHour,
  profileBirthCity,
  onGoToProfile,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { archetypes: archetypesData, myths: mythsData, images: imagesData } = useData();
  const [mode, setMode]     = useState<Mode>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [picks, setPicks]   = useState<Option[]>([]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<FinderResult | null>(null);
  const [openDetail, setOpenDetail] = useState<MitlerEntry | null>(null);

  const cardFade   = useRef(new Animated.Value(1)).current;
  const resultFade = useRef(new Animated.Value(0)).current;

  const parsedBirth = (() => {
    if (!profileBirthDate) return null;
    const [y, m, d] = profileBirthDate.split('-').map(n => parseInt(n, 10));
    if (!y || !m || !d) return null;
    return { day: d, month: m, year: y };
  })();

  const reset = () => {
    setMode('intro'); setQIndex(0); setPicks([]); setChosen(null); setResult(null);
    cardFade.setValue(1); resultFade.setValue(0);
  };

  const handlePick = (idx: number, opt: Option) => {
    if (chosen !== null) return;
    setChosen(idx);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      const newPicks = [...picks, opt];
      if (qIndex < QUESTIONS.length - 1) {
        Animated.timing(cardFade, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
          setPicks(newPicks); setQIndex(i => i + 1); setChosen(null);
          Animated.timing(cardFade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
        });
      } else {
        Animated.timing(cardFade, { toValue: 0, duration: 280, useNativeDriver: true }).start(() => {
          showResult(findByQuiz(newPicks, archetypesData, mythsData, imagesData));
        });
      }
    }, 350);
  };

  const handleBirthFinder = () => {
    if (parsedBirth) {
      showResult(findByBirth(
        parsedBirth.day,
        parsedBirth.month,
        parsedBirth.year,
        profileBirthHour,
        profileBirthCity,
        archetypesData,
        mythsData,
        imagesData,
      ));
    } else {
      setMode('needsProfile');
    }
  };

  const showResult = (r: FinderResult) => {
    setResult(r);
    setMode('result');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.timing(resultFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  };

  const openArchetype = (a: Archetype) =>
    setOpenDetail({
      kind: 'archetype', id: a.id, name: a.name, emoji: a.emoji,
      tagline: '', detailMeta: `${a.tradition} · ${a.category}`, searchBlob: '', data: a,
    });
  const openMyth = (m: Myth) =>
    setOpenDetail({
      kind: 'myth', id: m.id, name: m.name, emoji: m.emoji,
      tagline: '', detailMeta: `${m.culture} · ${m.era}`, searchBlob: '', data: m,
    });
  const openImage = (i: ImageItem) =>
    setOpenDetail({
      kind: 'image', id: i.id, name: i.name, emoji: i.emoji,
      tagline: '', detailMeta: `${i.tradition} · ${i.category}`, searchBlob: '', data: i,
    });

  if (openDetail) {
    return <MitlerDetailScreen entry={openDetail} onClose={() => setOpenDetail(null)} />;
  }

  const currentQ = QUESTIONS[qIndex];
  const progress = qIndex / QUESTIONS.length;

  return (
    <View style={[styles.root, { paddingTop: embedded ? 0 : insets.top }]}>
      {(!embedded || mode !== 'intro') && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={embedded ? reset : (mode === 'intro' || mode === 'result' ? onClose : reset)}
            style={styles.closeBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.closeTxt}>{embedded ? '←' : (mode === 'intro' || mode === 'result' ? '✕' : '←')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rehber Mitini Bul</Text>
          <View style={{ width: 32 }} />
        </View>
      )}

      {/* Intro */}
      {mode === 'intro' && (
        <View style={styles.introWrap}>
          <Text style={styles.introEmoji}>✦</Text>
          <Text style={styles.introTitle}>Rehber Mitini Keşfet</Text>
          <Text style={styles.introDesc}>
            Ruhunla uyumlu arketipi bulmak için iki yol var.
          </Text>
          <Text style={styles.introNote}>
            Sakin sana bir ayna tutar — içinde zaten var olanı yansıtır ve olası olanı fısıldar.
            Onu kalbinde uyandıracak, hissedip özümseyecek olan ise yalnızca sensin.
          </Text>

          <TouchableOpacity style={[styles.modeBtn, { borderColor: Colors.teal }]} onPress={() => setMode('quiz')} activeOpacity={0.8}>
            <Text style={styles.modeBtnEmoji}>✦</Text>
            <View style={styles.modeBtnText}>
              <Text style={[styles.modeBtnTitle, { color: Colors.tealLight }]}>Sorularla Keşfet</Text>
              <Text style={styles.modeBtnDesc}>7 soru, karakterine göre eşleşir</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeBtn, { borderColor: Colors.gold }]} onPress={handleBirthFinder} activeOpacity={0.8}>
            <Text style={styles.modeBtnEmoji}>☀</Text>
            <View style={styles.modeBtnText}>
              <Text style={[styles.modeBtnTitle, { color: Colors.gold }]}>{t('finder.mode.birth.title')}</Text>
              <Text style={styles.modeBtnDesc}>{t('finder.mode.birth.desc')}</Text>
            </View>
            {parsedBirth && (
              <Text style={styles.modeBtnHint}>{t('finder.profile.using')} ✓</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Quiz */}
      {mode === 'quiz' && (
        <>
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
            </View>
            <Text style={styles.progressTxt}>{qIndex + 1} / {QUESTIONS.length}</Text>
          </View>
          <Animated.View style={[styles.qCard, { opacity: cardFade }]}>
            <Text style={styles.qEmoji}>{currentQ.emoji}</Text>
            <Text style={styles.qText}>{currentQ.q}</Text>
            <View style={styles.optionsWrap}>
              {currentQ.options.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.optBtn, chosen === i && styles.optBtnChosen, chosen !== null && chosen !== i && styles.optBtnDimmed]}
                  onPress={() => handlePick(i, opt)}
                  activeOpacity={0.75}
                  disabled={chosen !== null}
                >
                  <Text style={[styles.optTxt, chosen === i && { color: Colors.tealLight }]}>{opt.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </>
      )}

      {/* Profil'e yönlendirme — doğum bilgileri eksikse */}
      {mode === 'needsProfile' && (
        <View style={styles.needsProfileWrap}>
          <Text style={styles.needsProfileEmoji}>☀</Text>
          <Text style={styles.needsProfileTitle}>{t('finder.profile.missing.title')}</Text>
          <Text style={styles.needsProfileDesc}>{t('finder.profile.missing.desc')}</Text>
          {onGoToProfile && (
            <TouchableOpacity
              style={styles.needsProfileBtn}
              onPress={() => { onGoToProfile(); reset(); }}
              activeOpacity={0.85}
            >
              <Text style={styles.needsProfileBtnTxt}>{t('finder.profile.missing.cta')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Result */}
      {mode === 'result' && result && (
        <Animated.ScrollView
          style={{ opacity: resultFade }}
          contentContainerStyle={styles.resultScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultLabel}>Sana Eşlik Edenler</Text>
          {result.reason ? <Text style={styles.resultReason}>{result.reason}</Text> : null}

          <TripleCard
            color={Colors.gold}
            label="ARKETİP"
            emoji={result.archetype.emoji}
            name={result.archetype.name}
            meta={`${result.archetype.tradition} · ${result.archetype.category}`}
            body={result.archetype.essence}
            tags={result.archetype.keywords || []}
            onOpen={() => openArchetype(result.archetype)}
          />

          <TripleCard
            color={Colors.purpleLight}
            label="MİT"
            emoji={result.myth.emoji}
            name={result.myth.name}
            meta={`${result.myth.culture} · ${result.myth.era}`}
            body={result.myth.summary}
            tags={[result.myth.category, result.myth.element]}
            onOpen={() => openMyth(result.myth)}
          />

          <TripleCard
            color={Colors.tealLight}
            label="İMGE"
            emoji={result.image.emoji}
            name={result.image.name}
            meta={`${result.image.tradition} · ${result.image.category}`}
            body={result.image.essence}
            tags={result.image.keywords || []}
            onOpen={() => openImage(result.image)}
          />

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={embedded ? reset : onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnTxt}>{embedded ? 'Yeniden Keşfet ✦' : 'Kapat ✦'}</Text>
          </TouchableOpacity>
        </Animated.ScrollView>
      )}
    </View>
  );
}

function TripleCard({
  color, label, emoji, name, meta, body, tags, onOpen,
}: {
  color: string;
  label: string;
  emoji: string;
  name: string;
  meta: string;
  body: string;
  tags: string[];
  onOpen: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.resultCard, { borderColor: color + '50' }]}
      onPress={onOpen}
      activeOpacity={0.85}
    >
      <Text style={[styles.resultMiniLabel, { color }]}>{label}</Text>
      <View style={[styles.medallion, { borderColor: color + '50' }]}>
        <View style={[styles.medallionInner, { borderColor: color + '30' }]}>
          <Text style={styles.resultEmoji}>{emoji}</Text>
        </View>
      </View>
      <Text style={styles.resultName}>{name}</Text>
      <Text style={[styles.resultMeta, { color }]}>{meta.toUpperCase()}</Text>
      <View style={[styles.divider, { backgroundColor: color }]} />
      <Text style={styles.resultMsg} numberOfLines={4}>{body}</Text>
      <View style={styles.tagsRow}>
        {(tags || []).filter(Boolean).slice(0, 3).map((t, i) => (
          <View key={i} style={[styles.tag, { borderColor: color + '40' }]}>
            <Text style={[styles.tagTxt, { color }]}>{t}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.openHint, { color }]}>Detayı Aç →</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  closeTxt: { fontSize: 14, color: Colors.textMuted },
  headerTitle: {
    fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold,
    color: Colors.tealLight, letterSpacing: 1.5, textTransform: 'uppercase',
  },

  // Intro
  introWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.lg, gap: Spacing.md,
  },
  introEmoji: { fontSize: 56, marginBottom: Spacing.sm, color: Colors.textPrimary },
  introTitle: {
    fontSize: Typography.size.xl, fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary, textAlign: 'center', letterSpacing: 0.5,
  },
  introDesc: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
    textAlign: 'center', lineHeight: Typography.size.sm * 1.7,
    marginBottom: Spacing.sm,
  },
  introNote: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    textAlign: 'center', lineHeight: Typography.size.xs * 1.85,
    fontStyle: 'italic', opacity: 0.7, marginBottom: Spacing.sm,
  },
  modeBtn: {
    width: '100%', flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg,
    borderWidth: 1, padding: Spacing.md,
  },
  modeBtnEmoji: { fontSize: 28, width: 36, textAlign: 'center' },
  modeBtnText: { flex: 1 },
  modeBtnTitle: { fontSize: Typography.size.md, fontWeight: Typography.weight.semibold, marginBottom: 2 },
  modeBtnDesc: { fontSize: Typography.size.xs, color: Colors.textMuted },

  // Progress
  progressWrap: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  progressTrack: {
    flex: 1, height: 3, backgroundColor: Colors.surface,
    borderRadius: BorderRadius.round, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.teal, borderRadius: BorderRadius.round },
  progressTxt: { fontSize: Typography.size.xs, color: Colors.textMuted, width: 36, textAlign: 'right' },

  // Quiz
  qCard: {
    flex: 1, paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg, paddingBottom: Spacing.lg,
    alignItems: 'center', justifyContent: 'center', gap: Spacing.lg,
  },
  qEmoji: { fontSize: 44, marginBottom: Spacing.xs },
  qText: {
    fontSize: Typography.size.xl, fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary, textAlign: 'center', lineHeight: Typography.size.xl * 1.5,
  },
  optionsWrap: { width: '100%', gap: Spacing.sm, marginTop: Spacing.sm },
  optBtn: {
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.divider,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, alignItems: 'center',
  },
  optBtnChosen: { borderColor: Colors.teal, backgroundColor: Colors.teal + '18' },
  optBtnDimmed: { opacity: 0.35 },
  optTxt: {
    fontSize: Typography.size.md, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: Typography.size.md * 1.4,
  },

  // Profile-required panel (replaces former inline birth form)
  modeBtnHint: {
    fontSize: 9,
    color: Colors.gold + 'AA',
    letterSpacing: 1.5,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  needsProfileWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  needsProfileEmoji: {
    fontSize: 48,
    color: Colors.gold,
    marginBottom: Spacing.sm,
  },
  needsProfileTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
    color: Colors.gold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  needsProfileDesc: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.size.sm * 1.7,
    marginBottom: Spacing.sm,
  },
  needsProfileBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.gold,
    backgroundColor: Colors.gold + '14',
  },
  needsProfileBtnTxt: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.gold,
    letterSpacing: 1,
  },

  // Result
  resultScroll: {
    padding: Spacing.lg, alignItems: 'center', gap: Spacing.md, paddingBottom: Spacing.xxxl,
  },
  resultLabel: {
    fontSize: Typography.size.xs, color: Colors.teal,
    letterSpacing: 2.5, textTransform: 'uppercase',
  },
  resultReason: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    textAlign: 'center', fontStyle: 'italic', marginTop: -Spacing.xs,
  },
  resultCard: {
    width: '100%', backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl, borderWidth: 1,
    padding: Spacing.lg, alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm,
  },
  resultMiniLabel: {
    fontSize: 10, letterSpacing: 3,
    fontWeight: Typography.weight.semibold,
  },
  medallion: {
    width: 84, height: 84, borderRadius: 42, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  medallionInner: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  resultEmoji: { fontSize: 32 },
  resultName: {
    fontSize: Typography.size.xl, fontWeight: Typography.weight.bold,
    color: Colors.textPrimary, letterSpacing: 0.8, textAlign: 'center',
  },
  resultMeta: {
    fontSize: 10, letterSpacing: 1.5,
  },
  divider: { width: 28, height: 1, opacity: 0.5, marginVertical: Spacing.xs },
  resultMsg: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: Typography.size.sm * 1.85, fontWeight: Typography.weight.light,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, justifyContent: 'center', marginTop: Spacing.xs },
  tag: { borderWidth: 1, borderRadius: BorderRadius.round, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  tagTxt: { fontSize: 10, letterSpacing: 0.5 },
  openHint: {
    fontSize: 10, letterSpacing: 1.5, marginTop: Spacing.xs,
    textTransform: 'uppercase', fontWeight: Typography.weight.semibold,
  },

  doneBtn: {
    backgroundColor: Colors.teal, paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.round, marginTop: Spacing.md,
  },
  doneBtnTxt: {
    fontSize: Typography.size.md, fontWeight: Typography.weight.bold,
    color: '#0D1E1B', letterSpacing: 1,
  },
});
