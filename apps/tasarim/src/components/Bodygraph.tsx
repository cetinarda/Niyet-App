import React from 'react';
import Svg, { Polygon, Rect, Path, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { CenterKey, CENTERS } from '../data/centers';
import { CHANNELS } from '../data/channels';
import { HumanDesignChart } from '../utils/humanDesign';

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

// Her gate için bodygraph üzerinde yaklaşık konum (merkez yüzeyinde)
// Sadece görselleştirme için yaklaşık yerler.
const GATE_POSITIONS: Record<number, { x: number; y: number }> = {
  // Head (3 kapı)
  64: { x: 130, y: 24 }, 61: { x: 150, y: 18 }, 63: { x: 170, y: 24 },
  // Ajna (6 kapı)
  47: { x: 124, y: 92 }, 24: { x: 150, y: 86 }, 4: { x: 176, y: 92 },
  17: { x: 124, y: 112 }, 43: { x: 150, y: 118 }, 11: { x: 176, y: 112 },
  // Throat (11 kapı)
  62: { x: 122, y: 152 }, 23: { x: 142, y: 152 }, 56: { x: 162, y: 152 },
  35: { x: 182, y: 158 }, 12: { x: 122, y: 168 }, 45: { x: 178, y: 168 },
  33: { x: 122, y: 184 }, 8: { x: 142, y: 184 }, 31: { x: 162, y: 184 },
  20: { x: 178, y: 184 }, 16: { x: 142, y: 196 },
  // G
  1: { x: 150, y: 224 }, 13: { x: 174, y: 244 }, 25: { x: 150, y: 254 },
  46: { x: 126, y: 244 }, 2: { x: 138, y: 268 }, 15: { x: 162, y: 268 },
  10: { x: 130, y: 232 }, 7: { x: 170, y: 232 },
  // Heart
  21: { x: 210, y: 240 }, 40: { x: 232, y: 252 }, 26: { x: 218, y: 264 }, 51: { x: 218, y: 232 },
  // Solar Plexus
  36: { x: 240, y: 340 }, 22: { x: 252, y: 350 }, 37: { x: 264, y: 360 },
  6: { x: 246, y: 372 }, 49: { x: 230, y: 376 }, 55: { x: 256, y: 384 }, 30: { x: 232, y: 360 },
  // Sacral
  34: { x: 130, y: 348 }, 5: { x: 150, y: 344 }, 14: { x: 170, y: 348 },
  29: { x: 130, y: 360 }, 59: { x: 150, y: 360 }, 9: { x: 170, y: 360 },
  3: { x: 130, y: 374 }, 42: { x: 150, y: 374 }, 27: { x: 170, y: 374 },
  // Spleen
  48: { x: 76, y: 348 }, 57: { x: 64, y: 360 }, 44: { x: 52, y: 360 },
  50: { x: 70, y: 376 }, 32: { x: 56, y: 376 }, 28: { x: 84, y: 360 }, 18: { x: 70, y: 348 },
  // Root
  58: { x: 116, y: 446 }, 38: { x: 130, y: 446 }, 54: { x: 144, y: 446 },
  53: { x: 158, y: 446 }, 60: { x: 172, y: 446 }, 52: { x: 186, y: 446 },
  19: { x: 116, y: 474 }, 39: { x: 150, y: 474 }, 41: { x: 184, y: 474 },
};

interface Props {
  chart: HumanDesignChart | null;
  size?: number;            // istenen genişlik
  showLabels?: boolean;
}

export function Bodygraph({ chart, size = 300, showLabels = true }: Props) {
  const scale = size / W;
  const height = H * scale;

  function renderShape(c: CenterShape, fillStyle: string) {
    const stroke = Colors.centerStroke;
    const sw = 1.2;
    if (c.shape === 'square') {
      const s = c.size;
      return (
        <Rect
          key={`bg-${c.key}`}
          x={c.x - s / 2} y={c.y - s / 2}
          width={s} height={s}
          fill={fillStyle} stroke={stroke} strokeWidth={sw}
        />
      );
    }
    if (c.shape === 'diamond') {
      const s = c.size / 2;
      const points = `${c.x},${c.y - s} ${c.x + s},${c.y} ${c.x},${c.y + s} ${c.x - s},${c.y}`;
      return (
        <Polygon key={`bg-${c.key}`} points={points}
          fill={fillStyle} stroke={stroke} strokeWidth={sw} />
      );
    }
    if (c.shape === 'triangle-up') {
      const s = c.size;
      const h = (Math.sqrt(3) / 2) * s;
      const points = `${c.x},${c.y - h / 2} ${c.x + s / 2},${c.y + h / 2} ${c.x - s / 2},${c.y + h / 2}`;
      return (
        <Polygon key={`bg-${c.key}`} points={points}
          fill={fillStyle} stroke={stroke} strokeWidth={sw} />
      );
    }
    // triangle-down
    const s = c.size;
    const h = (Math.sqrt(3) / 2) * s;
    const points = `${c.x},${c.y + h / 2} ${c.x + s / 2},${c.y - h / 2} ${c.x - s / 2},${c.y - h / 2}`;
    return (
      <Polygon key={`bg-${c.key}`} points={points}
        fill={fillStyle} stroke={stroke} strokeWidth={sw} />
    );
  }

  const defined = chart?.definedCenters;
  const activeGates = chart?.activeGates || new Set<number>();
  const personalityGates = chart?.personalityGates || new Set<number>();
  const designGates = chart?.designGates || new Set<number>();
  const activeChannels = chart?.activeChannels || [];

  // Her gate'in iki taraftan biri (Personality / Design / Both) olabilir
  function gateColor(g: number): string {
    const inP = personalityGates.has(g);
    const inD = designGates.has(g);
    if (inP && inD) return Colors.gold;
    if (inP) return '#000';
    if (inD) return Colors.ember;
    return 'rgba(255,255,255,0.18)';
  }

  return (
    <View style={[styles.wrap, { width: size, height }]}>
      <Svg width={size} height={height} viewBox={`0 0 ${W} ${H}`}>
        {/* Channel lines (önce undefined olanlar) */}
        {CHANNELS.map(ch => {
          const a = GATE_POSITIONS[ch.gates[0]];
          const b = GATE_POSITIONS[ch.gates[1]];
          if (!a || !b) return null;
          const isActive = activeGates.has(ch.gates[0]) && activeGates.has(ch.gates[1]);
          return (
            <Line
              key={`ch-${ch.id}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={isActive ? Colors.channelDefined : Colors.channelUndefined}
              strokeWidth={isActive ? 2.4 : 1}
            />
          );
        })}

        {/* Centers — undefined yarı saydam, defined merkez rengi */}
        {CENTER_LAYOUT.map(c => {
          const isDef = defined?.has(c.key);
          return renderShape(c, isDef ? c.color : Colors.centerUndefined);
        })}

        {/* Gate noktaları */}
        {Object.entries(GATE_POSITIONS).map(([gStr, pos]) => {
          const g = Number(gStr);
          const isActive = activeGates.has(g);
          return (
            <G key={`g-${g}`}>
              <Circle cx={pos.x} cy={pos.y} r={isActive ? 5 : 3} fill={gateColor(g)} />
              {showLabels && (
                <SvgText
                  x={pos.x} y={pos.y + 2}
                  fontSize="6"
                  fontWeight="700"
                  fill={isActive ? '#FFF' : 'rgba(255,255,255,0.45)'}
                  textAnchor="middle"
                >{g}</SvgText>
              )}
            </G>
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
