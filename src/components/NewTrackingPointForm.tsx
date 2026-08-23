import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";
import { Calendar } from "./Calendar";

type Props = {
  onSave: (data: {
    title: string;
    status: string;
    nextStep: string;
    nextDueDate: number | null;
  }) => Promise<void>;
};

function formatDueDate(dateMs: number) {
  return new Date(dateMs).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function NewTrackingPointForm({ onSave }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [dueDate, setDueDate] = useState<number | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const reset = () => {
    setTitle("");
    setStatus("");
    setNextStep("");
    setDueDate(null);
    setShowCalendar(false);
    setIsOpen(false);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    try {
      await onSave({ title, status, nextStep, nextDueDate: dueDate });
      reset();
    } catch {
      // Surfaced by the parent's error banner; keep the form open and filled.
    }
  };

  if (!isOpen) {
    return (
      <Pressable
        style={[styles.trigger, cursorPointer]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.triggerText}>+ Nouveau</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.fieldLabel}>Titre</Text>
      <TextInput
        style={styles.titleInput}
        placeholder="Ex : Livraison dépendance équipe A"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      <Text style={styles.fieldLabel}>Statut actuel</Text>
      <TextInput
        style={styles.textArea}
        placeholder="..."
        placeholderTextColor={colors.textMuted}
        value={status}
        onChangeText={setStatus}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.fieldLabel}>Next step</Text>
      <TextInput
        style={styles.textArea}
        placeholder="..."
        placeholderTextColor={colors.textMuted}
        value={nextStep}
        onChangeText={setNextStep}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.fieldLabel}>Prochaine échéance</Text>
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

      <View style={styles.actions}>
        <Pressable style={cursorPointer} onPress={reset}>
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
        <Pressable
          style={[styles.saveButton, cursorPointer]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Sauvegarder</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMuted,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 6,
    marginTop: 12,
  },
  titleInput: {
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.overlayPanel,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.overlayPanel,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 70,
    textAlignVertical: "top",
  },
  dueDateButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.overlayPanel,
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
  calendarPopover: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.overlayPanel,
    alignSelf: "flex-start",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
  },
  cancelText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
