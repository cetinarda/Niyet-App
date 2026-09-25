import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { useI18n } from '../i18n/useI18n';
import { shareCard, isShareable } from '../utils/shareCard';
import { useSakinHayvanStore } from '../store/useStore';

type Stone = {
  id: string;
  name: string;
  emoji: string;
  color?: string;
  element: string;
  chakra?: string;
  properties: string[];
  origin?: string;
  plant?: string;
  imageUrl?: string;
  dailyMessage: string;
  howToUse?: string;
  affirmation?: string;
  rarity?: string;
};

// `animal` is a legacy alias kept for backward compatibility with callers that
// have not been migrated yet (e.g. HomeScreen's dead detail path). New callers
// pass `stone`.
interface Props { stone?: Stone; animal?: Stone; onClose: () => void; }

export function AnimalDetailScreen({ stone: stoneProp, animal, onClose }: Props) {
  const stone = (stoneProp ?? animal) as Stone;
  const insets = useSafeAreaInsets();
  const { t, lang } = useI18n();
  const { recordCardView } = useSakinHayvanStore();
  const [imgErr, setImgErr] = useState(false);

  // Keşfet'te bu kartı açmak "okuma" sayılır (rozet için); aynı kart günde 1 kez.
  useEffect(() => { recordCardView(stone.id); }, [stone.id]);

  const rarityLabel = stone.rarity
    ? t(('animalDetail.rarityLabels.' + stone.rarity) as any)
    : null;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.sm }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.back}>{t('animalDetail.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.familyTag}>{t('animalDetail.familyTag')}</Text>
          {isShareable() && (
            <TouchableOpacity
              onPress={() => {
                const moreCta = ({ tr: 'Daha fazlası için sakin.life', en: 'More at sakin.life', de: 'Mehr auf sakin.life', es: 'Más en sakin.life', pt: 'Mais em sakin.life', fr: 'Plus sur sakin.life', ja: '詳しくは sakin.life' } as any)[lang] || 'sakin.life';
                // Kicker altindaki aciklama satiri (paylasim kartinda).
                const subGuide = ({ tr:'Bugünün sana özel rehber bitkisi', en:'Your guide plant for today', de:'Deine Pflanze des Tages', es:'Tu planta guía de hoy', pt:'A tua planta guia de hoje', fr:'Ta plante guide du jour', ja:'今日のガイドプラント' } as any)[lang] || { tr:'Bugünün sana özel rehber bitkisi', en:'Your guide plant for today', de:'Deine Pflanze des Tages', es:'Tu planta guía de hoy', pt:'A tua planta guia de hoje', fr:'Ta plante guide du jour', ja:'今日のガイドプラント' }.en;
                shareCard({
                  subtitle: subGuide, appName: 'Sakin Bitkiler', accent: Colors.teal, emoji: stone.emoji, imageUrl: stone.imageUrl,
                  title: stone.name, meta: `${stone.element}${stone.chakra ? ' · ' + stone.chakra : ''}`,
                  body: stone.dailyMessage, cta: moreCta,
                  fileName: `sakin-${stone.name}.png`, shareText: `${stone.name}: sakin.life`,
                });
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('common.share')}
            >
              <Text style={[styles.back, { color: Colors.teal }]}>{t('common.share')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.hero}>
          <View style={[styles.medallion, { borderColor: Colors.teal + '40' }]}>
            <View style={[styles.medallionInner, { borderColor: Colors.teal + '25' }]}>
              {stone.imageUrl && !imgErr ? (
                <Image source={{ uri: stone.imageUrl }} style={styles.heroImg} onError={() => setImgErr(true)} />
              ) : (
                <Text style={styles.heroEmoji}>{stone.emoji}</Text>
              )}
            </View>
          </View>
          <Text style={styles.heroName}>{stone.name}</Text>
          <Text style={styles.heroMeta}>{stone.element.toLocaleUpperCase(lang)}{stone.chakra ? ' · ' + stone.chakra : ''}</Text>
          {rarityLabel && (
            <View style={[styles.rarityBadge, { borderColor: Colors.gold + '50' }]}>
              <Text style={styles.rarityText}>{rarityLabel}</Text>
            </View>
          )}
        </View>

        {stone.properties && stone.properties.length > 0 && (
          <Section title={t('animalDetail.sections.properties')} color={Colors.tealLight}>
            <View style={styles.tagsRow}>
              {stone.properties.map((p, i) => (
                <View key={i} style={[styles.tag, { borderColor: Colors.teal + '40' }]}>
                  <Text style={[styles.tagTxt, { color: Colors.teal }]}>{p}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        <Section title={t('animalDetail.sections.todayMessage')} color={Colors.tealLight}>
          <Text style={styles.body}>{stone.dailyMessage}</Text>
          {!!stone.affirmation && (
            <View style={[styles.affirmBox, { borderColor: Colors.teal + '40' }]}>
              <Text style={styles.affirmLabel}>{t('animalDetail.sections.affirmation')}</Text>
              <Text style={styles.affirmText}>{stone.affirmation}</Text>
            </View>
          )}
        </Section>

        {!!stone.howToUse && (
          <Section title={t('animalDetail.sections.howToUse')} color={Colors.gold}>
            <View style={[styles.practiceBox, { borderColor: Colors.teal + '40' }]}>
              <Text style={styles.practiceMark}>✦</Text>
              <Text style={styles.practiceText}>{stone.howToUse}</Text>
            </View>
          </Section>
        )}

        {!!stone.chakra && (
          <Section title={t('animalDetail.sections.chakra')} color={Colors.sakinLavender}>
            <Text style={styles.body}>{stone.chakra}</Text>
          </Section>
        )}

        {!!stone.origin && (
          <Section title={t('animalDetail.sections.origin')} color={Colors.purpleLight}>
            <Text style={styles.body}>{stone.origin}</Text>
          </Section>
        )}

        {!!(stone as any).myth && (
          <Section title={t('animalDetail.sections.myth')} color={Colors.gold}>
            <Text style={styles.body}>{(stone as any).myth}</Text>
          </Section>
        )}

        {!!stone.plant && (
          <Section title={t('animalDetail.sections.plant')} color={Colors.sakinMoonstone}>
            <Text style={styles.body}>{stone.plant}</Text>
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
  heroEmoji: { color: Colors.textPrimary, fontSize: 48 },
  heroName: { fontSize: Typography.size.xxxl, fontWeight: Typography.weight.light, color: Colors.textPrimary, letterSpacing: 1, textAlign: 'center' },
  heroMeta: { fontSize: Typography.size.xs, color: Colors.textMuted, letterSpacing: 2, marginTop: Spacing.xs },
  rarityBadge: { borderWidth: 1, borderRadius: BorderRadius.round, paddingHorizontal: Spacing.md, paddingVertical: 4, marginTop: Spacing.sm },
  rarityText: { fontSize: 10, color: Colors.gold, letterSpacing: 1.5, textTransform: 'uppercase' },
  section: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.divider },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionTitle: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold, letterSpacing: 2.5, textTransform: 'uppercase' },
  body: { fontSize: Typography.size.sm, color: Colors.textSecondary, lineHeight: Typography.size.sm * 1.85, fontWeight: Typography.weight.light },
  affirmBox: { borderWidth: 1, borderRadius: BorderRadius.sm, padding: Spacing.md, marginTop: Spacing.md },
  affirmLabel: { fontSize: 9, color: Colors.tealLight, letterSpacing: 2, marginBottom: 4 },
  affirmText: { fontSize: Typography.size.sm, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: Typography.size.sm * 1.6 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tag: { borderWidth: 1, borderRadius: BorderRadius.round, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  tagTxt: { fontSize: 11, letterSpacing: 0.5 },
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
});
