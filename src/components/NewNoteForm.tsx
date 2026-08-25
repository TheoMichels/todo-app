import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";

type Props = {
  onSave: (title: string, description: string) => Promise<void>;
};

export function NewNoteForm({ onSave }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setIsOpen(false);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    try {
      await onSave(title, description);
      reset();
    } catch {
      // Surfaced by the parent's error banner; keep the form open and filled.
    }
  };

  if (!isOpen) {
    return (
      <Pressable style={[styles.trigger, cursorPointer]} onPress={() => setIsOpen(true)}>
        <Text style={styles.triggerText}>+ Nouvelle note</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <TextInput
        style={styles.titleInput}
        placeholder="Titre"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
        autoFocus
      />
      <TextInput
        style={styles.descriptionInput}
        placeholder="Description"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      <View style={styles.actions}>
        <Pressable style={cursorPointer} onPress={reset}>
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
        <Pressable style={[styles.saveButton, cursorPointer]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Sauvegarder</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 260,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMuted,
  },
  card: {
    width: 260,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.overlayPanel,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  descriptionInput: {
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.overlayPanel,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 80,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
  },
  cancelText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 13,
  },
});
