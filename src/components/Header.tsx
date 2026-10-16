import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { colors, radius, shadows, spacing } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";
import { Logo } from "./Logo";

export interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isNarrow = width < 400;

  const headerDynamicStyle: ViewStyle = {
    backgroundColor: isMobile ? "rgba(255, 255, 255, 0.85)" : colors.panel,
    ...(!isMobile && Platform.OS === "web"
      ? ({ backdropFilter: "blur(20px)" } as unknown as ViewStyle)
      : {}),
  };

  return (
    <View
      style={[
        styles.header,
        headerDynamicStyle,
        isMobile && styles.headerMobile,
      ]}
    >
      <View style={styles.brandRow}>
        {onToggleSidebar && (
          <Pressable
            style={[styles.sidebarToggle, isNarrow && styles.sidebarToggleNarrow, cursorPointer]}
            onPress={onToggleSidebar}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Basculer le menu latéral"
          >
            <Text style={styles.sidebarToggleIcon}>☰</Text>
          </Pressable>
        )}

        <View style={styles.brandBadge}>
          <Logo size={isNarrow ? 28 : 34} />
        </View>

        <View style={styles.brandTextCol}>
          <Text
            style={[styles.brandTitle, isNarrow && styles.brandTitleNarrow]}
            numberOfLines={1}
          >
            Todo
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <View style={[styles.localBadge, isNarrow && styles.localBadgeNarrow]}>
          <Text
            testID="storage-mode-badge"
            style={[styles.localBadgeText, isNarrow && styles.localBadgeTextNarrow]}
            numberOfLines={1}
          >
            Stockage local
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    zIndex: 10,
    ...shadows.sm,
  },
  headerMobile: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 1,
  },
  sidebarToggle: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceActive,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
    ...shadows.sm,
  },
  sidebarToggleNarrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 2,
  },
  sidebarToggleIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  brandBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  brandTextCol: {
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.brand,
    letterSpacing: -0.2,
  },
  brandTitleNarrow: {
    fontSize: 18,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  localBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: colors.primaryBackground,
    borderColor: colors.borderStrong,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  localBadgeNarrow: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  localBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  localBadgeTextNarrow: {
    fontSize: 10,
  },
});
