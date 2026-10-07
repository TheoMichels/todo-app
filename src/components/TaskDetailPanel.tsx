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
    borderRadius: 24,
    backgroundColor: colors.overlayPanel,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: "#93A5CE",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 16,
    ...({ backdropFilter: "blur(32px)" } as any),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },
  close: {
    fontSize: 16,
    color: colors.textMuted,
    paddingHorizontal: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 0.2,
  },
  titleInput: {
    fontSize: 15,
    fontWeight: "400",
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 12,
  },
  priorityPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
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
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  priorityTextSelected: {
    color: colors.textOnBrand,
  },
  dueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dueDateText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  removeDueDate: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: "500",
  },
  addDueDate: {
    fontSize: 15,
    color: colors.accent,
    fontWeight: "600",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    textAlign: "center",
  },
});
