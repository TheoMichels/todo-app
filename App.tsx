import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTodos } from "./src/hooks/useTodos";
import { useSections } from "./src/hooks/useSections";
import { TodoItem } from "./src/components/TodoItem";
import { Sidebar } from "./src/components/Sidebar";
import { TaskDetailPanel } from "./src/components/TaskDetailPanel";
import { colors, gradient } from "./src/theme/colors";

export default function App() {
  const { sections, loading: sectionsLoading, addSection } = useSections();
  const [selectedSectionId, setSelectedSectionId] = useState<string>();

  useEffect(() => {
    if (!selectedSectionId && sections.length > 0) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  const {
    todos,
    loading: todosLoading,
    addTodo,
    toggleTodo,
    updateTodo,
    removeTodo,
  } = useTodos(selectedSectionId);
  const [input, setInput] = useState("");
  const [selectedTodoId, setSelectedTodoId] = useState<string>();

  const handleAdd = () => {
    addTodo(input);
    setInput("");
  };

  const handleAddSection = (name: string) => {
    const section = addSection(name);
    if (section) setSelectedSectionId(section.id);
  };

  const handleRemove = (id: string) => {
    removeTodo(id);
    if (id === selectedTodoId) setSelectedTodoId(undefined);
  };

  const loading = sectionsLoading || todosLoading;
  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const selectedTodo = todos.find((t) => t.id === selectedTodoId);

  return (
    <LinearGradient
      colors={gradient.colors}
      locations={gradient.locations}
      start={gradient.start}
      end={gradient.end}
      style={styles.root}
    >
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.stage}>
            <View style={styles.layout}>
              {!sectionsLoading && (
                <Sidebar
                  sections={sections}
                  selectedId={selectedSectionId}
                  onSelect={(id) => {
                    setSelectedSectionId(id);
                    setSelectedTodoId(undefined);
                  }}
                  onAdd={handleAddSection}
                />
              )}

              <View style={styles.content}>
                <Text style={styles.header}>
                  {selectedSection?.name ?? "Mes tâches"}
                </Text>

                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ajouter une tâche..."
                    placeholderTextColor={colors.textMuted}
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={handleAdd}
                    onKeyPress={(e) => {
                      if (e.nativeEvent.key === "Enter") handleAdd();
                    }}
                    returnKeyType="done"
                  />
                  <Pressable style={styles.addButton} onPress={handleAdd}>
                    <Text style={styles.addButtonText}>Ajouter</Text>
                  </Pressable>
                </View>

                {loading ? (
                  <Text style={styles.empty}>Chargement...</Text>
                ) : todos.length === 0 ? (
                  <Text style={styles.empty}>Aucune tâche pour le moment.</Text>
                ) : (
                  <FlatList
                    data={todos}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TodoItem
                        todo={item}
                        onToggle={toggleTodo}
                        onOpen={setSelectedTodoId}
                        onRemove={handleRemove}
                      />
                    )}
                  />
                )}
              </View>
            </View>

            {selectedTodo && (
              <>
                <Pressable
                  style={styles.backdrop}
                  onPress={() => setSelectedTodoId(undefined)}
                />
                <View style={styles.panelContainer}>
                  <TaskDetailPanel
                    todo={selectedTodo}
                    onChange={(patch) => updateTodo(selectedTodo.id, patch)}
                    onClose={() => setSelectedTodoId(undefined)}
                  />
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <StatusBar style="light" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  stage: {
    flex: 1,
    position: "relative",
  },
  layout: {
    flex: 1,
    flexDirection: "row",
    padding: 20,
    width: "100%",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.backdrop,
  },
  panelContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    bottom: 20,
    width: 320,
    maxWidth: "90%",
  },
  content: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.panel,
    padding: 24,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addButtonText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 40,
  },
});
