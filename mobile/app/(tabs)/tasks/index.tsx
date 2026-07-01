import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../../../stores/taskStore';
import { useAuthStore } from '../../../stores/authStore';
import { TaskCard } from '../../../components/TaskCard';
import { EmptyState } from '../../../components/EmptyState';
import { Sparkline } from '../../../components/Sparkline';
import { CreateTaskSheet, CreateTaskSheetRef } from '../../../components/CreateTaskSheet';
import { useGreeting } from '../../../hooks/useGreeting';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
} from '../../../theme/tokens';
import { Task } from '../../../types';

// Generate last-7-day sparkline data from tasks
const buildSparklineData = (tasks: Task[]): number[] => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });
  return days.map((day) =>
    tasks.filter((t) => t.is_completed && new Date(t.updated_at).toDateString() === day).length
  );
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function TasksScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const sheetRef = useRef<CreateTaskSheetRef>(null);
  const greeting = useGreeting();

  const { user } = useAuthStore();
  const { tasks, isLoading, isRefreshing, fetchTasks, refreshTasks, createTask, toggleTask, deleteTask } =
    useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggle = useCallback(
    async (id: string) => {
      try {
        await toggleTask(id);
      } catch {
        Toast.show({ type: 'error', text1: 'Failed to update task' });
      }
    },
    [toggleTask]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteTask(id);
        Toast.show({ type: 'success', text1: 'Task deleted' });
      } catch {
        Toast.show({ type: 'error', text1: 'Failed to delete task' });
      }
    },
    [deleteTask]
  );

  const handleCreate = useCallback(
    async (payload: Parameters<typeof createTask>[0]) => {
      await createTask(payload);
      Toast.show({ type: 'success', text1: '✅ Task created!' });
    },
    [createTask]
  );

  const sparkData = buildSparklineData(tasks);
  const pendingCount = tasks.filter((t) => !t.is_completed).length;
  const completedToday = tasks.filter(
    (t) => t.is_completed && new Date(t.updated_at).toDateString() === new Date().toDateString()
  ).length;

  const firstName = user?.email?.split('@')[0] ?? 'there';

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshTasks}
            tintColor={Colors.accentStart}
          />
        }
        ListHeaderComponent={
          <>
            {/* Gradient hero header */}
            <LinearGradient
              colors={['#1A0533', '#0F0F1A', Colors.background]}
              style={styles.header}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
            >
              <SafeAreaView edges={['top']}>
                <View style={styles.headerInner}>
                  <View>
                    <Text style={styles.greeting}>
                      {greeting.text} {greeting.emoji}
                    </Text>
                    <Text style={styles.username}>{firstName}</Text>
                  </View>
                  <View style={styles.statsRow}>
                    <View style={styles.statPill}>
                      <Text style={styles.statNum}>{pendingCount}</Text>
                      <Text style={styles.statLabel}>pending</Text>
                    </View>
                    <View style={[styles.statPill, { borderColor: Colors.success }]}>
                      <Text style={[styles.statNum, { color: Colors.success }]}>{completedToday}</Text>
                      <Text style={styles.statLabel}>done today</Text>
                    </View>
                  </View>
                </View>

                {/* Sparkline */}
                <View style={styles.sparkWrap}>
                  <Text style={styles.sparkTitle}>7-day activity</Text>
                  <Sparkline
                    data={sparkData}
                    labels={DAY_LABELS}
                    width={width - Spacing.lg * 2}
                    height={56}
                    color={Colors.accentStart}
                  />
                </View>
              </SafeAreaView>
            </LinearGradient>

            {/* Section title */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>
                {tasks.length === 0 ? 'No tasks yet' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
              </Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <TaskCard
            task={item}
            index={index}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onPress={(id) => router.push(`/(tabs)/tasks/${id}`)}
          />
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon="checkmark-done-circle-outline"
              title="No tasks yet"
              subtitle={'Tap the + button to create\nyour first task'}
            />
          )
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => sheetRef.current?.open()}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[Colors.accentStart, Colors.accentEnd]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color={Colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      <CreateTaskSheet ref={sheetRef} onSubmit={handleCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: Spacing.lg },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  username: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', marginTop: 4 },
  statPill: {
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    minWidth: 52,
  },
  statNum: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.accentStart,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.3,
  },
  sparkWrap: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  sparkTitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  list: { paddingBottom: 120 },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.lg,
    borderRadius: Radius.full,
    shadowColor: Colors.accentStart,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
