import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { useTaskStore } from '../../../stores/taskStore';
import { FluxInput } from '../../../components/ui/FluxInput';
import { FluxButton } from '../../../components/ui/FluxButton';
import { PriorityPill } from '../../../components/ui/PriorityPill';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../../theme/tokens';
import { formatDueDateFull, formatRelative } from '../../../utils/dateUtils';
import { Task } from '../../../types';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks, updateTask, deleteTask, toggleTask } = useTaskStore();

  const task = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setPriority(task.priority);
      setDueDate(task.due_date ?? '');
      setIsDirty(false);
    }
  }, [task]);

  const markDirty = () => setIsDirty(true);

  const handleSave = async () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Title is required' });
      return;
    }
    setIsSaving(true);
    try {
      await updateTask(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: 'success', text1: 'Task updated' });
      setIsDirty(false);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save changes' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await deleteTask(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.back();
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete task' });
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const handleToggle = async () => {
    try {
      await toggleTask(id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update status' });
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </SafeAreaView>
        <View style={styles.centered}>
          <Text style={styles.notFound}>Task not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Task Details</Text>
          <TouchableOpacity onPress={handleDelete} disabled={isDeleting} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {/* Status banner */}
          <TouchableOpacity onPress={handleToggle} activeOpacity={0.8}>
            <GlassCard
              style={[styles.statusCard, task.is_completed && styles.statusCardDone]}
              glow={task.is_completed}
              glowColor={Colors.success}
            >
              <Ionicons
                name={task.is_completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={task.is_completed ? Colors.success : Colors.textSecondary}
              />
              <Text style={[styles.statusText, task.is_completed && { color: Colors.success }]}>
                {task.is_completed ? 'Completed — tap to reopen' : 'Pending — tap to complete'}
              </Text>
            </GlassCard>
          </TouchableOpacity>

          {/* Form */}
          <FluxInput
            label="Title"
            value={title}
            onChangeText={(t) => { setTitle(t); markDirty(); }}
            placeholder="Task title"
            containerStyle={styles.field}
          />

          <FluxInput
            label="Description"
            value={description}
            onChangeText={(t) => { setDescription(t); markDirty(); }}
            placeholder="Add context..."
            multiline
            numberOfLines={4}
            style={styles.textarea}
            containerStyle={styles.field}
          />

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Priority</Text>
            <View style={styles.pillRow}>
              {(['low', 'medium', 'high'] as const).map((p) => (
                <PriorityPill
                  key={p}
                  value={p}
                  selected={priority === p}
                  onPress={(v) => { setPriority(v); markDirty(); }}
                  style={styles.pillFlex}
                />
              ))}
            </View>
          </View>

          <FluxInput
            label="Due Date"
            value={dueDate}
            onChangeText={(d) => { setDueDate(d); markDirty(); }}
            placeholder="YYYY-MM-DD"
            containerStyle={styles.field}
          />

          {isDirty && (
            <FluxButton
              label={isSaving ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              isLoading={isSaving}
              size="lg"
              style={styles.saveBtn}
            />
          )}

          {/* Metadata */}
          <GlassCard style={styles.metaCard}>
            <MetaRow icon="calendar-outline" label="Created" value={formatRelative(task.created_at)} />
            <MetaRow icon="refresh-outline" label="Updated" value={formatRelative(task.updated_at)} />
            {task.due_date && (
              <MetaRow icon="time-outline" label="Due" value={formatDueDateFull(task.due_date)} />
            )}
            <MetaRow
              icon="phone-portrait-outline"
              label="Source"
              value={task.source.charAt(0).toUpperCase() + task.source.slice(1)}
            />
          </GlassCard>
        </View>
      </ScrollView>
    </View>
  );
}

const MetaRow = ({
  icon, label, value,
}: {
  icon: string; label: string; value: string;
}) => (
  <View style={metaStyles.row}>
    <Ionicons name={icon as 'calendar-outline'} size={14} color={Colors.textMuted} />
    <Text style={metaStyles.label}>{label}</Text>
    <Text style={metaStyles.value}>{value}</Text>
  </View>
);

const metaStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  label: { fontSize: FontSize.sm, color: Colors.textMuted, flex: 1, fontWeight: FontWeight.medium },
  value: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: Spacing.xs },
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  deleteBtn: { padding: Spacing.xs },
  scroll: { flex: 1 },
  body: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  statusCardDone: { borderColor: Colors.success },
  statusText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  field: { gap: Spacing.xs },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, letterSpacing: 0.3 },
  textarea: { height: 90, textAlignVertical: 'top', paddingTop: Spacing.sm },
  pillRow: { flexDirection: 'row', gap: Spacing.sm },
  pillFlex: { flex: 1, alignItems: 'center' },
  saveBtn: {},
  metaCard: { padding: Spacing.md, gap: 0 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { color: Colors.textSecondary, fontSize: FontSize.base },
});
