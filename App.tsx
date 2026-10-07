import { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useTodos } from "./src/hooks/useTodos";
import { useSections } from "./src/hooks/useSections";
import { useTrackingPoints } from "./src/hooks/useTrackingPoints";
import { useNotes } from "./src/hooks/useNotes";
import { TodoItem } from "./src/components/TodoItem";
import { Sidebar } from "./src/components/Sidebar";
import { TaskDetailPanel } from "./src/components/TaskDetailPanel";
import { NewTaskForm } from "./src/components/NewTaskForm";
import { TrackingPointCard } from "./src/components/TrackingPointCard";
import { NewTrackingPointForm } from "./src/components/NewTrackingPointForm";
import { TrackingDetailPanel } from "./src/components/TrackingDetailPanel";
import { NoteCard } from "./src/components/NoteCard";
import { NewNoteForm } from "./src/components/NewNoteForm";
import { ErrorState } from "./src/components/ErrorState";
import { ErrorBanner } from "./src/components/ErrorBanner";
import { Logo } from "./src/components/Logo";
import { colors, gradient, shadows } from "./src/theme/colors";
import { cursorPointer } from "./src/theme/webCursor";
import { NOTES_SECTION_ID, TRASH_SECTION_ID } from "./src/types/section";

// Matches Sidebar's own width (200) + marginRight (12).
const SIDEBAR_TOTAL_WIDTH = 212;

export default function App() {
  const {
    sections,
    loading: sectionsLoading,
    error: sectionsError,
    retry: retrySections,
    addSection,
    updateSection,
  } = useSections();
  const [selectedSectionId, setSelectedSectionId] = useState<string>();

  useEffect(() => {
    if (!selectedSectionId && sections.length > 0) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [mobileActiveTab, setMobileActiveTab] = useState<"tasks" | "tracking">("tasks");

  const {
    todos,
    loading: todosLoading,
    error: todosError,
    retry: retryTodos,
    addTodo,
    toggleTodo,
    updateTodo,
    removeTodo,
  } = useTodos(selectedSectionId);
  const [selectedTodoId, setSelectedTodoId] = useState<string>();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const sidebarAnimDesktop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isMobile) {
      Animated.timing(sidebarAnimDesktop, {
        toValue: sidebarVisible ? 1 : 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [sidebarVisible, isMobile, sidebarAnimDesktop]);

  // Ensure sidebar is closed when switching to mobile, or initialized properly.
  useEffect(() => {
    if (isMobile) {
      setSidebarVisible(false);
    } else {
      setSidebarVisible(true);
    }
  }, [isMobile]);

  const {
    points,
    loading: pointsLoading,
    error: pointsError,
    retry: retryPoints,
    addPoint,
    updatePoint,
    removePoint,
  } = useTrackingPoints(selectedSectionId);
  const [selectedPointId, setSelectedPointId] = useState<string>();

  const {
    notes,
    loading: notesLoading,
    error: notesError,
    retry: retryNotes,
    addNote,
    updateNote,
    removeNote,
  } = useNotes();

  const [actionError, setActionError] = useState<string | null>(null);

  const runAction = useCallback(
    async (action: () => Promise<void>, options?: { rethrow?: boolean }) => {
      try {
        setActionError(null);
        await action();
      } catch (e) {
        setActionError(e instanceof Error ? e.message : "Une erreur est survenue.");
        if (options?.rethrow) throw e;
      }
    },
    []
  );

  const handleAddSection = (name: string) =>
    runAction(async () => {
      const section = await addSection(name);
      if (section) setSelectedSectionId(section.id);
    });

  const handleRenameSection = (id: string, name: string) =>
    runAction(() => updateSection(id, name));

  const handleAddTodo = (
    title: string,
    options: Parameters<typeof addTodo>[1]
  ) => runAction(() => addTodo(title, options), { rethrow: true });

  const handleToggle = (id: string) => runAction(() => toggleTodo(id));

  const handleUpdateTodo = (id: string, patch: Parameters<typeof updateTodo>[1]) =>
    runAction(() => updateTodo(id, patch));

  const handleRemove = (id: string) =>
    runAction(async () => {
      await removeTodo(id);
      if (id === selectedTodoId) setSelectedTodoId(undefined);
    });

  const handleAddPoint = (data: Parameters<typeof addPoint>[0]) =>
    runAction(() => addPoint(data), { rethrow: true });

  const handleUpdatePoint = (id: string, patch: Parameters<typeof updatePoint>[1]) =>
    runAction(() => updatePoint(id, patch));

  const handleRemovePoint = (id: string) =>
    runAction(async () => {
      await removePoint(id);
      if (id === selectedPointId) setSelectedPointId(undefined);
    });

  const handleAddNote = (title: string, description: string) =>
    runAction(() => addNote(title, description), { rethrow: true });

  const handleUpdateNote = (id: string, title: string, description: string) =>
    runAction(() => updateNote(id, title, description));

  const handleRemoveNote = (id: string) => runAction(() => removeNote(id));

  const tasksLoading = sectionsLoading || todosLoading;
  const isTrashView = selectedSectionId === TRASH_SECTION_ID;
  const isNotesView = selectedSectionId === NOTES_SECTION_ID;
  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const selectedTodo = todos.find((t) => t.id === selectedTodoId);
  const selectedPoint = points.find((p) => p.id === selectedPointId);
  const sectionNameById = Object.fromEntries(
    sections.map((s) => [s.id, s.name])
  );

  const sidebarElement = (
    <Sidebar
      sections={sections}
      selectedId={selectedSectionId}
      isMobile={isMobile}
      onClose={isMobile ? () => setSidebarVisible(false) : undefined}
      onSelect={(id) => {
        setSelectedSectionId(id);
        setSelectedTodoId(undefined);
        if (isMobile) setSidebarVisible(false);
      }}
      onAdd={handleAddSection}
      onRename={handleRenameSection}
    />
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
            {isMobile && sidebarVisible && (
              <>
                <Pressable
                  style={[styles.backdrop, { zIndex: 60 }]}
                  onPress={() => setSidebarVisible(false)}
                />
                <View style={[styles.panelContainer, styles.panelContainerMobile, { zIndex: 61 }]}>
                  {sidebarElement}
                </View>
              </>
            )}
            <View style={styles.pageContent}>
              <View style={styles.topBar}>
                <Pressable
                  style={[styles.sidebarToggle, cursorPointer]}
                  onPress={() => setSidebarVisible((v) => !v)}
                  hitSlop={8}
                >
                  <Text style={styles.sidebarToggleIcon}>☰</Text>
                </Pressable>

                <View style={styles.brand}>
                  <Logo size={48} />
                  <Text style={styles.brandTitle}>Todo</Text>
                </View>

                <View style={styles.topBarSpacer} />
              </View>

              <View style={styles.layout}>
                {!isMobile && (
                  <Animated.View
                    style={[
                      styles.sidebarWrapper,
                      {
                        width: sidebarAnimDesktop.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, SIDEBAR_TOTAL_WIDTH],
                        }),
                        opacity: sidebarAnimDesktop,
                        zIndex: 1,
                      },
                    ]}
                  >
                    {sidebarElement}
                  </Animated.View>
                )}

                <View style={styles.mainArea}>
                  {actionError && (
                    <ErrorBanner
                      message={actionError}
                      onDismiss={() => setActionError(null)}
                    />
                  )}

                    {!isNotesView && isMobile && (
                      <View style={styles.mobileTabs}>
                        <Pressable
                          style={[styles.mobileTab, mobileActiveTab === "tasks" && styles.mobileTabActive, cursorPointer]}
                          onPress={() => setMobileActiveTab("tasks")}
                        >
                          <Text style={[styles.mobileTabText, mobileActiveTab === "tasks" && styles.mobileTabTextActive]}>Tâches</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.mobileTab, mobileActiveTab === "tracking" && styles.mobileTabActive, cursorPointer]}
                          onPress={() => setMobileActiveTab("tracking")}
                        >
                          <Text style={[styles.mobileTabText, mobileActiveTab === "tracking" && styles.mobileTabTextActive]}>Points de suivi</Text>
                        </Pressable>
                      </View>
                    )}
                    <View style={[styles.panelsRow, isMobile && { flexDirection: "column" }]}>
                    {isNotesView ? (
                      <View style={styles.content}>
                        <Text style={styles.header}>Notes</Text>

                        {notesError ? (
                          <ErrorState message={notesError} onRetry={retryNotes} />
                        ) : notesLoading ? (
                          <Text style={styles.empty}>Chargement...</Text>
                        ) : (
                          <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.notesGrid}>
                              {notes.map((note) => (
                                <NoteCard
                                  key={note.id}
                                  note={note}
                                  onUpdate={handleUpdateNote}
                                  onRemove={handleRemoveNote}
                                />
                              ))}
                              <NewNoteForm onSave={handleAddNote} />
                            </View>
                          </ScrollView>
                        )}
                      </View>
                    ) : (
                      <>
                        {(!isMobile || mobileActiveTab === "tasks") && (
                          <View style={styles.content}>
                            <Text style={styles.header}>
                              {isTrashView ? "Supprimés" : selectedSection?.name ?? "Mes tâches"}
                            </Text>

                            {sectionsError || todosError ? (
                              <ErrorState
                                message={sectionsError ?? todosError ?? ""}
                                onRetry={() => {
                                  retrySections();
                                  retryTodos();
                                }}
                              />
                            ) : (
                              <>
                                {!isTrashView && <NewTaskForm onAdd={handleAddTodo} />}

                                {tasksLoading ? (
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
                                        onToggle={handleToggle}
                                        onOpen={setSelectedTodoId}
                                        onRemove={handleRemove}
                                        onRestore={isTrashView ? handleToggle : undefined}
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
                        )}

                        {(!isMobile || mobileActiveTab === "tracking") && (
                          <View style={styles.content}>
                            <Text style={styles.header}>Points de suivi</Text>

                            {pointsError ? (
                              <ErrorState message={pointsError} onRetry={retryPoints} />
                            ) : isTrashView ? (
                              <Text style={styles.empty}>
                                Aucun point de suivi dans les éléments supprimés.
                              </Text>
                            ) : (
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
                                  <NewTrackingPointForm onSave={handleAddPoint} />
                                }
                              />
                            )}
                          </View>
                        )}
                      </>
                    )}
                    </View>
                </View>
              </View>
            </View>

            {selectedTodo && (
              <>
                <Pressable
                  style={[styles.backdrop, { zIndex: 60 }]}
                  onPress={() => setSelectedTodoId(undefined)}
                />
                <View style={[styles.panelContainer, isMobile && styles.panelContainerMobile, { zIndex: 61 }]}>
                  <TaskDetailPanel
                    todo={selectedTodo}
                    onChange={(patch) => handleUpdateTodo(selectedTodo.id, patch)}
                    onClose={() => setSelectedTodoId(undefined)}
                  />
                </View>
              </>
            )}

            {selectedPoint && (
              <>
                <Pressable
                  style={[styles.backdrop, { zIndex: 60 }]}
                  onPress={() => setSelectedPointId(undefined)}
                />
                <View style={[styles.panelContainer, isMobile && styles.panelContainerMobile, { zIndex: 61 }]}>
                  <TrackingDetailPanel
                    point={selectedPoint}
                    onChange={(patch) => handleUpdatePoint(selectedPoint.id, patch)}
                    onClose={() => setSelectedPointId(undefined)}
                  />
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <StatusBar style="dark" />
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
  pageContent: {
    flex: 1,
    padding: 12,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  brand: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },
  topBarSpacer: {
    width: 32,
  },
  layout: {
    flex: 1,
    flexDirection: "row",
  },
  mainArea: {
    flex: 1,
    flexDirection: "column",
  },
  sidebarWrapper: {
    overflow: "hidden",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.backdrop,
    ...({ backdropFilter: "blur(4px)" } as any),
  },
  panelContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    bottom: 12,
    width: 320,
    maxWidth: "90%",
  },
  panelsRow: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  content: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: colors.panel,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    ...({ backdropFilter: "blur(24px)" } as any),
  },
  sidebarToggle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  sidebarToggleIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 40,
  },
  notesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  mobileTabs: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: colors.panel,
    padding: 6,
    ...shadows.sm,
  },
  mobileTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  mobileTabActive: {
    backgroundColor: colors.accent,
  },
  mobileTabText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  mobileTabTextActive: {
    color: colors.textOnBrand,
  },
  panelContainerMobile: {
    top: "20%",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    maxWidth: "100%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    ...shadows.lg,
  },
});
