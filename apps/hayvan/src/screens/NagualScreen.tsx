import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, TAB_BAR_HEIGHT } from '../theme/colors';
import nagualsData from '../data/naguals.json';
import animalsData from '../data/animals.json';
import { useTuraStore } from '../store/useStore';
import { calcLifePath } from '../utils/numerology';
import { calcHDType } from '../utils/humanDesign';
import { useI18n } from '../i18n/useI18n';
import { useLocalizedNaguals, useLocalizedAnimals } from '../i18n/localize';

interface Props { onClose: () => void; embedded?: boolean; }
type Nagual = typeof nagualsData[0];
type Animal = typeof animalsData[0];

function getWeeklyNagual(): Nagual {
  const week = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  return nagualsData[week % nagualsData.length];
}

function getDaysRemaining(): number {
  const now = new Date();
  const day = now.getDay();
  const daysToMonday = (8 - day) % 7 || 7;
  return daysToMonday;
}

function getPersonalNagual(
  birthDate: string,
  element: string,
): { animal: Animal; lifePath: number; hdType: string } | null {
  const pool = animalsData.filter(a => a.element === element);
  if (pool.length === 0) return null;

  const lifePath = calcLifePath(birthDate);
  const hdType = calcHDType(birthDate);
  const week = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));

  const seed = (lifePath * 11 + week) % pool.length;
  const animal = pool[seed];

  return { animal, lifePath, hdType };
}

const HD_REASONS_TR: Record<string, string> = {
  'Jeneratör': 'yanıtlama gücünü',
  'Manifesting Jeneratör': 'çok boyutlu enerjini',
  'Projektör': 'yönlendirme sezgini',
  'Manifestor': 'başlatma gücünü',
  'Reflektör': 'yansıtma bilgeliğini',
};
const HD_REASONS_EN: Record<string, string> = {
  'Jeneratör': 'your power of response',
  'Manifesting Jeneratör': 'your multidimensional energy',
  'Projektör': 'your guiding intuition',
  'Manifestor': 'your initiating power',
  'Reflektör': 'your reflective wisdom',
};
const ELEMENT_TR_TO_EN: Record<string, string> = {
  'ateş': 'fire', 'su': 'water', 'toprak': 'earth', 'hava': 'air',
};
function buildReason(lang: 'tr' | 'en', element: string, lifePath: number, hdType: string): string {
  if (lang === 'en') {
    const elEn = ELEMENT_TR_TO_EN[element] || element;
    const hdReason = HD_REASONS_EN[hdType] || 'your inner strength';
    const cap = elEn.charAt(0).toUpperCase() + elEn.slice(1);
    return `${cap} element · Life path ${lifePath} · ${hdType} type — here to support ${hdReason} in this period.`;
  }
  const hdReason = HD_REASONS_TR[hdType] || 'içsel gücünü';
  const cap = element.charAt(0).toUpperCase() + element.slice(1);
  return `${cap} unsuru · Yaşam yolu ${lifePath} · ${hdType} tipi — bu dönemde ${hdReason} desteklemek için seninle.`;
}

export function NagualScreen({ onClose, embedded }: Props) {
  const insets = useSafeAreaInsets();
  const { t, lang } = useI18n();
  const { profile } = useTuraStore();
  const localNaguals = useLocalizedNaguals() as Nagual[];
  const localAnimals = useLocalizedAnimals() as Animal[];
  const [rawNagual] = useState<Nagual>(() => getWeeklyNagual());
  const nagual = localNaguals.find(n => n.id === rawNagual.id) || rawNagual;
  const daysLeft = getDaysRemaining();

  const personal = useMemo(() => {
    if (!profile?.birthDate || !profile?.element) return null;
    const raw = getPersonalNagual(profile.birthDate, profile.element);
    if (!raw) return null;
    const animal = localAnimals.find(a => a.id === raw.animal.id) || raw.animal;
    const reason = buildReason(lang, profile.element, raw.lifePath, raw.hdType);
    return { ...raw, animal, reason };
  }, [profile?.birthDate, profile?.element, localAnimals, lang]);

  return (
    <View style={styles.root}>
      {!embedded && (
        <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.back}>{t('nagual.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.familyTag}>{t('nagual.familyTag')}</Text>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>{t('nagual.introTitle')}</Text>
          <Text style={styles.introText}>
            {t('nagual.introText')}
          </Text>
        </View>

        {/* Universal weekly nagual */}
        <View style={[styles.heroCard, { borderColor: Colors.ember + '60' }]}>
          <Text style={styles.weekTag}>{t('nagual.weekTag')}</Text>
          <Text style={styles.heroEmoji}>{nagual.emoji}</Text>
          <Text style={styles.heroName}>{nagual.name}</Text>
          <Text style={styles.heroAspect}>{(nagual as any).aspect}</Text>
          <View style={styles.divider} />
          <Text style={styles.dailyMsg}>{(nagual as any).dailyMessage}</Text>
          <View style={[styles.guideBox, { borderColor: Colors.ember + '40' }]}>
            <Text style={styles.guideLabel}>{t('nagual.thisWeek')}</Text>
            <Text style={styles.guideText}>{(nagual as any).guidance}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{nagual.element.toUpperCase()}</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{t('nagual.daysLeft').replace('{n}', String(daysLeft))}</Text>
          </View>
        </View>

        {/* Personal nagual */}
        {personal ? (
          <View style={[styles.personalCard, { borderColor: Colors.teal + '60' }]}>
            <Text style={styles.personalTag}>{t('nagual.personalTag')}</Text>
            <Text style={styles.heroEmoji}>{personal.animal.emoji}</Text>
            <Text style={styles.heroName}>{personal.animal.name}</Text>
            <Text style={[styles.heroAspect, { color: Colors.tealLight }]}>
              {personal.animal.symbolism.slice(0, 2).join(' · ').toUpperCase()}
            </Text>
            <View style={[styles.divider, { backgroundColor: Colors.teal }]} />
            <Text style={styles.dailyMsg}>{personal.animal.dailyMessage}</Text>
            <View style={[styles.guideBox, { borderColor: Colors.teal + '40' }]}>
              <Text style={[styles.guideLabel, { color: Colors.tealLight }]}>{t('nagual.guidance')}</Text>
              <Text style={styles.guideText}>{personal.animal.guidance}</Text>
            </View>
            <View style={[styles.reasonBox, { borderColor: Colors.teal + '25' }]}>
              <Text style={styles.reasonText}>{personal.reason}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.lockedCard}>
            <Text style={styles.lockedEmoji}>✦</Text>
            <Text style={styles.lockedTitle}>{t('nagual.locked.title')}</Text>
            <Text style={styles.lockedText}>{t('nagual.locked.text')}</Text>
          </View>
        )}

        <View style={{ height: insets.bottom + TAB_BAR_HEIGHT + Spacing.md }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  back: { fontSize: Typography.size.sm, color: Colors.emberLight, letterSpacing: 0.5 },
  familyTag: { fontSize: 9, color: Colors.textMuted, letterSpacing: 2 },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  intro: { marginBottom: Spacing.lg },
  introTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semibold, color: Colors.textPrimary, letterSpacing: 0.5, marginBottom: Spacing.sm },
  introText: { fontSize: Typography.size.sm, color: Colors.textSecondary, lineHeight: Typography.size.sm * 1.8, fontWeight: Typography.weight.light },
  heroCard: { borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', backgroundColor: Colors.backgroundCard, marginBottom: Spacing.lg },
  weekTag: { fontSize: 9, letterSpacing: 4, color: Colors.emberLight, marginBottom: Spacing.md },
  heroEmoji: { fontSize: 56, marginBottom: Spacing.sm },
  heroName: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.light, color: Colors.textPrimary, letterSpacing: 1 },
  heroAspect: { fontSize: Typography.size.xs, color: Colors.emberLight, letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' },
  divider: { width: 28, height: 1, backgroundColor: Colors.ember, opacity: 0.3, marginVertical: Spacing.md },
  dailyMsg: { fontSize: Typography.size.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: Typography.size.sm * 1.85, fontStyle: 'italic', fontWeight: Typography.weight.light, marginBottom: Spacing.md },
  guideBox: { borderWidth: 1, borderRadius: BorderRadius.sm, padding: Spacing.md, width: '100%', marginBottom: Spacing.md },
  guideLabel: { fontSize: 9, color: Colors.emberLight, letterSpacing: 2, marginBottom: 4 },
  guideText: { fontSize: Typography.size.sm, color: Colors.textPrimary, lineHeight: Typography.size.sm * 1.7 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  metaText: { fontSize: 10, color: Colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textMuted },
  personalCard: { borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', backgroundColor: Colors.backgroundCard, marginBottom: Spacing.lg },
  personalTag: { fontSize: 9, letterSpacing: 4, color: Colors.tealLight, marginBottom: Spacing.md },
  reasonBox: { borderWidth: 1, borderRadius: BorderRadius.sm, padding: Spacing.md, width: '100%', borderStyle: 'dashed' },
  reasonText: { fontSize: Typography.size.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: Typography.size.xs * 1.8, fontStyle: 'italic' },
  lockedCard: { borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.cardBorder, borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  lockedEmoji: { fontSize: 28, color: Colors.teal, marginBottom: Spacing.sm },
  lockedTitle: { fontSize: Typography.size.md, color: Colors.textMuted, fontWeight: Typography.weight.semibold, letterSpacing: 1, marginBottom: Spacing.sm },
  lockedText: { fontSize: Typography.size.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: Typography.size.xs * 1.85, fontStyle: 'italic' },
});
