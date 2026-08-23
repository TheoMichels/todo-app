import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Section } from "../types/section";
import { colors } from "../theme/colors";

type Props = {
  sections: Section[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
};

export function Sidebar({ sections, selectedId, onSelect, onAdd }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const commitAdd = () => {
    const trimmed = draft.trim();
    if (trimmed) onAdd(trimmed);
    setDraft("");
    setIsAdding(false);
  };

  return (
    <View style={styles.sidebar}>
      <Text style={styles.brand}>Mes tâches</Text>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {sections.map((section) => {
          const selected = section.id === selectedId;
          return (
            <Pressable
              key={section.id}
              style={[styles.item, selected && styles.itemSelected]}
              onPress={() => onSelect(section.id)}
            >
              <Text
                style={[styles.itemText, selected && styles.itemTextSelected]}
                numberOfLines={1}
              >
                {section.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isAdding ? (
        <TextInput
          style={styles.addInput}
          value={draft}
          onChangeText={setDraft}
          placeholder="Nom de la section"
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={commitAdd}
          onBlur={commitAdd}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === "Enter") commitAdd();
          }}
          autoFocus
        />
      ) : (
        <Pressable style={styles.addButton} onPress={() => setIsAdding(true)}>
          <Text style={styles.addButtonText}>+ Section</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    borderRadius: 16,
    backgroundColor: colors.sidebar,
    padding: 20,
    marginRight: 20,
  },
  brand: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 20,
  },
  list: {
    flexGrow: 0,
    marginBottom: 12,
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  itemSelected: {
    backgroundColor: colors.accent,
  },
  itemText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  itemTextSelected: {
    color: colors.textPrimary,
  },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMuted,
  },
  addInput: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
    color: colors.textPrimary,
    fontSize: 14,
  },
});
