import React from 'react';
import Svg, { Polygon, Rect, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { CenterKey, CENTERS } from '../data/centers';
import { CHANNELS } from '../data/channels';
import { HumanDesignChart } from '../utils/humanDesign';
import { L, getLang } from '../i18n';

// Bodygraph topolojisi: 9 merkez koordinatları (300x520 viewport)
const W = 300;
const H = 520;

interface CenterShape {
  key: CenterKey;
  x: number;        // merkez merkez noktası
  y: number;
  shape: 'triangle-up' | 'triangle-down' | 'square' | 'diamond';
  size: number;
  color: string;
}

const CENTER_LAYOUT: CenterShape[] = [
  { key: 'head',        x: 150, y: 36,  shape: 'triangle-up',   size: 60, color: CENTERS.head.color },
  { key: 'ajna',        x: 150, y: 100, shape: 'triangle-down', size: 60, color: CENTERS.ajna.color },
  { key: 'throat',      x: 150, y: 168, shape: 'square',        size: 64, color: CENTERS.throat.color },
  { key: 'g',           x: 150, y: 248, shape: 'diamond',       size: 60, color: CENTERS.g.color },
  { key: 'heart',       x: 218, y: 250, shape: 'triangle-down', size: 44, color: CENTERS.heart.color },
  { key: 'solarPlexus', x: 246, y: 360, shape: 'triangle-up',   size: 56, color: CENTERS.solarPlexus.color },
  { key: 'sacral',      x: 150, y: 360, shape: 'square',        size: 60, color: CENTERS.sacral.color },
  { key: 'spleen',      x: 60,  y: 360, shape: 'triangle-down', size: 56, color: CENTERS.spleen.color },
  { key: 'root',        x: 150, y: 460, shape: 'square',        size: 76, color: CENTERS.root.color },
];

// Kanal çizimi için merkez bağlantı noktaları (gate noktaları kaldırıldı; kanallar
// merkez-merkez sade çizgilerle gösterilir). Her merkezin tek temsil noktası.
const CENTER_POINT: Record<CenterKey, { x: number; y: number }> = Object.fromEntries(
  CENTER_LAYOUT.map(c => [c.key, { x: c.x, y: c.y }]),
) as Record<CenterKey, { x: number; y: number }>;

// Merkez kısa etiketleri (sade, büyük harf — referans infografik tarzı, Sakin paleti).
const SHORT: Record<CenterKey, { tr: string; en: string }> = {
  head:        { tr: 'KAFA',   en: 'HEAD' },
  ajna:        { tr: 'AJNA',   en: 'AJNA' },
  throat:      { tr: 'BOĞAZ',  en: 'THROAT' },
  g:           { tr: 'BENLİK', en: 'SELF' },
  heart:       { tr: 'EGO',    en: 'EGO' },
  solarPlexus: { tr: 'DUYGU',  en: 'EMOTION' },
  sacral:      { tr: 'SAKRAL', en: 'SACRAL' },
  spleen:      { tr: 'DALAK',  en: 'SPLEEN' },
  root:        { tr: 'KÖK',    en: 'ROOT' },
};

interface Props {
  chart: HumanDesignChart | null;
  size?: number;            // istenen genişlik
  showLabels?: boolean;     // true → merkez içinde kısa ad göster
}

export function Bodygraph({ chart, size = 300, showLabels = true }: Props) {
  const scale = size / W;
  const height = H * scale;

  // grow=1 ana şekil; grow>1 → arkadaki yumuşak hâle (tanımlı merkez parıltısı).
  function shapePoints(c: CenterShape, grow = 1): { kind: 'rect'; x: number; y: number; w: number; h: number } | { kind: 'poly'; points: string } {
    const sz = c.size * grow;
    if (c.shape === 'square') {
      return { kind: 'rect', x: c.x - sz / 2, y: c.y - sz / 2, w: sz, h: sz };
    }
    if (c.shape === 'diamond') {
      const s = sz / 2;
      return { kind: 'poly', points: `${c.x},${c.y - s} ${c.x + s},${c.y} ${c.x},${c.y + s} ${c.x - s},${c.y}` };
    }
    const h = (Math.sqrt(3) / 2) * sz;
    if (c.shape === 'triangle-up') {
      return { kind: 'poly', points: `${c.x},${c.y - h / 2} ${c.x + sz / 2},${c.y + h / 2} ${c.x - sz / 2},${c.y + h / 2}` };
    }
    // triangle-down
    return { kind: 'poly', points: `${c.x},${c.y + h / 2} ${c.x + sz / 2},${c.y - h / 2} ${c.x - sz / 2},${c.y - h / 2}` };
  }

  function drawShape(c: CenterShape, fill: string, stroke: string, sw: number, grow = 1, keySuffix = '') {
    const p = shapePoints(c, grow);
    if (p.kind === 'rect') {
      return <Rect key={`bg-${c.key}${keySuffix}`} x={p.x} y={p.y} width={p.w} height={p.h} rx={6} fill={fill} stroke={stroke} strokeWidth={sw} />;
    }
    return <Polygon key={`bg-${c.key}${keySuffix}`} points={p.points} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
  }

  const defined = chart?.definedCenters;
  const activeGates = chart?.activeGates || new Set<number>();
  const lang = getLang();
  void L;
  const a11yLabel = lang === 'en' ? 'Bodygraph chart' : 'Bodygraph haritası';

  // Bir kanalın iki ucu da aktif mi? (tanımlı kanal → belirgin çizgi)
  function channelActive(gates: [number, number]): boolean {
    return activeGates.has(gates[0]) && activeGates.has(gates[1]);
  }

  return (
    <View style={[styles.wrap, { width: size, height }]} accessibilityLabel={a11yLabel}>
      <Svg width={size} height={height} viewBox={`0 0 ${W} ${H}`}>
        {/* 1) Kanal iskeleti — çok sönük, yapı ipucu (merkez-merkez) */}
        {CHANNELS.map(ch => {
          const a = CENTER_POINT[ch.centers[0] as CenterKey];
          const b = CENTER_POINT[ch.centers[1] as CenterKey];
          if (!a || !b || channelActive(ch.gates as [number, number])) return null;
          return <Line key={`sk-${ch.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={Colors.channelUndefined} strokeWidth={1} />;
        })}

        {/* 2) Tanımlı kanallar — belirgin altın çizgi (merkezlerin altında) */}
        {CHANNELS.map(ch => {
          const a = CENTER_POINT[ch.centers[0] as CenterKey];
          const b = CENTER_POINT[ch.centers[1] as CenterKey];
          if (!a || !b || !channelActive(ch.gates as [number, number])) return null;
          return <Line key={`ac-${ch.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={Colors.channelDefined} strokeWidth={2.6} strokeLinecap="round" />;
        })}

        {/* 3) Merkezler */}
        {CENTER_LAYOUT.map(c => {
          const isDef = defined?.has(c.key);
          if (isDef) {
            // Tanımlı: dolu renk + arkada yumuşak hâle (parıltı)
            return (
              <G key={`grp-${c.key}`}>
                {drawShape(c, c.color, 'none', 0, 1.22, '-halo')}
                {drawShape(c, c.color, 'rgba(255,255,255,0.30)', 1.2, 1)}
              </G>
            );
          }
          // Tanımsız: içi boş, net ince çerçeve → "açık/geçirgen" okunur
          return (
            <G key={`grp-${c.key}`}>
              {drawShape(c, 'transparent', 'rgba(255,255,255,0.24)', 1.4, 1)}
            </G>
          );
        })}

        {/* 4) Merkez kısa adları (şekil içinde) — tanımlı koyu, tanımsız sönük açık */}
        {showLabels && CENTER_LAYOUT.map(c => {
          const isDef = defined?.has(c.key);
          // triangle-up'ta geniş alan altta, triangle-down'da üstte; merkeze yakın tut.
          const dy = c.shape === 'triangle-up' ? c.size * 0.14 : c.shape === 'triangle-down' ? -c.size * 0.10 : 0;
          const label = lang === 'en' ? SHORT[c.key].en : SHORT[c.key].tr;
          return (
            <SvgText
              key={`lb-${c.key}`}
              x={c.x} y={c.y + dy + 2.5}
              fontSize={7.5}
              fontWeight="700"
              letterSpacing={0.4}
              fill={isDef ? 'rgba(13,11,20,0.78)' : 'rgba(255,255,255,0.46)'}
              textAnchor="middle"
            >{label}</SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
  },
});
