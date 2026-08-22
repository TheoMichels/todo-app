import { Pressable, StyleSheet, Text, View } from "react-native";
import { Todo } from "../types/todo";

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export function TodoItem({ todo, onToggle, onRemove }: Props) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.textArea} onPress={() => onToggle(todo.id)}>
        <View style={[styles.checkbox, todo.done && styles.checkboxDone]}>
          {todo.done && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={[styles.title, todo.done && styles.titleDone]}>
          {todo.title}
        </Text>
      </Pressable>
      <Pressable onPress={() => onRemove(todo.id)} hitSlop={8}>
        <Text style={styles.delete}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  textArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#999",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: "#4a90d9",
    borderColor: "#4a90d9",
  },
  checkmark: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  title: {
    fontSize: 16,
    color: "#222",
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  delete: {
    fontSize: 16,
    color: "#c0392b",
    paddingHorizontal: 8,
  },
});
