import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { Starfield } from '../components/Starfield';
import { getLang } from '../i18n';

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
  const en = getLang() === 'en';

  if (step === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xxxl, paddingBottom: insets.bottom + Spacing.xl }]}>
        <Starfield width={520} height={420} density={0.7} seed={11} />
        <View style={styles.medallionWrap}>
          <Text style={styles.medallion}>✦</Text>
        </View>
        <Text style={styles.title}>Sakin Tasarım</Text>
        <Text style={styles.subtitle}>{en ? 'welcome to the sakin.life ecosystem' : 'sakin.life ekosistemine hoş geldin'}</Text>

        <Text style={styles.body}>
          {en
            ? 'When you enter your birth date, time and city, we generate your Human Design chart (bodygraph) and offer a detailed personal report covering your type, inner authority, profile, and defined and undefined centers.'
            : 'Doğum tarihini, saatini ve şehrini girdiğinde Human Design haritanı (bodygraph) çıkartırız. Tip, içsel yetki, profil, tanımlı ve tanımsız merkezler üzerinden detaylı bir kişisel rapor sunarız.'}
        </Text>

        <View style={styles.featureRow}>
          <Feature emoji="🔒" title={en ? 'Privacy' : 'Gizlilik'} desc={en ? 'Your birth data stays only on your device; it never goes to a server.' : 'Doğum verin sadece cihazında kalır; sunucuya gitmez.'} />
          <Feature emoji="🪶" title={en ? 'No account' : 'Hesap yok'} desc={en ? 'No sign-up. No ads. No subscription.' : 'Üyelik yok. Reklam yok. Abonelik yok.'} />
          <Feature emoji="📜" title={en ? 'Educational' : 'Eğitim amaçlı'} desc={en ? 'Not medical, psychological or financial advice.' : 'Tıbbi, psikolojik ya da finansal tavsiye değildir.'} />
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setStep(1)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={en ? 'Continue' : 'Devam et'}
        >
          <Text style={styles.primaryBtnText}>{en ? 'Continue →' : 'Devam Et →'}</Text>
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
        <Text style={styles.kicker}>{en ? 'WHAT YOU SHOULD KNOW' : 'BİLMEN GEREKENLER'}</Text>
        <Text style={styles.h2}>{en ? "Let's be transparent" : 'Saydam olalım'}</Text>

        <Block title={en ? 'Where does your data stay?' : 'Verilerin nerede kalır?'}>
          {en
            ? 'When you enter your name, birth date, time and city, this data is stored only in your phone\'s local storage (AsyncStorage). It is never sent to any server. All planetary position calculations, chart generation and reports happen on your device, offline.'
            : 'İsim, doğum tarihi, saat ve şehir bilgisini girdiğinde bu veriler yalnızca telefonunun yerel deposunda (AsyncStorage) saklanır. Hiçbir sunucuya gönderilmez. Tüm gezegen pozisyonu hesaplamaları, harita üretimi ve raporlar cihazında, çevrimdışı olarak yapılır.'}
        </Block>

        <Block title={en ? 'What we collect' : 'Topladığımız veri'}>
          {en
            ? 'Only what you enter: name, birth date, birth time, birth city. No third-party analytics, cookies or tracking. You can delete your profile anytime.'
            : 'Yalnızca senin girdiğin bilgi: isim, doğum tarihi, doğum saati, doğum şehri. Üçüncü taraf analiz, çerez, takip yok. İstediğin zaman profilini silebilirsin.'}
        </Block>

        <Block title={en ? 'For education and personal exploration' : 'Eğitim ve kişisel keşif amaçlı'}>
          {en
            ? 'Sakin Tasarım is a reference app introducing the Human Design system. The content is not medical diagnosis, psychological therapy, financial advice or fortune-telling. Seek professional support for health, mental health or life decisions.'
            : 'Sakin Tasarım, Human Design sistemine giriş için bir referans uygulamasıdır. İçerik tıbbi tanı, psikolojik terapi, finansal danışmanlık veya kehanet değildir. Sağlık, ruh sağlığı veya yaşamsal kararlar için profesyonel destek al.'}
        </Block>

        <Block title={en ? 'Not for children' : 'Çocuklar için değil'}>
          {en
            ? 'The app is designed for ages 17 and up. It contains esoteric content and spiritual concepts.'
            : 'Uygulama 17 yaş ve üzeri için tasarlanmıştır. Ezoterik içerik ve manevi kavramlar içerir.'}
        </Block>

        <View style={styles.linkRow}>
          <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)} accessibilityRole="link">
            <Text style={styles.link}>{en ? 'Privacy Policy ↗' : 'Gizlilik Politikası ↗'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)} accessibilityRole="link">
            <Text style={styles.link}>{en ? 'Terms of Use ↗' : 'Kullanım Koşulları ↗'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setStep(2)}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.primaryBtnText}>{en ? 'Understood →' : 'Anladım →'}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // step 2: onam / consent
  const canProceed = adult && accepts;
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}
    >
      <Text style={styles.kicker}>{en ? 'LAST STEP' : 'SON ADIM'}</Text>
      <Text style={styles.h2}>{en ? 'Consent' : 'Onam'}</Text>
      <Text style={styles.body}>
        {en ? 'To continue, you need to confirm the two items below.' : 'Devam etmek için aşağıdaki iki maddeyi onaylaman gerekiyor.'}
      </Text>

      <CheckRow
        checked={adult}
        onToggle={() => setAdult(!adult)}
        label={en ? 'I am over 17 years old.' : '17 yaşından büyüğüm.'}
      />
      <CheckRow
        checked={accepts}
        onToggle={() => setAccepts(!accepts)}
        label={en
          ? "I have read and accept the Privacy Policy and Terms of Use. I understand the content is for educational/personal exploration and does not replace medical or professional advice."
          : "Gizlilik Politikası ve Kullanım Koşulları'nı okudum, kabul ediyorum. İçeriğin eğitim/kişisel keşif amaçlı olduğunu, tıbbi ya da profesyonel tavsiye yerine geçmediğini biliyorum."}
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
          {canProceed ? (en ? 'Begin →' : 'Başla →') : (en ? 'Check both boxes' : 'İki kutuyu işaretle')}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        {en ? 'We store your consent on your device. You will see this screen only once.' : 'Onayını cihazında saklarız. Bu ekranı yalnızca bir kez göreceksin.'}
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
