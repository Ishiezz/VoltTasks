import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/tokens';
import { getPriorityColor } from '../../theme/tokens';

interface PriorityPillProps {
  value: 'low' | 'medium' | 'high';
  selected?: boolean;
  onPress?: (v: 'low' | 'medium' | 'high') => void;
  style?: StyleProp<ViewStyle>;
}

const LABELS = { low: 'Low', medium: 'Med', high: 'High' };
const EMOJI  = { low: '🟢', medium: '🟡', high: '🔴' };

export const PriorityPill: React.FC<PriorityPillProps> = ({
  value,
  selected = false,
  onPress,
  style,
}) => {
  const { color, bg } = getPriorityColor(value);

  return (
    <TouchableOpacity
      onPress={() => onPress?.(value)}
      activeOpacity={0.7}
      style={[
        styles.pill,
        { backgroundColor: selected ? bg : Colors.surfaceHover },
        selected && {
          borderColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
          elevation: 4,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: selected ? color : Colors.textSecondary }]}>
        {EMOJI[value]} {LABELS[value]}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.2,
  },
});
