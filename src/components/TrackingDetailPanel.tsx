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

type Props = {
  point: TrackingPoint;
  onChange: (
    patch: Partial<Pick<TrackingPoint, "title" | "status" | "nextStep">>
  ) => void;
  onClose: () => void;
};

export function TrackingDetailPanel({ point, onChange, onClose }: Props) {
  const [title, setTitle] = useState(point.title);
  const [status, setStatus] = useState(point.status);
  const [nextStep, setNextStep] = useState(point.nextStep);

  useEffect(() => {
    setTitle(point.title);
    setStatus(point.status);
    setNextStep(point.nextStep);
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
    boxShadow: "0px 16px 32px rgba(147, 165, 206, 0.2)",
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
  textArea: {
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 100,
    textAlignVertical: "top",
    lineHeight: 22,
  },




});
