import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { colors, radius, spacing } from "../theme/colors";
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
  const isNarrow = width < 420;

  const { user, isAuthenticated, signOut } = useAuth();
  const [authModalVisible, setAuthModalVisible] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Ignoré en UI directe
    }
  };

  return (
    <>
      <View style={styles.topBar}>
        {onToggleSidebar && (
          <Pressable
            style={[styles.sidebarToggle, cursorPointer]}
            onPress={onToggleSidebar}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Basculer le menu latéral"
          >
            <Text style={styles.sidebarToggleIcon}>☰</Text>
          </Pressable>
        )}

        <View style={styles.brand}>
          <Logo size={48} />
          <Text style={styles.brandTitle} numberOfLines={1}>
            Todo
          </Text>
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
  topBar: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
    zIndex: 10,
  },
  sidebarToggle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  sidebarToggleIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  brand: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    pointerEvents: "none",
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },
  actionsRow: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  localBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255, 255, 255, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.60)",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  localBadgeNarrow: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  localBadgeText: {
    fontSize: 11,
    fontWeight: "600",
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
    backgroundColor: colors.panel,
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
    fontWeight: "600",
    color: colors.primary,
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.panel,
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
