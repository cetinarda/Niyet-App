import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, TAB_BAR_HEIGHT } from '../theme/colors';
import stonesData from '../data/plants.json';
import { AnimalDetailScreen } from './AnimalDetailScreen';
import { useI18n } from '../i18n/useI18n';
import { useLocalizedStones } from '../i18n/localize';

interface Props {
  onClose: () => void;
  embedded?: boolean;
}

type Stone = typeof stonesData[0];

export function AnimalLibraryScreen({ onClose, embedded }: Props) {
  const insets = useSafeAreaInsets();
  const { t, lang } = useI18n();
  const stones = useLocalizedStones();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Stone | null>(null);

  const sorted = useMemo(() => {
    return [...stones].sort((a, b) => a.name.localeCompare(b.name, lang === 'tr' ? 'tr' : 'en'));
  }, [stones, lang]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.properties || []).some((p: string) => p.toLowerCase().includes(q)) ||
      s.element.toLowerCase().includes(q) ||
      (s.chakra || '').toLowerCase().includes(q)
    );
  }, [query, sorted]);

  // Group by first letter
  const groups = useMemo(() => {
    const map = new Map<string, Stone[]>();
    for (const s of filtered) {
      const letter = s.name[0].toLocaleUpperCase(lang === 'tr' ? 'tr' : 'en');
      const list = map.get(letter) || [];
      list.push(s);
      map.set(letter, list);
    }
    return Array.from(map.entries());
  }, [filtered, lang]);

  if (selected) {
    return <AnimalDetailScreen stone={selected as any} onClose={() => setSelected(null)} />;
  }

  return (
    <View style={styles.root}>
      {!embedded && (
        <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.back}>{t('animalLibrary.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.familyTag}>{t('animalLibrary.familyTag')}</Text>
        </View>
      )}

      <View style={[styles.header, embedded && styles.headerCompact]}>
        <Text style={styles.subtitle}>
          {t('animalLibrary.subtitle').replace('{count}', String(stones.length))}
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>✦</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={t('animalLibrary.searchPlaceholder')}
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
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {groups.length === 0 && (
          <Text style={styles.empty}>{t('animalLibrary.noResults')}</Text>
        )}
        {groups.map(([letter, items]) => (
          <View key={letter} style={styles.group}>
            <View style={styles.groupHead}>
              <View style={styles.groupDot} />
              <Text style={styles.groupLetter}>{letter}</Text>
              <View style={styles.groupLine} />
            </View>
            {items.map(stone => (
              <StoneRow
                key={stone.id}
                stone={stone}
                onPress={() => setSelected(stone)}
              />
            ))}
          </View>
        ))}
        <View style={{ height: insets.bottom + TAB_BAR_HEIGHT + Spacing.md }} />
      </ScrollView>
    </View>
  );
}

function StoneRow({ stone, onPress }: { stone: Stone; onPress: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  const url = (stone as any).imageUrl as string | undefined;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowImgWrap}>
        {url && !imgErr ? (
          <Image source={{ uri: url }} style={styles.rowImg} onError={() => setImgErr(true)} />
        ) : (
          <Text style={styles.rowEmoji}>{stone.emoji}</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{stone.name}</Text>
        <Text style={styles.rowMeta}>
          {stone.element} · {stone.chakra}
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
  back: {
    fontSize: Typography.size.sm,
    color: Colors.tealLight,
    letterSpacing: 0.5,
  },
  familyTag: {
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerCompact: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.light,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
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
    marginBottom: Spacing.md,
  },
  searchIcon: {
    fontSize: 14,
    color: Colors.gold,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    padding: 0,
  },
  clearBtn: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.xs,
  },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
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
  groupDot: {
    width: 4, height: 4,
    borderRadius: 2,
    backgroundColor: Colors.tealLight,
  },
  groupLetter: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.tealLight,
    letterSpacing: 2,
  },
  groupLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
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
    borderColor: Colors.teal + '40',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.backgroundCard,
  },
  rowImg: { width: 44, height: 44, borderRadius: 22 },
  rowEmoji: { fontSize: 22 },
  rowName: {
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  rowMeta: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rowArrow: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
  },
});
