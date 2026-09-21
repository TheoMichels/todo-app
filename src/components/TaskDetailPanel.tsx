import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Priority, Todo } from "../types/todo";
import { colors } from "../theme/colors";
import { Calendar } from "./Calendar";

type Props = {
  todo: Todo;
  onChange: (patch: Partial<Pick<Todo, "title" | "priority" | "dueDate">>) => void;
  onClose: () => void;
};

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "urgent", label: "Urgent" },
];

function formatDate(dateMs: number) {
  return new Date(dateMs).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function TaskDetailPanel({ todo, onChange, onClose }: Props) {
  const [title, setTitle] = useState(todo.title);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    setTitle(todo.title);
    setShowCalendar(false);
  }, [todo.id]);

  const commitTitle = () => {
    if (title.trim()) onChange({ title });
    else setTitle(todo.title);
  };

  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>Détails de la tâche</Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.fieldLabel}>Titre</Text>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          onBlur={commitTitle}
          onSubmitEditing={commitTitle}
        />

        <Text style={styles.fieldLabel}>Priorité</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map(({ value, label }) => {
            const selected = todo.priority === value;
            return (
              <Pressable
                key={value}
                style={[
                  styles.priorityPill,
                  selected &&
                    (value === "urgent"
                      ? styles.priorityPillUrgent
                      : styles.priorityPillSelected),
                ]}
                onPress={() => onChange({ priority: value })}
              >
                <Text
                  style={[
                    styles.priorityText,
                    selected && styles.priorityTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>Date d'échéance</Text>
        {todo.dueDate ? (
          <View style={styles.dueDateRow}>
            <Pressable onPress={() => setShowCalendar((v) => !v)}>
              <Text style={styles.dueDateText}>{formatDate(todo.dueDate)}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onChange({ dueDate: null });
                setShowCalendar(false);
              }}
              hitSlop={8}
            >
              <Text style={styles.removeDueDate}>Retirer</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setShowCalendar((v) => !v)}>
            <Text style={styles.addDueDate}>+ Ajouter une date</Text>
          </Pressable>
        )}

        {showCalendar && (
          <Calendar
            value={todo.dueDate}
            onSelect={(dateMs) => {
              onChange({ dueDate: dateMs });
              setShowCalendar(false);
            }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.overlayPanel,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  close: {
    fontSize: 16,
    color: colors.textMuted,
    paddingHorizontal: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 16,
  },
  titleInput: {
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityPillSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  priorityPillUrgent: {
    backgroundColor: colors.urgent,
    borderColor: colors.urgent,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  priorityTextSelected: {
    color: colors.textOnBrand,
  },
  dueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dueDateText: {
    fontSize: 14,
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  removeDueDate: {
    fontSize: 13,
    color: colors.danger,
  },
  addDueDate: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: "500",
  },
});
