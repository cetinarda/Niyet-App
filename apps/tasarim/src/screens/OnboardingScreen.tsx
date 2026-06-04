import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { Starfield } from '../components/Starfield';

interface Props {
  onAccept: () => void;
}

const PRIVACY_URL = 'https://sakin.life/tasarim/gizlilik';
const TERMS_URL = 'https://sakin.life/tasarim/kosullar';

export function OnboardingScreen({ onAccept }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [adult, setAdult] = useState(false);
  const [accepts, setAccepts] = useState(false);

  if (step === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xxxl, paddingBottom: insets.bottom + Spacing.xl }]}>
        <Starfield width={520} height={420} density={0.7} seed={11} />
        <View style={styles.medallionWrap}>
          <Text style={styles.medallion}>✦</Text>
        </View>
        <Text style={styles.title}>Sakin Tasarım</Text>
        <Text style={styles.subtitle}>sakin.life ekosistemine hoş geldin</Text>

        <Text style={styles.body}>
          Doğum tarih, saat ve şehrini girdiğinde Human Design haritanı (bodygraph)
          çıkartırız. Tip, içsel yetki, profil, tanımlı ve tanımsız merkezler
          üzerinden detaylı bir kişisel rapor sunarız.
        </Text>

        <View style={styles.featureRow}>
          <Feature emoji="🔒" title="Gizlilik" desc="Doğum verin sadece cihazında kalır; sunucuya gitmez." />
          <Feature emoji="🪶" title="Hesap yok" desc="Üyelik yok. Reklam yok. Abonelik yok." />
          <Feature emoji="📜" title="Eğitim amaçlı" desc="Tıbbi, psikolojik ya da finansal tavsiye değildir." />
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setStep(1)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Devam et"
        >
          <Text style={styles.primaryBtnText}>Devam Et →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 1) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <Text style={styles.kicker}>BİLMEN GEREKENLER</Text>
        <Text style={styles.h2}>Saydam olalım</Text>

        <Block title="Verilerin nerede kalır?">
          İsim, doğum tarihi, saat ve şehir bilgisini girdiğinde bu veriler yalnızca
          telefonunun yerel deposunda (AsyncStorage) saklanır. Hiçbir sunucuya
          gönderilmez. Tüm gezegen pozisyonu hesaplamaları, harita üretimi ve raporlar
          cihazında, çevrimdışı olarak yapılır.
        </Block>

        <Block title="Topladığımız veri">
          Yalnızca senin girdiğin bilgi: isim, doğum tarihi, doğum saati, doğum şehri.
          Üçüncü taraf analiz, çerez, takip yok. İstediğin zaman profilini silebilirsin.
        </Block>

        <Block title="Eğitim ve kişisel keşif amaçlı">
          Sakin Tasarım, Human Design sistemine giriş için bir referans uygulamasıdır.
          İçerik tıbbi tanı, psikolojik terapi, finansal danışmanlık veya kehanet
          değildir. Sağlık, ruh sağlığı veya yaşamsal kararlar için profesyonel destek al.
        </Block>

        <Block title="Çocuklar için değil">
          Uygulama 17 yaş ve üzeri için tasarlanmıştır. Ezoterik içerik ve manevi
          kavramlar içerir.
        </Block>

        <View style={styles.linkRow}>
          <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)} accessibilityRole="link">
            <Text style={styles.link}>Gizlilik Politikası ↗</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)} accessibilityRole="link">
            <Text style={styles.link}>Kullanım Koşulları ↗</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setStep(2)}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.primaryBtnText}>Anladım →</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // step 2 — onam
  const canProceed = adult && accepts;
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}
    >
      <Text style={styles.kicker}>SON ADIM</Text>
      <Text style={styles.h2}>Onam</Text>
      <Text style={styles.body}>
        Devam etmek için aşağıdaki iki maddeyi onaylaman gerekiyor.
      </Text>

      <CheckRow
        checked={adult}
        onToggle={() => setAdult(!adult)}
        label="17 yaşından büyüğüm."
      />
      <CheckRow
        checked={accepts}
        onToggle={() => setAccepts(!accepts)}
        label="Gizlilik Politikası ve Kullanım Koşulları'nı okudum, kabul ediyorum. İçeriğin eğitim/kişisel keşif amaçlı olduğunu, tıbbi ya da profesyonel tavsiye yerine geçmediğini biliyorum."
      />

      <TouchableOpacity
        style={[styles.primaryBtn, !canProceed && styles.primaryBtnDisabled]}
        onPress={canProceed ? onAccept : undefined}
        activeOpacity={canProceed ? 0.85 : 1}
        disabled={!canProceed}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canProceed }}
      >
        <Text style={styles.primaryBtnText}>
          {canProceed ? 'Başla →' : 'İki kutuyu işaretle'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        Onayını cihazında saklarız. Bu ekranı yalnızca bir kez göreceksin.
      </Text>
    </ScrollView>
  );
}

function Feature({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      <Text style={styles.blockBody}>{children}</Text>
    </View>
  );
}

function CheckRow({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <TouchableOpacity
      style={styles.checkRow}
      onPress={onToggle}
      activeOpacity={0.85}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
    >
      <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
        {checked && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg },

  medallionWrap: {
    alignItems: 'center', marginBottom: Spacing.xl,
  },
  medallion: { fontSize: 80, color: Colors.gold, opacity: 0.9 },

  title: {
    fontSize: Typography.size.display,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    letterSpacing: 1.2,
    color: Colors.gold,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.xxl,
  },
  body: {
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    lineHeight: Typography.size.md * 1.6,
    paddingHorizontal: Spacing.lg,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  kicker: {
    fontSize: 10, letterSpacing: 2, color: Colors.gold, marginBottom: 4,
  },
  h2: {
    fontSize: Typography.size.xxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    marginBottom: Spacing.md,
  },

  featureRow: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  feature: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  featureEmoji: { fontSize: 22, marginBottom: 4 },
  featureTitle: {
    fontSize: Typography.size.md, color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  featureDesc: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    marginTop: 2, lineHeight: Typography.size.sm * 1.5,
  },

  block: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
  },
  blockTitle: {
    fontSize: Typography.size.md, color: Colors.text,
    fontWeight: Typography.weight.semibold, marginBottom: 4,
  },
  blockBody: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.6,
  },

  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: Spacing.md,
  },
  link: {
    fontSize: Typography.size.sm,
    color: Colors.purpleSoft,
    textDecorationLine: 'underline',
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  checkBox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  checkBoxOn: { backgroundColor: Colors.gold },
  checkMark: { color: Colors.background, fontWeight: '700', fontSize: 14 },
  checkLabel: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.text,
    lineHeight: Typography.size.sm * 1.55,
  },

  primaryBtn: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    alignSelf: 'center',
    marginTop: Spacing.lg,
    ...Shadows.gold,
  },
  primaryBtnDisabled: {
    backgroundColor: Colors.surface,
    ...Shadows.card,
  },
  primaryBtnText: {
    color: Colors.background,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.md,
    letterSpacing: 0.4,
  },

  footerNote: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    textAlign: 'center', marginTop: Spacing.xl,
    fontStyle: 'italic',
  },
});
