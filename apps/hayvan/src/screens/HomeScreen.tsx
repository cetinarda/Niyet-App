import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import quotesData from '../data/quotes.json';
import animalsData from '../data/animals.json';
import philosophersData from '../data/philosophers.json';
import { useTuraStore } from '../store/useStore';
import { AnimalDetailScreen } from './AnimalDetailScreen';
import { useI18n } from '../i18n/useI18n';
import { useLocalizedAnimals, useLocalizedQuotes, useLocalizedPhilosophers } from '../i18n/localize';
import { DisclaimerModal } from '../components/DisclaimerModal';

interface HomeScreenProps {
  onNavigateToProfile?: () => void;
}

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.min(Math.round(SCREEN_W * 0.65), 270);
const CARD_H = Math.round(CARD_W * 1.75);
const STACK = 7;


// ─── Kilim band ────────────────────────────────────────────────────────────────
function KilimBand({ color }: { color: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 3 }}>
      {['◆', '▲', '◆', '▼', '◆', '▲', '◆', '▼', '◆'].map((s, i) => (
        <Text key={i} style={{ color, fontSize: 5.5, opacity: 0.5 }}>{s}</Text>
      ))}
    </View>
  );
}

// ─── Graceful image with emoji/symbol fallback ────────────────────────────────
function FallbackImage({
  uri,
  fallback,
  imgStyle,
}: {
  uri?: string;
  fallback: string;
  imgStyle: object;
}) {
  const [err, setErr] = useState(false);
  if (!uri || err) {
    return <Text style={cs.bigEmoji}>{fallback}</Text>;
  }
  return (
    <Image
      source={{ uri }}
      style={[cs.roundImg, imgStyle]}
      onError={() => setErr(true)}
    />
  );
}

function PortraitImage({ uri, color }: { uri?: string; color: string }) {
  const [err, setErr] = useState(false);
  if (!uri || err) {
    return <Text style={[cs.portraitSymbol, { color }]}>✦</Text>;
  }
  return (
    <Image
      source={{ uri }}
      style={[cs.portrait, { borderColor: color + '40' }]}
      onError={() => setErr(true)}
    />
  );
}

// ─── Card content components ───────────────────────────────────────────────────
function QuoteContent({ quote }: { quote: typeof quotesData[0] }) {
  const philosopher = (philosophersData as Record<string, { imageUrl?: string }>)[quote.source];
  return (
    <View style={cs.container}>
      <PortraitImage uri={philosopher?.imageUrl} color={Colors.gold} />
      <Text style={cs.quoteText}>{quote.text}</Text>
      <View style={cs.divider} />
      <Text style={[cs.source, { color: Colors.gold }]}>{quote.source}</Text>
    </View>
  );
}


function AnimalContent({ animal, onOpenDetail, detailBtnLabel }: { animal: typeof animalsData[0]; onOpenDetail: () => void; detailBtnLabel: string }) {
  return (
    <View style={cs.container}>
      <View style={[cs.medallion, { borderColor: Colors.teal + '50' }]}>
        <View style={[cs.inner, { borderColor: Colors.teal + '30' }]}>
          <FallbackImage
            uri={(animal as any).imageUrl}
            fallback={animal.emoji}
            imgStyle={cs.roundImg}
          />
        </View>
      </View>
      <TouchableOpacity onPress={onOpenDetail} activeOpacity={0.7}>
        <Text style={[cs.itemName, { color: Colors.tealLight }]}>
          {animal.name}  <Text style={cs.openHint}>→</Text>
        </Text>
      </TouchableOpacity>
      <Text style={cs.meta}>{animal.element} · {animal.symbolism[0]}</Text>
      <View style={[cs.divider, { backgroundColor: Colors.teal }]} />
      <Text style={cs.body}>{animal.dailyMessage}</Text>
      <View style={[cs.affirmBox, { borderColor: Colors.teal + '35' }]}>
        <Text style={[cs.affirmText, { color: Colors.tealLight }]}>{animal.guidance}</Text>
      </View>
      <TouchableOpacity onPress={onOpenDetail} style={cs.detailBtn} activeOpacity={0.8}>
        <Text style={[cs.detailBtnText, { color: Colors.tealLight }]}>
          {animal.name}{detailBtnLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Mini deck indicator ────────────────────────────────────────────────────────
type DeckItem = { title: string; short: string; subtitle: string; color: string; motif: string };
function MiniDeck({ deck, state }: { deck: DeckItem; state: 'done' | 'active' | 'pending' }) {
  const color = state === 'pending' ? Colors.textMuted : deck.color;
  return (
    <View style={[ms.wrapper, state === 'active' && { opacity: 1 }, state === 'pending' && { opacity: 0.35 }]}>
      <View style={[ms.card, ms.shadow2, { borderColor: color + '20' }]} />
      <View style={[ms.card, ms.shadow1, { borderColor: color + '40' }]} />
      <View style={[ms.card, ms.front, {
        borderColor: color,
        backgroundColor: state === 'active' ? color + '15' : Colors.backgroundCard,
      }]}>
        <Text style={{ fontSize: 10, color, fontWeight: '700' }}>
          {state === 'done' ? '✓' : deck.motif}
        </Text>
      </View>
      <Text style={[ms.label, { color }]}>{deck.short}</Text>
    </View>
  );
}

// ─── Home screen ───────────────────────────────────────────────────────────────
export function HomeScreen({ onNavigateToProfile }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { profile, dailyReading, generateDailyReading, updateStats } = useTuraStore();
  const animals = useLocalizedAnimals();
  const quotes = useLocalizedQuotes();
  const philosophers = useLocalizedPhilosophers();

  const DECKS = [
    { title: t('home.decks.animal.title'), short: t('home.decks.animal.short'), subtitle: t('home.decks.animal.subtitle'), color: Colors.teal, motif: '⊕' },
    { title: t('home.decks.quote.title'),  short: t('home.decks.quote.short'),  subtitle: t('home.decks.quote.subtitle'),  color: Colors.gold, motif: '✦' },
  ];

  const [reading, setReading] = useState(dailyReading);
  const [step, setStep]       = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone]       = useState(false);
  const [showAnimalDetail, setShowAnimalDetail] = useState(false);

  const backFade  = useRef(new Animated.Value(1)).current;
  const frontFade = useRef(new Animated.Value(0)).current;
  const revealedRef = useRef(false);

  useEffect(() => {
    if (!reading) {
      const qIds = quotesData.map(q => q.id);
      const aIds = animalsData.map(a => a.id);
      generateDailyReading(qIds, aIds, aIds, aIds).then(r => {
        const q = quotesData.find(x => x.id === r.quoteId);
        if (q) updateStats(q.id, q.source, r.animalId, r.animalId, r.nagualId);
        setReading(r);
      });
    }
  }, []);

  // Shake detection
  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    let lx = 0, ly = 0, lz = 0, cool = false;
    const setup = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Accelerometer } = require('expo-sensors');
        Accelerometer.setUpdateInterval(100);
        sub = Accelerometer.addListener(({ x, y, z }: { x: number; y: number; z: number }) => {
          const d = Math.abs(x - lx) + Math.abs(y - ly) + Math.abs(z - lz);
          lx = x; ly = y; lz = z;
          if (d > 2.4 && !revealedRef.current && !cool) {
            cool = true;
            setTimeout(() => { cool = false; }, 800);
            triggerReveal();
          }
        });
      } catch { /* web fallback */ }
    };
    setup();
    return () => { sub?.remove(); };
  }, []);

  const quote  = reading ? quotes.find(q => q.id === reading.quoteId)  : null;
  const animal = reading ? animals.find(a => a.id === reading.animalId) : null;

  const deck = DECKS[step];

  const triggerReveal = () => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.parallel([
      Animated.timing(backFade,  { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.timing(frontFade, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < DECKS.length - 1) {
      Animated.timing(frontFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setStep(s => s + 1);
        setRevealed(false);
        revealedRef.current = false;
        backFade.setValue(1);
        frontFade.setValue(0);
      });
    } else {
      setDone(true);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 6)  return t('home.greeting.night');
    if (h < 12) return t('home.greeting.morning');
    if (h < 18) return t('home.greeting.afternoon');
    return t('home.greeting.evening');
  };

  if (showAnimalDetail && animal) {
    return <AnimalDetailScreen animal={animal as any} onClose={() => setShowAnimalDetail(false)} />;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <DisclaimerModal />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.username}>{profile?.name || t('home.defaultUser')}</Text>
        </View>
        <TouchableOpacity onPress={onNavigateToProfile} style={styles.profileBtn}>
          <Text style={styles.profileInitial}>
            {profile?.name?.charAt(0).toUpperCase() || '☀'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main area */}
      <View style={styles.main}>

        {done ? (
          /* ── Done screen ── */
          <View style={styles.doneWrap}>
            <Text style={{ fontSize: 40, color: Colors.gold }}>☀</Text>
            <Text style={styles.doneTitle}>{t('home.doneTitle')}</Text>
            <Text style={styles.doneSub}>{t('home.doneSub')}</Text>
            {quote && (
              <>
                <View style={styles.doneLine} />
                <Text style={styles.doneQuote}>
                  {quote.text.length > 90 ? quote.text.slice(0, 87) + '…' : quote.text}
                </Text>
              </>
            )}
          </View>

        ) : (
          <>
            {/* ── Deck stack + card ── */}
            <View style={styles.deckOuter}>
              {/* Shadow cards (deck effect) */}
              <View style={[styles.shadowCard, {
                borderColor: deck.color + '18',
                top: 0, left: STACK * 2,
              }]} />
              <View style={[styles.shadowCard, {
                borderColor: deck.color + '35',
                top: STACK * 0.6, left: STACK,
              }]} />

              {/* Main card */}
              <View style={[styles.card, { top: STACK, left: 0, borderColor: deck.color + '55' }]}>
                {/* Back side */}
                <Animated.View
                  style={[StyleSheet.absoluteFill, { opacity: backFade }]}
                  pointerEvents={revealed ? 'none' : 'auto'}
                >
                  <TouchableOpacity
                    style={styles.backInner}
                    onPress={triggerReveal}
                    activeOpacity={0.85}
                  >
                    <View style={styles.bandRow}>
                      <View style={[styles.bandLine, { backgroundColor: deck.color }]} />
                      <KilimBand color={deck.color} />
                      <View style={[styles.bandLine, { backgroundColor: deck.color }]} />
                    </View>

                    <View style={styles.backCenter}>
                      <Text style={[styles.cStar, { top: 0, left: 0, color: deck.color }]}>✦</Text>
                      <Text style={[styles.cStar, { top: 0, right: 0, color: deck.color }]}>✦</Text>
                      <Text style={[styles.cStar, { bottom: 0, left: 0, color: deck.color }]}>✦</Text>
                      <Text style={[styles.cStar, { bottom: 0, right: 0, color: deck.color }]}>✦</Text>
                      <View style={[styles.hLine, { top: '30%', backgroundColor: deck.color }]} />
                      <View style={[styles.hLine, { bottom: '30%', backgroundColor: deck.color }]} />

                      <Text style={{ fontSize: 38, color: deck.color, lineHeight: 44 }}>☀</Text>
                      <Text style={[styles.backTitle, { color: deck.color }]}>{deck.title}</Text>
                      <Text style={styles.backSub}>{deck.subtitle}</Text>

                      <View style={styles.tapRow}>
                        <View style={[styles.tapLine, { backgroundColor: deck.color }]} />
                        <Text style={[styles.tapHint, { color: deck.color }]}>{t('home.tapHint')}</Text>
                        <View style={[styles.tapLine, { backgroundColor: deck.color }]} />
                      </View>
                    </View>

                    <View style={styles.bandRow}>
                      <View style={[styles.bandLine, { backgroundColor: deck.color }]} />
                      <KilimBand color={deck.color} />
                      <View style={[styles.bandLine, { backgroundColor: deck.color }]} />
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                {/* Front side */}
                <Animated.View
                  style={[StyleSheet.absoluteFill, { opacity: frontFade }]}
                  pointerEvents={revealed ? 'auto' : 'none'}
                >
                  <View style={[styles.frontHeader, { borderBottomColor: deck.color + '30' }]}>
                    <Text style={{ fontSize: 10, color: deck.color }}>☀</Text>
                    <Text style={[styles.frontTitle, { color: deck.color }]}>{deck.title}</Text>
                  </View>
                  <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollPad}
                    showsVerticalScrollIndicator={false}
                  >
                    {step === 0 && animal && <AnimalContent animal={animal} onOpenDetail={() => setShowAnimalDetail(true)} detailBtnLabel={t('home.detailBtn')} />}
                    {step === 1 && quote  && <QuoteContent quote={quote} />}
                  </ScrollView>
                  <TouchableOpacity
                    style={[styles.nextBtn, { borderColor: deck.color }]}
                    onPress={handleNext}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.nextBtnText, { color: deck.color }]}>
                      {step < DECKS.length - 1 ? t('home.nextDeck') : t('home.completed')}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>

            {/* ── Mini deck progress ── */}
            <View style={styles.deckRow}>
              {DECKS.map((d, i) => (
                <MiniDeck
                  key={i}
                  deck={d}
                  state={i < step ? 'done' : i === step ? 'active' : 'pending'}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  greeting: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  username: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  profileBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  profileInitial: {
    fontSize: Typography.size.sm,
    color: Colors.gold,
    fontWeight: Typography.weight.semibold,
  },

  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.xl,
    gap: Spacing.xl,
  },

  deckOuter: {
    width: CARD_W + STACK * 2,
    height: CARD_H + STACK,
    position: 'relative',
  },
  shadowCard: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  card: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },

  backInner: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'space-between',
  },
  bandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  bandLine: { flex: 1, height: 1, opacity: 0.25 },
  backCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    position: 'relative',
  },
  cStar: { position: 'absolute', fontSize: 8, opacity: 0.4 },
  hLine: { position: 'absolute', left: 0, right: 0, height: 1, opacity: 0.1 },
  backTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 2,
  },
  backSub: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  tapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.md,
    opacity: 0.6,
  },
  tapLine: { flex: 1, height: 1, opacity: 0.5 },
  tapHint: { fontSize: 8, letterSpacing: 2, textTransform: 'uppercase' },

  frontHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
  },
  frontTitle: {
    fontSize: 9,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  scroll: { flex: 1 },
  scrollPad: { padding: Spacing.md },
  nextBtn: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 10,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  deckRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    alignItems: 'flex-end',
  },

  doneWrap: {
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  doneTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Typography.size.lg * 1.5,
    marginTop: Spacing.sm,
  },
  doneSub: { fontSize: Typography.size.xs, color: Colors.textMuted, letterSpacing: 0.8 },
  doneLine: {
    width: 28, height: 1,
    backgroundColor: Colors.gold,
    opacity: 0.3,
    marginVertical: Spacing.sm,
  },
  doneQuote: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: Typography.size.xs * 1.9,
    fontWeight: Typography.weight.light,
    maxWidth: 260,
  },
});

// Mini deck styles
const ms = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 4 },
  card: {
    position: 'absolute',
    width: 36, height: 54,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow2: { top: 0, left: 4 },
  shadow1: { top: 2, left: 2 },
  front:   { top: 4, left: 0 },
  label: {
    fontSize: 9,
    letterSpacing: 0.8,
    marginTop: 58,
    textTransform: 'uppercase',
    fontWeight: Typography.weight.medium,
  },
});

// Content styles
const cs = StyleSheet.create({
  container: { alignItems: 'center' },
  portrait: {
    width: 52, height: 52,
    borderRadius: 26,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  portraitSymbol: {
    fontSize: 22,
    marginBottom: Spacing.sm,
    opacity: 0.7,
  },
  quoteText: {
    fontSize: Typography.size.xs,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Typography.size.xs * 2,
    fontStyle: 'italic',
    fontWeight: Typography.weight.light,
  },
  divider: {
    width: 18, height: 1,
    backgroundColor: Colors.gold,
    opacity: 0.4,
    marginVertical: Spacing.sm,
  },
  source: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: Typography.weight.medium,
    textAlign: 'center',
  },
  medallion: {
    width: 74, height: 74, borderRadius: 37,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  inner: {
    width: 54, height: 54, borderRadius: 27,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    overflow: 'hidden',
  },
  roundImg: {
    width: 54, height: 54,
    borderRadius: 27,
  },
  bigEmoji: { fontSize: 26 },
  itemName: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  meta: {
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  plantTag: {
    fontSize: 9,
    color: Colors.tealLight,
    letterSpacing: 0.8,
    marginTop: 2,
    opacity: 0.8,
  },
  body: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.size.xs * 1.9,
    fontWeight: Typography.weight.light,
    marginBottom: Spacing.sm,
  },
  affirmBox: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    width: '100%',
  },
  affirmText: {
    fontSize: Typography.size.xs,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: Typography.size.xs * 1.7,
    fontWeight: Typography.weight.light,
  },
  openHint: {
    fontSize: 10,
    color: Colors.tealLight,
    opacity: 0.6,
  },
  detailBtn: {
    marginTop: Spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.teal + '40',
    borderRadius: BorderRadius.round,
  },
  detailBtnText: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: Typography.weight.semibold,
  },
});
