import { Pressable, StyleSheet, Text, View } from "react-native";
import { TrackingPoint } from "../types/trackingPoint";
import { colors } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";

type Props = {
  point: TrackingPoint;
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
};

function formatDueDate(dateMs: number) {
  return new Date(dateMs).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function TrackingPointCard({ point, onOpen, onRemove }: Props) {
  return (
    <View style={styles.card}>
      <Pressable
        style={[styles.textArea, cursorPointer]}
        onPress={() => onOpen(point.id)}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>{point.title}</Text>
          {point.nextDueDate && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {formatDueDate(point.nextDueDate)}
              </Text>
            </View>
          )}
        </View>

        {!!point.status && (
          <Text style={styles.line} numberOfLines={2}>
            <Text style={styles.lineLabel}>Statut actuel : </Text>
            {point.status}
          </Text>
        )}

        {!!point.nextStep && (
          <Text style={styles.line} numberOfLines={2}>
            <Text style={styles.lineLabel}>Next step : </Text>
            {point.nextStep}
          </Text>
        )}
      </Pressable>

      <Pressable
        style={cursorPointer}
        onPress={() => onRemove(point.id)}
        hitSlop={8}
      >
        <Text style={styles.delete}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  textArea: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 4,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.overlayPanel,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  line: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lineLabel: {
    color: colors.textMuted,
    fontWeight: "600",
  },
  delete: {
    fontSize: 16,
    color: colors.danger,
    paddingHorizontal: 4,
  },
});
