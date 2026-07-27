import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Typography } from '../theme/colors';
import { Bodygraph } from './Bodygraph';
import { Starfield } from './Starfield';
import { TYPES } from '../data/types';
import { AUTHORITIES } from '../data/authorities';
import { HumanDesignChart } from '../utils/humanDesign';
import { SavedProfile } from '../store/useStore';
import { L, getLang } from '../i18n';
import { crossLabel } from '../utils/humanDesign';

// Instagram Story: 1080x1920 (9:16). React Native birimi olarak 540x960
// kullanıp 2× capture ile 1080x1920 PNG üretiyoruz.
export const STORY_W = 540;
export const STORY_H = 960;

interface Props {
  profile: SavedProfile;
  chart: HumanDesignChart;
}

export function StoryCard({ profile, chart }: Props) {
  const t = TYPES[chart.type];
  const a = AUTHORITIES[chart.authority];
  const photoUri = profile.photoUri;

  return (
    <View style={styles.card} collapsable={false}>
      {/* Galaktik arka plan */}
      <Starfield
        width={STORY_W}
        height={STORY_H}
        density={1.1}
        seed={profile.id.charCodeAt(0) + profile.birthDate.length}
        showNebula
      />

      {/* Üst marka */}
      <View style={styles.topBlock}>
        <Text style={styles.brand}>{getLang() === 'en' ? 'SAKİN · DESIGN' : 'SAKİN · TASARIM'}</Text>
        <Text style={styles.subBrand}>{getLang() === 'en' ? 'Human Design Identity' : 'Human Design Kimliği'}</Text>
      </View>

      {/* Foto halkası */}
      <View style={styles.photoRing}>
        {photoUri ? (
          <>
            <Image source={{ uri: photoUri }} style={styles.photo} />
            <View style={styles.photoOverlay} pointerEvents="none" />
          </>
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoEmoji}>{t.emoji}</Text>
          </View>
        )}
      </View>

      {/* İsim ve tip */}
      <Text style={styles.name} numberOfLines={2}>{profile.name}</Text>
      <Text style={styles.type}>{L(t, 'name')}</Text>
      <Text style={styles.subMeta}>
        {chart.profile} · {getLang() === 'en' ? L(a, 'name').replace(' Authority', '') : a.name.replace(' Yetki', '')}
      </Text>

      {/* Bodygraph */}
      <View style={styles.bodyHolder}>
        <Bodygraph chart={chart} size={300} showLabels={false} />
      </View>

      {/* Stat grid 2x3 */}
      <View style={styles.statsGrid}>
        <Stat label={getLang() === 'en' ? 'STRATEGY' : 'STRATEJİ'} value={L(t, 'strategy')} />
        <Stat label={getLang() === 'en' ? 'SIGNATURE' : 'İMZA'} value={L(t, 'signature')} />
        <Stat label={getLang() === 'en' ? 'NOT-SELF' : 'YANLIŞ'} value={L(t, 'notSelf')} />
        <Stat
          label={getLang() === 'en' ? 'DEFINITION' : 'TANIM'}
          value={
            getLang() === 'en'
              ? (chart.definition.startsWith('Tek')
                  ? 'Single'
                  : chart.definition.startsWith('Bölünmüş')
                  ? 'Split'
                  : chart.definition.startsWith('Üçlü')
                  ? 'Triple'
                  : chart.definition.startsWith('Dörtlü')
                  ? 'Quadruple'
                  : 'None')
              : chart.definition.split(' ')[0]
          }
        />
        <Stat label={getLang() === 'en' ? 'GATE' : 'KAPI'} value={`${chart.activeGates.size} / 64`} />
        <Stat label={getLang() === 'en' ? 'CENTER' : 'MERKEZ'} value={`${chart.definedCenters.size} / 9`} />
      </View>

      {/* Alt blok */}
      <View style={styles.bottomBlock}>
        <Text style={styles.cross} numberOfLines={2}>
          {crossLabel(chart.incarnationCross)}
        </Text>
        <Text style={styles.footer}>sakin.life</Text>
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: STORY_W,
    height: STORY_H,
    backgroundColor: '#0D0B14',
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 32,
  },

  topBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brand: {
    fontSize: 13,
    letterSpacing: 4,
    color: Colors.gold,
    fontWeight: '600',
  },
  subBrand: {
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.textMuted,
    marginTop: 4,
  },

  photoRing: {
    width: 140,
    height: 140,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.gold + '60',
    padding: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%', height: '100%',
    borderRadius: 999,
  },
  photoOverlay: {
    position: 'absolute',
    top: 4, left: 4, right: 4, bottom: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  photoPlaceholder: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#15111E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: 56,
    opacity: 0.85,
  },

  name: {
    fontSize: 32,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    marginTop: 18,
    textAlign: 'center',
    lineHeight: 36,
  },
  type: {
    fontSize: 18,
    color: Colors.gold,
    marginTop: 6,
    letterSpacing: 0.6,
  },
  subMeta: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.4,
  },

  bodyHolder: {
    marginTop: 14,
    alignItems: 'center',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    marginTop: 12,
  },
  stat: {
    width: '33.333%',
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    letterSpacing: 1.4,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 14,
  },

  bottomBlock: {
    position: 'absolute',
    bottom: 28,
    left: 32,
    right: 32,
    alignItems: 'center',
  },
  cross: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
    marginBottom: 8,
  },
  footer: {
    fontSize: 11,
    letterSpacing: 3,
    color: Colors.goldDeep,
  },
});
