import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Section, TRASH_SECTION_ID } from "../types/section";
import { colors } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";

type Props = {
  sections: Section[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
};

export function Sidebar({ sections, selectedId, onSelect, onAdd, onRename }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const commitAdd = () => {
    const trimmed = draft.trim();
    if (trimmed) onAdd(trimmed);
    setDraft("");
    setIsAdding(false);
  };

  const startEditing = (section: Section) => {
    setEditingId(section.id);
    setEditDraft(section.name);
  };

  const commitEdit = () => {
    const trimmed = editDraft.trim();
    if (editingId && trimmed) onRename(editingId, trimmed);
    setEditingId(null);
  };

  return (
    <View style={styles.sidebar}>
      <Text style={styles.brand}>Mes tâches</Text>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {sections.map((section) => {
          const selected = section.id === selectedId;

          if (editingId === section.id) {
            return (
              <TextInput
                key={section.id}
                style={styles.editInput}
                value={editDraft}
                onChangeText={setEditDraft}
                onSubmitEditing={commitEdit}
                onBlur={commitEdit}
                autoFocus
              />
            );
          }

          return (
            <Pressable
              key={section.id}
              style={[styles.item, selected && styles.itemSelected, cursorPointer]}
              onPress={() => onSelect(section.id)}
              onHoverIn={() => setHoveredId(section.id)}
              onHoverOut={() => setHoveredId((current) => (current === section.id ? null : current))}
            >
              <View style={styles.itemRow}>
                <Text
                  style={[styles.itemText, selected && styles.itemTextSelected]}
                  numberOfLines={1}
                >
                  {section.name}
                </Text>
                {hoveredId === section.id && (
                  <Pressable
                    style={cursorPointer}
                    onPress={(e) => {
                      e.stopPropagation();
                      startEditing(section);
                    }}
                    hitSlop={8}
                  >
                    <Text
                      style={[
                        styles.editIcon,
                        selected && styles.editIconSelected,
                      ]}
                    >
                      ✎
                    </Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          );
        })}

        <View style={styles.divider} />

        <Pressable
          style={[
            styles.item,
            selectedId === TRASH_SECTION_ID && styles.itemSelected,
            cursorPointer,
          ]}
          onPress={() => onSelect(TRASH_SECTION_ID)}
        >
          <Text
            style={[
              styles.itemText,
              styles.trashText,
              selectedId === TRASH_SECTION_ID && styles.itemTextSelected,
            ]}
            numberOfLines={1}
          >
            Supprimés
          </Text>
        </Pressable>
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
          autoFocus
        />
      ) : (
        <Pressable
          style={[styles.addButton, cursorPointer]}
          onPress={() => setIsAdding(true)}
        >
          <Text style={styles.addButtonText}>+ Section</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    width: 220,
    borderRadius: 16,
    backgroundColor: colors.sidebar,
    padding: 24,
    marginRight: 20,
  },
  brand: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 20,
  },
  list: {
    flexGrow: 1,
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
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  itemTextSelected: {
    color: colors.textPrimary,
  },
  editIcon: {
    fontSize: 14,
    color: colors.textMuted,
  },
  editIconSelected: {
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  trashText: {
    color: colors.textMuted,
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
  editInput: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: 6,
  },
});
