import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, TAB_BAR_HEIGHT } from '../theme/colors';
import { useTuraStore } from '../store/useStore';
import { useI18n } from '../i18n/useI18n';

import { useLocalizedAnimals, useLocalizedQuotes, useLocalizedNaguals, useLocalizedStones } from '../i18n/localize';

type FilterType = 'all' | 'quote' | 'stone' | 'animal' | 'nagual';

const FILTERS: { key: FilterType; color: string }[] = [
  { key: 'all',    color: Colors.gold },
  { key: 'quote',  color: Colors.gold },
  { key: 'stone',  color: Colors.purple },
  { key: 'animal', color: Colors.teal },
  { key: 'nagual', color: Colors.ember },
];

export function ArchiveScreen() {
  const insets = useSafeAreaInsets();
  const { t, lang } = useI18n();
  const { archive, stats, getTopStat } = useTuraStore();
  const animals = useLocalizedAnimals();
  const quotes = useLocalizedQuotes();
  const naguals = useLocalizedNaguals();
  const stones = useLocalizedStones();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const topSource = getTopStat(stats.sourceCounts);
  const topStoneId = getTopStat(stats.stoneCounts);
  const topAnimalId = getTopStat(stats.animalCounts);
  const topNagualId = getTopStat(stats.nagualCounts || {});

  const topStone = topStoneId ? stones.find(s => s.id === topStoneId) : null;
  const topAnimal = topAnimalId ? animals.find(a => a.id === topAnimalId) : null;
  const topNagual = topNagualId ? naguals.find(n => n.id === topNagualId) : null;

  const formattedDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const locale = lang === 'en' ? 'en-US' : 'tr-TR';
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const renderEntry = ({ item }: { item: typeof archive[0] }) => {
    const quote = quotes.find(q => q.id === item.quoteId);
    const stone = stones.find(s => s.id === item.stoneId);
    const animal = animals.find(a => a.id === item.animalId);
    const nagual = naguals.find(n => n.id === (item as any).nagualId);
    const isExpanded = expanded === item.date;

    return (
      <TouchableOpacity
        style={styles.entryCard}
        onPress={() => setExpanded(isExpanded ? null : item.date)}
        activeOpacity={0.85}
      >
        <View style={styles.entryHeader}>
          <Text style={styles.entryDate}>{formattedDate(item.date)}</Text>
          <Text style={styles.entryChevron}>{isExpanded ? '▲' : '▼'}</Text>
        </View>

        <View style={styles.entryPills}>
          {(filter === 'all' || filter === 'quote') && (
            <View style={[styles.pill, { borderColor: Colors.goldDark }]}>
              <Text style={[styles.pillText, { color: Colors.gold }]} numberOfLines={1}>
                {quote?.source || '—'}
              </Text>
            </View>
          )}
          {(filter === 'all' || filter === 'stone') && stone && (
            <View style={[styles.pill, { borderColor: Colors.purpleDark }]}>
              <Text style={[styles.pillText, { color: Colors.purpleLight }]} numberOfLines={1}>
                {stone.emoji} {stone.name}
              </Text>
            </View>
          )}
          {(filter === 'all' || filter === 'animal') && animal && (
            <View style={[styles.pill, { borderColor: Colors.tealDark }]}>
              <Text style={[styles.pillText, { color: Colors.tealLight }]} numberOfLines={1}>
                {animal.emoji} {animal.name}
              </Text>
            </View>
          )}
          {(filter === 'all' || filter === 'nagual') && nagual && (
            <View style={[styles.pill, { borderColor: Colors.emberDark }]}>
              <Text style={[styles.pillText, { color: Colors.emberLight }]} numberOfLines={1}>
                {nagual.emoji} {nagual.name}
              </Text>
            </View>
          )}
        </View>

        {isExpanded && (
          <View style={styles.entryExpanded}>
            {quote && (filter === 'all' || filter === 'quote') && (
              <View style={styles.expandSection}>
                <Text style={[styles.expandLabel, { color: Colors.gold }]}>{quote.source}</Text>
                <Text style={styles.expandText}>{quote.text}</Text>
              </View>
            )}
            {stone && (filter === 'all' || filter === 'stone') && (
              <View style={styles.expandSection}>
                <Text style={[styles.expandLabel, { color: Colors.purpleLight }]}>
                  {stone.emoji} {stone.name}
                </Text>
                <Text style={styles.expandText}>{stone.dailyMessage}</Text>
              </View>
            )}
            {animal && (filter === 'all' || filter === 'animal') && (
              <View style={styles.expandSection}>
                <Text style={[styles.expandLabel, { color: Colors.tealLight }]}>
                  {animal.emoji} {animal.name}
                </Text>
                <Text style={styles.expandText}>{animal.dailyMessage}</Text>
              </View>
            )}
            {nagual && (filter === 'all' || filter === 'nagual') && (
              <View style={styles.expandSection}>
                <Text style={[styles.expandLabel, { color: Colors.emberLight }]}>
                  {nagual.emoji} {nagual.name}
                </Text>
                <Text style={styles.expandText}>{nagual.dailyMessage}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('archive.title')}</Text>
        <Text style={styles.subtitle}>{t('archive.readingsCount').replace('{n}', String(archive.length))}</Text>
      </View>

      {archive.length > 0 && (
        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>{t('archive.spiritualMap')}</Text>
          <View style={styles.reportRow}>
            {topSource && (
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>{t('archive.reportLabels.guide')}</Text>
                <Text style={[styles.reportValue, { color: Colors.gold }]}>{topSource}</Text>
              </View>
            )}
            {topStone && (
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>{t('archive.reportLabels.stone')}</Text>
                <Text style={[styles.reportValue, { color: Colors.purpleLight }]}>{topStone.name}</Text>
              </View>
            )}
            {topAnimal && (
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>{t('archive.reportLabels.animal')}</Text>
                <Text style={[styles.reportValue, { color: Colors.tealLight }]}>{topAnimal.name}</Text>
              </View>
            )}
            {topNagual && (
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>{t('archive.reportLabels.nagual')}</Text>
                <Text style={[styles.reportValue, { color: Colors.emberLight }]}>{topNagual.name}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && { borderColor: f.color }]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, { color: filter === f.key ? f.color : Colors.textMuted }]}>
              {t(('archive.filters.' + f.key) as any)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {archive.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('archive.empty.title')}</Text>
          <Text style={styles.emptySubtext}>{t('archive.empty.subtitle')}</Text>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={archive}
          keyExtractor={item => item.date}
          renderItem={renderEntry}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  reportCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  reportTitle: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reportItem: {
    alignItems: 'center',
    flex: 1,
  },
  reportLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginBottom: 3,
  },
  reportValue: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: TAB_BAR_HEIGHT + Spacing.lg,
  },
  entryCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  entryDate: {
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.medium,
  },
  entryChevron: {
    fontSize: 9,
    color: Colors.textMuted,
  },
  entryPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
  },
  pillText: {
    fontSize: Typography.size.xs,
  },
  entryExpanded: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  expandSection: {
    gap: 5,
  },
  expandLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.3,
  },
  expandText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.7,
    fontStyle: 'italic',
    fontWeight: Typography.weight.light,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.medium,
  },
  emptySubtext: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
  },
});
