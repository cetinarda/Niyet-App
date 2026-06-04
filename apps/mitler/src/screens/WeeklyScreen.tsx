import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { useData, Archetype, Myth, ImageItem } from '../data/loader';
import { useMitlerStore } from '../store/useStore';
import { calcLifePath } from '../utils/numerology';
import { MitlerDetailScreen, MitlerEntry } from './MitlerDetailScreen';

interface Props { onClose: () => void; embedded?: boolean; }

function weekIndex(): number {
  return Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
}

function getWeekly(
  archetypesData: any[],
  mythsData: any[],
  imagesData: any[],
) {
  const w = weekIndex();
  return {
    archetype: archetypesData[w % archetypesData.length],
    myth:      mythsData[(w * 3) % mythsData.length],
    image:     imagesData[(w * 5) % imagesData.length],
  };
}

function getDaysRemaining(): number {
  const now = new Date();
  const day = now.getDay();
  const daysToMonday = (8 - day) % 7 || 7;
  return daysToMonday;
}

function getPersonal(birthDate: string, archetypesData: any[]): {
  archetype: any;
  lifePath: number;
  reason: string;
} {
  const lifePath = calcLifePath(birthDate);
  const w = weekIndex();
  const seed = (lifePath * 11 + w) % archetypesData.length;
  const archetype = archetypesData[seed];

  const reason = `Hayat Yolu ${lifePath} — bu dönemde içsel ritmine eşlik etmek için seninle.`;
  return { archetype, lifePath, reason };
}

export function WeeklyScreen({ onClose, embedded }: Props) {
  const insets = useSafeAreaInsets();
  const { profile } = useMitlerStore();
  const { archetypes: archetypesData, myths: mythsData, images: imagesData } = useData();
  const weekly = useMemo(
    () => getWeekly(archetypesData as any, mythsData as any, imagesData as any),
    [archetypesData, mythsData, imagesData],
  );
  const daysLeft = getDaysRemaining();
  const [openDetail, setOpenDetail] = useState<MitlerEntry | null>(null);

  const personal = useMemo(() => {
    if (!profile?.birthDate) return null;
    try {
      return getPersonal(profile.birthDate, archetypesData as any);
    } catch {
      return null;
    }
  }, [profile?.birthDate, archetypesData]);

  const openArchetype = (a: Archetype) =>
    setOpenDetail({
      kind: 'archetype', id: a.id, name: a.name, emoji: a.emoji,
      tagline: '', detailMeta: `${a.tradition} · ${a.category}`, searchBlob: '', data: a,
    });
  const openMyth = (m: Myth) =>
    setOpenDetail({
      kind: 'myth', id: m.id, name: m.name, emoji: m.emoji,
      tagline: '', detailMeta: `${m.culture} · ${m.era}`, searchBlob: '', data: m,
    });
  const openImage = (i: ImageItem) =>
    setOpenDetail({
      kind: 'image', id: i.id, name: i.name, emoji: i.emoji,
      tagline: '', detailMeta: `${i.tradition} · ${i.category}`, searchBlob: '', data: i,
    });

  if (openDetail) {
    return <MitlerDetailScreen entry={openDetail} onClose={() => setOpenDetail(null)} />;
  }

  return (
    <View style={styles.root}>
      {!embedded && (
        <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.back}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.familyTag}>SAKİN · MİTLER</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Hafta — Dönemsel Rehber</Text>
          <Text style={styles.introText}>
            Tüm arketiplerin seninle doğar, ömür boyu kalır. Haftalık rehber ise belirli bir
            dönemine eşlik eden geçici figürdür. Bir sınav, bir geçiş, bir dönüşüm anında yanına
            gelir. Görevini tamamlayınca yerini başkasına bırakır.
          </Text>
        </View>

        {/* Universal weekly trio */}
        <TouchableOpacity
          style={[styles.heroCard, { borderColor: Colors.gold + '60' }]}
          onPress={() => openArchetype(weekly.archetype)}
          activeOpacity={0.85}
        >
          <Text style={styles.weekTag}>BU HAFTA · EVRENSEL ARKETİP</Text>
          <Text style={styles.heroEmoji}>{weekly.archetype.emoji}</Text>
          <Text style={styles.heroName}>{weekly.archetype.name}</Text>
          <Text style={[styles.heroAspect, { color: Colors.gold }]}>
            {weekly.archetype.tradition.toUpperCase()} · {weekly.archetype.category.toUpperCase()}
          </Text>
          <View style={[styles.divider, { backgroundColor: Colors.gold }]} />
          <Text style={styles.dailyMsg}>{weekly.archetype.essence}</Text>
          <View style={[styles.guideBox, { borderColor: Colors.gold + '40' }]}>
            <Text style={[styles.guideLabel, { color: Colors.gold }]}>BU DÖNEMDE</Text>
            <Text style={styles.guideText}>{weekly.archetype.advice}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{weekly.archetype.element?.toUpperCase()}</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{daysLeft} gün kaldı</Text>
          </View>
          <Text style={[styles.openHint, { color: Colors.gold }]}>Detayı Aç →</Text>
        </TouchableOpacity>

        {/* Weekly myth */}
        <TouchableOpacity
          style={[styles.heroCard, { borderColor: Colors.purpleLight + '60' }]}
          onPress={() => openMyth(weekly.myth)}
          activeOpacity={0.85}
        >
          <Text style={[styles.weekTag, { color: Colors.purpleLight }]}>BU HAFTA · MİT</Text>
          <Text style={styles.heroEmoji}>{weekly.myth.emoji}</Text>
          <Text style={styles.heroName}>{weekly.myth.name}</Text>
          <Text style={[styles.heroAspect, { color: Colors.purpleLight }]}>
            {weekly.myth.culture.toUpperCase()} · {weekly.myth.era.toUpperCase()}
          </Text>
          <View style={[styles.divider, { backgroundColor: Colors.purpleLight }]} />
          <Text style={styles.dailyMsg} numberOfLines={5}>{weekly.myth.summary}</Text>
          <View style={[styles.guideBox, { borderColor: Colors.purpleLight + '40' }]}>
            <Text style={[styles.guideLabel, { color: Colors.purpleLight }]}>DERS</Text>
            <Text style={styles.guideText}>{weekly.myth.lesson}</Text>
          </View>
          <Text style={[styles.openHint, { color: Colors.purpleLight }]}>Detayı Aç →</Text>
        </TouchableOpacity>

        {/* Weekly image */}
        <TouchableOpacity
          style={[styles.heroCard, { borderColor: Colors.tealLight + '60' }]}
          onPress={() => openImage(weekly.image)}
          activeOpacity={0.85}
        >
          <Text style={[styles.weekTag, { color: Colors.tealLight }]}>BU HAFTA · İMGE</Text>
          <Text style={styles.heroEmoji}>{weekly.image.emoji}</Text>
          <Text style={styles.heroName}>{weekly.image.name}</Text>
          <Text style={[styles.heroAspect, { color: Colors.tealLight }]}>
            {weekly.image.tradition.toUpperCase()} · {weekly.image.category.toUpperCase()}
          </Text>
          <View style={[styles.divider, { backgroundColor: Colors.tealLight }]} />
          <Text style={styles.dailyMsg} numberOfLines={5}>{weekly.image.essence}</Text>
          <View style={[styles.guideBox, { borderColor: Colors.tealLight + '40' }]}>
            <Text style={[styles.guideLabel, { color: Colors.tealLight }]}>BUGÜN</Text>
            <Text style={styles.guideText}>{weekly.image.advice}</Text>
          </View>
          <Text style={[styles.openHint, { color: Colors.tealLight }]}>Detayı Aç →</Text>
        </TouchableOpacity>

        {/* Personal weekly */}
        {personal ? (
          <TouchableOpacity
            style={[styles.personalCard, { borderColor: Colors.sakinLavender + '60' }]}
            onPress={() => openArchetype(personal.archetype)}
            activeOpacity={0.85}
          >
            <Text style={styles.personalTag}>KİŞİSEL REHBERİM</Text>
            <Text style={styles.heroEmoji}>{personal.archetype.emoji}</Text>
            <Text style={styles.heroName}>{personal.archetype.name}</Text>
            <Text style={[styles.heroAspect, { color: Colors.sakinLavender }]}>
              {personal.archetype.tradition.toUpperCase()}
            </Text>
            <View style={[styles.divider, { backgroundColor: Colors.sakinLavender }]} />
            <Text style={styles.dailyMsg}>{personal.archetype.essence}</Text>
            <View style={[styles.guideBox, { borderColor: Colors.sakinLavender + '40' }]}>
              <Text style={[styles.guideLabel, { color: Colors.sakinLavender }]}>REHBERLİK</Text>
              <Text style={styles.guideText}>{personal.archetype.advice}</Text>
            </View>
            <View style={[styles.reasonBox, { borderColor: Colors.sakinLavender + '25' }]}>
              <Text style={styles.reasonText}>{personal.reason}</Text>
            </View>
            <Text style={[styles.openHint, { color: Colors.sakinLavender }]}>Detayı Aç →</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.lockedCard}>
            <Text style={styles.lockedEmoji}>✦</Text>
            <Text style={styles.lockedTitle}>Kişisel Rehberim</Text>
            <Text style={styles.lockedText}>
              Doğum haritana göre sana özel dönemsel bir arketip belirlemek için profil
              bilgilerini tamamla.{'\n\n'}
              Profil → Kişisel Harita bölümünden doğum tarihini ekleyebilirsin.
            </Text>
          </View>
        )}

        <View style={{ height: insets.bottom + Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  back: { fontSize: Typography.size.sm, color: Colors.sakinLavender, letterSpacing: 0.5 },
  familyTag: { fontSize: 9, color: Colors.textMuted, letterSpacing: 2 },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  intro: { marginBottom: Spacing.lg },
  introTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semibold, color: Colors.textPrimary, letterSpacing: 0.5, marginBottom: Spacing.sm },
  introText: { fontSize: Typography.size.sm, color: Colors.textSecondary, lineHeight: Typography.size.sm * 1.8, fontWeight: Typography.weight.light },
  heroCard: { borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', backgroundColor: Colors.backgroundCard, marginBottom: Spacing.lg },
  weekTag: { fontSize: 9, letterSpacing: 4, color: Colors.gold, marginBottom: Spacing.md },
  heroEmoji: { fontSize: 56, marginBottom: Spacing.sm },
  heroName: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.light, color: Colors.textPrimary, letterSpacing: 1, textAlign: 'center' },
  heroAspect: { fontSize: Typography.size.xs, letterSpacing: 2, marginTop: 4, textTransform: 'uppercase', textAlign: 'center' },
  divider: { width: 28, height: 1, opacity: 0.3, marginVertical: Spacing.md },
  dailyMsg: { fontSize: Typography.size.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: Typography.size.sm * 1.85, fontStyle: 'italic', fontWeight: Typography.weight.light, marginBottom: Spacing.md },
  guideBox: { borderWidth: 1, borderRadius: BorderRadius.sm, padding: Spacing.md, width: '100%', marginBottom: Spacing.md },
  guideLabel: { fontSize: 9, letterSpacing: 2, marginBottom: 4 },
  guideText: { fontSize: Typography.size.sm, color: Colors.textPrimary, lineHeight: Typography.size.sm * 1.7 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  metaText: { fontSize: 10, color: Colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textMuted },
  openHint: { fontSize: 10, letterSpacing: 1.5, marginTop: Spacing.sm, textTransform: 'uppercase', fontWeight: Typography.weight.semibold },

  personalCard: { borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', backgroundColor: Colors.backgroundCard, marginBottom: Spacing.lg },
  personalTag: { fontSize: 9, letterSpacing: 4, color: Colors.sakinLavender, marginBottom: Spacing.md },
  reasonBox: { borderWidth: 1, borderRadius: BorderRadius.sm, padding: Spacing.md, width: '100%', borderStyle: 'dashed' },
  reasonText: { fontSize: Typography.size.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: Typography.size.xs * 1.8, fontStyle: 'italic' },
  lockedCard: { borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.cardBorder, borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  lockedEmoji: { fontSize: 28, color: Colors.sakinLavender, marginBottom: Spacing.sm },
  lockedTitle: { fontSize: Typography.size.md, color: Colors.textMuted, fontWeight: Typography.weight.semibold, letterSpacing: 1, marginBottom: Spacing.sm },
  lockedText: { fontSize: Typography.size.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: Typography.size.xs * 1.85, fontStyle: 'italic' },
});
