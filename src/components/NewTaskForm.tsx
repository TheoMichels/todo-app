import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    const prevTitle = title;
    const prevUrgent = urgent;

    setTitle("");
    setUrgent(false);

    try {
      await onAdd(trimmedTitle, { priority: prevUrgent ? "urgent" : "standard" });
    } catch {
      // Surfaced by the parent's error banner; keep the form filled so nothing is lost.
      setTitle(prevTitle);
      setUrgent(prevUrgent);
    }
  };

  const isWeb = Platform.OS === "web";

  const formContent = (
    <>
      {isWeb && (
        <input
          type="text"
          name="prevent_autofill"
          id="prevent_autofill"
          style={{ display: "none" }}
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
        />
      )}
      <TextInput
        id="new-task-title"
        nativeID="new-task-title"
        testID="new-task-input"
        style={styles.input}
        placeholder="Ajouter une tâche..."
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
        inputMode="text"
        autoComplete="off"
        textContentType="none"
        importantForAutofill="no"
        autoCorrect={false}
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
    </>
  );

  if (isWeb) {
    return (
      <form
        style={styles.container as unknown as React.CSSProperties}
        action="#"
        method="get"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
      >
        {formContent}
      </form>
    );
  }

  return <View style={styles.container}>{formContent}</View>;
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
