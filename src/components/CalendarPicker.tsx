import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { cursorPointer } from "../theme/webCursor";

type Props = {
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
};

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];
const DAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

export function CalendarPicker({ value, onChange }: Props) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust for Monday start (0 is Sunday)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < startDay; i++) {
      arr.push(null); // empty slots
    }
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push(i);
    }
    return arr;
  }, [startDay, daysInMonth]);

  const handleSelect = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (value === formattedDate) {
      onChange(""); // Clear if same date is clicked
    } else {
      onChange(formattedDate);
    }
  };

  const today = new Date();
  const isToday = (day: number) => 
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split("-").map(Number);
    return y === year && m === month + 1 && d === day;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handlePrevMonth} style={[styles.navButton, cursorPointer]}>
          <Text style={styles.navText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.monthText}>{MONTHS[month]} {year}</Text>
        <Pressable onPress={handleNextMonth} style={[styles.navButton, cursorPointer]}>
          <Text style={styles.navText}>{">"}</Text>
        </Pressable>
      </View>
      
      <View style={styles.daysHeader}>
        {DAYS.map(d => (
          <Text key={d} style={styles.dayHeaderText}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day, index) => {
          if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
          
          const selected = isSelected(day);
          const todayHighlight = isToday(day);

          return (
            <Pressable
              key={day}
              onPress={() => handleSelect(day)}
              style={[
                styles.dayCell,
                cursorPointer,
                todayHighlight && styles.dayToday,
                selected && styles.daySelected,
              ]}
            >
              <Text style={[
                styles.dayText,
                todayHighlight && styles.dayTextToday,
                selected && styles.dayTextSelected,
              ]}>
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.overlayPanel,
  },
  navText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  daysHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%", // 100 / 7
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  dayToday: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  dayTextToday: {
    fontWeight: "600",
    color: colors.accent,
  },
  daySelected: {
    backgroundColor: colors.accent,
  },
  dayTextSelected: {
    color: colors.textOnBrand,
    fontWeight: "bold",
  },
});
