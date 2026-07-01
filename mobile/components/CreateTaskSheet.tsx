import React, { useCallback, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { FluxButton } from './ui/FluxButton';
import { FluxInput } from './ui/FluxInput';
import { PriorityPill } from './ui/PriorityPill';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme/tokens';
import { CreateTaskPayload } from '../types';

export interface CreateTaskSheetRef {
  open: () => void;
  close: () => void;
}

interface CreateTaskSheetProps {
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
}

export const CreateTaskSheet = forwardRef<CreateTaskSheetRef, CreateTaskSheetProps>(
  ({ onSubmit }, ref) => {
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['75%'], []);

    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [priority, setPriority] = React.useState<'low' | 'medium' | 'high'>('medium');
    const [dueDate, setDueDate] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [errors, setErrors] = React.useState<{ title?: string }>({});

    useImperativeHandle(ref, () => ({
      open: () => {
        sheetRef.current?.snapToIndex(0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      close: () => sheetRef.current?.close(),
    }));

    const reset = () => {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setErrors({});
    };

    const handleSubmit = async () => {
      if (!title.trim()) {
        setErrors({ title: 'Title is required' });
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          due_date: dueDate || undefined,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        reset();
        sheetRef.current?.close();
      } catch {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.6}
        />
      ),
      []
    );

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Task</Text>
            <TouchableOpacity onPress={() => { reset(); sheetRef.current?.close(); }}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>
            <FluxInput
              label="Title"
              value={title}
              onChangeText={(t) => { setTitle(t); setErrors({}); }}
              placeholder="What needs to be done?"
              error={errors.title}
              containerStyle={styles.field}
              returnKeyType="next"
              autoFocus
            />

            <FluxInput
              label="Description (optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Add some context..."
              containerStyle={styles.field}
              multiline
              numberOfLines={3}
              style={styles.textarea}
            />

            <View style={styles.field}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityRow}>
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <PriorityPill
                    key={p}
                    value={p}
                    selected={priority === p}
                    onPress={setPriority}
                    style={styles.pillFlex}
                  />
                ))}
              </View>
            </View>

            <FluxInput
              label="Due Date (optional)"
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD or ISO datetime"
              containerStyle={styles.field}
              keyboardType="default"
            />
          </ScrollView>

          <View style={styles.footer}>
            <FluxButton
              label={isSubmitting ? 'Creating...' : 'Create Task'}
              onPress={handleSubmit}
              isLoading={isSubmitting}
              size="lg"
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

CreateTaskSheet.displayName = 'CreateTaskSheet';

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    backgroundColor: Colors.border,
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  form: {
    flex: 1,
  },
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.3,
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pillFlex: {
    flex: 1,
    alignItems: 'center',
  },
  footer: {
    paddingVertical: Spacing.lg,
  },
});
