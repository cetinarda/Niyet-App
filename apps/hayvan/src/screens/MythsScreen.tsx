import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import nagualsData from '../data/naguals.json';
import { useI18n } from '../i18n/useI18n';
import { useLocalizedNaguals } from '../i18n/localize';

interface Props {
  onClose: () => void;
  embedded?: boolean;
}

export type Myth = typeof nagualsData[0];

const ELEMENT_COLORS: Record<string, string> = {
  ateş: Colors.ember,    fire: Colors.ember,
  su: Colors.tealLight,  water: Colors.tealLight,
  toprak: Colors.gold,   earth: Colors.gold,
  hava: Colors.sakinLavender, air: Colors.sakinLavender,
  karanlık: Colors.purple, dark: Colors.purple,
};

export function MythsScreen({ onClose, embedded }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const localNaguals = useLocalizedNaguals();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Myth | null>(null);
  const [elementFilter, setElementFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = localNaguals as Myth[];
    if (elementFilter) list = list.filter(m => m.element === elementFilter);
    if (q) {
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m as any).aspect?.toLowerCase().includes(q) ||
        m.element.toLowerCase().includes(q)
      );
    }
    return list;
  }, [query, elementFilter, localNaguals]);

  const elements = useMemo(() => {
    const set = new Set(localNaguals.map((m: any) => m.element));
    return Array.from(set) as string[];
  }, [localNaguals]);

  if (selected) {
    return <MythDetail myth={selected} onClose={() => setSelected(null)} />;
  }

  return (
    <View style={styles.root}>
      {!embedded && (
        <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.back}>{t('myths.back' as any)}</Text>
          </TouchableOpacity>
          <Text style={styles.familyTag}>{t('myths.familyTag' as any)}</Text>
        </View>
      )}

      <View style={[styles.header, embedded && styles.headerCompact]}>
        <Text style={styles.subtitle}>
          {(t('myths.subtitle' as any) as string).replace('{count}', String(nagualsData.length))}
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>✦</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={t('myths.searchPlaceholder' as any)}
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={12}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <TouchableOpacity
          style={[styles.filterChip, !elementFilter && styles.filterChipActive]}
          onPress={() => setElementFilter(null)}
        >
          <Text style={[styles.filterChipText, !elementFilter && styles.filterChipTextActive]}>
            {t('myths.filterAll' as any)}
          </Text>
        </TouchableOpacity>
        {elements.map(el => (
          <TouchableOpacity
            key={el}
            style={[
              styles.filterChip,
              elementFilter === el && { borderColor: ELEMENT_COLORS[el] || Colors.cardBorder, backgroundColor: (ELEMENT_COLORS[el] || Colors.teal) + '15' }
            ]}
            onPress={() => setElementFilter(el)}
          >
            <Text style={[
              styles.filterChipText,
              elementFilter === el && { color: ELEMENT_COLORS[el] || Colors.tealLight }
            ]}>
              {el}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 && (
          <Text style={styles.empty}>{t('myths.noResults' as any)}</Text>
        )}
        {filtered.map(m => {
          const color = ELEMENT_COLORS[m.element] || Colors.teal;
          return (
            <TouchableOpacity
              key={m.id}
              style={[styles.row, { borderColor: color + '30' }]}
              onPress={() => setSelected(m)}
              activeOpacity={0.7}
            >
              <View style={[styles.rowSymbol, { borderColor: color + '50', backgroundColor: color + '10' }]}>
                <Text style={styles.rowEmoji}>{m.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{m.name}</Text>
                <Text style={[styles.rowAspect, { color: color + 'CC' }]}>
                  {(m as any).aspect}
                </Text>
                <Text style={styles.rowMeta}>{m.element.toUpperCase()}</Text>
              </View>
              <Text style={styles.rowArrow}>→</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: insets.bottom + Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

export function MythDetail({ myth, onClose }: { myth: Myth; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const color = ELEMENT_COLORS[myth.element] || Colors.teal;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.detailScroll, { paddingTop: insets.top + Spacing.sm }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={[styles.back, { color }]}>{t('myths.back' as any)}</Text>
          </TouchableOpacity>
          <Text style={styles.familyTag}>{t('myths.familyTag' as any)}</Text>
        </View>

        <View style={styles.hero}>
          <View style={[styles.medallion, { borderColor: color + '60' }]}>
            <View style={[styles.medallionInner, { borderColor: color + '30' }]}>
              <Text style={styles.heroEmoji}>{myth.emoji}</Text>
            </View>
          </View>
          <Text style={styles.heroName}>{myth.name}</Text>
          <Text style={[styles.heroAspect, { color }]}>{(myth as any).aspect}</Text>
          <Text style={styles.heroElement}>{myth.element.toUpperCase()}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionDot, { backgroundColor: color }]} />
            <Text style={[styles.sectionTitle, { color }]}>{t('myths.msgSection' as any)}</Text>
          </View>
          <Text style={styles.body}>{(myth as any).dailyMessage}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionDot, { backgroundColor: color }]} />
            <Text style={[styles.sectionTitle, { color }]}>{t('myths.guidanceSection' as any)}</Text>
          </View>
          <View style={[styles.guidanceBox, { borderColor: color + '40' }]}>
            <Text style={styles.body}>{(myth as any).guidance}</Text>
          </View>
        </View>

        <View style={{ height: insets.bottom + Spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm,
  },
  back: { fontSize: Typography.size.sm, color: Colors.tealLight, letterSpacing: 0.5 },
  familyTag: { fontSize: 9, color: Colors.textMuted, letterSpacing: 2 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  headerCompact: { paddingTop: Spacing.xs, paddingBottom: Spacing.sm },
  title: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.light, color: Colors.textPrimary, letterSpacing: 1 },
  subtitle: { fontSize: Typography.size.xs, color: Colors.textMuted, letterSpacing: 0.5, marginTop: 4 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundCard, borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.round, marginBottom: Spacing.sm,
  },
  searchIcon: { fontSize: 14, color: Colors.ember, opacity: 0.5 },
  searchInput: { flex: 1, fontSize: Typography.size.sm, color: Colors.textPrimary, padding: 0 },
  clearBtn: { fontSize: Typography.size.sm, color: Colors.textMuted, paddingHorizontal: Spacing.xs },
  filterRow: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingVertical: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundCard,
  },
  filterChipActive: { borderColor: Colors.gold + '60', backgroundColor: Colors.gold + '15' },
  filterChipText: { fontSize: Typography.size.xs, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  filterChipTextActive: { color: Colors.gold },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.sm },
  empty: { textAlign: 'center', color: Colors.textMuted, fontSize: Typography.size.sm, marginTop: Spacing.xl, fontStyle: 'italic' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderWidth: 1, borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundCard,
  },
  rowSymbol: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  rowEmoji: { fontSize: 24 },
  rowName: { fontSize: Typography.size.md, color: Colors.textPrimary, letterSpacing: 0.3, fontWeight: Typography.weight.semibold },
  rowAspect: { fontSize: Typography.size.xs, letterSpacing: 1, marginTop: 2, textTransform: 'uppercase' },
  rowMeta: { fontSize: 9, color: Colors.textMuted, letterSpacing: 1.5, marginTop: 2 },
  rowArrow: { fontSize: Typography.size.sm, color: Colors.textMuted },
  detailScroll: { paddingBottom: Spacing.xxxl },
  hero: { alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, paddingTop: Spacing.md },
  medallion: { width: 120, height: 120, borderRadius: 60, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  medallionInner: { width: 96, height: 96, borderRadius: 48, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 48 },
  heroName: { fontSize: Typography.size.xxxl, fontWeight: Typography.weight.light, color: Colors.textPrimary, letterSpacing: 1, textAlign: 'center' },
  heroAspect: { fontSize: Typography.size.sm, letterSpacing: 2, marginTop: Spacing.xs, textTransform: 'uppercase' },
  heroElement: { fontSize: 9, color: Colors.textMuted, letterSpacing: 3, marginTop: Spacing.xs },
  section: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.divider },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionTitle: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold, letterSpacing: 2.5 },
  body: { fontSize: Typography.size.sm, color: Colors.textSecondary, lineHeight: Typography.size.sm * 1.85, fontWeight: Typography.weight.light },
  guidanceBox: { borderWidth: 1, borderRadius: BorderRadius.sm, padding: Spacing.md },
});
