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
import { useData } from '../data/loader';
import { MitlerDetailScreen, MitlerEntry, Kind, KIND_COLOR, KIND_LABEL } from './MitlerDetailScreen';
import { useLanguage } from '../i18n/useLanguage';

interface Props {
  onClose: () => void;
  embedded?: boolean;
}

type Filter = 'all' | Kind;

type FilterTKey =
  | 'library.filter.all'
  | 'library.filter.archetype'
  | 'library.filter.myth'
  | 'library.filter.image'
  | 'library.filter.tarot'
  | 'library.filter.rune'
  | 'library.filter.iching';

const FILTERS: { key: Filter; tKey: FilterTKey }[] = [
  { key: 'all',       tKey: 'library.filter.all' },
  { key: 'archetype', tKey: 'library.filter.archetype' },
  { key: 'myth',      tKey: 'library.filter.myth' },
  { key: 'image',     tKey: 'library.filter.image' },
  { key: 'tarot',     tKey: 'library.filter.tarot' },
  { key: 'rune',      tKey: 'library.filter.rune' },
  { key: 'iching',    tKey: 'library.filter.iching' },
];

function archetypeEntry(a: any): MitlerEntry {
  return {
    kind: 'archetype',
    id: a.id,
    name: a.name,
    emoji: a.emoji,
    tagline: (a.keywords || []).slice(0, 2).join(' · '),
    detailMeta: `${a.tradition} · ${a.category}`,
    searchBlob: [a.name, a.tradition, a.category, a.essence, ...(a.keywords || [])].join(' '),
    data: a,
  };
}
function mythEntry(m: any): MitlerEntry {
  return {
    kind: 'myth',
    id: m.id,
    name: m.name,
    emoji: m.emoji,
    tagline: `${m.culture} · ${m.category}`,
    detailMeta: `${m.culture} · ${m.era}`,
    searchBlob: [m.name, m.culture, m.era, m.category, m.summary].join(' '),
    data: m,
  };
}
function imageEntry(i: any): MitlerEntry {
  return {
    kind: 'image',
    id: i.id,
    name: i.name,
    emoji: i.emoji,
    tagline: (i.keywords || []).slice(0, 2).join(' · '),
    detailMeta: `${i.tradition} · ${i.category}`,
    searchBlob: [i.name, i.tradition, i.category, i.essence, ...(i.keywords || [])].join(' '),
    data: i,
  };
}
function tarotEntry(t: any): MitlerEntry {
  const arcanaLabel =
    t.arcana === 'major' ? `Major ${t.number}` :
    t.arcana === 'minor' ? `${t.suit} ${t.number}` :
                            `${t.rank} of ${t.suit}`;
  return {
    kind: 'tarot',
    id: t.id,
    name: t.name,
    emoji: t.emoji,
    tagline: (t.keywords || []).slice(0, 2).join(' · '),
    detailMeta: `Tarot · ${arcanaLabel}`,
    searchBlob: [t.name, arcanaLabel, t.essence, ...(t.keywords || [])].join(' '),
    data: t,
  };
}
function runeEntry(r: any): MitlerEntry {
  return {
    kind: 'rune',
    id: r.id,
    name: r.name,
    emoji: r.emoji,
    tagline: (r.keywords || []).slice(0, 2).join(' · '),
    detailMeta: `Rune · ${r.aett} aett · ${r.letter}`,
    searchBlob: [r.name, r.letter, r.aett, r.essence, ...(r.keywords || [])].join(' '),
    data: r,
  };
}
function ichingEntry(ic: any): MitlerEntry {
  return {
    kind: 'iching',
    id: ic.id,
    name: ic.name,
    emoji: ic.emoji,
    tagline: (ic.keywords || []).slice(0, 2).join(' · '),
    detailMeta: `I Ching #${ic.number} · ${ic.trigrams}`,
    searchBlob: [ic.name, String(ic.number), ic.trigrams, ic.essence, ...(ic.keywords || [])].join(' '),
    data: ic,
  };
}

function buildEntries(data: ReturnType<typeof useData>): MitlerEntry[] {
  return [
    ...data.archetypes.map(archetypeEntry),
    ...data.myths.map(mythEntry),
    ...data.images.map(imageEntry),
    ...data.tarot.map(tarotEntry),
    ...data.runes.map(runeEntry),
    ...data.iching.map(ichingEntry),
  ];
}

function normalize(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

export function MitlerLibraryScreen({ onClose, embedded }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const data = useData();
  const TOTAL =
    data.archetypes.length + data.myths.length + data.images.length +
    data.tarot.length + data.runes.length + data.iching.length;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<MitlerEntry | null>(null);

  const all = useMemo(() => buildEntries(data), [data]);

  const filtered = useMemo(() => {
    const pool = filter === 'all' ? all : all.filter(e => e.kind === filter);
    const q = normalize(query);
    if (!q) {
      return [...pool].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    }
    const terms = q.split(/\s+/).filter(Boolean);
    return pool
      .filter(e => {
        const blob = normalize(e.searchBlob);
        return terms.every(t => blob.includes(t));
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [filter, query, all]);

  const groups = useMemo(() => {
    const map = new Map<string, MitlerEntry[]>();
    for (const e of filtered) {
      const letter = e.name[0].toLocaleUpperCase('tr');
      const list = map.get(letter) || [];
      list.push(e);
      map.set(letter, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (selected) {
    return <MitlerDetailScreen entry={selected} onClose={() => setSelected(null)} />;
  }

  return (
    <View style={styles.root}>
      {!embedded && (
        <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.back}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.familyTag}>{t('common.familyTag')}</Text>
        </View>
      )}

      <View style={[styles.header, embedded && styles.headerCompact]}>
        <Text style={styles.subtitle}>
          {t('library.subtitle', { n: TOTAL })}
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>✦</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={t('library.search.placeholder')}
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
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, active && styles.filterBtnActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterLabel, { color: active ? Colors.tealLight : Colors.textMuted }]}>
                {t(f.tKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {groups.length === 0 && (
          <Text style={styles.empty}>{t('library.empty')}</Text>
        )}
        {groups.map(([letter, items]) => (
          <View key={letter} style={styles.group}>
            <View style={styles.groupHead}>
              <View style={styles.groupDot} />
              <Text style={styles.groupLetter}>{letter}</Text>
              <View style={styles.groupLine} />
            </View>
            {items.map(entry => (
              <EntryRow
                key={`${entry.kind}:${entry.id}`}
                entry={entry}
                onPress={() => setSelected(entry)}
              />
            ))}
          </View>
        ))}
        <View style={{ height: insets.bottom + Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

function EntryRow({ entry, onPress }: { entry: MitlerEntry; onPress: () => void }) {
  const accent = KIND_COLOR[entry.kind];
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.rowImgWrap, { borderColor: accent + '40' }]}>
        <Text style={styles.rowEmoji}>{entry.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{entry.name}</Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          <Text style={{ color: accent }}>{KIND_LABEL[entry.kind]}</Text>
          {entry.tagline ? ` · ${entry.tagline}` : ''}
        </Text>
      </View>
      <Text style={styles.rowArrow}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  back: { fontSize: Typography.size.sm, color: Colors.tealLight, letterSpacing: 0.5 },
  familyTag: { fontSize: 9, color: Colors.textMuted, letterSpacing: 2 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerCompact: { paddingTop: Spacing.xs, paddingBottom: Spacing.sm },
  subtitle: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.sm,
  },
  searchIcon: { fontSize: 14, color: Colors.gold, opacity: 0.5 },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    padding: 0,
  },
  clearBtn: { fontSize: Typography.size.sm, color: Colors.textMuted, paddingHorizontal: Spacing.xs },
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: Spacing.md,
  },
  filterRow: {
    paddingHorizontal: Spacing.lg,
    gap: 6,
    alignItems: 'center',
  },
  filterBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 76,
  },
  filterBtnActive: {
    borderColor: Colors.teal,
    backgroundColor: Colors.teal + '15',
  },
  filterLabel: {
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.5,
    fontWeight: Typography.weight.medium,
  },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  empty: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    marginTop: Spacing.xl,
    fontStyle: 'italic',
  },
  group: { marginBottom: Spacing.lg },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  groupDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.tealLight },
  groupLetter: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.tealLight,
    letterSpacing: 2,
  },
  groupLine: { flex: 1, height: 1, backgroundColor: Colors.divider },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowImgWrap: {
    width: 44, height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.backgroundCard,
  },
  rowEmoji: { fontSize: 22 },
  rowName: { fontSize: Typography.size.md, color: Colors.textPrimary, letterSpacing: 0.3 },
  rowMeta: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2 },
  rowArrow: { fontSize: Typography.size.sm, color: Colors.textMuted },
});
