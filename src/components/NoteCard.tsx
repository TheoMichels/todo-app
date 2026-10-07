import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { Note } from "../types/note";
import { colors, shadows } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";

type Props = {
  note: Note;
  onUpdate: (id: string, title: string, description: string) => void;
  onRemove: (id: string) => void;
};

export function NoteCard({ note, onUpdate, onRemove }: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [description, setDescription] = useState(note.description);

  const startEditing = () => {
    setTitle(note.title);
    setDescription(note.description);
    setIsEditing(true);
  };

  const cancel = () => setIsEditing(false);

  const save = () => {
    if (!title.trim()) return;
    onUpdate(note.id, title, description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <View style={[styles.card, isMobile && styles.cardMobile]}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Titre"
          placeholderTextColor={colors.textMuted}
          autoFocus
        />
        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
        />
        <View style={styles.actions}>
          <Pressable style={cursorPointer} onPress={cancel}>
            <Text style={styles.cancelText}>Annuler</Text>
          </Pressable>
          <Pressable style={[styles.saveButton, cursorPointer]} onPress={save}>
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, isMobile && styles.cardMobile]}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {note.title}
        </Text>
        <View style={styles.icons}>
          <Pressable style={cursorPointer} onPress={startEditing} hitSlop={8}>
            <Text style={styles.icon}>✎</Text>
          </Pressable>
          <Pressable style={cursorPointer} onPress={() => onRemove(note.id)} hitSlop={8}>
            <Text style={[styles.icon, styles.deleteIcon]}>✕</Text>
          </Pressable>
        </View>
      </View>
      {!!note.description && <Text style={styles.description}>{note.description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 240,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    ...shadows.sm,
  },
  cardMobile: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  icons: {
    flexDirection: "row",
    gap: 12,
  },
  icon: {
    fontSize: 16,
    color: colors.textMuted,
  },
  deleteIcon: {
    color: colors.danger,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  titleInput: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.overlayPanel,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  descriptionInput: {
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.overlayPanel,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 100,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
  },
  cancelText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveButtonText: {
    color: colors.textOnBrand,
    fontWeight: "600",
    fontSize: 14,
  },
});
