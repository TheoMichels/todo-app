import React, { useState } from "react";
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
import { isLocalMode } from "../config/storageMode";
import { useAuth } from "../hooks/useAuth";
import { AuthModal } from "./AuthModal";

export interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isNarrow = width < 400;

  const { user, isAuthenticated, signOut } = useAuth();
  const [authModalVisible, setAuthModalVisible] = useState(false);

  const headerDynamicStyle: ViewStyle = {
    backgroundColor: isMobile ? "rgba(255, 255, 255, 0.85)" : colors.panel,
    ...(!isMobile && Platform.OS === "web"
      ? ({ backdropFilter: "blur(20px)" } as unknown as ViewStyle)
      : {}),
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
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
          {isLocalMode ? (
            <View style={[styles.localBadge, isNarrow && styles.localBadgeNarrow]}>
              <Text
                testID="storage-mode-badge"
                style={[styles.localBadgeText, isNarrow && styles.localBadgeTextNarrow]}
                numberOfLines={1}
              >
                Stockage local
              </Text>
            </View>
          ) : (
            <View style={styles.cloudAuthRow}>
              <Pressable
                style={[styles.cloudAccountBtn, isNarrow && styles.cloudAccountBtnNarrow, cursorPointer]}
                onPress={() => setAuthModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Gérer mon compte et synchronisation"
              >
                <Text style={styles.cloudIcon}>☁️</Text>
                {!isNarrow && (
                  <Text style={styles.cloudAccountText} numberOfLines={1}>
                    {isAuthenticated && user?.email ? user.email.split("@")[0] : "Compte"}
                  </Text>
                )}
              </Pressable>

              {isAuthenticated && (
                <Pressable
                  style={[styles.logoutBtn, isNarrow && styles.logoutBtnNarrow, cursorPointer]}
                  onPress={handleSignOut}
                  accessibilityRole="button"
                  accessibilityLabel="Se déconnecter"
                >
                  <Text style={styles.logoutBtnText}>Déconnexion</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>

      {!isLocalMode && (
        <AuthModal
          visible={authModalVisible}
          onClose={() => setAuthModalVisible(false)}
        />
      )}
    </>
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
  cloudAuthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  cloudAccountBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  cloudAccountBtnNarrow: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  cloudIcon: {
    fontSize: 13,
  },
  cloudAccountText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceActive,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutBtnNarrow: {
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.danger,
  },
});
