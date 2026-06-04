import React from 'react';
import {
  Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ElementDistribution, ELEMENT_META, ElementKey } from '../utils/elements';
import { ElementPie } from './ElementPie';

const ORDER: ElementKey[] = ['ates', 'toprak', 'hava', 'su'];

export function ElementDetail({ dist, visible, onClose }: {
  dist: ElementDistribution; visible: boolean; onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  // Baskın element
  const dominant = ORDER.reduce((a, b) => (dist[b] > dist[a] ? b : a), 'ates' as ElementKey);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handleRow}>
            <View style={styles.handle} />
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityRole="button" accessibilityLabel="Kapat">
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={styles.kicker}>KOZMİK AĞIRLIK</Text>
            <Text style={styles.title}>Element Dengen</Text>

            <View style={{ alignItems: 'center', marginVertical: 18 }}>
              <ElementPie dist={dist} size={156} lang="tr" />
            </View>

            {/* Baskın element kartı */}
            <View style={[styles.dominantCard, { borderColor: ELEMENT_META[dominant].color + '55' }]}>
              <Text style={[styles.dominantGlyph, { color: ELEMENT_META[dominant].color }]}>
                {ELEMENT_META[dominant].glyph}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.dominantLabel}>Baskın element</Text>
                <Text style={[styles.dominantName, { color: ELEMENT_META[dominant].color }]}>
                  {ELEMENT_META[dominant].tr} · %{Math.round(dist[dominant] * 100)}
                </Text>
                <Text style={styles.dominantDesc}>{ELEMENT_META[dominant].desc}</Text>
              </View>
            </View>

            {/* Element başına dağılım + katkı veren gövdeler */}
            {ORDER.map((k) => {
              const planets = dist.contributions.filter((c) => c.element === k);
              if (planets.length === 0) return null;
              const meta = ELEMENT_META[k];
              return (
                <View key={k} style={styles.elemBlock}>
                  <View style={styles.elemHead}>
                    <View style={[styles.dot, { backgroundColor: meta.color }]} />
                    <Text style={styles.elemName}>{meta.tr}</Text>
                    <Text style={[styles.elemPct, { color: meta.color }]}>%{Math.round(dist[k] * 100)}</Text>
                  </View>
                  {/* ağırlık çubuğu */}
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${Math.round(dist[k] * 100)}%`, backgroundColor: meta.color }]} />
                  </View>
                  <View style={styles.planetRow}>
                    {planets
                      .slice()
                      .sort((a, b) => b.weight - a.weight)
                      .map((p) => (
                        <View key={p.key} style={styles.planetChip}>
                          <Text style={styles.planetGlyph}>{p.glyph}</Text>
                          <Text style={styles.planetTxt}>
                            {p.tr} · {p.signTr}
                            {p.dignity === 'yonetici' ? ' ⟡' : p.dignity === 'yucelme' ? ' ▲' : ''}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              );
            })}

            {/* Yöntem açıklaması */}
            <View style={styles.methodBox}>
              <Text style={styles.methodTitle}>Hesaplama nasıl yapılıyor?</Text>
              <Text style={styles.methodTxt}>
                Eşit sayım yerine her gök cismi önemine göre tartılır: Güneş ve Ay en ağır,
                kişisel gezegenler (Merkür, Venüs, Mars) orta, kuşak gezegenleri (Uranüs,
                Neptün) çok hafif. Bir gezegen yönettiği burçtaysa (⟡ yönetici) veya yüceldiği
                burçtaysa (▲ yücelme) gücü artar; aynı burçta toplanan üç+ gezegen (stellium)
                ekstra vurgu kazanır. Kuzey Ay Düğümü karmik yön olarak hafifçe katılır.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#15121f',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 22, maxHeight: '92%',
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  handleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)' },
  closeBtn: { position: 'absolute', right: 0, top: -4, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeTxt: { color: '#9b93ad', fontSize: 18 },

  kicker: { fontSize: 11, letterSpacing: 3, color: '#8a7fb0', marginTop: 4 },
  title: { fontSize: 26, color: '#efeaf7', marginTop: 4, fontWeight: '600' },

  dominantCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 18,
  },
  dominantGlyph: { fontSize: 40, width: 46, textAlign: 'center' },
  dominantLabel: { fontSize: 11, letterSpacing: 1.5, color: '#8a7fb0' },
  dominantName: { fontSize: 19, fontWeight: '600', marginTop: 2 },
  dominantDesc: { fontSize: 13, color: '#b8b0c8', lineHeight: 19, marginTop: 6 },

  elemBlock: { marginBottom: 18 },
  elemHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 9 },
  elemName: { fontSize: 15, color: '#efeaf7', flex: 1 },
  elemPct: { fontSize: 15, fontWeight: '700' },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 10 },
  barFill: { height: 6, borderRadius: 3 },
  planetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  planetChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11, gap: 5,
  },
  planetGlyph: { fontSize: 13, color: '#cfc8e0' },
  planetTxt: { fontSize: 12.5, color: '#cfc8e0' },

  methodBox: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14,
    padding: 16, marginTop: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  methodTitle: { fontSize: 13.5, color: '#efeaf7', fontWeight: '600', marginBottom: 7 },
  methodTxt: { fontSize: 12.5, color: '#a99fc2', lineHeight: 19 },
});
