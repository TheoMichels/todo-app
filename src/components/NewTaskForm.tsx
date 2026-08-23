import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Priority } from "../types/todo";
import { colors } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";
import { Calendar } from "./Calendar";

type Props = {
  onAdd: (
    title: string,
    options: { priority: Priority; dueDate: number | null }
  ) => Promise<void>;
};

function formatDueDate(dateMs: number) {
  return new Date(dateMs).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function NewTaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [dueDate, setDueDate] = useState<number | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) return;
    try {
      await onAdd(title, { priority: urgent ? "urgent" : "standard", dueDate });
      setTitle("");
      setUrgent(false);
      setDueDate(null);
      setShowCalendar(false);
    } catch {
      // Surfaced by the parent's error banner; keep the form filled so nothing is lost.
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Ajouter une tâche..."
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />

        <Pressable
          style={[styles.urgentToggle, urgent && styles.urgentToggleActive, cursorPointer]}
          onPress={() => setUrgent((v) => !v)}
        >
          <View style={[styles.checkbox, urgent && styles.checkboxChecked]}>
            {urgent && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.urgentLabel, urgent && styles.urgentLabelActive]}>
            Urgent
          </Text>
        </Pressable>

        <Pressable
          style={[styles.dueDateButton, dueDate != null && styles.dueDateButtonActive, cursorPointer]}
          onPress={() => setShowCalendar((v) => !v)}
        >
          <Text
            style={[styles.dueDateText, dueDate != null && styles.dueDateTextActive]}
          >
            {dueDate != null ? formatDueDate(dueDate) : "+ Échéance"}
          </Text>
        </Pressable>

        <Pressable style={[styles.addButton, cursorPointer]} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Ajouter</Text>
        </Pressable>
      </View>

      {showCalendar && (
        <View style={styles.calendarPopover}>
          <Calendar
            value={dueDate}
            onSelect={(dateMs) => {
              setDueDate(dateMs);
              setShowCalendar(false);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.textPrimary,
  },
  urgentToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  urgentToggleActive: {
    borderColor: colors.urgent,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.urgent,
    borderColor: colors.urgent,
  },
  checkmark: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: "bold",
  },
  urgentLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  urgentLabelActive: {
    color: colors.textPrimary,
  },
  dueDateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dueDateButtonActive: {
    borderColor: colors.accent,
  },
  dueDateText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  dueDateTextActive: {
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
  },
  addButtonText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  calendarPopover: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignSelf: "flex-start",
  },
});
