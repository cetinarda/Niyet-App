import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';
import { Colors } from '../theme/colors';
import { useI18n } from '../i18n/useI18n';

// Footer linkleri 7-dil (önceden hardcode Türkçe). 'Sakin' özel ad korunur.
const FLABELS: Record<string, string[]> = {
  tr: ['SAKİN NEDİR?', 'FİYATLANDIRMA', 'HİZMET ŞARTLARI', 'GİZLİLİK', 'İADE', 'DESTEK'],
  en: ['WHAT IS SAKIN?', 'PRICING', 'TERMS', 'PRIVACY', 'REFUND', 'SUPPORT'],
  de: ['WAS IST SAKIN?', 'PREISE', 'AGB', 'DATENSCHUTZ', 'RÜCKERSTATTUNG', 'SUPPORT'],
  es: ['¿QUÉ ES SAKIN?', 'PRECIOS', 'TÉRMINOS', 'PRIVACIDAD', 'REEMBOLSO', 'SOPORTE'],
  fr: ['QU’EST-CE QUE SAKIN ?', 'TARIFS', 'CONDITIONS', 'CONFIDENTIALITÉ', 'REMBOURSEMENT', 'ASSISTANCE'],
  ja: ['SAKINとは', '料金', '利用規約', 'プライバシー', '返金', 'サポート'],
  pt: ['O QUE É SAKIN?', 'PREÇOS', 'TERMOS', 'PRIVACIDADE', 'REEMBOLSO', 'SUPORTE'],
};
const FPATHS = ['/about', '/pricing', '/terms', '/privacy', '/refund', '/support'];

/**
 * Web-only sticky footer with policy links.
 * Renders nothing on iOS/Android — those use the in-app legal links in PaywallScreen/ProfileScreen.
 */
export function WebFooter() {
  const { lang } = useI18n();
  if (Platform.OS !== 'web') return null;

  const open = (path: string) => {
    if (typeof window !== 'undefined') window.location.href = path;
    else Linking.openURL(path);
  };

  const labels = FLABELS[lang] || FLABELS.tr;
  const links = FPATHS.map((path, i) => ({ label: labels[i], path }));

  return (
    <View style={styles.bar}>
      {links.map(l => (
        <TouchableOpacity key={l.path} onPress={() => open(l.path)} hitSlop={8}>
          <Text style={styles.link}>{l.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10, 9, 17, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(218, 175, 92, 0.15)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 18,
  },
  link: {
    color: Colors.sakinLavender,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '300',
  },
});
