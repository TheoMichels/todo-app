import { Pressable, StyleSheet, Text, View } from "react-native";
import { TrackingPoint } from "../types/trackingPoint";
import { colors, shadows } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";

type Props = {
  point: TrackingPoint;
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
  drag?: () => void;
  isActive?: boolean;
};

export function TrackingPointCard({ point, onOpen, onRemove, drag, isActive }: Props) {
  return (
    <View style={[styles.card, isActive && styles.cardActive]}>
      {drag && (
        <Pressable
          style={[styles.dragHandle, cursorPointer]}
          onPressIn={drag}
          hitSlop={8}
        >
          <Text style={styles.dragIcon}>☰</Text>
        </Pressable>
      )}
      <Pressable
        style={[styles.textArea, cursorPointer]}
        onPress={() => onOpen(point.id)}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>{point.title}</Text>
          {!!point.dueDate && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>📅 {point.dueDate}</Text>
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
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    ...shadows.sm,
  },
  cardActive: {
    transform: [{ scale: 1.01 }],
    ...shadows.md,
    backgroundColor: colors.overlayPanel,
    borderColor: colors.border,
  },
  dragHandle: {
    padding: 4,
    justifyContent: "center",
  },
  dragIcon: {
    color: colors.textMuted,
    fontSize: 18,
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
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.overlayPanel,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  line: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 22,
  },
  lineLabel: {
    color: colors.textMuted,
    fontWeight: "600",
  },
  delete: {
    fontSize: 18,
    color: colors.textMuted,
    paddingHorizontal: 4,
  },
});
