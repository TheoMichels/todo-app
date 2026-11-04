import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { TrackingPoint } from "../types/trackingPoint";
import { colors, shadows } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";

type Props = {
  point: TrackingPoint;
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
  drag?: () => void;
  isActive?: boolean;
  sectionName?: string;
  sectionColor?: string;
};

export function TrackingPointCard({ point, onOpen, onRemove, drag, isActive, sectionName, sectionColor }: Props) {
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const isOverdue = !!point.dueDate && point.dueDate < localToday;
  return (
    <View testID={`tracking-${point.id}`} style={[styles.card, isActive && styles.cardActive]}>
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
            <View testID="tracking-due-date" style={[styles.badge, isOverdue && styles.overdueBadge]}>
              {isOverdue && (
                <Svg width={14} height={14} viewBox="0 0 16 16" fill="none" accessibilityElementsHidden>
                  <Circle cx={8} cy={8} r={6.5} stroke={colors.danger} strokeWidth={1.5} />
                  <Path d="M8 4.5V8l2.25 1.5" stroke={colors.danger} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              )}
              <Text style={[styles.badgeText, isOverdue && styles.overdueText]}>{isOverdue ? "Dépassé · " : "📅 "}{point.dueDate}</Text>
            </View>
          )}
        </View>

        {!!sectionName && <View testID="section-badge" style={[styles.sectionBadge, { backgroundColor: sectionColor }]}><Text style={styles.badgeText}>{sectionName}</Text></View>}
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
  sectionBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 4 },
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
  overdueBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, backgroundColor: colors.dangerSoft, borderColor: "transparent" },
  overdueText: { color: colors.danger },
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
