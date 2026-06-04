import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { useMitlerStore } from '../store/useStore';

import { useData } from '../data/loader';

type FilterType = 'all' | 'archetype' | 'myth' | 'image';

const FILTERS: { key: FilterType; label: string; color: string }[] = [
  { key: 'all',       label: 'Tümü',      color: Colors.gold },
  { key: 'archetype', label: 'Arketip',   color: Colors.gold },
  { key: 'myth',      label: 'Mit',       color: Colors.purple },
  { key: 'image',     label: 'İmge',      color: Colors.teal },
];

export function ArchiveScreen() {
  const insets = useSafeAreaInsets();
  const { archive, stats, getTopStat } = useMitlerStore();
  const { archetypes: archetypesData, myths: mythsData, images: imagesData } = useData();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const topArchetypeId = getTopStat(stats.archetypeCounts);
  const topMythId      = getTopStat(stats.mythCounts);
  const topImageId     = getTopStat(stats.imageCounts);
  const topTradition   = getTopStat(stats.traditionCounts);

  const topArchetype = topArchetypeId ? archetypesData.find(a => a.id === topArchetypeId) : null;
  const topMyth      = topMythId      ? mythsData.find(m => m.id === topMythId)           : null;
  const topImage     = topImageId     ? imagesData.find(i => i.id === topImageId)         : null;

  const formattedDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const renderEntry = ({ item }: { item: typeof archive[0] }) => {
    const archetype = archetypesData.find(a => a.id === item.archetypeId);
    const myth      = mythsData.find(m => m.id === item.mythId);
    const image     = imagesData.find(i => i.id === item.imageId);
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
          {(filter === 'all' || filter === 'archetype') && archetype && (
            <View style={[styles.pill, { borderColor: Colors.goldDark }]}>
              <Text style={[styles.pillText, { color: Colors.gold }]} numberOfLines={1}>
                {archetype.emoji} {archetype.name}
              </Text>
            </View>
          )}
          {(filter === 'all' || filter === 'myth') && myth && (
            <View style={[styles.pill, { borderColor: Colors.purpleDark }]}>
              <Text style={[styles.pillText, { color: Colors.purpleLight }]} numberOfLines={1}>
                {myth.emoji} {myth.name}
              </Text>
            </View>
          )}
          {(filter === 'all' || filter === 'image') && image && (
            <View style={[styles.pill, { borderColor: Colors.tealDark }]}>
              <Text style={[styles.pillText, { color: Colors.tealLight }]} numberOfLines={1}>
                {image.emoji} {image.name}
              </Text>
            </View>
          )}
        </View>
        {isExpanded && (
          <View style={styles.entryExpanded}>
            {archetype && (filter === 'all' || filter === 'archetype') && (
              <View style={styles.expandSection}>
                <Text style={[styles.expandLabel, { color: Colors.gold }]}>
                  {archetype.emoji} {archetype.name} · {archetype.tradition}
                </Text>
                <Text style={styles.expandText}>{archetype.essence}</Text>
                <Text style={[styles.expandSubLabel, { color: Colors.purpleLight }]}>🌙 Rüyada</Text>
                <Text style={styles.expandText}>{archetype.dreamMeaning}</Text>
                <Text style={[styles.expandSubLabel, { color: Colors.tealLight }]}>☀ Gerçekte</Text>
                <Text style={styles.expandText}>{archetype.wakingMeaning}</Text>
              </View>
            )}
            {myth && (filter === 'all' || filter === 'myth') && (
              <View style={styles.expandSection}>
                <Text style={[styles.expandLabel, { color: Colors.purpleLight }]}>
                  {myth.emoji} {myth.name} · {myth.culture}
                </Text>
                <Text style={styles.expandText}>{myth.summary}</Text>
                <Text style={[styles.expandSubLabel, { color: Colors.purpleLight }]}>🌙 Rüyada</Text>
                <Text style={styles.expandText}>{myth.dreamMeaning}</Text>
                <Text style={[styles.expandSubLabel, { color: Colors.tealLight }]}>☀ Gerçekte</Text>
                <Text style={styles.expandText}>{myth.wakingMeaning}</Text>
              </View>
            )}
            {image && (filter === 'all' || filter === 'image') && (
              <View style={styles.expandSection}>
                <Text style={[styles.expandLabel, { color: Colors.tealLight }]}>
                  {image.emoji} {image.name} · {image.tradition}
                </Text>
                <Text style={styles.expandText}>{image.essence}</Text>
                <Text style={[styles.expandSubLabel, { color: Colors.purpleLight }]}>🌙 Rüyada</Text>
                <Text style={styles.expandText}>{image.dreamMeaning}</Text>
                <Text style={[styles.expandSubLabel, { color: Colors.tealLight }]}>☀ Gerçekte</Text>
                <Text style={styles.expandText}>{image.wakingMeaning}</Text>
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
        <Text style={styles.title}>Arşiv</Text>
        <Text style={styles.subtitle}>{archive.length} okuma</Text>
      </View>
      {archive.length > 0 && (
        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>Mit Haritan</Text>
          <View style={styles.reportRow}>
            {topArchetype && (
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>Arketip</Text>
                <Text style={[styles.reportValue, { color: Colors.gold }]}>{topArchetype.name}</Text>
              </View>
            )}
            {topMyth && (
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>Mit</Text>
                <Text style={[styles.reportValue, { color: Colors.purpleLight }]}>{topMyth.name}</Text>
              </View>
            )}
            {topImage && (
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>İmge</Text>
                <Text style={[styles.reportValue, { color: Colors.tealLight }]}>{topImage.name}</Text>
              </View>
            )}
            {topTradition && (
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>Gelenek</Text>
                <Text style={[styles.reportValue, { color: Colors.emberLight }]}>{topTradition}</Text>
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
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {archive.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Henüz okuma yok.</Text>
          <Text style={styles.emptySubtext}>Ana ekrandan ilk destenı aç.</Text>
        </View>
      ) : (
        <FlatList
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
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  title: { fontSize: Typography.size.xxxl, fontWeight: Typography.weight.bold, color: Colors.textPrimary, letterSpacing: 0.5 },
  subtitle: { fontSize: Typography.size.sm, color: Colors.textMuted, marginTop: 2 },
  reportCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.divider,
  },
  reportTitle: { fontSize: Typography.size.xs, color: Colors.textMuted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: Spacing.md },
  reportRow: { flexDirection: 'row', justifyContent: 'space-around' },
  reportItem: { alignItems: 'center', flex: 1 },
  reportLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, marginBottom: 3 },
  reportValue: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold, textAlign: 'center' },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: Spacing.md, gap: Spacing.xs },
  filterBtn: {
    flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundSecondary, alignItems: 'center',
    borderWidth: 1, borderColor: 'transparent',
  },
  filterLabel: { fontSize: Typography.size.xs, fontWeight: Typography.weight.medium },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxxl },
  entryCard: {
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.divider,
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  entryDate: { fontSize: Typography.size.sm, color: Colors.textPrimary, fontWeight: Typography.weight.medium },
  entryChevron: { fontSize: 9, color: Colors.textMuted },
  entryPills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  pill: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.round, borderWidth: 1 },
  pillText: { fontSize: Typography.size.xs },
  entryExpanded: { marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: Spacing.md, gap: Spacing.md },
  expandSection: { gap: 5 },
  expandLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, letterSpacing: 0.3 },
  expandSubLabel: { fontSize: 10, fontWeight: Typography.weight.semibold, letterSpacing: 1.2, marginTop: 6, textTransform: 'uppercase' },
  expandText: { fontSize: Typography.size.sm, color: Colors.textSecondary, lineHeight: Typography.size.sm * 1.7, fontWeight: Typography.weight.light },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyText: { fontSize: Typography.size.lg, color: Colors.textPrimary, fontWeight: Typography.weight.medium },
  emptySubtext: { fontSize: Typography.size.sm, color: Colors.textMuted },
});
