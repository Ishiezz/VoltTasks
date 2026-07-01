import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import { Colors, FontSize, FontWeight } from '../theme/tokens';

interface SparklineProps {
  data: number[];
  labels?: string[];
  width?: number;
  height?: number;
  color?: string;
}

const buildPath = (data: number[], width: number, height: number): string => {
  if (data.length < 2) return '';
  const max = Math.max(...data, 1);
  const pad = 8;
  const step = (width - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => ({
    x: pad + i * step,
    y: pad + (1 - v / max) * (height - pad * 2),
  }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
};

const buildAreaPath = (data: number[], width: number, height: number): string => {
  const linePath = buildPath(data, width, height);
  if (!linePath) return '';
  const pad = 8;
  const lastX = pad + (data.length - 1) * ((width - pad * 2) / (data.length - 1));
  return `${linePath} L ${lastX} ${height} L ${pad} ${height} Z`;
};

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  labels,
  width = 320,
  height = 64,
  color = Colors.accentStart,
}) => {
  const linePath = buildPath(data, width, height);
  const areaPath = buildAreaPath(data, width, height);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </SvgGradient>
        </Defs>
        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGrad)" />
        {/* Line */}
        <Path d={linePath} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
        {/* Dot at latest point */}
        {data.length > 0 && (() => {
          const max = Math.max(...data, 1);
          const pad = 8;
          const step = (width - pad * 2) / Math.max(data.length - 1, 1);
          const lastIdx = data.length - 1;
          const cx = pad + lastIdx * step;
          const cy = pad + (1 - data[lastIdx] / max) * (height - pad * 2);
          return <Circle cx={cx} cy={cy} r={4} fill={color} />;
        })()}
      </Svg>
      {labels && (
        <View style={styles.labels}>
          {labels.map((l, i) => (
            <Text key={i} style={styles.labelText}>{l}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 4 },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  labelText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
});
