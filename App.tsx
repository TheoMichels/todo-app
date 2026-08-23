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
  View,
} from "react-native";
import { useTodos } from "./src/hooks/useTodos";
import { useSections } from "./src/hooks/useSections";
import { useTrackingPoints } from "./src/hooks/useTrackingPoints";
import { TodoItem } from "./src/components/TodoItem";
import { Sidebar, AppView } from "./src/components/Sidebar";
import { TaskDetailPanel } from "./src/components/TaskDetailPanel";
import { NewTaskForm } from "./src/components/NewTaskForm";
import { TrackingPointCard } from "./src/components/TrackingPointCard";
import { NewTrackingPointForm } from "./src/components/NewTrackingPointForm";
import { TrackingDetailPanel } from "./src/components/TrackingDetailPanel";
import { colors, gradient } from "./src/theme/colors";
import { cursorPointer } from "./src/theme/webCursor";
import { TRASH_SECTION_ID } from "./src/types/section";

export default function App() {
  const [view, setView] = useState<AppView>("tasks");
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
  const [selectedTodoId, setSelectedTodoId] = useState<string>();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const {
    points,
    loading: pointsLoading,
    addPoint,
    updatePoint,
    removePoint,
  } = useTrackingPoints();
  const [selectedPointId, setSelectedPointId] = useState<string>();

  const handleViewChange = (next: AppView) => {
    setView(next);
    setSelectedTodoId(undefined);
    setSelectedPointId(undefined);
  };

  const handleAddSection = (name: string) => {
    const section = addSection(name);
    if (section) setSelectedSectionId(section.id);
  };

  const handleRemove = (id: string) => {
    removeTodo(id);
    if (id === selectedTodoId) setSelectedTodoId(undefined);
  };

  const handleRemovePoint = (id: string) => {
    removePoint(id);
    if (id === selectedPointId) setSelectedPointId(undefined);
  };

  const loading = sectionsLoading || todosLoading;
  const isTrashView = selectedSectionId === TRASH_SECTION_ID;
  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const selectedTodo = todos.find((t) => t.id === selectedTodoId);
  const selectedPoint = points.find((p) => p.id === selectedPointId);
  const sectionNameById = Object.fromEntries(
    sections.map((s) => [s.id, s.name])
  );

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
              {sidebarVisible && (
                <Sidebar
                  view={view}
                  onViewChange={handleViewChange}
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
                <View style={styles.headerRow}>
                  <Pressable
                    style={[styles.sidebarToggle, cursorPointer]}
                    onPress={() => setSidebarVisible((v) => !v)}
                    hitSlop={8}
                  >
                    <Text style={styles.sidebarToggleIcon}>☰</Text>
                  </Pressable>
                  <Text style={styles.header}>
                    {view === "tracking"
                      ? "Points de suivi"
                      : isTrashView
                      ? "Supprimés"
                      : selectedSection?.name ?? "Mes tâches"}
                  </Text>
                </View>

                {view === "tracking" ? (
                  <FlatList
                    data={points}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={
                      pointsLoading ? (
                        <Text style={styles.empty}>Chargement...</Text>
                      ) : null
                    }
                    renderItem={({ item }) => (
                      <TrackingPointCard
                        point={item}
                        onOpen={setSelectedPointId}
                        onRemove={handleRemovePoint}
                      />
                    )}
                    ListFooterComponent={
                      <NewTrackingPointForm onSave={addPoint} />
                    }
                  />
                ) : (
                  <>
                    {!isTrashView && <NewTaskForm onAdd={addTodo} />}

                    {loading ? (
                      <Text style={styles.empty}>Chargement...</Text>
                    ) : todos.length === 0 ? (
                      <Text style={styles.empty}>
                        {isTrashView
                          ? "Aucune tâche terminée."
                          : "Aucune tâche pour le moment."}
                      </Text>
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
                            onRestore={isTrashView ? toggleTodo : undefined}
                            sectionName={
                              isTrashView ? sectionNameById[item.sectionId] : undefined
                            }
                          />
                        )}
                      />
                    )}
                  </>
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

            {selectedPoint && (
              <>
                <Pressable
                  style={styles.backdrop}
                  onPress={() => setSelectedPointId(undefined)}
                />
                <View style={styles.panelContainer}>
                  <TrackingDetailPanel
                    point={selectedPoint}
                    onChange={(patch) => updatePoint(selectedPoint.id, patch)}
                    onClose={() => setSelectedPointId(undefined)}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  sidebarToggle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarToggleIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 40,
  },
});
