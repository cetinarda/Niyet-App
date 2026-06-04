import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { getGlossaryEntry, GLOSSARY } from '../data/glossary';

interface Props {
  /** Glossary key from src/data/glossary.ts */
  termKey: string;
  /** Optional size variant */
  size?: 'sm' | 'md';
}

export function HelpButton({ termKey, size = 'sm' }: Props) {
  const [open, setOpen] = useState(false);
  const entry = getGlossaryEntry(termKey);

  if (!entry) return null;

  const dim = size === 'md' ? 22 : 18;
  const fontSize = size === 'md' ? 13 : 11;

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={[styles.btn, { width: dim, height: dim, borderRadius: dim / 2 }]}
        hitSlop={10}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${entry.term} terimi hakkında bilgi`}
      >
        <Text style={[styles.btnText, { fontSize }]}>?</Text>
      </TouchableOpacity>

      <GlossaryModal
        visible={open}
        initialKey={termKey}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/** Standalone glossary modal — can be shown without a specific term. */
export function GlossaryModal({
  visible,
  initialKey,
  onClose,
}: {
  visible: boolean;
  initialKey?: string;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [activeKey, setActiveKey] = useState<string | null>(initialKey || null);

  React.useEffect(() => {
    if (visible) setActiveKey(initialKey || null);
  }, [visible, initialKey]);

  const entries = Object.entries(GLOSSARY);
  const activeEntry = activeKey ? GLOSSARY[activeKey] : null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.md }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.sheetHead}>
            <View style={styles.helpBadge}>
              <Text style={styles.helpBadgeText}>?</Text>
            </View>
            <Text style={styles.sheetTitle}>
              {activeEntry ? activeEntry.term : 'Terimler Sözlüğü'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {activeEntry ? (
            <ScrollView
              contentContainerStyle={styles.detailScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.shortDesc}>{activeEntry.short}</Text>
              <View style={styles.divider} />
              <Text style={styles.longDesc}>{activeEntry.long}</Text>
              <TouchableOpacity
                style={styles.allTermsBtn}
                onPress={() => setActiveKey(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.allTermsText}>← Tüm Terimler</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView
              contentContainerStyle={styles.listScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.intro}>
                Sakin Mitler'de geçen kavramların kısa açıklamaları. Bir terime tıkla, detayını oku.
              </Text>
              {entries.map(([key, e]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.termRow}
                  onPress={() => setActiveKey(key)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.termName}>{e.term}</Text>
                    <Text style={styles.termShort}>{e.short}</Text>
                  </View>
                  <Text style={styles.termArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Floating glossary entry button — full glossary, no specific term. */
export function GlossaryFAB() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.fab}
        activeOpacity={0.85}
        hitSlop={8}
      >
        <Text style={styles.fabText}>?</Text>
      </TouchableOpacity>
      <GlossaryModal visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const RED = '#D9434E';
const RED_DARK = '#8E1F26';

const styles = StyleSheet.create({
  btn: {
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: RED_DARK,
  },
  btnText: {
    color: '#FFF',
    fontWeight: '700',
    lineHeight: undefined,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: RED_DARK,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 100,
  },
  fabText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    borderColor: Colors.cardBorder,
    maxHeight: '85%',
    paddingHorizontal: Spacing.lg,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  helpBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpBadgeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sheetTitle: {
    flex: 1,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
  closeBtn: {
    fontSize: 20,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.xs,
  },
  detailScroll: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  shortDesc: {
    fontSize: Typography.size.sm,
    color: Colors.gold,
    fontStyle: 'italic',
    lineHeight: Typography.size.sm * 1.7,
    letterSpacing: 0.3,
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginBottom: Spacing.md,
  },
  longDesc: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.85,
    fontWeight: Typography.weight.light,
  },
  allTermsBtn: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  allTermsText: {
    fontSize: Typography.size.xs,
    color: Colors.tealLight,
    letterSpacing: 1.5,
  },
  listScroll: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  intro: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: Typography.size.xs * 1.7,
    marginBottom: Spacing.md,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  termName: {
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  termShort: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    lineHeight: Typography.size.xs * 1.6,
  },
  termArrow: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
  },
});
