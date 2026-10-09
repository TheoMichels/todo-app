import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NOTES_SECTION_ID, Section, TRASH_SECTION_ID } from "../types/section";
import { colors, shadows } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";

type Props = {
  sections: Section[];
  todoCounts?: Record<string, number>;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
};

export function Sidebar({ sections, todoCounts = {}, selectedId, onSelect, onAdd, onRename, onRemove, isMobile, onClose }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [isManageMode, setIsManageMode] = useState(false);

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
    <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
      <View style={styles.headerRow}>
        <Text style={styles.brand}>Mes tâches</Text>
        {isMobile && onClose && (
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        )}
      </View>

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
            <View
              key={section.id}
              style={[styles.item, selected && styles.itemSelected]}
            >
              <Pressable
                style={[styles.itemPressable, cursorPointer]}
                onPress={() => onSelect(section.id)}
              >
                <Text
                  style={[styles.itemText, selected && styles.itemTextSelected]}
                  numberOfLines={1}
                >
                  {section.name}
                </Text>
                {!!todoCounts[section.id] && !isManageMode && (
                  <View style={[styles.badge, selected && styles.badgeSelected]}>
                    <Text style={[styles.badgeText, selected && styles.badgeTextSelected]}>
                      {todoCounts[section.id]}
                    </Text>
                  </View>
                )}
              </Pressable>
              {isManageMode && (
                <View style={styles.manageIconsRow}>
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
                        styles.manageTextAction,
                        selected && styles.manageTextActionSelected,
                      ]}
                    >
                      ✎
                    </Text>
                  </Pressable>
                  <Pressable
                    style={cursorPointer}
                    onPress={(e) => {
                      e.stopPropagation();
                      onRemove(section.id);
                    }}
                    hitSlop={8}
                  >
                    <Text
                      style={[
                        styles.manageTextAction,
                        selected && styles.manageTextActionSelected,
                        styles.deleteIcon,
                      ]}
                    >
                      ✕
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.divider} />

        <Pressable
          style={[
            styles.item,
            selectedId === NOTES_SECTION_ID && styles.itemSelected,
            cursorPointer,
          ]}
          onPress={() => onSelect(NOTES_SECTION_ID)}
        >
          <Text
            style={[
              styles.itemText,
              selectedId === NOTES_SECTION_ID && styles.itemTextSelected,
            ]}
            numberOfLines={1}
          >
            Notes
          </Text>
        </Pressable>

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
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.addButton, cursorPointer]}
            onPress={() => setIsAdding(true)}
          >
            <Text style={styles.addButtonText}>+ Nouvelle Section</Text>
          </Pressable>
          <Pressable
            style={[styles.addButton, styles.manageButton, cursorPointer, isManageMode && styles.manageButtonActive]}
            onPress={() => setIsManageMode(!isManageMode)}
          >
            <Text style={[styles.addButtonText, isManageMode && styles.manageButtonTextActive]}>Gérer sections</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    width: 200,
    borderRadius: 24,
    backgroundColor: colors.sidebar,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    ...({ backdropFilter: "blur(24px)" } as any),
  },
  sidebarMobile: {
    width: "100%",
    marginRight: 0,
    backgroundColor: colors.overlayPanel || colors.sidebar,
    borderColor: colors.borderStrong || colors.border,
    boxShadow: "0px 16px 32px rgba(147, 165, 206, 0.2)",
    elevation: 16,
    ...({ backdropFilter: "blur(32px)" } as any),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  brand: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },
  close: {
    fontSize: 16,
    color: colors.textMuted,
    paddingHorizontal: 4,
  },
  list: {
    flexGrow: 1,
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  itemSelected: {
    backgroundColor: colors.accent,
    ...shadows.sm,
  },
  itemPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  itemTextSelected: {
    color: colors.textOnBrand,
  },
  badge: {
    backgroundColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  badgeTextSelected: {
    color: colors.textOnBrand,
  },
  manageTextAction: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textMuted,
  },
  manageTextActionSelected: {
    color: colors.textOnBrand,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
    marginHorizontal: 8,
  },
  trashText: {
    color: colors.textMuted,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  addInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: 14,
  },
  editInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 4,
  },
  manageIconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteIcon: {
    color: "#ffffff",
    fontSize: 14,
  },
  actionButtons: {
    gap: 8,
  },
  manageButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  manageButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  manageButtonTextActive: {
    color: colors.textOnBrand,
  }
});
