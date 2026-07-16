import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import archetypesData from '../data/archetypes.json';
import mythsData from '../data/myths.json';
import imagesData from '../data/images.json';
import tarotData from '../data/tarot.json';
import runesData from '../data/runes.json';
import ichingData from '../data/iching.json';
import { translate, getLanguage } from '../i18n/useLanguage';
import { shareCard, isShareable } from '../utils/shareCard';

export type Kind = 'archetype' | 'myth' | 'image' | 'tarot' | 'rune' | 'iching';

export interface MitlerEntry {
  kind: Kind;
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  detailMeta: string;
  searchBlob: string;
  data: any;
}

interface Props { entry: MitlerEntry; onClose: () => void; }

export const KIND_LABEL: Record<Kind, string> = {
  archetype: 'Arketip',
  myth: 'Mit',
  image: 'İmge',
  tarot: 'Tarot',
  rune: 'Rune',
  iching: 'I Ching',
};

export const KIND_COLOR: Record<Kind, string> = {
  archetype: Colors.gold,
  myth: Colors.purpleLight,
  image: Colors.tealLight,
  tarot: Colors.sakinLavender,
  rune: Colors.emberLight,
  iching: Colors.sakinMint,
};

export function MitlerDetailScreen({ entry, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const accent = KIND_COLOR[entry.kind];

  const sections = buildSections(entry);

  const handleShare = async () => {
    const first = sections[0]?.body ?? '';
    // Web: zarif görsel kart (indir / native paylaş → Instagram). Native: metin paylaşımı.
    if (isShareable()) {
      await shareCard({
        appName: 'Sakin Mitler',
        accent,
        emoji: entry.emoji,
        title: entry.name,
        meta: entry.detailMeta,
        body: first,
        fileName: `sakin-${entry.name}.png`,
        shareText: `${entry.name} — sakin.life`,
      });
      return;
    }
    const message = `${entry.name} — ${translate(('detail.kind.' + entry.kind) as any)}\n\n${first}\n\n${translate('common.familyTag')}`;
    try {
      if (Platform.OS !== 'web') {
        await Share.share({ message, title: entry.name });
      }
    } catch {
      // user cancelled or share unavailable — silent
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.sm }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={[styles.back, { color: accent }]}>{translate('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.familyTag}>{translate('common.familyTag')}</Text>
          <TouchableOpacity
            onPress={handleShare}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={translate('detail.shareA11y')}
          >
            <Text style={[styles.share, { color: accent }]}>{translate('detail.share')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={[styles.medallion, { borderColor: accent + '40' }]}>
            <View style={[styles.medallionInner, { borderColor: accent + '25' }]}>
              <Text style={styles.heroEmoji}>{entry.emoji}</Text>
            </View>
          </View>
          <Text style={styles.heroName}>{entry.name}</Text>
          <Text style={[styles.heroKind, { color: accent }]}>
            {translate(('detail.kind.' + entry.kind) as any).toLocaleUpperCase(getLanguage())}
          </Text>
          <Text style={styles.heroMeta}>{entry.detailMeta}</Text>
        </View>

        {sections.map((s, i) => (
          <Section key={i} title={s.title} color={s.color}>
            {s.boxed ? (
              <View style={[styles.boxedBody, { borderColor: s.color + '40', backgroundColor: s.color + '08' }]}>
                <Text style={styles.body}>{s.body}</Text>
              </View>
            ) : (
              <Text style={styles.body}>{s.body}</Text>
            )}
          </Section>
        ))}

        <View style={styles.footer}>
          <Text style={styles.disclaimerFooter}>{translate('disclaimer.footer')}</Text>
          <Text style={styles.footerText}>{translate('common.familyFooter')}</Text>
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

interface SectionData { title: string; body: string; color: string; boxed?: boolean }

function buildSections(entry: MitlerEntry): SectionData[] {
  const ACCENT  = KIND_COLOR[entry.kind];
  const DREAM   = Colors.sakinLavender;
  const WAKING  = Colors.tealLight;

  if (entry.kind === 'archetype') {
    const a = entry.data as typeof archetypesData[0];
    return [
      { title: translate('detail.section.essence'),                body: a.essence,                             color: ACCENT },
      { title: translate('detail.section.lightAspect'),      body: a.lightAspect,                         color: ACCENT },
      { title: translate('detail.section.shadowAspect'),         body: a.shadowAspect,                        color: Colors.ember },
      { title: translate('detail.section.dream'),  body: a.dreamMeaning,                        color: DREAM,  boxed: true },
      { title: translate('detail.section.waking'),    body: a.wakingMeaning,                       color: WAKING, boxed: true },
      { title: translate('detail.section.advice'),    body: a.advice,                              color: ACCENT },
      { title: translate('detail.section.affirmation'),          body: a.affirmation,                         color: ACCENT, boxed: true },
    ];
  }
  if (entry.kind === 'myth') {
    const m = entry.data as typeof mythsData[0];
    return [
      { title: translate('detail.section.story'),            body: m.summary,                             color: ACCENT },
      { title: translate('detail.section.depth'),      body: m.depthMeaning,                        color: ACCENT },
      { title: translate('detail.section.jungian'),   body: m.jungian,                             color: ACCENT },
      { title: translate('detail.section.dream'),  body: m.dreamMeaning,                        color: DREAM,  boxed: true },
      { title: translate('detail.section.waking'),    body: m.wakingMeaning,                       color: WAKING, boxed: true },
      { title: translate('detail.section.lesson'),              body: m.lesson,                              color: ACCENT, boxed: true },
    ];
  }
  if (entry.kind === 'image') {
    const im = entry.data as typeof imagesData[0];
    return [
      { title: translate('detail.section.essence'),                  body: im.essence,                            color: ACCENT },
      { title: translate('detail.section.symbolism'),           body: im.symbolism,                          color: ACCENT },
      { title: translate('detail.section.dream'),    body: im.dreamMeaning,                       color: DREAM,  boxed: true },
      { title: translate('detail.section.waking'),      body: im.wakingMeaning,                      color: WAKING, boxed: true },
      { title: translate('detail.section.advice'),      body: im.advice,                             color: ACCENT },
    ];
  }
  if (entry.kind === 'tarot') {
    const t = entry.data as typeof tarotData[0];
    return [
      { title: translate('detail.section.essence'),                  body: t.essence,                             color: ACCENT },
      { title: translate('detail.section.upright'),       body: t.upright,                             color: ACCENT, boxed: true },
      { title: translate('detail.section.reversed'),     body: t.reversed,                            color: Colors.ember, boxed: true },
      { title: translate('detail.section.advice'),      body: t.advice,                              color: ACCENT },
    ];
  }
  if (entry.kind === 'rune') {
    const r = entry.data as typeof runesData[0];
    return [
      { title: translate('detail.section.essence'),                  body: r.essence,                             color: ACCENT },
      { title: translate('detail.section.upright'),                 body: r.upright,                             color: ACCENT, boxed: true },
      { title: translate('detail.section.reversed'),                body: r.reversed,                            color: Colors.ember, boxed: true },
      { title: translate('detail.section.advice'),      body: r.advice,                              color: ACCENT },
    ];
  }
  // iching
  const ic = entry.data as typeof ichingData[0];
  return [
    { title: translate('detail.section.essence'),                  body: ic.essence,                            color: ACCENT },
    { title: translate('detail.section.trigrams'),          body: ic.trigrams,                           color: ACCENT },
    { title: translate('detail.section.advice'),      body: ic.advice,                             color: ACCENT, boxed: true },
  ];
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.xxxl },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  back: { fontSize: Typography.size.sm, letterSpacing: 0.5 },
  familyTag: { fontSize: 9, color: Colors.textMuted, letterSpacing: 2 },
  share: { fontSize: Typography.size.sm, letterSpacing: 0.5 },

  hero: { alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  medallion: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  medallionInner: {
    width: 96, height: 96, borderRadius: 48, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  heroEmoji: { fontSize: 48 },
  heroName: {
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.light,
    color: Colors.textPrimary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  heroKind: {
    fontSize: 10,
    letterSpacing: 3,
    marginTop: Spacing.sm,
  },
  heroMeta: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginTop: 4,
    textAlign: 'center',
  },

  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionTitle: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  body: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.85,
    fontWeight: Typography.weight.light,
  },
  boxedBody: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },

  footer: { paddingVertical: Spacing.xl, alignItems: 'center' },
  footerText: { fontSize: 9, color: Colors.textMuted, letterSpacing: 4 },
  disclaimerFooter: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
