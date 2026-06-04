import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import {
  GLOSSARY, CATEGORY_LABELS, CATEGORY_ORDER, GlossaryCategory,
  searchGlossary, GlossaryEntry,
} from '../data/glossary';

type Filter = 'all' | GlossaryCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Hepsi' },
  ...CATEGORY_ORDER.map(c => ({ key: c, label: CATEGORY_LABELS[c] })),
];

export function GlossaryScreen() {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const results = useMemo(
    () => searchGlossary(q, filter === 'all' ? undefined : filter),
    [q, filter]
  );

  const totalLabel = q.trim()
    ? `${results.length} sonuç`
    : `${GLOSSARY.length} terim`;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.xxl }]}>
      <View style={styles.headerBlock}>
        <Text style={styles.brand}>SAKİN · TASARIM</Text>
        <Text style={styles.title}>Sözlük</Text>
        <Text style={styles.subtitle}>
          Human Design terimlerini ara · {totalLabel}
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>✦</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="örn. Sakral Yetki, Kapı 41, Manifestor..."
          placeholderTextColor={Colors.textMuted}
          value={q}
          onChangeText={setQ}
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel="Sözlükte ara"
        />
        {!!q && (
          <TouchableOpacity
            onPress={() => setQ('')}
            accessibilityRole="button"
            accessibilityLabel="Aramayı temizle"
          >
            <Text style={styles.searchClear}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}
        contentContainerStyle={styles.filtersInner}
      >
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterPill, active && styles.filterPillActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={f.label}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: Spacing.xxl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {results.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Eşleşme yok</Text>
            <Text style={styles.emptyDesc}>
              "{q}" için sözlükte sonuç bulunamadı. Filtre değiştir ya da
              farklı bir terim dene.
            </Text>
          </View>
        ) : (
          results.map((entry) => (
            <Row
              key={entry.id}
              entry={entry}
              open={openId === entry.id}
              onToggle={() => setOpenId(openId === entry.id ? null : entry.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function Row({
  entry, open, onToggle,
}: { entry: GlossaryEntry; open: boolean; onToggle: () => void }) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.rowHead}
        onPress={onToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={entry.name}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.rowCat}>{entry.categoryLabel}</Text>
          <Text style={styles.rowName}>{entry.name}</Text>
          {!!entry.subtitle && (
            <Text style={styles.rowSub}>{entry.subtitle}</Text>
          )}
        </View>
        <Text style={styles.rowChev}>{open ? '−' : '+'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.rowBody}>
          <Text style={styles.rowBodyText}>{entry.body}</Text>
          {entry.details?.map((d, i) => (
            <Text key={i} style={styles.rowDetail}>·  {d}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.xl },

  headerBlock: {
    marginBottom: Spacing.lg,
  },
  brand: {
    fontSize: 11, letterSpacing: 3, color: Colors.textMuted,
    fontWeight: Typography.weight.medium,
  },
  title: {
    fontSize: Typography.size.xxxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  searchIcon: {
    fontSize: 16,
    color: Colors.gold,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: Typography.size.md,
    paddingVertical: 0,
  },
  searchClear: {
    color: Colors.textMuted,
    fontSize: 22,
    paddingHorizontal: 8,
  },

  filtersRow: {
    maxHeight: 44,
    marginBottom: Spacing.md,
  },
  filtersInner: {
    gap: 6,
    paddingRight: Spacing.md,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  filterPillActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  filterText: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  filterTextActive: {
    color: Colors.background,
    fontWeight: Typography.weight.semibold,
  },

  list: { flex: 1 },

  row: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  rowCat: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  rowName: {
    fontSize: Typography.size.md,
    color: Colors.text,
    fontWeight: Typography.weight.regular,
  },
  rowSub: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rowChev: {
    fontSize: 22,
    color: Colors.textMuted,
    marginLeft: Spacing.md,
  },
  rowBody: {
    paddingBottom: Spacing.lg,
    paddingRight: Spacing.lg,
  },
  rowBodyText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.6,
  },
  rowDetail: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: 6,
    lineHeight: Typography.size.sm * 1.5,
  },

  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.size.lg,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.size.sm * 1.6,
  },
});
