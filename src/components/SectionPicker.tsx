import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";
import { Section } from "../types/section";

type Props = {
  kind: "task" | "tracking";
  sections: Section[];
  value: string | undefined;
  onChange: (id: string) => void;
};

export function SectionPicker({ kind, sections, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selected = sections.find((section) => section.id === value);
  return (
    <View testID={`${kind}-section-picker`} style={kind === "task" ? styles.task : styles.tracking}>
      {kind === "tracking" && <Text style={styles.label}>Section</Text>}
      <Pressable testID={`${kind}-section-trigger`} accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={[styles.trigger, cursorPointer]}>
        <Text numberOfLines={1} style={styles.text}>{selected?.name ?? "Section"} ▾</Text>
      </Pressable>
      {open && <View style={styles.options}>
        {sections.map((section) => <Pressable key={section.id} testID={`${kind}-section-${section.name.toLowerCase()}`} accessibilityRole="button" accessibilityState={{ selected: value === section.id }} onPress={() => { onChange(section.id); setOpen(false); }} style={[styles.option, cursorPointer]}><Text style={styles.text}>{section.name}</Text></Pressable>)}
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  task: { flex: 1, minWidth: 0, position: "relative", zIndex: 2 },
  tracking: { marginTop: 8, position: "relative", zIndex: 2 },
  label: { fontSize: 11, fontWeight: "600", color: colors.textMuted, textTransform: "uppercase", marginBottom: 4 },
  trigger: { minHeight: 44, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.overlayPanel, borderRadius: 10, paddingHorizontal: 10, justifyContent: "center" },
  text: { color: colors.textPrimary, fontSize: 14 },
  options: { position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: colors.surfaceActive, borderRadius: 10, borderWidth: 1, borderColor: colors.divider },
  option: { minHeight: 44, paddingHorizontal: 10, justifyContent: "center" },
});
