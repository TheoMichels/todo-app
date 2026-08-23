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

export type AppView = "tasks" | "tracking";

type Props = {
  view: AppView;
  onViewChange: (view: AppView) => void;
  sections: Section[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
};

const VIEWS: { value: AppView; label: string }[] = [
  { value: "tasks", label: "Tâches" },
  { value: "tracking", label: "Suivi" },
];

export function Sidebar({
  view,
  onViewChange,
  sections,
  selectedId,
  onSelect,
  onAdd,
}: Props) {
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
      <View style={styles.viewSwitch}>
        {VIEWS.map(({ value, label }) => {
          const selected = view === value;
          return (
            <Pressable
              key={value}
              style={[
                styles.viewTab,
                selected && styles.viewTabSelected,
                cursorPointer,
              ]}
              onPress={() => onViewChange(value)}
            >
              <Text
                style={[styles.viewTabText, selected && styles.viewTabTextSelected]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {view === "tasks" && (
        <>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {sections.map((section) => {
              const selected = section.id === selectedId;
              return (
                <Pressable
                  key={section.id}
                  style={[styles.item, selected && styles.itemSelected, cursorPointer]}
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
        </>
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
  viewSwitch: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  viewTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  viewTabSelected: {
    backgroundColor: colors.accent,
  },
  viewTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  viewTabTextSelected: {
    color: colors.textPrimary,
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
});
