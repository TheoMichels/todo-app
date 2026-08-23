import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { TrackingPoint } from "../types/trackingPoint";
import { colors } from "../theme/colors";
import { Calendar } from "./Calendar";

type Props = {
  point: TrackingPoint;
  onChange: (
    patch: Partial<Pick<TrackingPoint, "title" | "status" | "nextStep" | "nextDueDate">>
  ) => void;
  onClose: () => void;
};

function formatDate(dateMs: number) {
  return new Date(dateMs).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function TrackingDetailPanel({ point, onChange, onClose }: Props) {
  const [title, setTitle] = useState(point.title);
  const [status, setStatus] = useState(point.status);
  const [nextStep, setNextStep] = useState(point.nextStep);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    setTitle(point.title);
    setStatus(point.status);
    setNextStep(point.nextStep);
    setShowCalendar(false);
  }, [point.id]);

  const commitTitle = () => {
    if (title.trim()) onChange({ title });
    else setTitle(point.title);
  };

  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>Détails du point de suivi</Text>
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
          onKeyPress={(e) => {
            if (e.nativeEvent.key === "Enter") commitTitle();
          }}
        />

        <Text style={styles.fieldLabel}>Statut actuel</Text>
        <TextInput
          style={styles.textArea}
          value={status}
          onChangeText={setStatus}
          onBlur={() => onChange({ status })}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.fieldLabel}>Next step</Text>
        <TextInput
          style={styles.textArea}
          value={nextStep}
          onChangeText={setNextStep}
          onBlur={() => onChange({ nextStep })}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.fieldLabel}>Prochaine échéance</Text>
        {point.nextDueDate ? (
          <View style={styles.dueDateRow}>
            <Pressable onPress={() => setShowCalendar((v) => !v)}>
              <Text style={styles.dueDateText}>
                {formatDate(point.nextDueDate)}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onChange({ nextDueDate: null });
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
            value={point.nextDueDate}
            onSelect={(dateMs) => {
              onChange({ nextDueDate: dateMs });
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
  textArea: {
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 70,
    textAlignVertical: "top",
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
