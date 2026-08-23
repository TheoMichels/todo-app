import { Pressable, StyleSheet, Text, View } from "react-native";
import { Todo } from "../types/todo";
import { colors } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
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
  sectionName,
}: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.checkbox, cursorPointer]}
        onPress={() => onToggle(todo.id)}
        hitSlop={8}
      >
        <View style={[styles.checkboxInner, todo.done && styles.checkboxDone]}>
          {todo.done && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </Pressable>

      <Pressable
        style={[styles.textArea, cursorPointer]}
        onPress={() => onOpen(todo.id)}
      >
        <Text style={[styles.title, todo.done && styles.titleDone]}>
          {todo.title}
        </Text>
        {(todo.priority === "urgent" || todo.dueDate || sectionName) && (
          <View style={styles.badgeRow}>
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
        )}
      </Pressable>

      <Pressable
        style={cursorPointer}
        onPress={() => onRemove(todo.id)}
        hitSlop={8}
      >
        <Text style={styles.delete}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  checkbox: {
    padding: 2,
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
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
    fontSize: 13,
    fontWeight: "bold",
  },
  textArea: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: colors.textMuted,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  badgeUrgent: {
    backgroundColor: colors.urgent,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  delete: {
    fontSize: 16,
    color: colors.danger,
    paddingHorizontal: 8,
  },
});
