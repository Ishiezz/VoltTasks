import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../stores/authStore';
import { FluxButton } from '../../components/ui/FluxButton';
import { FluxInput } from '../../components/ui/FluxInput';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
} from '../../theme/tokens';

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, signup, isLoading } = useAuthStore();

  const validate = () => {
    const errs: typeof errors = {};
    if (!email.trim() || !email.includes('@')) errs.email = 'Enter a valid email';
    if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await signup(email.trim(), password);
        Toast.show({ type: 'success', text1: 'Account created!', text2: 'Please log in.' });
        setMode('login');
        setPassword('');
      }
    } catch (err: unknown) {
      Toast.show({
        type: 'error',
        text1: mode === 'login' ? 'Login failed' : 'Signup failed',
        text2: err instanceof Error ? err.message : 'Please try again',
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Mesh gradient hero */}
      <LinearGradient
        colors={['#1A0533', '#0A0A0F']}
        style={styles.gradientBg}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo area */}
            <View style={styles.logoArea}>
              <View style={styles.logoMark}>
                <Text style={styles.logoText}>⚡</Text>
              </View>
              <Text style={styles.appName}>Flux Tasks</Text>
              <Text style={styles.tagline}>Built for people who move fast</Text>
            </View>

            {/* Form card */}
            <View style={styles.card}>
              {/* Tab switcher */}
              <View style={styles.tabs}>
                {(['login', 'signup'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.tab, mode === m && styles.tabActive]}
                    onPress={() => { setMode(m); setErrors({}); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                      {m === 'login' ? 'Sign In' : 'Create Account'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.form}>
                <FluxInput
                  label="Email"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email}
                  returnKeyType="next"
                />

                <FluxInput
                  label="Password"
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
                  placeholder="••••••••"
                  secureTextEntry
                  error={errors.password}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />

                <FluxButton
                  label={mode === 'login' ? 'Sign In' : 'Create Account'}
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  size="lg"
                  style={styles.submitBtn}
                />
              </View>
            </View>

            <Text style={styles.footer}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <Text
                style={styles.footerLink}
                onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrors({}); }}
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </Text>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  gradientBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    gap: Spacing.xl,
  },
  logoArea: { alignItems: 'center', gap: Spacing.sm },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: Colors.glowViolet,
    borderWidth: 1,
    borderColor: Colors.accentStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 28 },
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.accentStart,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.accentStart,
    fontWeight: FontWeight.semibold,
  },
  form: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  submitBtn: { marginTop: Spacing.sm },
  footer: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  footerLink: {
    color: Colors.accentStart,
    fontWeight: FontWeight.semibold,
  },
});
