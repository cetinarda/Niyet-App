import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';
import { Colors } from '../theme/colors';

/**
 * Web-only sticky footer with policy links.
 * Renders nothing on iOS/Android — those use the in-app legal links in PaywallScreen/ProfileScreen.
 */
export function WebFooter() {
  if (Platform.OS !== 'web') return null;

  const open = (path: string) => {
    if (typeof window !== 'undefined') window.location.href = path;
    else Linking.openURL(path);
  };

  const links = [
    { label: 'SAKİN NEDİR?', path: '/about' },
    { label: 'FİYATLANDIRMA', path: '/pricing' },
    { label: 'HİZMET ŞARTLARI', path: '/terms' },
    { label: 'GİZLİLİK', path: '/privacy' },
    { label: 'İADE', path: '/refund' },
    { label: 'DESTEK', path: '/support' },
  ];

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
