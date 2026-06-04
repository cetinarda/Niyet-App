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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { useData } from '../data/loader';
import { useMitlerStore } from '../store/useStore';
import { useLanguage } from '../i18n/useLanguage';

interface HomeScreenProps {
  onNavigateToProfile?: () => void;
}

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.min(Math.round(SCREEN_W * 0.62), 260);
const CARD_H = Math.round(CARD_W * 1.7);
const STACK = 7;

const DECK_CONFIG = [
  { tKey: 'home.deck.archetype' as const, subKey: 'home.deck.archetypeSub' as const, color: Colors.gold,   motif: '◈' },
  { tKey: 'home.deck.myth'      as const, subKey: 'home.deck.mythSub'      as const, color: Colors.purple, motif: '◈' },
  { tKey: 'home.deck.image'     as const, subKey: 'home.deck.imageSub'     as const, color: Colors.teal,   motif: '◈' },
];

function KilimBand({ color }: { color: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 3 }}>
      {['◆', '▲', '◆', '▼', '◆', '▲', '◆', '▼', '◆'].map((s, i) => (
        <Text key={i} style={{ color, fontSize: 5.5, opacity: 0.5 }}>{s}</Text>
      ))}
    </View>
  );
}

function ArchetypeContent({ item }: { item: typeof archetypesData[0] }) {
  return (
    <View style={cs.container}>
      <View style={[cs.medallion, { borderColor: Colors.gold + '50' }]}>
        <View style={[cs.inner, { borderColor: Colors.gold + '30' }]}>
          <Text style={cs.bigEmoji}>{item.emoji}</Text>
        </View>
      </View>
      <Text style={[cs.itemName, { color: Colors.goldLight }]}>{item.name}</Text>
      <Text style={cs.meta}>{item.tradition} · {item.category}</Text>
      <View style={[cs.divider, { backgroundColor: Colors.gold }]} />

      <SectionLabel label="Öz" color={Colors.gold} />
      <Text style={cs.body}>{item.essence}</Text>

      <SectionLabel label="Aydınlık Yan" color={Colors.gold} />
      <Text style={cs.body}>{item.lightAspect}</Text>

      <SectionLabel label="Gölge Yan" color={Colors.gold} />
      <Text style={cs.body}>{item.shadowAspect}</Text>

      <SectionLabel label="🌙 Rüyada Görülürse" color={Colors.purpleLight} />
      <View style={[cs.dreamBox, { borderColor: Colors.purple + '40' }]}>
        <Text style={cs.body}>{item.dreamMeaning}</Text>
      </View>

      <SectionLabel label="☀ Gerçek Hayatta" color={Colors.tealLight} />
      <View style={[cs.realBox, { borderColor: Colors.teal + '40' }]}>
        <Text style={cs.body}>{item.wakingMeaning}</Text>
      </View>

      <SectionLabel label="Bugünkü Pratik" color={Colors.gold} />
      <Text style={cs.body}>{item.advice}</Text>

      <View style={[cs.affirmBox, { borderColor: Colors.gold + '35' }]}>
        <Text style={[cs.affirmText, { color: Colors.goldLight }]}>{item.affirmation}</Text>
      </View>
    </View>
  );
}

function MythContent({ item }: { item: typeof mythsData[0] }) {
  return (
    <View style={cs.container}>
      <View style={[cs.medallion, { borderColor: Colors.purple + '50' }]}>
        <View style={[cs.inner, { borderColor: Colors.purple + '30' }]}>
          <Text style={cs.bigEmoji}>{item.emoji}</Text>
        </View>
      </View>
      <Text style={[cs.itemName, { color: Colors.purpleLight }]}>{item.name}</Text>
      <Text style={cs.meta}>{item.culture} · {item.era}</Text>
      <View style={[cs.divider, { backgroundColor: Colors.purple }]} />

      <SectionLabel label="Hikaye" color={Colors.purpleLight} />
      <Text style={cs.body}>{item.summary}</Text>

      <SectionLabel label="Derin Anlamı" color={Colors.purpleLight} />
      <Text style={cs.body}>{item.depthMeaning}</Text>

      <SectionLabel label="Jung'un Okuması" color={Colors.purpleLight} />
      <Text style={cs.body}>{item.jungian}</Text>

      <SectionLabel label="🌙 Rüyada Görülürse" color={Colors.purpleLight} />
      <View style={[cs.dreamBox, { borderColor: Colors.purple + '40' }]}>
        <Text style={cs.body}>{item.dreamMeaning}</Text>
      </View>

      <SectionLabel label="☀ Gerçek Hayatta Yaşanırsa" color={Colors.tealLight} />
      <View style={[cs.realBox, { borderColor: Colors.teal + '40' }]}>
        <Text style={cs.body}>{item.wakingMeaning}</Text>
      </View>

      <View style={[cs.affirmBox, { borderColor: Colors.purple + '35' }]}>
        <Text style={[cs.affirmText, { color: Colors.purpleLight }]}>Ders: {item.lesson}</Text>
      </View>
    </View>
  );
}

function ImageContent({ item }: { item: typeof imagesData[0] }) {
  return (
    <View style={cs.container}>
      <View style={[cs.medallion, { borderColor: Colors.teal + '50' }]}>
        <View style={[cs.inner, { borderColor: Colors.teal + '30' }]}>
          <Text style={cs.bigEmoji}>{item.emoji}</Text>
        </View>
      </View>
      <Text style={[cs.itemName, { color: Colors.tealLight }]}>{item.name}</Text>
      <Text style={cs.meta}>{item.tradition} · {item.category}</Text>
      <View style={[cs.divider, { backgroundColor: Colors.teal }]} />

      <SectionLabel label="Öz" color={Colors.tealLight} />
      <Text style={cs.body}>{item.essence}</Text>

      <SectionLabel label="Sembolizm" color={Colors.tealLight} />
      <Text style={cs.body}>{item.symbolism}</Text>

      <SectionLabel label="🌙 Rüyada Görülürse" color={Colors.purpleLight} />
      <View style={[cs.dreamBox, { borderColor: Colors.purple + '40' }]}>
        <Text style={cs.body}>{item.dreamMeaning}</Text>
      </View>

      <SectionLabel label="☀ Gerçek Hayatta" color={Colors.tealLight} />
      <View style={[cs.realBox, { borderColor: Colors.teal + '40' }]}>
        <Text style={cs.body}>{item.wakingMeaning}</Text>
      </View>

      <SectionLabel label="Bugünkü Pratik" color={Colors.tealLight} />
      <Text style={cs.body}>{item.advice}</Text>
    </View>
  );
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <View style={cs.sectionLabelRow}>
      <View style={[cs.sectionDot, { backgroundColor: color }]} />
      <Text style={[cs.sectionLabel, { color }]}>{label}</Text>
    </View>
  );
}

function MiniDeck({ deck, label, state }: { deck: typeof DECK_CONFIG[0]; label: string; state: 'done' | 'active' | 'pending' }) {
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
      <Text style={[ms.label, { color }]}>{label}</Text>
    </View>
  );
}

export function HomeScreen({ onNavigateToProfile }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { profile, dailyReading, generateDailyReading, updateStats } = useMitlerStore();
  const { t } = useLanguage();
  const { archetypes: archetypesData, myths: mythsData, images: imagesData } = useData();

  const [reading, setReading] = useState(dailyReading);
  const [step, setStep]       = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone]       = useState(false);

  const backFade  = useRef(new Animated.Value(1)).current;
  const frontFade = useRef(new Animated.Value(0)).current;
  const revealedRef = useRef(false);

  useEffect(() => {
    if (!reading) {
      const aIds = archetypesData.map(a => a.id);
      const mIds = mythsData.map(m => m.id);
      const iIds = imagesData.map(i => i.id);
      generateDailyReading(aIds, mIds, iIds).then(r => {
        const myth = mythsData.find(m => m.id === r.mythId)!;
        updateStats(r.archetypeId, r.mythId, r.imageId, myth.culture);
        setReading(r);
      });
    }
  }, []);

  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    let lx = 0, ly = 0, lz = 0, cool = false;
    const setup = async () => {
      try {
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

  const archetype = reading ? archetypesData.find(a => a.id === reading.archetypeId) : null;
  const myth      = reading ? mythsData.find(m => m.id === reading.mythId)         : null;
  const image     = reading ? imagesData.find(i => i.id === reading.imageId)       : null;

  const deck = DECK_CONFIG[step];
  const deckTitle = t(deck.tKey);
  const deckSub = t(deck.subKey);

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
    if (step < DECK_CONFIG.length - 1) {
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
    if (h < 6)  return t('greeting.night');
    if (h < 12) return t('greeting.morning');
    if (h < 18) return t('greeting.day');
    return t('greeting.evening');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.username}>{profile?.name || t('greeting.guest')}</Text>
        </View>
        <TouchableOpacity onPress={onNavigateToProfile} style={styles.profileBtn}>
          <Text style={styles.profileInitial}>
            {profile?.name?.charAt(0).toUpperCase() || '☥'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        {done ? (
          <View style={styles.doneWrap}>
            <Text style={{ fontSize: 40, color: Colors.gold }}>☥</Text>
            <Text style={styles.doneTitle}>{t('home.done.title')}</Text>
            <Text style={styles.doneSub}>{t('home.done.sub')}</Text>
            {archetype && (
              <>
                <View style={styles.doneLine} />
                <Text style={styles.doneQuote}>
                  "{archetype.affirmation}"
                </Text>
              </>
            )}
          </View>
        ) : (
          <>
            <View style={styles.deckOuter}>
              <View style={[styles.shadowCard, {
                borderColor: deck.color + '18',
                top: 0, left: STACK * 2,
              }]} />
              <View style={[styles.shadowCard, {
                borderColor: deck.color + '35',
                top: STACK * 0.6, left: STACK,
              }]} />

              <View style={[styles.card, { top: STACK, left: 0, borderColor: deck.color + '55' }]}>
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

                      <Text style={{ fontSize: 38, color: deck.color, lineHeight: 44 }}>☥</Text>
                      <Text style={[styles.backTitle, { color: deck.color }]}>{deckTitle}</Text>
                      <Text style={styles.backSub}>{deckSub}</Text>

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

                <Animated.View
                  style={[StyleSheet.absoluteFill, { opacity: frontFade }]}
                  pointerEvents={revealed ? 'auto' : 'none'}
                >
                  <View style={[styles.frontHeader, { borderBottomColor: deck.color + '30' }]}>
                    <Text style={{ fontSize: 10, color: deck.color }}>☥</Text>
                    <Text style={[styles.frontTitle, { color: deck.color }]}>{deckTitle}</Text>
                  </View>
                  <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollPad}
                    showsVerticalScrollIndicator={false}
                  >
                    {step === 0 && archetype && <ArchetypeContent item={archetype} />}
                    {step === 1 && myth       && <MythContent      item={myth}      />}
                    {step === 2 && image      && <ImageContent     item={image}     />}
                  </ScrollView>
                  <TouchableOpacity
                    style={[styles.nextBtn, { borderColor: deck.color }]}
                    onPress={handleNext}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.nextBtnText, { color: deck.color }]}>
                      {step < DECK_CONFIG.length - 1 ? t('common.next') : t('common.done')}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>

            <View style={styles.deckRow}>
              {DECK_CONFIG.map((d, i) => (
                <MiniDeck
                  key={i}
                  deck={d}
                  label={t(d.tKey)}
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
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
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
  doneSub: { fontSize: Typography.size.xs, color: Colors.textMuted, letterSpacing: 0.8, textAlign: 'center' },
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
    maxWidth: 280,
  },
});

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

const cs = StyleSheet.create({
  container: { alignItems: 'stretch' },
  medallion: {
    width: 70, height: 70, borderRadius: 35,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
    alignSelf: 'center',
  },
  inner: {
    width: 50, height: 50, borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  bigEmoji: { fontSize: 24 },
  itemName: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.4,
    marginBottom: 2,
    textAlign: 'center',
  },
  meta: {
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  divider: {
    width: 22, height: 1,
    opacity: 0.5,
    marginVertical: Spacing.sm,
    alignSelf: 'center',
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  sectionDot: {
    width: 4, height: 4, borderRadius: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  body: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    lineHeight: Typography.size.xs * 1.85,
    fontWeight: Typography.weight.light,
  },
  dreamBox: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    backgroundColor: 'rgba(123,79,166,0.05)',
  },
  realBox: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    backgroundColor: 'rgba(46,158,138,0.05)',
  },
  affirmBox: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.md,
  },
  affirmText: {
    fontSize: Typography.size.xs,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: Typography.size.xs * 1.7,
    fontWeight: Typography.weight.light,
  },
});
