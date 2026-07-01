import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  FadeInDown,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  getPriorityColor,
} from '../theme/tokens';
import { formatDueDate, isOverdue } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (id: string) => void;
}

const SWIPE_THRESHOLD = 80;

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onToggle,
  onDelete,
  onPress,
}) => {
  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const checkScale = useSharedValue(1);

  const { color: priorityColor } = getPriorityColor(task.priority);
  const dueDateStr = formatDueDate(task.due_date);
  const overdue = isOverdue(task.due_date, task.is_completed);

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    checkScale.value = withSpring(0.8, { damping: 8 }, () => {
      checkScale.value = withSpring(1.2, { damping: 6 }, () => {
        checkScale.value = withSpring(1);
      });
    });
    onToggle(task.id);
  }, [task.id, onToggle, checkScale]);

  const handleDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(task.id);
  }, [task.id, onDelete]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = Math.max(-140, Math.min(0, e.translationX));
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        // Snap to reveal delete
        translateX.value = withSpring(-120);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: cardOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(300).springify()}
      style={styles.wrapper}
    >
      {/* Delete action revealed on swipe */}
      <TouchableOpacity style={styles.deleteAction} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={22} color={Colors.textPrimary} />
        <Text style={styles.deleteLabel}>Delete</Text>
      </TouchableOpacity>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Priority stripe */}
          <View style={[styles.priorityStripe, { backgroundColor: priorityColor }]} />

          {/* Checkbox */}
          <Animated.View style={checkStyle}>
            <Pressable onPress={handleToggle} style={styles.checkboxArea} hitSlop={10}>
              <View
                style={[
                  styles.checkbox,
                  task.is_completed && {
                    backgroundColor: Colors.accentStart,
                    borderColor: Colors.accentStart,
                    shadowColor: Colors.accentStart,
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 6,
                  },
                ]}
              >
                {task.is_completed && (
                  <Ionicons name="checkmark" size={14} color={Colors.white} />
                )}
              </View>
            </Pressable>
          </Animated.View>

          {/* Content */}
          <TouchableOpacity
            style={styles.content}
            onPress={() => onPress(task.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.title,
                task.is_completed && styles.titleCompleted,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>

            {task.description ? (
              <Text style={styles.description} numberOfLines={1}>
                {task.description}
              </Text>
            ) : null}

            <View style={styles.meta}>
              {dueDateStr ? (
                <View style={[styles.tag, overdue && styles.tagOverdue]}>
                  <Ionicons
                    name="time-outline"
                    size={11}
                    color={overdue ? Colors.error : Colors.textMuted}
                  />
                  <Text style={[styles.tagText, overdue && { color: Colors.error }]}>
                    {dueDateStr}
                  </Text>
                </View>
              ) : null}

              {task.source === 'email' && (
                <View style={styles.sourceTag}>
                  <Ionicons name="mail-outline" size={11} color={Colors.accentEnd} />
                  <Text style={[styles.tagText, { color: Colors.accentEnd }]}>
                    Email
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: Colors.error,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    minHeight: 72,
  },
  priorityStripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  checkboxArea: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.md,
    gap: 4,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surfaceHover,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.xs,
  },
  tagOverdue: {
    backgroundColor: Colors.errorBg,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.glowCyan,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.xs,
  },
  tagText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
});
