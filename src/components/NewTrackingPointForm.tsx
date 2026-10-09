import { createElement, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";
import { CalendarPicker } from "./CalendarPicker";

type Props = {
  onSave: (data: {
    title: string;
    status: string;
    nextStep: string;
    dueDate?: string;
  }) => Promise<void>;
};

export function NewTrackingPointForm({ onSave }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const reset = () => {
    setTitle("");
    setStatus("");
    setNextStep("");
    setDueDate("");
    setShowCalendar(false);
    setIsOpen(false);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    try {
      await onSave({ title, status, nextStep, dueDate: dueDate || undefined });
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

      <Text style={styles.fieldLabel}>Échéance</Text>
      <Pressable 
        style={[styles.dateButton, cursorPointer]} 
        onPress={() => setShowCalendar(!showCalendar)}
      >
        <Text style={[styles.dateButtonText, !dueDate && styles.dateButtonTextEmpty]}>
          📅 {dueDate || "Sélectionner une date"}
        </Text>
      </Pressable>
      {showCalendar && (
        <CalendarPicker 
          value={dueDate} 
          onChange={(val) => {
            setDueDate(val);
            setShowCalendar(false);
          }} 
        />
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
    borderColor: "rgba(255,255,255,0.4)",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  triggerText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 8,
  },
  titleInput: {
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: colors.overlayPanel,
    borderRadius: 10,
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





  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.overlayPanel,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateButtonText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  dateButtonTextEmpty: {
    color: colors.textMuted,
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
    color: colors.textOnBrand,
    fontWeight: "600",
  },
});
