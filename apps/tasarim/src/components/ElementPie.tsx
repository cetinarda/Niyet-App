import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { ElementDistribution, ELEMENT_META, ElementKey } from '../utils/elements';

const ORDER: ElementKey[] = ['ates', 'toprak', 'hava', 'su'];

export function ElementPie({ dist, size = 132, lang = 'tr' }: { dist: ElementDistribution; size?: number; lang?: 'tr' | 'en' }) {
  const stroke = Math.round(size * 0.17);
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const C = 2 * Math.PI * r;

  let offset = 0;
  const segs = ORDER.map((k) => {
    const len = dist[k] * C;
    const s = { k, color: ELEMENT_META[k].color, dash: len, off: offset };
    offset += len;
    return s;
  }).filter((s) => s.dash > 0.01);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* zemin halka */}
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          {segs.map((s) => (
            <Circle
              key={s.k}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${C - s.dash}`}
              strokeDashoffset={-s.off}
              strokeLinecap="butt"
            />
          ))}
        </G>
      </Svg>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 12, columnGap: 14, rowGap: 6 }}>
        {ORDER.filter((k) => dist[k] > 0).map((k) => (
          <View key={k} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: ELEMENT_META[k].color, marginRight: 6 }} />
            <Text style={{ color: '#cfc8e0', fontSize: 12.5, letterSpacing: 0.2 }}>
              {(lang === 'en' ? ELEMENT_META[k].en : ELEMENT_META[k].tr)} · {Math.round(dist[k] * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
