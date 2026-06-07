import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, TAB_BAR_HEIGHT } from '../theme/colors';
import stonesData from '../data/plants.json';
import stoneZodiac from '../data/stoneZodiac.json';
import { useLocalizedStones } from '../i18n/localize';
import { useI18n } from '../i18n/useI18n';
import { AnimalDetailScreen } from './AnimalDetailScreen';

type Stone = typeof stonesData[0];

// ─── Zodiac & element constants ─────────────────────────────────────────────────

// Keys in stoneZodiac.json are Turkish — these are the canonical lookup keys.
const ZODIAC_KEYS = [
  'Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak',
  'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık',
] as const;
type ZodiacKey = typeof ZODIAC_KEYS[number];

const ZODIAC_EN: Record<ZodiacKey, string> = {
  'Koç': 'Aries', 'Boğa': 'Taurus', 'İkizler': 'Gemini', 'Yengeç': 'Cancer',
  'Aslan': 'Leo', 'Başak': 'Virgo', 'Terazi': 'Libra', 'Akrep': 'Scorpio',
  'Yay': 'Sagittarius', 'Oğlak': 'Capricorn', 'Kova': 'Aquarius', 'Balık': 'Pisces',
};

const ZODIAC_SYMBOL: Record<ZodiacKey, string> = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋',
  'Aslan': '♌', 'Başak': '♍', 'Terazi': '♎', 'Akrep': '♏',
  'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓',
};

// Elements use the Turkish value stored in stones.json `element`.
const ELEMENTS = [
  { key: 'ateş',   labelKey: 'fire',  symbol: '△', color: Colors.ember },
  { key: 'toprak', labelKey: 'earth', symbol: '▽', color: Colors.gold },
  { key: 'hava',   labelKey: 'air',   symbol: '○', color: Colors.tealLight },
  { key: 'su',     labelKey: 'water', symbol: '◇', color: Colors.sakinMoonstone },
] as const;

type Mode = 'intro' | 'result';
type Selection =
  | { type: 'zodiac'; key: ZodiacKey }
  | { type: 'element'; key: string };

// ─── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  prefillBirthDate?: string; // YYYY-MM-DD
  prefillBirthHour?: number;
  prefillBirthCity?: string;
  embedded?: boolean;
}

export function AnimalFinderScreen({ onClose, prefillBirthDate, embedded }: Props) {
  const insets = useSafeAreaInsets();
  const { t, lang } = useI18n();
  const localStones = useLocalizedStones();
  const [mode, setMode] = useState<Mode>('intro');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [detail, setDetail] = useState<Stone | null>(null);

  const byId = useMemo(() => {
    const m = new Map<string, Stone>();
    for (const s of localStones as Stone[]) m.set(s.id, s);
    return m;
  }, [localStones]);

  // Birth month → birthstone (from monthStones)
  const birthMonth = useMemo(() => {
    if (!prefillBirthDate) return null;
    const parts = prefillBirthDate.split('-');
    const m = parseInt(parts[1]);
    return m >= 1 && m <= 12 ? m : null;
  }, [prefillBirthDate]);

  const birthStones = useMemo(() => {
    if (!birthMonth) return [];
    const ids = (stoneZodiac.monthStones as Record<string, string[]>)[String(birthMonth)] || [];
    return ids.map(id => byId.get(id)).filter(Boolean) as Stone[];
  }, [birthMonth, byId]);

  const resultStones = useMemo(() => {
    if (!selection) return [];
    if (selection.type === 'zodiac') {
      const ids = (stoneZodiac.zodiacStones as Record<string, string[]>)[selection.key] || [];
      return ids.map(id => byId.get(id)).filter(Boolean) as Stone[];
    }
    // element filter — element value stored in canonical Turkish
    return (localStones as Stone[]).filter(
      s => s.element === selection.key || s.element === 'tüm unsurlar'
    );
  }, [selection, byId, localStones]);

  const choose = (sel: Selection) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelection(sel);
    setMode('result');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const reset = () => {
    setSelection(null);
    setMode('intro');
  };

  const resultLabel = () => {
    if (!selection) return '';
    if (selection.type === 'zodiac') {
      const name = lang === 'en' ? ZODIAC_EN[selection.key] : selection.key;
      return t('animalFinder.result.zodiacLabel').replace('{name}', name);
    }
    const el = ELEMENTS.find(e => e.key === selection.key);
    const name = el ? t(('animalFinder.elements.' + el.labelKey) as any) : selection.key;
    return t('animalFinder.result.elementLabel').replace('{name}', name);
  };

  if (detail) {
    return <AnimalDetailScreen stone={detail as any} onClose={() => setDetail(null)} />;
  }

  return (
    <View style={[styles.root, { paddingTop: embedded ? 0 : insets.top }]}>
      {/* Header */}
      {(!embedded || mode !== 'intro') && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={mode === 'intro' ? (embedded ? () => {} : onClose) : reset}
            style={styles.closeBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.closeTxt}>{mode === 'intro' ? (embedded ? '←' : '✕') : '←'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('animalFinder.headerTitle')}</Text>
          <View style={{ width: 32 }} />
        </View>
      )}

      {/* ── Intro: zodiac + element pickers ── */}
      {mode === 'intro' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.introScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.introEmoji}>✦</Text>
          <Text style={styles.introTitle}>{t('animalFinder.intro.title')}</Text>
          <Text style={styles.introDesc}>{t('animalFinder.intro.desc')}</Text>
          <Text style={styles.introNote}>{t('animalFinder.intro.note')}</Text>

          {/* Birthstone shortcut (if profile birth date present) */}
          {birthStones.length > 0 && (
            <View style={styles.birthCard}>
              <Text style={styles.birthCardTitle}>{t('animalFinder.intro.birthStoneTitle')}</Text>
              <View style={styles.birthRow}>
                {birthStones.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.birthChip}
                    onPress={() => setDetail(s)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.birthChipEmoji}>{s.emoji}</Text>
                    <Text style={styles.birthChipName}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Zodiac */}
          <Text style={styles.sectionLabel}>{t('animalFinder.intro.zodiacLabel')}</Text>
          <View style={styles.zodiacGrid}>
            {ZODIAC_KEYS.map(z => (
              <TouchableOpacity
                key={z}
                style={styles.zodiacBtn}
                onPress={() => choose({ type: 'zodiac', key: z })}
                activeOpacity={0.8}
              >
                <Text style={styles.zodiacSymbol}>{ZODIAC_SYMBOL[z]}</Text>
                <Text style={styles.zodiacName}>{lang === 'en' ? ZODIAC_EN[z] : z}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Element */}
          <Text style={styles.sectionLabel}>{t('animalFinder.intro.elementLabel')}</Text>
          <Text style={styles.sectionHint}>{t('animalFinder.intro.elementHint')}</Text>
          <View style={styles.elementRow}>
            {ELEMENTS.map(e => (
              <TouchableOpacity
                key={e.key}
                style={[styles.elementBtn, { borderColor: e.color + '50' }]}
                onPress={() => choose({ type: 'element', key: e.key })}
                activeOpacity={0.8}
              >
                <Text style={[styles.elementSymbol, { color: e.color }]}>{e.symbol}</Text>
                <Text style={[styles.elementName, { color: e.color }]}>
                  {t(('animalFinder.elements.' + e.labelKey) as any)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: TAB_BAR_HEIGHT + Spacing.lg }} />
        </ScrollView>
      )}

      {/* ── Result: list of recommended stones ── */}
      {mode === 'result' && selection && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.resultScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultLabel}>{resultLabel()}</Text>

          {resultStones.length === 0 ? (
            <Text style={styles.emptyTxt}>{t('animalFinder.result.empty')}</Text>
          ) : (
            resultStones.map(s => (
              <TouchableOpacity
                key={s.id}
                style={styles.stoneRow}
                onPress={() => setDetail(s)}
                activeOpacity={0.75}
              >
                <View style={styles.stoneImgWrap}>
                  {s.imageUrl ? (
                    <Image source={{ uri: s.imageUrl }} style={styles.stoneImg} />
                  ) : (
                    <Text style={styles.stoneEmoji}>{s.emoji}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stoneName}>{s.name}</Text>
                  <Text style={styles.stoneMeta}>{s.element} · {s.chakra}</Text>
                </View>
                <Text style={styles.stoneArrow}>→</Text>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity style={styles.doneBtn} onPress={reset} activeOpacity={0.8}>
            <Text style={styles.doneBtnTxt}>{t('animalFinder.result.rediscoverBtn')}</Text>
          </TouchableOpacity>
          <View style={{ height: TAB_BAR_HEIGHT + Spacing.lg }} />
        </ScrollView>
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
  introScroll: { padding: Spacing.lg, alignItems: 'center' },
  introEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  introTitle: {
    fontSize: Typography.size.xl, fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary, textAlign: 'center', letterSpacing: 0.5,
  },
  introDesc: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
    textAlign: 'center', lineHeight: Typography.size.sm * 1.7,
    marginTop: Spacing.sm,
  },
  introNote: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    textAlign: 'center', lineHeight: Typography.size.xs * 1.85,
    fontStyle: 'italic', opacity: 0.7, marginTop: Spacing.sm, marginBottom: Spacing.lg,
  },

  // Birthstone
  birthCard: {
    width: '100%', backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.gold + '40',
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  birthCardTitle: {
    fontSize: Typography.size.xs, color: Colors.gold,
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: Spacing.sm,
  },
  birthRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  birthChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.gold + '40', borderRadius: BorderRadius.round,
  },
  birthChipEmoji: { fontSize: 16 },
  birthChipName: { fontSize: Typography.size.sm, color: Colors.textPrimary },

  // Section label
  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: Typography.size.xs, color: Colors.textSecondary,
    letterSpacing: 2, textTransform: 'uppercase',
    marginBottom: Spacing.sm, marginTop: Spacing.xs,
  },
  sectionHint: {
    alignSelf: 'flex-start',
    fontSize: Typography.size.xs, color: Colors.textMuted,
    lineHeight: Typography.size.xs * 1.7,
    opacity: 0.75, marginTop: -Spacing.xs, marginBottom: Spacing.sm,
  },

  // Zodiac grid
  zodiacGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
    justifyContent: 'space-between', width: '100%', marginBottom: Spacing.lg,
  },
  zodiacBtn: {
    width: '31%', alignItems: 'center', gap: 4,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  zodiacSymbol: { fontSize: 22, color: Colors.tealLight },
  zodiacName: { fontSize: 11, color: Colors.textSecondary, letterSpacing: 0.3 },

  // Element row
  elementRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
    justifyContent: 'space-between', width: '100%',
  },
  elementBtn: {
    width: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  elementSymbol: { fontSize: 16 },
  elementName: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, letterSpacing: 0.5 },

  // Result
  resultScroll: { padding: Spacing.lg },
  resultLabel: {
    fontSize: Typography.size.md, color: Colors.tealLight,
    fontWeight: Typography.weight.semibold, letterSpacing: 0.5,
    marginBottom: Spacing.md, textAlign: 'center',
  },
  emptyTxt: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
    textAlign: 'center', fontStyle: 'italic', marginVertical: Spacing.xl,
  },
  stoneRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  stoneImgWrap: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1, borderColor: Colors.teal + '40',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    backgroundColor: Colors.backgroundCard,
  },
  stoneImg: { width: 44, height: 44, borderRadius: 22 },
  stoneEmoji: { fontSize: 22 },
  stoneName: { fontSize: Typography.size.md, color: Colors.textPrimary, letterSpacing: 0.3 },
  stoneMeta: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2 },
  stoneArrow: { fontSize: Typography.size.sm, color: Colors.textMuted },

  doneBtn: {
    alignSelf: 'center',
    backgroundColor: Colors.teal, paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.round, marginTop: Spacing.lg,
  },
  doneBtnTxt: {
    fontSize: Typography.size.md, fontWeight: Typography.weight.bold,
    color: '#0D1E1B', letterSpacing: 1,
  },
});
