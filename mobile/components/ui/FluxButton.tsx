import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/tokens';

interface FluxButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'gradient' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const FluxButton: React.FC<FluxButtonProps> = ({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'gradient',
  size = 'md',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || isLoading;

  const sizeStyles = {
    sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
    md: { paddingVertical: 14, paddingHorizontal: Spacing.lg },
    lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
  };

  const textSizes = {
    sm: FontSize.sm,
    md: FontSize.md,
    lg: FontSize.base,
  };

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[styles.wrapper, style]}
      >
        <LinearGradient
          colors={
            isDisabled
              ? [Colors.border, Colors.border]
              : [Colors.accentStart, Colors.accentEnd]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, sizeStyles[size]]}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.textPrimary} size="small" />
          ) : (
            <Text style={[styles.text, { fontSize: textSizes[size] }, textStyle]}>
              {label}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[
          styles.outline,
          sizeStyles[size],
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.accentStart} size="small" />
        ) : (
          <Text style={[styles.outlineText, { fontSize: textSizes[size] }, textStyle]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // ghost
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.6}
      style={[sizeStyles[size], isDisabled && styles.disabled, style]}
    >
      <Text style={[styles.ghostText, { fontSize: textSizes[size] }, textStyle]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  text: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.3,
  },
  outline: {
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.accentStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: Colors.accentStart,
    fontWeight: FontWeight.semibold,
  },
  ghostText: {
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  disabled: {
    opacity: 0.4,
  },
});
