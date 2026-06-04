import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../theme/colors';
import { useTasarimStore } from '../store/useStore';
import { Bodygraph } from '../components/Bodygraph';
import { TYPES } from '../data/types';
import { AUTHORITIES } from '../data/authorities';
import { PROFILES, LINES, ProfileKey } from '../data/profiles';
import { CENTERS, CenterKey, CENTER_ORDER } from '../data/centers';
import { GATES } from '../data/gates';
import { getActivationsByCenter, planetLabel } from '../utils/humanDesign';

interface Props {
  onNavigate: (t: 'home' | 'chart' | 'report' | 'profile') => void;
}

export function ChartScreen({ onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  const { activeProfile, chart } = useTasarimStore();
  const [openCenter, setOpenCenter] = useState<CenterKey | null>(null);
  const [openGate, setOpenGate] = useState<number | null>(null);

  if (!activeProfile || !chart) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.medallion}>✦</Text>
        <Text style={styles.emptyTitle}>Henüz harita yok</Text>
        <Text style={styles.emptyDesc}>Önce profilini oluştur.</Text>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => onNavigate('profile')}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>Profili Oluştur</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const t = TYPES[chart.type];
  const a = AUTHORITIES[chart.authority];
  const pSun = chart.personality.find(x => x.planet === 'sun')!;
  const dSun = chart.design.find(x => x.planet === 'sun')!;
  const pLine = LINES[pSun.line];
  const dLine = LINES[dSun.line];
  const p = PROFILES[chart.profile as ProfileKey] ?? {
    key: chart.profile,
    name: `${pLine.name} / ${dLine.name}`,
    theme: '',
    shortDesc: pLine.shortDesc,
    longDesc:
      `Bilinçli çizgi ${pSun.line}. ${pLine.name}: ${pLine.shortDesc} ` +
      `Bilinçsiz çizgi ${dSun.line}. ${dLine.name}: ${dLine.shortDesc}`,
  };

  const definedCenters = CENTER_ORDER.filter(k => chart.definedCenters.has(k));
  const undefinedCenters = CENTER_ORDER.filter(k => !chart.definedCenters.has(k));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, {
        paddingTop: insets.top + Spacing.xxl,
        paddingBottom: Spacing.xxl,
      }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Üst başlık */}
      <Text style={styles.brand}>SAKİN · TASARIM</Text>
      <Text style={styles.name}>{activeProfile.name}</Text>
      <Text style={styles.meta}>
        {activeProfile.birthDate} · {activeProfile.birthTime} · {activeProfile.city.name.split(',')[0]}
      </Text>

      {/* HERO — sol özet, sağ köşede küçük bodygraph */}
      <View style={styles.hero}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroType}>{chart.type}</Text>
          <Text style={styles.heroStrategy}>{chart.strategy}</Text>
          <Text style={styles.heroEssence}>{t.shortDesc}</Text>

          <View style={styles.heroFacts}>
            <Fact
              k="Profil"
              v={chart.profile}
              desc={`${p.name}${p.theme ? ' · ' + p.theme : ''}`}
            />
            <Fact
              k="Yetki"
              v={a.name.replace(' Yetki', '')}
              desc={`${a.emoji} ${a.shortDesc.split('.')[0]}`}
            />
            <Fact
              k="Tanım"
              v={chart.definition.split(' ')[0]}
              desc={
                chart.definition.startsWith('Tek')
                  ? 'Tüm tanımlı merkezler tek küme; akışkan enerji'
                  : chart.definition.startsWith('Bölünmüş')
                  ? 'İki ayrı küme; köprü kuran insanlara çekilirsin'
                  : chart.definition.startsWith('Üçlü')
                  ? 'Üç ayrı küme; üç farklı bağlantı arayışı'
                  : chart.definition.startsWith('Dörtlü')
                  ? 'Dört ayrı küme; nadir, çok yönlü bağ kurma'
                  : 'Reflektör — örnekleyici doğa'
              }
            />
            <Fact
              k="İmza"
              v={chart.signature}
              desc={`Yanlış frekans: ${chart.notSelf}`}
            />
          </View>
        </View>
        <View style={styles.heroRight}>
          <Bodygraph chart={chart} size={140} showLabels={false} />
        </View>
      </View>

      {/* İkinci sıra — özet rakamlar */}
      <View style={styles.numberRow}>
        <NumberStat label="Aktif Kapı" value={`${chart.activeGates.size}`} sub="/ 64" />
        <NumberStat label="Aktif Kanal" value={`${chart.activeChannels.length}`} sub="/ 36" />
        <NumberStat label="Tanımlı Merkez" value={`${chart.definedCenters.size}`} sub="/ 9" />
      </View>

      {/* === DETAY AKIŞI === */}
      <Section title="Tipin" kicker="TİP" big>
        <Text style={styles.body}>{t.longDesc}</Text>
        <KeyVal k="Strateji" v={t.strategy} />
        <KeyVal k="Doğru frekans" v={t.signature} />
        <KeyVal k="Yanlış frekans" v={t.notSelf} />
        <KeyVal k="Aura" v={t.aura} />
        <KeyVal k="Rol" v={t.rolePrimary} />
        <KeyVal k="Oran" v={t.oran} last />
        <Text style={styles.subLabel}>Pratik notlar</Text>
        {t.pracicalTips.map((tip, i) => (
          <Text key={i} style={styles.bullet}>·  {tip}</Text>
        ))}
      </Section>

      <Section title="İçsel Yetkin" kicker={a.name.toLocaleUpperCase('tr')}>
        <Text style={styles.body}>{a.shortDesc}</Text>
        <Text style={styles.subLabel}>Karar verme adımları</Text>
        {a.howToDecide.map((tip, i) => (
          <Text key={i} style={styles.bullet}>·  {tip}</Text>
        ))}
        {!!a.caution && <Text style={styles.caution}>! {a.caution}</Text>}
      </Section>

      <Section title="Profilin" kicker={`${chart.profile} — ${p.name.toLocaleUpperCase('tr')}`}>
        <Text style={styles.body}>{p.longDesc}</Text>
        <Text style={styles.subLabel}>Bilinçli çizgi · Personality Sun {pSun.gate}.{pSun.line}</Text>
        <Text style={styles.body}>
          <Text style={styles.lineTitle}>{pSun.line}. {pLine.name}</Text>{'\n'}
          {pLine.shortDesc}{'\n'}
          <Text style={styles.shadowNote}>Gölge: {pLine.shadow}</Text>
        </Text>
        <Text style={styles.subLabel}>Bilinçsiz çizgi · Design Sun {dSun.gate}.{dSun.line}</Text>
        <Text style={styles.body}>
          <Text style={styles.lineTitle}>{dSun.line}. {dLine.name}</Text>{'\n'}
          {dLine.shortDesc}{'\n'}
          <Text style={styles.shadowNote}>Gölge: {dLine.shadow}</Text>
        </Text>
      </Section>

      <Section title="Tanım ve İnkarnasyon Haçı" kicker="DEFINITION & CROSS">
        <KeyVal k="Tanım türü" v={chart.definition} />
        <KeyVal k="İnkarnasyon Haçı" v={chart.incarnationCross} last />
        <Text style={[styles.body, { marginTop: Spacing.md }]}>
          Tanım, tanımlı merkezlerinin kaç ayrı küme halinde bağlandığını söyler.
          Tek tanımlı isen enerjin akışkandır; bölünmüşlerde köprü kuran insan ve
          durumlara çekilirsin. İnkarnasyon Haçı senin yaşam boyu üzerinde
          çalıştığın evrensel temadır — Personality Sun/Earth ve Design Sun/Earth
          aktivasyonlarından örülür.
        </Text>
      </Section>

      <Section
        title={`Aktif Kanalların · ${chart.activeChannels.length}`}
        kicker="KANALLAR"
      >
        {chart.activeChannels.length === 0 ? (
          <Text style={styles.body}>
            Tanımlı kanalın yok — Reflektör doğası. Çevren senin aynan.
          </Text>
        ) : chart.activeChannels.map(c => (
          <View key={c.id} style={styles.channelRow}>
            <Text style={styles.channelId}>{c.id}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.channelName}>{c.name}</Text>
              <Text style={styles.channelDesc}>{c.shortDesc}</Text>
              <Text style={styles.channelMeta}>
                {CENTERS[c.centers[0]].name} ↔ {CENTERS[c.centers[1]].name} · {c.circuit} devre
              </Text>
            </View>
          </View>
        ))}
      </Section>

      <Section title={`Tanımlı Merkezlerin · ${definedCenters.length}`} kicker="MERKEZ">
        <Text style={styles.body}>
          Tanımlı merkezler senin sabit, güvenilir frekansındır. Hayata bu
          merkezlerden tutarlı bir enerji yayarsın.
        </Text>
        {definedCenters.map(k => {
          const c = CENTERS[k];
          const isOpen = openCenter === k;
          const acts = getActivationsByCenter(chart, k);
          return (
            <View key={k} style={styles.centerItem}>
              <TouchableOpacity
                style={styles.centerHead}
                onPress={() => setOpenCenter(isOpen ? null : k)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
              >
                <View style={[styles.centerDot, { backgroundColor: c.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.centerName}>{c.name}</Text>
                  <Text style={styles.centerBio}>{c.bio}</Text>
                </View>
                <Text style={styles.chev}>{isOpen ? '−' : '+'}</Text>
              </TouchableOpacity>
              {isOpen && (
                <View style={styles.centerBody}>
                  <Text style={styles.body}>{c.defined.desc}</Text>
                  <Text style={styles.subLabel}>Hediyeler</Text>
                  {c.defined.gifts.map((g, i) => (
                    <Text key={i} style={styles.bullet}>·  {g}</Text>
                  ))}
                  {(acts.personality.length + acts.design.length) > 0 && (
                    <>
                      <Text style={styles.subLabel}>Bu merkezdeki aktivasyonlar</Text>
                      {acts.personality.map(act => (
                        <Text key={'p' + act.planet} style={styles.actLine}>
                          <Text style={{ color: Colors.text }}>● </Text>
                          {planetLabel(act.planet)} · {GATES[act.gate].name}{' '}
                          <Text style={{ color: Colors.gold }}>{act.gate}.{act.line}</Text>
                        </Text>
                      ))}
                      {acts.design.map(act => (
                        <Text key={'d' + act.planet} style={styles.actLine}>
                          <Text style={{ color: Colors.ember }}>● </Text>
                          {planetLabel(act.planet)} · {GATES[act.gate].name}{' '}
                          <Text style={{ color: Colors.ember }}>{act.gate}.{act.line}</Text>
                        </Text>
                      ))}
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </Section>

      <Section title={`Tanımsız Merkezlerin · ${undefinedCenters.length}`} kicker="GEÇİRGEN">
        <Text style={styles.body}>
          Tanımsız merkezler senin "yanlış benlik" tuzaklarını taşır ama aynı
          zamanda yaşam boyu kazanacağın bilgeliğin de evidir. Burada öğrenirsin.
        </Text>
        {undefinedCenters.map(k => {
          const c = CENTERS[k];
          const isOpen = openCenter === k;
          return (
            <View key={k} style={styles.centerItem}>
              <TouchableOpacity
                style={styles.centerHead}
                onPress={() => setOpenCenter(isOpen ? null : k)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
              >
                <View style={[styles.centerDot, styles.centerDotEmpty, { borderColor: c.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.centerName}>{c.name}</Text>
                  <Text style={styles.centerBio}>{c.bio}</Text>
                </View>
                <Text style={styles.chev}>{isOpen ? '−' : '+'}</Text>
              </TouchableOpacity>
              {isOpen && (
                <View style={styles.centerBody}>
                  <Text style={styles.body}>{c.undefined.desc}</Text>
                  <Text style={styles.subLabel}>Yanlış benlik sorusu</Text>
                  <Text style={styles.body}>{c.undefined.notSelfQuestion}</Text>
                  <Text style={styles.subLabel}>Kazanılan bilgelik</Text>
                  <Text style={styles.body}>{c.undefined.wisdom}</Text>
                </View>
              )}
            </View>
          );
        })}
      </Section>

      <Section title={`Aktif Kapıların · ${chart.activeGates.size}`} kicker="KAPI">
        <Text style={styles.body}>
          Beyaz nokta · sadece bilinçli (Personality){'\n'}
          Kırmızı nokta · sadece bilinçsiz (Design){'\n'}
          Altın nokta · her ikisi
        </Text>
        {Array.from(chart.activeGates).sort((a, b) => a - b).map(g => {
          const info = GATES[g];
          const inP = chart.personalityGates.has(g);
          const inD = chart.designGates.has(g);
          const dot = inP && inD ? Colors.gold : inP ? '#FFFFFF' : Colors.ember;
          const isOpen = openGate === g;
          return (
            <View key={g} style={styles.gateItem}>
              <TouchableOpacity
                style={styles.gateHead}
                onPress={() => setOpenGate(isOpen ? null : g)}
                activeOpacity={0.7}
                accessibilityRole="button"
              >
                <View style={[styles.gateDot, { backgroundColor: dot }]} />
                <Text style={styles.gateNum}>{g}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.gateName}>{info.name}</Text>
                  <Text style={styles.gateCenterLabel}>{CENTERS[info.center].name}</Text>
                </View>
                <Text style={styles.chev}>{isOpen ? '−' : '+'}</Text>
              </TouchableOpacity>
              {isOpen && (
                <View style={styles.gateBody}>
                  <Text style={styles.body}>{info.theme}</Text>
                  <KeyVal k="Hediye" v={info.gift} />
                  <KeyVal k="Gölge" v={info.shadow} last />
                </View>
              )}
            </View>
          );
        })}
      </Section>

      <Section title="Gezegen Aktivasyonları" kicker="EFEMERİT">
        <Text style={styles.body}>
          13 gezegenin doğum (bilinçli) ve doğumdan ~88 gün öncesi (bilinçsiz)
          pozisyonları. Her gezegen bir kapıyı ve çizgiyi aktive eder.
        </Text>
        <View style={styles.planetHead}>
          <Text style={[styles.planetCell, styles.planetCellHead, { flex: 1.4 }]}>Gezegen</Text>
          <Text style={[styles.planetCell, styles.planetCellHead]}>
            <Text style={{ color: Colors.text }}>● </Text>Bilinçli
          </Text>
          <Text style={[styles.planetCell, styles.planetCellHead]}>
            <Text style={{ color: Colors.ember }}>● </Text>Bilinçsiz
          </Text>
        </View>
        {chart.personality.map((act, idx) => {
          const d = chart.design[idx];
          return (
            <View key={act.planet} style={styles.planetRow}>
              <Text style={[styles.planetCell, { flex: 1.4, color: Colors.text }]}>
                {planetLabel(act.planet)}
              </Text>
              <Text style={styles.planetCell}>
                <Text style={{ color: Colors.gold }}>{act.gate}.{act.line}</Text>{'\n'}
                <Text style={styles.planetGateName}>{GATES[act.gate].name}</Text>
              </Text>
              <Text style={styles.planetCell}>
                <Text style={{ color: Colors.ember }}>{d.gate}.{d.line}</Text>{'\n'}
                <Text style={styles.planetGateName}>{GATES[d.gate].name}</Text>
              </Text>
            </View>
          );
        })}
      </Section>
    </ScrollView>
  );
}

// === Yardımcı bileşenler ===

function Section({
  title, kicker, big, children,
}: {
  title: string; kicker?: string; big?: boolean; children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      {!!kicker && <Text style={styles.sectionKicker}>{kicker}</Text>}
      <Text style={big ? styles.sectionTitleBig : styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Fact({ k, v, desc }: { k: string; v: string; desc?: string }) {
  return (
    <View style={styles.factRow}>
      <Text style={styles.factK}>{k}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.factV} numberOfLines={1}>{v}</Text>
        {!!desc && (
          <Text style={styles.factDesc} numberOfLines={2}>{desc}</Text>
        )}
      </View>
    </View>
  );
}

function NumberStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={styles.numStat}>
      <Text style={styles.numValueRow}>
        <Text style={styles.numValue}>{value}</Text>
        {!!sub && <Text style={styles.numSub}> {sub}</Text>}
      </Text>
      <Text style={styles.numLabel}>{label}</Text>
    </View>
  );
}

function KeyVal({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <View style={[styles.kvRow, last && styles.kvRowLast]}>
      <Text style={styles.kvK}>{k}</Text>
      <Text style={styles.kvV} numberOfLines={3}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.xl },

  empty: {
    flex: 1, alignItems: 'center',
    backgroundColor: Colors.background, paddingHorizontal: Spacing.xl,
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
    textAlign: 'center', marginBottom: Spacing.xl,
  },
  cta: {
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md,
    borderRadius: 999, borderWidth: 1, borderColor: Colors.gold,
  },
  ctaText: { color: Colors.gold },

  brand: {
    fontSize: 11, letterSpacing: 3, color: Colors.textMuted,
    fontWeight: Typography.weight.medium,
  },
  name: {
    fontSize: Typography.size.xxxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    lineHeight: Typography.size.xxxl * 1.15,
    marginTop: Spacing.sm,
  },
  meta: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
    marginTop: 4, marginBottom: Spacing.xl,
    letterSpacing: 0.3,
  },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: Colors.divider,
  },
  heroLeft: { flex: 1, paddingRight: Spacing.md },
  heroRight: { width: 140, alignItems: 'center' },
  heroType: {
    fontSize: Typography.size.xxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    lineHeight: Typography.size.xxl * 1.1,
  },
  heroStrategy: {
    fontSize: Typography.size.sm,
    color: Colors.gold,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  heroEssence: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: Typography.size.xs * 1.55,
    fontStyle: 'italic',
  },
  heroFacts: {
    marginTop: Spacing.lg,
  },
  factRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  factK: {
    width: 64,
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.4,
    paddingTop: 2,
  },
  factV: {
    fontSize: Typography.size.sm,
    color: Colors.text,
  },
  factDesc: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: Typography.size.xs * 1.5,
  },

  numberRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  numStat: { flex: 1, alignItems: 'center' },
  numValueRow: { alignItems: 'baseline' as any },
  numValue: {
    fontSize: Typography.size.xxxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
  },
  numSub: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
  },
  numLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: Colors.textMuted,
    marginTop: 2,
  },

  section: {
    paddingVertical: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sectionKicker: {
    fontSize: 10, letterSpacing: 2, color: Colors.gold,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: Typography.size.xl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    lineHeight: Typography.size.xl * 1.2,
  },
  sectionTitleBig: {
    fontSize: Typography.size.xxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    lineHeight: Typography.size.xxl * 1.15,
  },
  sectionBody: { marginTop: Spacing.md },

  body: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.65,
  },
  subLabel: {
    fontSize: 10, letterSpacing: 1.4, color: Colors.textMuted,
    marginTop: Spacing.md, marginBottom: 4,
  },
  bullet: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.55,
    marginBottom: 2,
  },
  caution: {
    fontSize: Typography.size.sm,
    color: Colors.emberSoft,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
    lineHeight: Typography.size.sm * 1.5,
  },
  lineTitle: {
    color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  shadowNote: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  kvRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  kvRowLast: { borderBottomWidth: 0 },
  kvK: {
    width: 130,
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  kvV: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.text,
  },

  channelRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  channelId: {
    fontSize: Typography.size.md,
    color: Colors.gold,
    fontFamily: Typography.font.serif,
    width: 60,
  },
  channelName: {
    fontSize: Typography.size.md, color: Colors.text,
  },
  channelDesc: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    marginTop: 2, lineHeight: Typography.size.sm * 1.5,
  },
  channelMeta: {
    fontSize: 10, color: Colors.textMuted, marginTop: 4, letterSpacing: 0.3,
  },

  centerItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  centerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  centerDot: {
    width: 14, height: 14, borderRadius: 999,
    marginRight: Spacing.md,
  },
  centerDotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  centerName: {
    fontSize: Typography.size.md, color: Colors.text,
  },
  centerBio: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    marginTop: 2,
  },
  centerBody: {
    paddingBottom: Spacing.lg,
    paddingLeft: 26,
  },
  actLine: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.55,
    marginTop: 2,
  },

  gateItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  gateHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md - 2,
  },
  gateDot: {
    width: 8, height: 8, borderRadius: 999,
    marginRight: Spacing.md,
  },
  gateNum: {
    fontSize: Typography.size.md,
    color: Colors.gold,
    fontFamily: Typography.font.serif,
    width: 40,
  },
  gateName: {
    fontSize: Typography.size.md,
    color: Colors.text,
  },
  gateCenterLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  gateBody: {
    paddingBottom: Spacing.md,
    paddingLeft: 56,
  },

  chev: {
    fontSize: 18, color: Colors.textMuted, marginLeft: Spacing.md,
  },

  planetHead: {
    flexDirection: 'row',
    paddingTop: Spacing.md,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  planetCellHead: {
    fontSize: 10, letterSpacing: 1, color: Colors.textMuted,
  },
  planetRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  planetCell: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.text,
    paddingHorizontal: 4,
  },
  planetGateName: {
    fontSize: 10, color: Colors.textMuted,
  },
});
