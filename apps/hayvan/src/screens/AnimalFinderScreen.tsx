import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, TAB_BAR_HEIGHT } from '../theme/colors';
import animalsData from '../data/animals.json';
import { useLocalizedAnimals } from '../i18n/localize';
import { useI18n } from '../i18n/useI18n';
import { en } from '../i18n/en';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Weight { trait: string; value: number }
interface Option { text: string; weights: Weight[]; element?: string }
interface Question { q: string; emoji: string; options: Option[] }
type Mode = 'intro' | 'quiz' | 'birth' | 'result';

interface AnimalResult {
  animal: typeof animalsData[0];
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
        weights: [{ trait: 'güç', value: 2 }, { trait: 'istikrar', value: 2 }, { trait: 'dayanıklılık', value: 2 }] },
      { text: 'Nehir, deniz, derin sular', element: 'su',
        weights: [{ trait: 'akış', value: 2 }, { trait: 'bilinçdışı', value: 2 }, { trait: 'dönüşüm', value: 2 }] },
      { text: 'Sıcak alev ve ateş', element: 'ateş',
        weights: [{ trait: 'cesaret', value: 2 }, { trait: 'tutku', value: 2 }, { trait: 'güç', value: 2 }] },
    ],
  },
  {
    q: 'Zor bir durumla karşılaştığında tepkin ne?',
    emoji: '↯',
    options: [
      { text: 'Dur, gözlemle, strateji kur',
        weights: [{ trait: 'bilgelik', value: 3 }, { trait: 'sezgi', value: 2 }, { trait: 'strateji', value: 2 }] },
      { text: 'Hızla harekete geç',
        weights: [{ trait: 'hız', value: 3 }, { trait: 'kararlılık', value: 2 }, { trait: 'cesaret', value: 2 }] },
      { text: 'Çevrendekilerini bir araya getir',
        weights: [{ trait: 'liderlik', value: 3 }, { trait: 'aile', value: 2 }, { trait: 'koruma', value: 2 }] },
      { text: 'İçine çekil, ruhsal güç ara',
        weights: [{ trait: 'içgüdü', value: 3 }, { trait: 'gizem', value: 2 }, { trait: 'içgörü', value: 2 }] },
    ],
  },
  {
    q: 'Seni en iyi anlatan sözcük hangisi?',
    emoji: '✺',
    options: [
      { text: 'Özgür',
        weights: [{ trait: 'özgürlük', value: 3 }, { trait: 'bağımsızlık', value: 3 }] },
      { text: 'Güçlü',
        weights: [{ trait: 'güç', value: 3 }, { trait: 'cesaret', value: 2 }, { trait: 'onur', value: 2 }] },
      { text: 'Bilge',
        weights: [{ trait: 'bilgelik', value: 3 }, { trait: 'içgörü', value: 2 }, { trait: 'derinlik', value: 2 }] },
      { text: 'Sevgi dolu',
        weights: [{ trait: 'sevgi', value: 3 }, { trait: 'şefkat', value: 3 }, { trait: 'aile', value: 2 }] },
    ],
  },
  {
    q: 'Bir grupta hangi rolü üstlenirsin?',
    emoji: '☾',
    options: [
      { text: 'Öncü ve yol açan',
        weights: [{ trait: 'liderlik', value: 3 }, { trait: 'cesaret', value: 2 }, { trait: 'vizyon', value: 2 }] },
      { text: 'Arabulucu ve dengeleyici',
        weights: [{ trait: 'uyum sağlama', value: 3 }, { trait: 'barış', value: 2 }, { trait: 'uyum', value: 2 }] },
      { text: 'Yaratıcı ve ilham veren',
        weights: [{ trait: 'yaratıcılık', value: 3 }, { trait: 'güzellik', value: 2 }, { trait: 'neşe', value: 2 }] },
      { text: 'Gözlemci ve analizci',
        weights: [{ trait: 'içgörü', value: 3 }, { trait: 'gizem', value: 2 }, { trait: 'strateji', value: 2 }] },
    ],
  },
  {
    q: 'En büyük gücün nedir?',
    emoji: '△',
    options: [
      { text: 'İçgüdülerim ve sezgim',
        weights: [{ trait: 'sezgi', value: 3 }, { trait: 'içgüdü', value: 3 }] },
      { text: 'Sabrım ve dayanıklılığım',
        weights: [{ trait: 'sabır', value: 3 }, { trait: 'dayanıklılık', value: 3 }, { trait: 'azim', value: 2 }] },
      { text: 'Zekâm ve esnekliğim',
        weights: [{ trait: 'zeka', value: 3 }, { trait: 'uyum sağlama', value: 2 }, { trait: 'çeviklik', value: 2 }] },
      { text: 'Cesaret ve tutkum',
        weights: [{ trait: 'cesaret', value: 3 }, { trait: 'tutku', value: 3 }, { trait: 'güç', value: 2 }] },
    ],
  },
  {
    q: 'Hayatta neyi özgürlük hissettiriyor?',
    emoji: '☀',
    options: [
      { text: 'Bağımsız karar verebilmek',
        weights: [{ trait: 'özgürlük', value: 3 }, { trait: 'bağımsızlık', value: 3 }] },
      { text: 'Sevdiklerimle güvende olmak',
        weights: [{ trait: 'koruma', value: 3 }, { trait: 'aile', value: 3 }, { trait: 'sadakat', value: 2 }] },
      { text: 'Değişip dönüşebilmek',
        weights: [{ trait: 'dönüşüm', value: 3 }, { trait: 'yenilenme', value: 3 }, { trait: 'değişim', value: 2 }] },
      { text: 'Gerçeği bulmak, derinleşmek',
        weights: [{ trait: 'bilgelik', value: 2 }, { trait: 'bilinç', value: 3 }, { trait: 'sır', value: 2 }] },
    ],
  },
  {
    q: 'Şu an içinde hangi enerji daha güçlü?',
    emoji: '◈',
    options: [
      { text: 'Hareket ve hız enerjisi',
        weights: [{ trait: 'hız', value: 3 }, { trait: 'çeviklik', value: 2 }, { trait: 'yolculuk', value: 2 }] },
      { text: 'Sessizlik ve gözlem enerjisi',
        weights: [{ trait: 'gizem', value: 3 }, { trait: 'sezgi', value: 2 }, { trait: 'içgörü', value: 2 }] },
      { text: 'Bereket ve topluluk enerjisi',
        weights: [{ trait: 'topluluk', value: 3 }, { trait: 'bereket', value: 3 }, { trait: 'çalışkanlık', value: 2 }] },
      { text: 'Güç ve dönüşüm enerjisi',
        weights: [{ trait: 'güç', value: 3 }, { trait: 'dönüşüm', value: 3 }, { trait: 'cesaret', value: 2 }] },
    ],
  },
];

// ─── Matching algorithms ───────────────────────────────────────────────────────

function scoreAnimals(traits: Record<string, number>, elements: Record<string, number>): typeof animalsData[0] {
  let best = animalsData[0];
  let bestScore = -1;
  for (const animal of animalsData) {
    let score = (elements[animal.element] || 0);
    for (const sym of animal.symbolism) score += (traits[sym] || 0);
    if (score > bestScore) { bestScore = score; best = animal; }
  }
  return best;
}

function findAnimalByQuiz(picks: Option[], lang: 'tr' | 'en' = 'tr'): AnimalResult {
  const traits: Record<string, number> = {};
  const elements: Record<string, number> = {};
  for (const p of picks) {
    for (const { trait, value } of p.weights) traits[trait] = (traits[trait] || 0) + value;
    if (p.element) elements[p.element] = (elements[p.element] || 0) + 3;
  }
  return {
    animal: scoreAnimals(traits, elements),
    reason: lang === 'en' ? 'Energy pattern in your answers' : 'Cevaplarındaki enerji örüntüsü',
  };
}

function findAnimalByBirth(day: number, month: number, year: number, hour?: number, city?: string, lang: 'tr' | 'en' = 'tr'): AnimalResult {
  const traits: Record<string, number> = {};
  const elements: Record<string, number> = {};

  // Season → element (strong)
  const seasonEl: Record<number, string> = {
    1:'su',2:'su',3:'hava',4:'hava',5:'hava',
    6:'ateş',7:'ateş',8:'ateş',9:'toprak',10:'toprak',11:'toprak',12:'su',
  };
  elements[seasonEl[month]] = 5;

  // Year digit sum → core energy (1-9)
  let ySum = year.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  while (ySum > 9) ySum = ySum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  const yearTraits: Record<number, string[]> = {
    1: ['liderlik','cesaret','özgürlük'],
    2: ['sezgi','barış','uyum'],
    3: ['yaratıcılık','neşe','güzellik'],
    4: ['istikrar','dayanıklılık','sabır'],
    5: ['özgürlük','değişim','yolculuk'],
    6: ['şefkat','aile','sevgi'],
    7: ['bilgelik','gizem','içgörü'],
    8: ['güç','dönüşüm','cesaret'],
    9: ['bilgelik','şefkat','dönüşüm'],
  };
  for (const t of (yearTraits[ySum] || [])) traits[t] = (traits[t] || 0) + 3;

  // Day group → secondary traits
  const dg = Math.min(Math.ceil(day / 8), 4);
  const dayTraits: Record<number, string[]> = {
    1: ['liderlik','cesaret','özgüven'],
    2: ['sezgi','içgüdü','gizem'],
    3: ['dönüşüm','bilgelik','içgörü'],
    4: ['sevgi','şefkat','koruma'],
  };
  for (const t of (dayTraits[dg] || [])) traits[t] = (traits[t] || 0) + 2;

  // Hour → time-of-day energy
  const HOUR_RANGES = [
    { min: 0,  max: 5,  traits: ['gizem','bilinçdışı','sır','içgüdü'],         label: 'gece' },
    { min: 6,  max: 11, traits: ['hız','uyanış','cesaret','kararlılık'],        label: 'sabah' },
    { min: 12, max: 17, traits: ['güç','liderlik','vizyon','özgüven'],          label: 'öğlen' },
    { min: 18, max: 23, traits: ['dönüşüm','bilgelik','şefkat','sezgi'],        label: 'akşam' },
  ];
  let hourLabel = '';
  if (hour !== undefined) {
    const hr = HOUR_RANGES.find(r => hour >= r.min && hour <= r.max);
    if (hr) {
      for (const t of hr.traits) traits[t] = (traits[t] || 0) + 3;
      hourLabel = hr.label;
    }
  }

  const SEASON_NAMES: Record<string, string> = { hava:'ilkbahar', ateş:'yaz', toprak:'sonbahar', su:'kış' };
  const seasonName = SEASON_NAMES[seasonEl[month]];

  if (lang === 'en') {
    const EL_EN: Record<string, string> = { hava: 'air', ateş: 'fire', toprak: 'earth', su: 'water' };
    const SEASON_EN: Record<string, string> = { hava: 'Spring', ateş: 'Summer', toprak: 'Autumn', su: 'Winter' };
    const HOUR_EN: Record<string, string> = { gece: 'night', sabah: 'morning', öğlen: 'midday', akşam: 'evening' };
    const elEn = EL_EN[seasonEl[month]] || seasonEl[month];
    const seasonEn = SEASON_EN[seasonEl[month]] || seasonName;
    const reason = [
      `${seasonEn} birth carrying ${elEn} energy`,
      hourLabel ? `the energy of ${HOUR_EN[hourLabel] || hourLabel}` : '',
      city && city.trim() ? `the mark of ${city.trim()}` : '',
    ].filter(Boolean).join(' · ');
    return { animal: scoreAnimals(traits, elements), reason };
  }

  const reason = [
    `${seasonName.charAt(0).toUpperCase() + seasonName.slice(1)} doğumundan gelen ${seasonEl[month]} enerjisi`,
    hourLabel ? `${hourLabel} saatinin ${HOUR_RANGES.find(r => hourLabel === r.label)?.traits[0] || ''} gücü` : '',
    city && city.trim() ? `${city.trim()} toprağının izi` : '',
  ].filter(Boolean).join(' · ');

  return { animal: scoreAnimals(traits, elements), reason };
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  prefillBirthDate?: string; // YYYY-MM-DD
  embedded?: boolean;
}

export function AnimalFinderScreen({ onClose, prefillBirthDate, embedded }: Props) {
  const insets = useSafeAreaInsets();
  const { t, lang } = useI18n();
  const localAnimals = useLocalizedAnimals();
  const [mode, setMode]         = useState<Mode>('intro');
  const [qIndex, setQIndex]     = useState(0);
  const [picks, setPicks]       = useState<Option[]>([]);
  const [chosen, setChosen]     = useState<number | null>(null);
  const [result, setResult]     = useState<AnimalResult | null>(null);

  const displayAnimal: typeof animalsData[0] | null = result
    ? ((localAnimals.find((a: any) => a.id === result.animal.id) as typeof animalsData[0] | undefined) || result.animal)
    : null;

  // birth form
  const prefill = prefillBirthDate?.split('-') ?? [];
  const [bDay,   setBDay]   = useState(prefill[2] ? String(parseInt(prefill[2])) : '');
  const [bMonth, setBMonth] = useState(prefill[1] ? String(parseInt(prefill[1])) : '');
  const [bYear,  setBYear]  = useState(prefill[0] ?? '');
  const [bHour,  setBHour]  = useState('');
  const [bCity,  setBCity]  = useState('');

  const cardFade   = useRef(new Animated.Value(1)).current;
  const resultFade = useRef(new Animated.Value(0)).current;

  const birthValid = parseInt(bDay) >= 1 && parseInt(bDay) <= 31 &&
    parseInt(bMonth) >= 1 && parseInt(bMonth) <= 12 &&
    parseInt(bYear) >= 1900 && parseInt(bYear) <= new Date().getFullYear();

  // ── quiz logic ──
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
          showResult(findAnimalByQuiz(newPicks, lang));
        });
      }
    }, 350);
  };

  // ── birth logic ──
  const handleBirthSubmit = () => {
    if (!birthValid) return;
    const d = parseInt(bDay), m = parseInt(bMonth), y = parseInt(bYear);
    const h = bHour.trim() !== '' ? Math.min(Math.max(parseInt(bHour), 0), 23) : undefined;
    showResult(findAnimalByBirth(d, m, y, h, bCity, lang));
  };

  const showResult = (r: AnimalResult) => {
    setResult(r);
    setMode('result');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.timing(resultFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  };

  const getDisplayQ = (i: number) => {
    if (lang === 'en') {
      const eq = en.animalFinder.quiz.questions[i];
      return { q: eq.q, options: eq.options as readonly string[] };
    }
    return { q: QUESTIONS[i].q, options: QUESTIONS[i].options.map((o: Option) => o.text) };
  };
  const currentQDisplay = getDisplayQ(qIndex);

  const currentQ = QUESTIONS[qIndex];
  const progress = qIndex / QUESTIONS.length;

  return (
    <View style={[styles.root, { paddingTop: embedded ? 0 : insets.top }]}>
      {/* Header */}
      {(!embedded || mode !== 'intro') && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={
              embedded
                ? () => { setMode('intro'); setQIndex(0); setPicks([]); setChosen(null); }
                : (mode === 'intro' || mode === 'result' ? onClose : () => { setMode('intro'); setQIndex(0); setPicks([]); setChosen(null); })
            }
            style={styles.closeBtn} activeOpacity={0.7}
          >
            <Text style={styles.closeTxt}>{embedded ? '←' : (mode === 'intro' || mode === 'result' ? '✕' : '←')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('animalFinder.headerTitle')}</Text>
          <View style={{ width: 32 }} />
        </View>
      )}

      {/* ── Intro ── */}
      {mode === 'intro' && (
        <View style={styles.introWrap}>
          <Text style={styles.introEmoji}>✦</Text>
          <Text style={styles.introTitle}>{t('animalFinder.intro.title')}</Text>
          <Text style={styles.introDesc}>
            {t('animalFinder.intro.desc')}
          </Text>
          <Text style={styles.introNote}>
            {t('animalFinder.intro.note')}
          </Text>

          <TouchableOpacity style={[styles.modeBtn, { borderColor: Colors.teal }]} onPress={() => setMode('quiz')} activeOpacity={0.8}>
            <Text style={styles.modeBtnEmoji}>✦</Text>
            <View style={styles.modeBtnText}>
              <Text style={[styles.modeBtnTitle, { color: Colors.tealLight }]}>{t('animalFinder.intro.quizBtn.title')}</Text>
              <Text style={styles.modeBtnDesc}>{t('animalFinder.intro.quizBtn.desc')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeBtn, { borderColor: Colors.gold }]} onPress={() => setMode('birth')} activeOpacity={0.8}>
            <Text style={styles.modeBtnEmoji}>☀</Text>
            <View style={styles.modeBtnText}>
              <Text style={[styles.modeBtnTitle, { color: Colors.gold }]}>{t('animalFinder.intro.birthBtn.title')}</Text>
              <Text style={styles.modeBtnDesc}>{t('animalFinder.intro.birthBtn.desc')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Quiz ── */}
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
            <Text style={styles.qText}>{currentQDisplay.q}</Text>
            <View style={styles.optionsWrap}>
              {QUESTIONS[qIndex].options.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.optBtn, chosen === i && styles.optBtnChosen, chosen !== null && chosen !== i && styles.optBtnDimmed]}
                  onPress={() => handlePick(i, opt)}
                  activeOpacity={0.75}
                  disabled={chosen !== null}
                >
                  <Text style={[styles.optTxt, chosen === i && { color: Colors.tealLight }]}>{currentQDisplay.options[i]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </>
      )}

      {/* ── Birth form ── */}
      {mode === 'birth' && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.birthWrap} keyboardShouldPersistTaps="handled">
          <Text style={styles.birthTitle}>{t('animalFinder.birth.title')}</Text>
          <Text style={styles.birthDesc}>
            {t('animalFinder.birth.desc')}
          </Text>

          <Text style={styles.birthLabel}>{t('animalFinder.birth.dateLabel')}</Text>
          <View style={styles.dateRow}>
            <TextInput style={[styles.dateInput, { flex: 1 }]} value={bDay} onChangeText={setBDay}
              placeholder={t('animalFinder.birth.dayPlaceholder')} placeholderTextColor={Colors.textMuted} keyboardType="number-pad" maxLength={2} />
            <TextInput style={[styles.dateInput, { flex: 1 }]} value={bMonth} onChangeText={setBMonth}
              placeholder={t('animalFinder.birth.monthPlaceholder')} placeholderTextColor={Colors.textMuted} keyboardType="number-pad" maxLength={2} />
            <TextInput style={[styles.dateInput, { flex: 2 }]} value={bYear} onChangeText={setBYear}
              placeholder={t('animalFinder.birth.yearPlaceholder')} placeholderTextColor={Colors.textMuted} keyboardType="number-pad" maxLength={4} />
          </View>

          <Text style={styles.birthLabel}>{t('animalFinder.birth.cityLabel')} <Text style={styles.birthLabelOpt}>{t('animalFinder.birth.cityOptional')}</Text></Text>
          <TextInput
            style={[styles.dateInput, { textAlign: 'left' }]}
            value={bCity}
            onChangeText={setBCity}
            placeholder={t('animalFinder.birth.cityPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
          />
          <Text style={styles.birthHint}>
            {t('animalFinder.birth.cityHint')}
          </Text>

          <Text style={[styles.birthLabel, { marginTop: Spacing.md }]}>{t('animalFinder.birth.hourLabel')} <Text style={styles.birthLabelOpt}>{t('animalFinder.birth.hourOptional')}</Text></Text>
          <TextInput
            style={styles.dateInput}
            value={bHour}
            onChangeText={setBHour}
            placeholder={t('animalFinder.birth.hourPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.birthHint}>
            {t('animalFinder.birth.hourHint')}
          </Text>

          <TouchableOpacity
            style={[styles.submitBtn, !birthValid && { opacity: 0.4 }]}
            onPress={handleBirthSubmit}
            disabled={!birthValid}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnTxt}>{t('animalFinder.birth.submitBtn')}</Text>
          </TouchableOpacity>
        </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* ── Result ── */}
      {mode === 'result' && result && (
        <Animated.ScrollView
          style={{ flex: 1, opacity: resultFade }}
          contentContainerStyle={styles.resultScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultLabel}>{t('animalFinder.result.label')}</Text>
          {result.reason ? (
            <Text style={styles.resultReason}>{result.reason}</Text>
          ) : null}

          <View style={styles.resultCard}>
            <View style={[styles.medallion, { borderColor: Colors.teal + '50' }]}>
              <View style={[styles.medallionInner, { borderColor: Colors.teal + '30' }]}>
                <Text style={styles.resultEmoji}>{displayAnimal!.emoji}</Text>
              </View>
            </View>
            <Text style={styles.resultName}>{displayAnimal!.name}</Text>
            <Text style={styles.resultMeta}>{displayAnimal!.element} · {displayAnimal!.symbolism[0]}</Text>
            <View style={[styles.divider, { backgroundColor: Colors.teal }]} />
            <Text style={styles.resultMsg}>{displayAnimal!.dailyMessage}</Text>
            <View style={[styles.guidanceBox, { borderColor: Colors.teal + '35' }]}>
              <Text style={[styles.guidanceTxt, { color: Colors.tealLight }]}>{displayAnimal!.guidance}</Text>
            </View>
            <View style={styles.tagsRow}>
              {displayAnimal!.symbolism.map((s: string, i: number) => (
                <View key={i} style={[styles.tag, { borderColor: Colors.teal + '40' }]}>
                  <Text style={[styles.tagTxt, { color: Colors.teal }]}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.anatolianTxt}>{displayAnimal!.anatolianMeaning}</Text>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={embedded ? () => { setMode('intro'); setResult(null); setQIndex(0); setPicks([]); setChosen(null); } : onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnTxt}>{embedded ? t('animalFinder.result.rediscoverBtn') : t('animalFinder.result.closeBtn')}</Text>
          </TouchableOpacity>
        </Animated.ScrollView>
      )}
    </View>
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
  introEmoji: { fontSize: 56, marginBottom: Spacing.sm },
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

  // Birth form
  birthWrap: {
    padding: Spacing.lg, gap: Spacing.md, paddingBottom: TAB_BAR_HEIGHT + Spacing.lg,
  },
  birthTitle: {
    fontSize: Typography.size.xl, fontWeight: Typography.weight.semibold,
    color: Colors.gold, marginBottom: Spacing.xs,
  },
  birthDesc: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
    lineHeight: Typography.size.sm * 1.7, marginBottom: Spacing.sm,
  },
  birthLabel: {
    fontSize: Typography.size.xs, color: Colors.textSecondary,
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4,
  },
  birthLabelOpt: { color: Colors.textMuted, textTransform: 'none' },
  dateRow: { flexDirection: 'row', gap: Spacing.sm },
  dateInput: {
    borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: BorderRadius.md,
    padding: Spacing.md, fontSize: Typography.size.lg, color: Colors.textPrimary,
    backgroundColor: Colors.backgroundCard, textAlign: 'center',
  },
  birthHint: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    fontStyle: 'italic', marginTop: Spacing.xs,
  },
  submitBtn: {
    marginTop: Spacing.lg, backgroundColor: Colors.gold,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.round, alignItems: 'center',
  },
  submitBtnTxt: {
    fontSize: Typography.size.md, fontWeight: Typography.weight.bold,
    color: '#1A1208', letterSpacing: 1,
  },

  // Result
  resultScroll: {
    padding: Spacing.lg, alignItems: 'center', gap: Spacing.md, paddingBottom: TAB_BAR_HEIGHT + Spacing.lg,
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
    borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.teal + '50',
    padding: Spacing.lg, alignItems: 'center', gap: Spacing.sm,
  },
  medallion: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  medallionInner: {
    width: 76, height: 76, borderRadius: 38, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(46,158,138,0.06)',
  },
  resultEmoji: { fontSize: 38 },
  resultName: {
    fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold,
    color: Colors.textPrimary, letterSpacing: 1,
  },
  resultMeta: {
    fontSize: Typography.size.xs, color: Colors.teal,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  divider: { width: 28, height: 1, opacity: 0.5, marginVertical: Spacing.xs },
  resultMsg: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: Typography.size.sm * 1.9, fontWeight: Typography.weight.light,
  },
  guidanceBox: {
    borderWidth: 1, borderRadius: BorderRadius.sm,
    padding: Spacing.sm, width: '100%', marginTop: Spacing.xs,
  },
  guidanceTxt: {
    fontSize: Typography.size.xs, textAlign: 'center',
    fontStyle: 'italic', lineHeight: Typography.size.xs * 1.8, fontWeight: Typography.weight.light,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, justifyContent: 'center', marginTop: Spacing.xs },
  tag: { borderWidth: 1, borderRadius: BorderRadius.round, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  tagTxt: { fontSize: 10, letterSpacing: 0.5 },

  anatolianTxt: {
    fontSize: Typography.size.xs, color: Colors.textMuted, textAlign: 'center',
    fontStyle: 'italic', lineHeight: Typography.size.xs * 1.8, paddingHorizontal: Spacing.md,
  },
  doneBtn: {
    backgroundColor: Colors.teal, paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.round, marginTop: Spacing.sm,
  },
  doneBtnTxt: {
    fontSize: Typography.size.md, fontWeight: Typography.weight.bold,
    color: '#0D1E1B', letterSpacing: 1,
  },
});
