import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";

type Props = {
  message: string;
  onDismiss: () => void;
};

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{message}</Text>
      <Pressable style={cursorPointer} onPress={onDismiss} hitSlop={8}>
        <Text style={styles.close}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "rgba(255,107,129,0.14)",
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 13.5,
    flex: 1,
  },
  close: {
    color: colors.danger,
    fontWeight: "700",
  },
});
