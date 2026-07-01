import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/tokens';

interface FluxInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const FluxInput: React.FC<FluxInputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: Colors.surfaceHover,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontFamily: 'System',
  },
  inputFocused: {
    borderColor: Colors.accentStart,
    shadowColor: Colors.accentStart,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    fontWeight: FontWeight.medium,
  },
});
