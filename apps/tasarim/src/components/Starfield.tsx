import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

interface Props {
  width: number;
  height: number;
  density?: number;       // birim alandaki yıldız sayısı (kabaca 0.3-1.5)
  seed?: number;          // deterministik dağılım için
  showNebula?: boolean;   // alttan üste hafif mor sis
  style?: ViewStyle;
}

// Hafif deterministik PRNG (mulberry32)
function makeRng(seed: number) {
  let a = seed | 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Galaktik arka plan — çok yumuşak, dikkat dağıtmayan yıldız dağılımı +
 * opsiyonel nebula glow. Tema göz yormamak için minimum opasiteyle.
 */
export function Starfield({
  width, height, density = 0.6, seed = 42, showNebula = true, style,
}: Props) {
  const stars = useMemo(() => {
    const rng = makeRng(seed);
    const area = width * height;
    const count = Math.max(8, Math.floor((area / 8000) * density));
    return Array.from({ length: count }, () => ({
      x: rng() * width,
      y: rng() * height,
      r: rng() < 0.92 ? 0.6 + rng() * 0.6 : 1.0 + rng() * 0.8,
      o: 0.18 + rng() * 0.35,
    }));
  }, [width, height, density, seed]);

  return (
    <View style={[styles.wrap, { width, height }, style]} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="neb" cx="50%" cy="115%" r="80%">
            <Stop offset="0%" stopColor="#7B4FA6" stopOpacity={showNebula ? '0.20' : '0'} />
            <Stop offset="55%" stopColor="#503070" stopOpacity={showNebula ? '0.06' : '0'} />
            <Stop offset="100%" stopColor="#0D0B14" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="neb2" cx="20%" cy="-10%" r="65%">
            <Stop offset="0%" stopColor="#C9A84C" stopOpacity={showNebula ? '0.10' : '0'} />
            <Stop offset="100%" stopColor="#0D0B14" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {showNebula && (
          <>
            <Rect width={width} height={height} fill="url(#neb)" />
            <Rect width={width} height={height} fill="url(#neb2)" />
          </>
        )}
        {stars.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={s.o} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0, left: 0,
  },
});
