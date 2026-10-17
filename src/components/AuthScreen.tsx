import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradient, radius, shadows, spacing } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";
import { Logo } from "./Logo";
import { useAuth } from "../hooks/useAuth";
import { isSupabaseConfigured } from "../config/supabase";
import { credentialsSchema } from "../types/schemas";

export function AuthScreen(): React.JSX.Element {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { signIn, signUp, isLoading: isAuthLoading } = useAuth();

  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTabChange = (newMode: "signIn" | "signUp") => {
    setMode(newMode);
    setFeedbackError(null);
    setFeedbackSuccess(null);
  };

  const handleSubmit = async () => {
    setFeedbackError(null);
    setFeedbackSuccess(null);

    if (!isSupabaseConfigured) {
      setFeedbackError(
        "Configuration Supabase requise : veuillez renseigner EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans votre fichier .env"
      );
      return;
    }

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setFeedbackError("Veuillez renseigner tous les champs obligatoires.");
      return;
    }

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setFeedbackError("Veuillez saisir une adresse email valide.");
      return;
    }

    if (password.length < 6) {
      setFeedbackError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (mode === "signUp" && password !== confirmPassword) {
      setFeedbackError("Les mots de passe ne correspondent pas.");
      return;
    }

    const parseResult = credentialsSchema.safeParse({ email: cleanEmail, password });
    if (!parseResult.success) {
      setFeedbackError(
        parseResult.error.issues[0]?.message ||
          "Saisissez une adresse email valide et un mot de passe de 6 caractères minimum."
      );
      return;
    }

    setIsSubmitting(true);

    if (mode === "signIn") {
      const result = await signIn(cleanEmail, password);
      setIsSubmitting(false);

      if (!result.success) {
        setFeedbackError(
          result.error || "Échec de connexion. Vérifiez vos identifiants."
        );
      } else {
        setFeedbackSuccess("Connexion réussie ! Chargement de vos données...");
      }
    } else {
      const result = await signUp(cleanEmail, password);
      setIsSubmitting(false);

      if (!result.success) {
        setFeedbackError(
          result.error || "Échec de l'inscription. Veuillez réessayer."
        );
      } else {
        setFeedbackSuccess(
          "Compte créé avec succès ! Si la confirmation par email est activée, veuillez valider votre boîte de réception."
        );
      }
    }
  };

  const isBusy = isSubmitting || isAuthLoading;

  return (
    <LinearGradient
      colors={gradient.colors}
      locations={gradient.locations}
      start={gradient.start}
      end={gradient.end}
      style={styles.gradientContainer}
      testID="auth-screen"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, isMobile && styles.cardMobile]}>
            {/* Header Todo : Logo, Titre & Sous-titre */}
            <View style={styles.brandHeader}>
              <View style={styles.logoBadge}>
                <Logo size={64} />
              </View>
              <Text style={styles.brandTitle}>Todo</Text>
              <Text style={styles.brandSubtitle}>Gestion de tâches & suivi</Text>
              <Text style={styles.brandDescription}>
                Espace sécurisé et synchronisé. Connectez-vous pour accéder à vos
                tâches et notes.
              </Text>
            </View>

            {/* Alerte Pédagogique si Supabase non configuré */}
            {!isSupabaseConfigured && (
              <View
                style={styles.unconfiguredBox}
                testID="unconfigured-banner"
                accessibilityRole="alert"
              >
                <View style={styles.unconfiguredHeader}>
                  <Text style={styles.unconfiguredIcon}>⚠️</Text>
                  <Text style={styles.unconfiguredTitle}>
                    Configuration Supabase requise
                  </Text>
                </View>
                <Text style={styles.unconfiguredMessage}>
                  Veuillez renseigner{" "}
                  <Text style={styles.codeText}>EXPO_PUBLIC_SUPABASE_URL</Text>{" "}
                  et{" "}
                  <Text style={styles.codeText}>
                    EXPO_PUBLIC_SUPABASE_ANON_KEY
                  </Text>{" "}
                  dans votre fichier <Text style={styles.codeText}>.env</Text>{" "}
                  puis redémarrer le serveur Expo.
                </Text>
              </View>
            )}

            {/* Bannières Feedback Erreur / Succès */}
            {feedbackError && (
              <View
                style={styles.errorBanner}
                testID="auth-error-banner"
                accessibilityRole="alert"
              >
                <Text style={styles.errorBannerText}>{feedbackError}</Text>
              </View>
            )}

            {feedbackSuccess && (
              <View
                style={styles.successBanner}
                testID="auth-success-banner"
                accessibilityRole="alert"
              >
                <Text style={styles.successBannerText}>{feedbackSuccess}</Text>
              </View>
            )}

            {/* Onglets Connexion / Inscription */}
            <View style={styles.tabContainer}>
              <Pressable
                testID="tab-signin"
                accessibilityRole="button"
                accessibilityLabel="Onglet Connexion"
                accessibilityState={{ selected: mode === "signIn", disabled: isBusy }}
                style={[
                  styles.tabButton,
                  cursorPointer,
                  mode === "signIn" && styles.tabButtonActive,
                ]}
                onPress={() => handleTabChange("signIn")}
                disabled={isBusy}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    mode === "signIn" && styles.tabButtonTextActive,
                  ]}
                >
                  Connexion
                </Text>
              </Pressable>

              <Pressable
                testID="tab-signup"
                accessibilityRole="button"
                accessibilityLabel="Onglet Créer un compte"
                accessibilityState={{ selected: mode === "signUp", disabled: isBusy }}
                style={[
                  styles.tabButton,
                  cursorPointer,
                  mode === "signUp" && styles.tabButtonActive,
                ]}
                onPress={() => handleTabChange("signUp")}
                disabled={isBusy}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    mode === "signUp" && styles.tabButtonTextActive,
                  ]}
                >
                  Créer un compte
                </Text>
              </Pressable>
            </View>

            {/* Formulaire */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Adresse Email</Text>
                <TextInput
                  testID="input-email"
                  accessibilityLabel="Adresse Email"
                  style={styles.input}
                  placeholder="nom@exemple.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isBusy}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mot de passe</Text>
                <TextInput
                  testID="input-password"
                  accessibilityLabel="Mot de passe"
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isBusy}
                />
              </View>

              {mode === "signUp" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Confirmer le mot de passe
                  </Text>
                  <TextInput
                    testID="input-confirm-password"
                    accessibilityLabel="Confirmer le mot de passe"
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isBusy}
                  />
                </View>
              )}

              {/* Bouton de Validation */}
              <Pressable
                testID="btn-submit"
                accessibilityRole="button"
                accessibilityLabel={
                  mode === "signIn" ? "Se connecter" : "Créer mon compte"
                }
                accessibilityState={{ busy: isBusy, disabled: isBusy }}
                style={[
                  styles.submitButton,
                  cursorPointer,
                  isBusy && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isBusy}
              >
                {isBusy ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {mode === "signIn" ? "Se connecter" : "Créer mon compte"}
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Note de sécurité */}
            <View style={styles.securityFooter}>
              <Text style={styles.securityText}>
                🔒 Authentification chiffrée de bout en bout via Supabase
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.lg,
  },
  cardMobile: {
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  brandHeader: {
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.brand,
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.2,
  },
  brandDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  unconfiguredBox: {
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.35)",
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs + 2,
  },
  unconfiguredHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  unconfiguredIcon: {
    fontSize: 16,
  },
  unconfiguredTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.warning,
  },
  unconfiguredMessage: {
    fontSize: 12,
    color: "#78350F",
    lineHeight: 17,
  },
  codeText: {
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#92400E",
  },
  errorBanner: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: "rgba(192, 57, 43, 0.25)",
    borderRadius: radius.md,
    padding: spacing.md - 2,
  },
  errorBannerText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: "600",
    textAlign: "center",
  },
  successBanner: {
    backgroundColor: colors.positiveSoft,
    borderWidth: 1,
    borderColor: "rgba(31, 122, 92, 0.25)",
    borderRadius: radius.md,
    padding: spacing.md - 2,
  },
  successBannerText: {
    fontSize: 12,
    color: colors.positive,
    fontWeight: "600",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(7, 41, 57, 0.06)",
    padding: 4,
    borderRadius: radius.md,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    ...shadows.sm,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  formContainer: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs + 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.primaryBackground,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 14,
    color: colors.textPrimary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
    ...shadows.sm,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  securityFooter: {
    alignItems: "center",
    marginTop: spacing.xs,
  },
  securityText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "500",
  },
});
