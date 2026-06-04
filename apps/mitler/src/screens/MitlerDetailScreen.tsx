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
    const message = `${entry.name} — ${KIND_LABEL[entry.kind]}\n\n${first}\n\nSakin Mitler`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && (navigator as any).share) {
        await (navigator as any).share({ title: entry.name, text: message });
      } else if (Platform.OS !== 'web') {
        await Share.share({ message, title: entry.name });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
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
            <Text style={[styles.back, { color: accent }]}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.familyTag}>SAKİN · MİTLER</Text>
          <TouchableOpacity
            onPress={handleShare}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Paylaş"
          >
            <Text style={[styles.share, { color: accent }]}>↑ Paylaş</Text>
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
            {KIND_LABEL[entry.kind].toUpperCase()}
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
          <Text style={styles.disclaimerFooter}>Yansıtma amaçlıdır · tavsiye değildir</Text>
          <Text style={styles.footerText}>SAKİN AİLESİ ✦</Text>
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
      { title: 'Öz',                body: a.essence,                             color: ACCENT },
      { title: 'Aydınlık Yan',      body: a.lightAspect,                         color: ACCENT },
      { title: 'Gölge Yan',         body: a.shadowAspect,                        color: Colors.ember },
      { title: 'Rüyada Görülürse',  body: a.dreamMeaning,                        color: DREAM,  boxed: true },
      { title: 'Gerçek Hayatta',    body: a.wakingMeaning,                       color: WAKING, boxed: true },
      { title: 'Bugünkü Pratik',    body: a.advice,                              color: ACCENT },
      { title: 'Olumlama',          body: a.affirmation,                         color: ACCENT, boxed: true },
    ];
  }
  if (entry.kind === 'myth') {
    const m = entry.data as typeof mythsData[0];
    return [
      { title: 'Hikaye',            body: m.summary,                             color: ACCENT },
      { title: 'Derin Anlamı',      body: m.depthMeaning,                        color: ACCENT },
      { title: "Jung'un Okuması",   body: m.jungian,                             color: ACCENT },
      { title: 'Rüyada Görülürse',  body: m.dreamMeaning,                        color: DREAM,  boxed: true },
      { title: 'Gerçek Hayatta',    body: m.wakingMeaning,                       color: WAKING, boxed: true },
      { title: 'Ders',              body: m.lesson,                              color: ACCENT, boxed: true },
    ];
  }
  if (entry.kind === 'image') {
    const im = entry.data as typeof imagesData[0];
    return [
      { title: 'Öz',                  body: im.essence,                            color: ACCENT },
      { title: 'Sembolizm',           body: im.symbolism,                          color: ACCENT },
      { title: 'Rüyada Görülürse',    body: im.dreamMeaning,                       color: DREAM,  boxed: true },
      { title: 'Gerçek Hayatta',      body: im.wakingMeaning,                      color: WAKING, boxed: true },
      { title: 'Bugünkü Pratik',      body: im.advice,                             color: ACCENT },
    ];
  }
  if (entry.kind === 'tarot') {
    const t = entry.data as typeof tarotData[0];
    return [
      { title: 'Öz',                  body: t.essence,                             color: ACCENT },
      { title: 'Düz (Upright)',       body: t.upright,                             color: ACCENT, boxed: true },
      { title: 'Ters (Reversed)',     body: t.reversed,                            color: Colors.ember, boxed: true },
      { title: 'Bugünkü Pratik',      body: t.advice,                              color: ACCENT },
    ];
  }
  if (entry.kind === 'rune') {
    const r = entry.data as typeof runesData[0];
    return [
      { title: 'Öz',                  body: r.essence,                             color: ACCENT },
      { title: 'Düz',                 body: r.upright,                             color: ACCENT, boxed: true },
      { title: 'Ters',                body: r.reversed,                            color: Colors.ember, boxed: true },
      { title: 'Bugünkü Pratik',      body: r.advice,                              color: ACCENT },
    ];
  }
  // iching
  const ic = entry.data as typeof ichingData[0];
  return [
    { title: 'Öz',                  body: ic.essence,                            color: ACCENT },
    { title: 'Trigramlar',          body: ic.trigrams,                           color: ACCENT },
    { title: 'Bugünkü Pratik',      body: ic.advice,                             color: ACCENT, boxed: true },
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
