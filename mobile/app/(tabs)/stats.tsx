import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../stores/taskStore';
import { DonutChart } from '../../components/DonutChart';
import { Sparkline } from '../../components/Sparkline';
import { StreakBadge } from '../../components/StreakBadge';
import { GlassCard } from '../../components/ui/GlassCard';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
} from '../../theme/tokens';

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  bg: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, bg }) => (
  <GlassCard style={[styles.statCard, { borderColor: color, backgroundColor: bg }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </GlassCard>
);

// Compute streak from completed tasks
const computeStreak = (tasks: { is_completed: boolean; updated_at: string }[]): number => {
  const completedDays = new Set(
    tasks
      .filter((t) => t.is_completed)
      .map((t) => new Date(t.updated_at).toDateString())
  );

  let streak = 0;
  const day = new Date();
  while (completedDays.has(day.toDateString())) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
};

const buildWeeklyData = (tasks: { is_completed: boolean; updated_at: string }[]): number[] =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return tasks.filter(
      (t) => t.is_completed && new Date(t.updated_at).toDateString() === d.toDateString()
    ).length;
  });

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StatsScreen() {
  const { tasks, fetchTasks } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.is_completed).length;
  const pending = tasks.filter((t) => !t.is_completed).length;
  const overdue = tasks.filter(
    (t) => !t.is_completed && t.due_date && new Date(t.due_date) < new Date()
  ).length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const streak = computeStreak(tasks);
  const weeklyData = buildWeeklyData(tasks);
  const createdThisWeek = tasks.filter(
    (t) => new Date(t.created_at) > new Date(Date.now() - 7 * 86400000)
  ).length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0D0520', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 0.5 }}
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Your Week</Text>
            <Text style={styles.pageSubtitle}>Stay consistent, stay ahead</Text>
          </View>

          {/* Donut chart */}
          <View style={styles.donutWrap}>
            <DonutChart percentage={rate} size={172} strokeWidth={16} label="completed" />
          </View>

          {/* Streak */}
          {streak > 0 && <StreakBadge days={streak} />}

          {/* Stat cards row */}
          <View style={styles.cardsRow}>
            <StatCard
              label="Created"
              value={createdThisWeek}
              color={Colors.accentEnd}
              bg="rgba(6, 182, 212, 0.08)"
            />
            <StatCard
              label="Completed"
              value={completed}
              color={Colors.success}
              bg={Colors.successBg}
            />
            <StatCard
              label="Overdue"
              value={overdue}
              color={Colors.error}
              bg={Colors.errorBg}
            />
          </View>

          {/* Productivity Trend */}
          <GlassCard style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendTitle}>Productivity Trend</Text>
              <Text style={styles.trendPeriod}>7-day view</Text>
            </View>
            <Sparkline
              data={weeklyData}
              labels={WEEK_LABELS}
              width={320}
              height={72}
              color={Colors.accentStart}
            />
          </GlassCard>

          {/* Summary stats */}
          <GlassCard style={styles.summaryCard}>
            <SummaryRow label="Total tasks" value={String(total)} />
            <SummaryRow label="Pending" value={String(pending)} />
            <SummaryRow label="Completion rate" value={`${rate}%`} accent />
            <SummaryRow label="This week's tasks" value={String(createdThisWeek)} />
          </GlassCard>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const SummaryRow = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <View style={sumStyles.row}>
    <Text style={sumStyles.label}>{label}</Text>
    <Text style={[sumStyles.value, accent && { color: Colors.accentStart }]}>{value}</Text>
  </View>
);

const sumStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  value: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  scroll: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 120 },
  pageHeader: { gap: 4 },
  pageTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  pageSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary },
  donutWrap: { alignItems: 'center', paddingVertical: Spacing.md },
  cardsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    gap: 4,
    borderWidth: 1.5,
  },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
  trendCard: { padding: Spacing.md, gap: Spacing.sm, overflow: 'hidden' },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  trendPeriod: { fontSize: FontSize.xs, color: Colors.textMuted },
  summaryCard: { padding: Spacing.md },
});
