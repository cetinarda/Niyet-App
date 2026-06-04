import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { getRelatedMyth, getElementPractice } from '../utils/animalRelations';
import { MythDetail } from './MythsScreen';
import { useI18n } from '../i18n/useI18n';
import { useLocalizedLore } from '../i18n/localize';

type Animal = {
  id: string;
  name: string;
  emoji: string;
  element: string;
  symbolism: string[];
  imageUrl?: string;
  anatolianMeaning: string;
  dailyMessage: string;
  guidance: string;
  rarity?: string;
};

interface Props { animal: Animal; onClose: () => void; }

export function AnimalDetailScreen({ animal, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const lore = useLocalizedLore(animal.id);
  const [imgErr, setImgErr] = useState(false);
  const [openMyth, setOpenMyth] = useState<ReturnType<typeof getRelatedMyth>>(null);

  const relatedMyth = getRelatedMyth(animal.id, animal.element);
  const practice = getElementPractice(animal.element);

  if (openMyth) {
    return <MythDetail myth={openMyth} onClose={() => setOpenMyth(null)} />;
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.sm }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.back}>{t('animalDetail.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.familyTag}>{t('animalDetail.familyTag')}</Text>
        </View>

        <View style={styles.hero}>
          <View style={[styles.medallion, { borderColor: Colors.teal + '40' }]}>
            <View style={[styles.medallionInner, { borderColor: Colors.teal + '25' }]}>
              {animal.imageUrl && !imgErr ? (
                <Image source={{ uri: animal.imageUrl }} style={styles.heroImg} onError={() => setImgErr(true)} />
              ) : (
                <Text style={styles.heroEmoji}>{animal.emoji}</Text>
              )}
            </View>
          </View>
          <Text style={styles.heroName}>{animal.name}</Text>
          <Text style={styles.heroMeta}>{animal.element.toUpperCase()} · {animal.symbolism.slice(0, 3).join(' · ')}</Text>
        </View>

        <Section title={t('animalDetail.sections.anatolian')} color={Colors.gold}>
          <Text style={styles.body}>{animal.anatolianMeaning}</Text>
        </Section>

        <Section title={t('animalDetail.sections.todayMessage')} color={Colors.tealLight}>
          <Text style={styles.body}>{animal.dailyMessage}</Text>
          <View style={[styles.affirmBox, { borderColor: Colors.teal + '40' }]}>
            <Text style={styles.affirmLabel}>{t('animalDetail.sections.guidance')}</Text>
            <Text style={styles.affirmText}>{animal.guidance}</Text>
          </View>
        </Section>

        {lore?.jung && (
          <Section title={t('animalDetail.sections.jung')} color={Colors.sakinLavender}>
            <Text style={styles.body}>{lore.jung}</Text>
          </Section>
        )}

        {lore?.dream && (
          <Section title={t('animalDetail.sections.dream')} color={Colors.sakinMoonstone}>
            <Text style={styles.body}>{lore.dream}</Text>
          </Section>
        )}

        {lore?.traditions && lore.traditions.length > 0 && (
          <Section title={t('animalDetail.sections.traditions')} color={Colors.purpleLight}>
            <View style={styles.traditionList}>
              {lore.traditions.map((tr: any, i: number) => (
                <View key={i} style={styles.traditionItem}>
                  <Text style={styles.traditionCulture}>{tr.culture}</Text>
                  <Text style={styles.traditionMeaning}>{tr.meaning}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {lore?.myths && lore.myths.length > 0 && (
          <Section title={t('animalDetail.sections.myths')} color={Colors.gold}>
            {lore.myths.map((m: string, i: number) => (
              <View key={i} style={styles.mythBox}>
                <Text style={styles.mythSymbol}>✦</Text>
                <Text style={styles.body}>{m}</Text>
              </View>
            ))}
          </Section>
        )}

        {lore?.shadow && (
          <Section title={t('animalDetail.sections.shadow')} color={Colors.ember}>
            <Text style={styles.body}>{lore.shadow}</Text>
          </Section>
        )}

        {lore?.whenAppears && (
          <Section title={t('animalDetail.sections.whenAppears')} color={Colors.tealLight}>
            <Text style={styles.body}>{lore.whenAppears}</Text>
          </Section>
        )}

        {!lore && (
          <View style={styles.missingLore}>
            <Text style={styles.missingText}>
              {t('animalDetail.missingLore')}
            </Text>
          </View>
        )}

        <Section title={t('animalDetail.sections.thisPractice')} color={Colors.tealLight}>
          <View style={[styles.practiceBox, { borderColor: Colors.teal + '40' }]}>
            <Text style={styles.practiceMark}>✦</Text>
            <Text style={styles.practiceText}>{practice}</Text>
          </View>
        </Section>

        {relatedMyth && (
          <Section title={t('animalDetail.sections.relatedMyth')} color={Colors.sakinLavender}>
            <TouchableOpacity
              style={[styles.relatedMyth, { borderColor: Colors.sakinLavender + '50' }]}
              onPress={() => setOpenMyth(relatedMyth)}
              activeOpacity={0.8}
            >
              <View style={[styles.relatedSymbol, { borderColor: Colors.sakinLavender + '60' }]}>
                <Text style={styles.relatedSymbolText}>{relatedMyth.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.relatedName}>{relatedMyth.name}</Text>
                <Text style={styles.relatedAspect}>
                  {(relatedMyth as any).aspect?.toUpperCase()}
                </Text>
                <Text style={styles.relatedHint}>
                  {t('animalDetail.resonanceHint')}
                </Text>
              </View>
            </TouchableOpacity>
          </Section>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('animalDetail.footer')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionDot, { backgroundColor: color }]} />
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.xxxl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  back: { fontSize: Typography.size.sm, color: Colors.tealLight, letterSpacing: 0.5 },
  familyTag: { fontSize: 9, color: Colors.textMuted, letterSpacing: 2 },
  hero: { alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  medallion: { width: 120, height: 120, borderRadius: 60, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  medallionInner: { width: 96, height: 96, borderRadius: 48, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' },
  heroImg: { width: 96, height: 96, borderRadius: 48 },
  heroEmoji: { fontSize: 48 },
  heroName: { fontSize: Typography.size.xxxl, fontWeight: Typography.weight.light, color: Colors.textPrimary, letterSpacing: 1, textAlign: 'center' },
  heroMeta: { fontSize: Typography.size.xs, color: Colors.textMuted, letterSpacing: 2, marginTop: Spacing.xs },
  section: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.divider },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionTitle: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold, letterSpacing: 2.5, textTransform: 'uppercase' },
  body: { fontSize: Typography.size.sm, color: Colors.textSecondary, lineHeight: Typography.size.sm * 1.85, fontWeight: Typography.weight.light },
  affirmBox: { borderWidth: 1, borderRadius: BorderRadius.sm, padding: Spacing.md, marginTop: Spacing.md },
  affirmLabel: { fontSize: 9, color: Colors.tealLight, letterSpacing: 2, marginBottom: 4 },
  affirmText: { fontSize: Typography.size.sm, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: Typography.size.sm * 1.6 },
  traditionList: { gap: Spacing.md },
  traditionItem: { paddingLeft: Spacing.md, borderLeftWidth: 1, borderLeftColor: Colors.purple + '40' },
  traditionCulture: { fontSize: Typography.size.xs, color: Colors.purpleLight, fontWeight: Typography.weight.semibold, letterSpacing: 1, marginBottom: 4 },
  traditionMeaning: { fontSize: Typography.size.sm, color: Colors.textSecondary, lineHeight: Typography.size.sm * 1.75, fontWeight: Typography.weight.light },
  mythBox: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  mythSymbol: { fontSize: 10, color: Colors.gold, marginTop: 4 },
  missingLore: { margin: Spacing.lg, padding: Spacing.lg, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.cardBorder, borderRadius: BorderRadius.md, alignItems: 'center' },
  missingText: { fontSize: Typography.size.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: Typography.size.xs * 1.8, fontStyle: 'italic' },
  footer: { paddingVertical: Spacing.xl, alignItems: 'center' },
  footerText: { fontSize: 9, color: Colors.textMuted, letterSpacing: 4 },
  practiceBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    backgroundColor: Colors.teal + '08',
  },
  practiceMark: { fontSize: 14, color: Colors.tealLight, marginTop: 2 },
  practiceText: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    lineHeight: Typography.size.sm * 1.7,
    fontWeight: Typography.weight.light,
  },
  relatedMyth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.sakinLavender + '08',
  },
  relatedSymbol: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.sakinLavender + '12',
  },
  relatedSymbolText: { fontSize: 20 },
  relatedName: {
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.3,
  },
  relatedAspect: {
    fontSize: 9,
    color: Colors.sakinLavender,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  relatedHint: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
