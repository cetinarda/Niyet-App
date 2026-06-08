import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { useI18n } from '../i18n/useI18n';

const DISCLAIMER_KEY = '@sakintaslar_disclaimer_shown';

// 7-dil metin (lang ile seçilir). Önceden sadece tr/en vardı.
const DTEXT: Record<string, { title: string; body: string; btn: string }> = {
  tr: { title: 'Başlamadan Önce', btn: 'Anladım', body: 'Sakin Taşlar; kristal gelenekleri, kültürel bilgelik ve doğanın taşlarından beslenir. İçerikler yalnızca kişisel yansıma ve eğitim amaçlıdır — tıbbi, psikolojik veya spiritüel tavsiye niteliği taşımaz.\n\nBuradaki yolculuk tamamen senin.' },
  en: { title: 'A Note Before You Begin', btn: 'I Understand', body: 'Sakin Stones draws on crystal traditions, cultural wisdom, and the stones of nature. Its content is intended for personal reflection and educational purposes only — not as medical, psychological, or spiritual advice.\n\nYour journey here is yours alone.' },
  de: { title: 'Bevor du beginnst', btn: 'Ich verstehe', body: 'Sakin Steine schöpft aus Kristalltraditionen, kulturellem Wissen und den Steinen der Natur. Die Inhalte dienen ausschließlich der persönlichen Reflexion und Bildung — sie sind keine medizinische, psychologische oder spirituelle Beratung.\n\nDeine Reise hier gehört allein dir.' },
  es: { title: 'Antes de empezar', btn: 'Entendido', body: 'Sakin Piedras se nutre de las tradiciones del cristal, la sabiduría cultural y las piedras de la naturaleza. Su contenido es solo para la reflexión personal y fines educativos — no constituye consejo médico, psicológico ni espiritual.\n\nEl camino aquí es solo tuyo.' },
  fr: { title: 'Avant de commencer', btn: 'J’ai compris', body: 'Sakin Pierres puise dans les traditions des cristaux, la sagesse culturelle et les pierres de la nature. Son contenu est destiné à la réflexion personnelle et à l’éducation uniquement — il ne constitue pas un avis médical, psychologique ou spirituel.\n\nLe chemin ici n’appartient qu’à toi.' },
  ja: { title: 'はじめる前に', btn: 'わかりました', body: 'Sakin ストーンは、クリスタルの伝統、文化的な知恵、そして自然の石々に根ざしています。その内容は個人的な内省と学びのためのものであり、医療・心理・スピリチュアルな助言ではありません。\n\nここでの旅は、あなただけのものです。' },
  pt: { title: 'Antes de começar', btn: 'Entendi', body: 'Sakin Pedras inspira-se nas tradições dos cristais, na sabedoria cultural e nas pedras da natureza. O seu conteúdo destina-se apenas à reflexão pessoal e a fins educativos — não constitui aconselhamento médico, psicológico ou espiritual.\n\nA jornada aqui é só tua.' },
};

export function DisclaimerModal() {
  const { lang } = useI18n();
  const [visible, setVisible] = useState(false);
  const tx = DTEXT[lang] || DTEXT.tr;

  useEffect(() => {
    AsyncStorage.getItem(DISCLAIMER_KEY).then(val => {
      if (!val) setVisible(true);
    });
  }, []);

  const dismiss = async () => {
    await AsyncStorage.setItem(DISCLAIMER_KEY, '1');
    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.symbol}>✦</Text>
          <Text style={styles.title}>{tx.title}</Text>
          <Text style={styles.body}>{tx.body}</Text>
          <TouchableOpacity style={styles.btn} onPress={dismiss} activeOpacity={0.85}>
            <Text style={styles.btnText}>{tx.btn}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
    padding: Spacing.xl,
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
  },
  symbol: {
    fontSize: 36,
    color: Colors.gold,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  body: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    lineHeight: Typography.size.sm * 1.7,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  btn: {
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.round,
  },
  btnText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: '#1A1208',
    letterSpacing: 1,
  },
});
