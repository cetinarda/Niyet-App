import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { useTasarimStore } from '../store/useStore';
import { generateWeeklyReport } from '../utils/weeklyReport';

interface Props {
  onNavigate: (t: 'home' | 'chart' | 'profile' | 'report') => void;
}

export function ReportScreen({ onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  const { activeProfile, chart } = useTasarimStore();

  const report = useMemo(() => {
    if (!chart) return null;
    return generateWeeklyReport(chart);
  }, [chart]);

  if (!activeProfile || !chart || !report) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.medallion}>✦</Text>
        <Text style={styles.emptyTitle}>Rapor için harita gerekli</Text>
        <Text style={styles.emptyDesc}>
          Önce profilini oluştur; raporlar haritandan üretilir.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => onNavigate('profile')}
        >
          <Text style={styles.primaryBtnText}>Profili Oluştur →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: Spacing.xxxl }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>HAFTALIK RAPOR</Text>
      <Text style={styles.h1}>{report.theme}</Text>
      <Text style={styles.weekLine}>{report.weekLabel} · {report.weekDates}</Text>
      <Text style={styles.themeDesc}>{report.themeDesc}</Text>

      {/* 3'lü ana blok */}
      <View style={styles.triCard}>
        <Text style={styles.triEmoji}>🎯</Text>
        <Text style={styles.triKicker}>DİKKAT ET</Text>
        <Text style={styles.triTitle}>{report.attention.title}</Text>
        <Text style={styles.triBody}>{report.attention.body}</Text>
        {!!report.attention.micro && (
          <Text style={styles.triMicro}>· {report.attention.micro}</Text>
        )}
      </View>

      <View style={[styles.triCard, { borderLeftColor: Colors.tealSoft }]}>
        <Text style={styles.triEmoji}>🍃</Text>
        <Text style={[styles.triKicker, { color: Colors.tealSoft }]}>SERBEST BIRAK</Text>
        <Text style={styles.triTitle}>{report.release.title}</Text>
        <Text style={styles.triBody}>{report.release.body}</Text>
        {!!report.release.micro && (
          <Text style={styles.triMicro}>· {report.release.micro}</Text>
        )}
      </View>

      <View style={[styles.triCard, { borderLeftColor: Colors.purpleSoft }]}>
        <Text style={styles.triEmoji}>👑</Text>
        <Text style={[styles.triKicker, { color: Colors.purpleSoft }]}>SAHİPLEN</Text>
        <Text style={styles.triTitle}>{report.ownership.title}</Text>
        <Text style={styles.triBody}>{report.ownership.body}</Text>
        {!!report.ownership.micro && (
          <Text style={styles.triMicro}>· {report.ownership.micro}</Text>
        )}
      </View>

      {/* Kapı spotlight */}
      <View style={styles.spotCard}>
        <Text style={styles.spotKicker}>HAFTANIN KAPISI</Text>
        <Text style={styles.spotGate}>
          {report.spotlightGate.number}.{report.spotlightGate.line}
        </Text>
        <Text style={styles.spotName}>{report.spotlightGate.name}</Text>
        <Text style={styles.spotSection}>
          {report.spotlightGate.section === 'personality' ? 'Bilinçli (Personality)' : 'Bilinçsiz (Design)'}
        </Text>
        <Text style={styles.spotTheme}>{report.spotlightGate.theme}</Text>
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.miniLabel}>HEDİYE</Text>
            <Text style={styles.miniValue}>{report.spotlightGate.gift}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.miniLabel}>GÖLGE</Text>
            <Text style={styles.miniValue}>{report.spotlightGate.shadow}</Text>
          </View>
        </View>
      </View>

      <View style={styles.practiceCard}>
        <Text style={styles.practiceKicker}>BU HAFTANIN PRATİĞİ</Text>
        <Text style={styles.practiceBody}>{report.practice}</Text>
      </View>

      <Text style={styles.affirmation}>“{report.affirmation}”</Text>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Senin Haritana Özel</Text>
      <Text style={styles.sectionDesc}>
        Aşağıdaki bölümler haftaya değil, doğum haritana bağlıdır. Her hafta aynı kalır;
        zaman içinde bunlar üzerine derinleşirsin.
      </Text>

      {/* Uyumluluk */}
      <View style={styles.bigCard}>
        <Text style={styles.bigKicker}>🤝 KİMLERLE ANLAŞIRSIN</Text>
        <Text style={styles.bigNote}>{report.compatibility.note}</Text>

        <Text style={styles.subLabel}>Uyumlu enerjiler</Text>
        {report.compatibility.getsAlong.map((s, i) => (
          <Text key={i} style={styles.bullet}>•  {s}</Text>
        ))}

        <Text style={[styles.subLabel, { marginTop: Spacing.md, color: Colors.emberSoft }]}>
          ⚡ Gerilim yaratan enerjiler
        </Text>
        {report.compatibility.tension.map((s, i) => (
          <Text key={i} style={styles.bullet}>•  {s}</Text>
        ))}
      </View>

      {/* Bedeni Dinleme */}
      <View style={styles.bigCard}>
        <Text style={styles.bigKicker}>🫁 BEDENİNİ NASIL DİNLERSİN</Text>
        <Text style={styles.bigTitle}>{report.bodyListening.authorityName}</Text>

        <Text style={styles.subLabel}>Hissin nasıl gelir</Text>
        <Text style={styles.bigBody}>{report.bodyListening.howToFeel}</Text>

        <Text style={styles.subLabel}>Bedenin neresinde</Text>
        <Text style={styles.bigBody}>{report.bodyListening.whereInBody}</Text>

        <Text style={[styles.subLabel, { color: Colors.emberSoft }]}>Kırmızı bayrak</Text>
        <Text style={styles.bigBody}>{report.bodyListening.redFlag}</Text>

        <Text style={[styles.subLabel, { color: Colors.success }]}>Reset</Text>
        <Text style={styles.bigBody}>{report.bodyListening.reset}</Text>
      </View>

      {/* Uyarı işaretleri */}
      <View style={[styles.bigCard, { borderColor: Colors.emberSoft + '40' }]}>
        <Text style={[styles.bigKicker, { color: Colors.emberSoft }]}>🚨 UYARI İŞARETLERİ</Text>
        <Text style={styles.bigNote}>
          Yanlış yönde olduğunu gösteren bedensel/duygusal sinyaller. Bunlar düşmanın değil,
          rehberin.
        </Text>

        <Text style={styles.subLabel}>Tipinden gelen işaretler</Text>
        {report.warnings.typeSigns.map((s, i) => (
          <Text key={i} style={styles.bullet}>•  {s}</Text>
        ))}

        {report.warnings.centerSigns.length > 0 && (
          <>
            <Text style={[styles.subLabel, { marginTop: Spacing.md }]}>
              Tanımsız merkezlerinden gelen sorular
            </Text>
            {report.warnings.centerSigns.map((s, i) => (
              <View key={i} style={styles.warningRow}>
                <Text style={styles.warningTitle}>{s.title}</Text>
                <Text style={styles.warningBody}>{s.body}</Text>
                {!!s.micro && <Text style={styles.warningMicro}>{s.micro}</Text>}
              </View>
            ))}
          </>
        )}
      </View>

      {/* Söndürme ritüelleri */}
      <View style={[styles.bigCard, { borderColor: Colors.success + '40' }]}>
        <Text style={[styles.bigKicker, { color: Colors.success }]}>🌿 İKAZ LAMBALARINI SÖNDÜRME</Text>
        <Text style={styles.bigNote}>
          Uyarı işaretleri yanmaya başladığında uygulanacak somut sıfırlama ritüelleri.
        </Text>
        {report.warnings.resets.map((s, i) => (
          <Text key={i} style={styles.bullet}>•  {s}</Text>
        ))}
      </View>

      <Text style={styles.footerNote}>
        Haftalık tema, dikkat / bırak / sahiplen blokları, kapı ve pratik her hafta değişir.
        Uyumluluk, beden dinleme ve uyarı işaretleri sabit kalır.
      </Text>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>
          Sakin Tasarım eğitim ve kişisel keşif amaçlıdır. İçerik tıbbi tanı,
          psikolojik terapi, finansal danışmanlık veya kehanet niteliği taşımaz.
          Sağlık, ruh sağlığı ve yaşamsal kararlar için profesyonel destek al.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg },

  empty: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.background, paddingHorizontal: Spacing.xl,
  },
  medallion: {
    fontSize: 64, color: Colors.gold, marginBottom: Spacing.lg, opacity: 0.85,
  },
  emptyTitle: {
    fontSize: Typography.size.xxl, color: Colors.text,
    fontFamily: Typography.font.serif, marginBottom: Spacing.md,
  },
  emptyDesc: {
    fontSize: Typography.size.md, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: Typography.size.md * 1.6, marginBottom: Spacing.xl,
  },
  primaryBtn: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
  },
  primaryBtnText: {
    color: Colors.background, fontWeight: Typography.weight.bold,
  },

  kicker: { fontSize: 10, letterSpacing: 2, color: Colors.gold },
  h1: {
    fontSize: Typography.size.xxxl, color: Colors.text,
    fontFamily: Typography.font.serif, marginTop: 4,
  },
  weekLine: {
    fontSize: Typography.size.xs, letterSpacing: 1, color: Colors.textMuted,
    marginTop: 2,
  },
  themeDesc: {
    fontSize: Typography.size.md, color: Colors.textSecondary,
    lineHeight: Typography.size.md * 1.6,
    marginTop: Spacing.md, marginBottom: Spacing.lg,
  },

  triCard: {
    paddingVertical: Spacing.lg,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  triEmoji: { fontSize: 26, marginBottom: 4 },
  triKicker: {
    fontSize: 10, letterSpacing: 1.6, color: Colors.gold, marginBottom: 4,
  },
  triTitle: {
    fontSize: Typography.size.lg, color: Colors.text,
    fontWeight: Typography.weight.semibold,
    fontFamily: Typography.font.serif,
    marginBottom: 4,
  },
  triBody: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.6,
  },
  triMicro: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    marginTop: Spacing.sm, fontStyle: 'italic',
  },

  spotCard: {
    paddingVertical: Spacing.xl,
    marginVertical: Spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
  },
  spotKicker: { fontSize: 10, letterSpacing: 1.6, color: Colors.gold },
  spotGate: {
    fontSize: Typography.size.display, color: Colors.gold,
    fontFamily: Typography.font.serif, fontWeight: Typography.weight.bold,
  },
  spotName: {
    fontSize: Typography.size.lg, color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  spotSection: {
    fontSize: 10, letterSpacing: 1, color: Colors.textMuted, marginTop: 2,
  },
  spotTheme: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    marginTop: Spacing.sm, textAlign: 'center', lineHeight: Typography.size.sm * 1.5,
  },
  row2: {
    flexDirection: 'row', alignSelf: 'stretch', marginTop: Spacing.md, gap: Spacing.md,
  },
  miniLabel: { fontSize: 9, letterSpacing: 1, color: Colors.textMuted },
  miniValue: { fontSize: Typography.size.xs, color: Colors.text, marginTop: 2 },

  practiceCard: {
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  practiceKicker: {
    fontSize: 10, letterSpacing: 1.6, color: Colors.tealSoft, marginBottom: 4,
  },
  practiceBody: {
    fontSize: Typography.size.md, color: Colors.text,
    lineHeight: Typography.size.md * 1.6,
  },

  affirmation: {
    fontSize: Typography.size.md, color: Colors.gold,
    fontFamily: Typography.font.serif, fontStyle: 'italic',
    textAlign: 'center', marginVertical: Spacing.lg,
    lineHeight: Typography.size.md * 1.6,
  },

  divider: {
    height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.lg,
  },

  sectionTitle: {
    fontSize: Typography.size.xl, color: Colors.text,
    fontFamily: Typography.font.serif,
  },
  sectionDesc: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
    marginTop: 4, marginBottom: Spacing.md,
    lineHeight: Typography.size.sm * 1.5,
  },

  bigCard: {
    paddingVertical: Spacing.lg,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  bigKicker: {
    fontSize: 11, letterSpacing: 1.6, color: Colors.gold, marginBottom: 4,
  },
  bigTitle: {
    fontSize: Typography.size.lg, color: Colors.text,
    fontFamily: Typography.font.serif, marginBottom: 4,
  },
  bigNote: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.6, marginBottom: Spacing.sm,
  },
  bigBody: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.6,
  },
  subLabel: {
    fontSize: 10, letterSpacing: 1.4, color: Colors.gold,
    marginTop: Spacing.sm, marginBottom: 4,
  },
  bullet: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.6, marginBottom: 2,
  },

  warningRow: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  warningTitle: {
    fontSize: Typography.size.sm, color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  warningBody: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.5, marginTop: 2,
  },
  warningMicro: {
    fontSize: Typography.size.xs, color: Colors.success,
    marginTop: 4, fontStyle: 'italic',
  },

  footerNote: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    textAlign: 'center', marginTop: Spacing.lg,
    lineHeight: Typography.size.xs * 1.6, fontStyle: 'italic',
  },
  disclaimerBox: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  disclaimerText: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    lineHeight: Typography.size.xs * 1.7,
    fontStyle: 'italic',
  },
});
