import { Pressable, StyleSheet, Text, View, Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import { useEffect, useRef, useState } from "react";
import { Todo } from "../types/todo";
import { colors, shadows } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
  onRestore?: (id: string) => void;
  sectionName?: string;
};

function formatDueDate(dateMs: number) {
  return new Date(dateMs).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function TodoItem({
  todo,
  onToggle,
  onOpen,
  onRemove,
  onRestore,
  sectionName,
}: Props) {
  const hasBadges = todo.priority === "urgent" || !!todo.dueDate || !!sectionName;

  const [isChecked, setIsChecked] = useState(todo.done);
  const [isAnimating, setIsAnimating] = useState(false);

  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Sync state if it changes externally
  useEffect(() => {
    if (!isAnimating) {
      setIsChecked(todo.done);
      opacityAnim.setValue(1);
      scaleAnim.setValue(1);
    }
  }, [todo.done, isAnimating, opacityAnim, scaleAnim]);

  const handleToggle = () => {
    if (isAnimating) return;

    setIsChecked(!todo.done);
    setIsAnimating(true);

    Animated.sequence([
      Animated.delay(200), // Laisser le temps de voir la checkbox cochée
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Animer la disparition de la liste (Android/iOS)
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onToggle(todo.id);
    });
  };

  return (
    <Animated.View style={[styles.row, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.topLine}>
        <Pressable
          style={[styles.checkbox, cursorPointer]}
          onPress={handleToggle}
          hitSlop={8}
        >
          <View style={[styles.checkboxInner, isChecked && styles.checkboxDone]}>
            {isChecked && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </Pressable>

        <Pressable
          style={[styles.titleArea, cursorPointer]}
          onPress={() => onOpen(todo.id)}
        >
          <Text style={[styles.title, isChecked && styles.titleDone]}>
            {todo.title}
          </Text>
        </Pressable>

        <Pressable
          style={cursorPointer}
          onPress={() => onRemove(todo.id)}
          hitSlop={8}
        >
          <Text style={styles.delete}>✕</Text>
        </Pressable>
      </View>

      {(hasBadges || onRestore) && (
        <View style={styles.badgeRow}>
          <View style={styles.badgeGroup}>
            {sectionName && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{sectionName}</Text>
              </View>
            )}
            {todo.priority === "urgent" && (
              <View style={[styles.badge, styles.badgeUrgent]}>
                <Text style={styles.badgeText}>Urgent</Text>
              </View>
            )}
            {todo.dueDate && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {formatDueDate(todo.dueDate)}
                </Text>
              </View>
            )}
          </View>

          {onRestore && (
            <Pressable
              style={cursorPointer}
              onPress={() => onRestore(todo.id)}
              hitSlop={8}
            >
              <Text style={styles.restore}>↺</Text>
            </Pressable>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    ...shadows.sm,
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    padding: 2,
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "bold",
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "400",
    color: colors.textPrimary,
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: colors.textMuted,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 8,
    marginLeft: 38,
  },
  badgeGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    flexShrink: 1,
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeUrgent: {
    backgroundColor: colors.urgent,
    borderColor: colors.urgent,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  restore: {
    fontSize: 18,
    color: colors.accent,
    paddingHorizontal: 8,
  },
  delete: {
    fontSize: 18,
    color: colors.textMuted,
    paddingHorizontal: 8,
  },
});
