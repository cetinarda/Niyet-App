import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { useMitlerStore } from '../store/useStore';
import { useLanguage } from '../i18n/useLanguage';

export function DisclaimerOverlay() {
  const { disclaimerAccepted, acceptDisclaimer, isLoading } = useMitlerStore();
  const { t } = useLanguage();

  const visible = !disclaimerAccepted && !isLoading;

  const handleAccept = async () => {
    try {
      await acceptDisclaimer();
    } catch {
      // silently ignore — overlay will reattempt on next render if needed
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => {
        // Disclaimer must be explicitly accepted; no-op on hardware back.
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.divider} />
            <Text style={styles.eyebrow}>SAKİN · MİTLER</Text>

            <Text style={styles.title}>{t('disclaimer.title')}</Text>

            <Text style={styles.body}>{t('disclaimer.body')}</Text>

            <Text style={styles.footer}>{t('disclaimer.footer')}</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={handleAccept}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('disclaimer.accept')}
            >
              <Text style={styles.buttonText}>{t('disclaimer.accept')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13,11,20,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  divider: {
    width: 48,
    height: 1,
    backgroundColor: Colors.gold,
    opacity: 0.6,
    marginBottom: Spacing.md,
  },
  eyebrow: {
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 4,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.light,
    color: Colors.gold,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  body: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  footer: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: Typography.size.sm,
    color: Colors.gold,
    letterSpacing: 2,
    fontWeight: Typography.weight.medium,
  },
});
