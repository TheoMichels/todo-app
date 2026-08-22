import { useState } from "react";
import { StatusBar } from "expo-status-bar";
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
import { TodoItem } from "./src/components/TodoItem";

export default function App() {
  const { todos, loading, addTodo, toggleTodo, removeTodo } = useTodos();
  const [input, setInput] = useState("");

  const handleAdd = () => {
    addTodo(input);
    setInput("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.header}>Mes tâches</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ajouter une tâche..."
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
                  onRemove={removeTodo}
                />
              )}
            />
          )}
        </View>
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color: "#222",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#4a90d9",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
  },
});
