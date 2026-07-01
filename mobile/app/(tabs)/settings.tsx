import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../stores/authStore';
import { useTaskStore } from '../../stores/taskStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { FluxButton } from '../../components/ui/FluxButton';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
} from '../../theme/tokens';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon, label, value, onPress, danger }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    style={styles.row}
  >
    <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
      <Ionicons name={icon} size={18} color={danger ? Colors.error : Colors.textSecondary} />
    </View>
    <Text style={[styles.rowLabel, danger && { color: Colors.error }]}>{label}</Text>
    {value && <Text style={styles.rowValue}>{value}</Text>}
    {onPress && (
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { user, logout, isLoading } = useAuthStore();
  const { tasks } = useTaskStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch {
            Toast.show({ type: 'error', text1: 'Logout failed' });
          }
        },
      },
    ]);
  };

  const completed = tasks.filter((t) => t.is_completed).length;
  const total = tasks.length;
  const fromEmail = tasks.filter((t) => t.source === 'email').length;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile card */}
        <GlassCard style={styles.profileCard} glow glowColor={Colors.accentStart}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.email?.[0] ?? '?').toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.profileSub}>Flux Tasks member</Text>
          </View>
        </GlassCard>

        {/* Task stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OVERVIEW</Text>
          <GlassCard>
            <SettingsRow icon="checkmark-circle-outline" label="Tasks completed" value={String(completed)} />
            <SettingsRow icon="list-outline" label="Total tasks" value={String(total)} />
            <SettingsRow icon="mail-outline" label="From email" value={String(fromEmail)} />
          </GlassCard>
        </View>

        {/* App info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP</Text>
          <GlassCard>
            <SettingsRow icon="information-circle-outline" label="Version" value="1.0.0" />
            <SettingsRow icon="code-outline" label="Built with" value="Expo + React Native" />
            <SettingsRow icon="flash-outline" label="Backend" value="Railway · Express" />
          </GlassCard>
        </View>

        {/* Automation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUTOMATION</Text>
          <GlassCard>
            <SettingsRow
              icon="mail-unread-outline"
              label="Email → Task"
              value="Active via n8n"
            />
            <SettingsRow
              icon="notifications-outline"
              label="Daily reminders"
              value="Slack · 9:00 AM"
            />
            <SettingsRow
              icon="calendar-outline"
              label="Weekly digest"
              value="Mon · 8:00 AM"
            />
          </GlassCard>
        </View>

        {/* Sign out */}
        <View style={styles.section}>
          <FluxButton
            label="Sign Out"
            onPress={handleLogout}
            isLoading={isLoading}
            variant="outline"
            size="lg"
          />
        </View>

        <Text style={styles.footer}>
          BuildableLabs Assignment · Phase 1 + Phase 3
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  scroll: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 120 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.glowViolet,
    borderWidth: 2,
    borderColor: Colors.accentStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.accentStart },
  profileInfo: { gap: 3 },
  profileEmail: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  profileSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: { backgroundColor: Colors.errorBg },
  rowLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  rowValue: { fontSize: FontSize.sm, color: Colors.textSecondary },
  footer: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.3,
    marginTop: Spacing.md,
  },
});
