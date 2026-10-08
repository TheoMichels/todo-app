import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Priority } from "../types/todo";
import { colors } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";

type Props = {
  onAdd: (
    title: string,
    options: { priority: Priority }
  ) => Promise<void>;
};

export function NewTaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [urgent, setUrgent] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) return;
    try {
      await onAdd(title, { priority: urgent ? "urgent" : "standard" });
      setTitle("");
      setUrgent(false);
    } catch {
      // Surfaced by the parent's error banner; keep the form filled so nothing is lost.
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Ajouter une tâche..."
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
      />

      <View style={styles.controlsRow}>
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

        <Pressable style={[styles.addButton, cursorPointer]} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Ajouter</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    gap: 12,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  urgentToggle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  urgentToggleActive: {
    borderColor: colors.urgent,
    backgroundColor: `${colors.urgent}10`,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 6,
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
    fontSize: 12,
    fontWeight: "bold",
  },
  urgentLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  urgentLabelActive: {
    color: colors.urgent,
    fontWeight: "600",
  },




  addButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: colors.textOnBrand,
    fontWeight: "600",
    fontSize: 15,
  },

});
