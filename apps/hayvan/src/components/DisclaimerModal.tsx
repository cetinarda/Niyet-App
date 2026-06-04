import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { useI18n } from '../i18n/useI18n';

const DISCLAIMER_KEY = '@tura_disclaimer_shown';

export function DisclaimerModal() {
  const { t, lang } = useI18n();
  const [visible, setVisible] = useState(false);

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
          <Text style={styles.title}>
            {lang === 'en' ? 'A Note Before You Begin' : 'Başlamadan Önce'}
          </Text>
          <Text style={styles.body}>
            {lang === 'en'
              ? 'Sakin Animal Guide draws on mythology, Jungian psychology, and cultural traditions. Its content is intended for personal reflection and educational purposes only — not as medical, psychological, or spiritual advice.\n\nYour journey here is yours alone.'
              : 'Sakin Hayvan Rehberi; mitoloji, Jung psikolojisi ve kültürel geleneklerden beslenir. İçerikler yalnızca kişisel yansıma ve eğitim amaçlıdır — tıbbi, psikolojik veya spiritüel tavsiye niteliği taşımaz.\n\nBuradaki yolculuk tamamen senin.'}
          </Text>
          <TouchableOpacity style={styles.btn} onPress={dismiss} activeOpacity={0.85}>
            <Text style={styles.btnText}>
              {lang === 'en' ? 'I Understand' : 'Anladım'}
            </Text>
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
