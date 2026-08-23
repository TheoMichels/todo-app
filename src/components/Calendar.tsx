import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  value: number | null;
  onSelect: (dateMs: number) => void;
};

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Monday-first offset: JS getDay() is 0 (Sunday) - 6 (Saturday).
function mondayFirstOffset(date: Date) {
  return (date.getDay() + 6) % 7;
}

export function Calendar({ value, onSelect }: Props) {
  const selectedDate = value ? new Date(value) : null;
  const [viewDate, setViewDate] = useState(selectedDate ?? new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = mondayFirstOffset(firstOfMonth);
  const today = new Date();

  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const goToMonth = (delta: number) => {
    setViewDate(new Date(year, month + delta, 1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => goToMonth(-1)} hitSlop={8}>
          <Text style={styles.nav}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <Pressable onPress={() => goToMonth(1)} hitSlop={8}>
          <Text style={styles.nav}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, i) => (
          <Text key={i} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) return <View key={i} style={styles.cell} />;
          const cellDate = new Date(year, month, day);
          const selected = !!selectedDate && isSameDay(cellDate, selectedDate);
          const isToday = isSameDay(cellDate, today);
          return (
            <Pressable
              key={i}
              style={[
                styles.cell,
                styles.dayCell,
                selected && styles.dayCellSelected,
                !selected && isToday && styles.dayCellToday,
              ]}
              onPress={() => onSelect(cellDate.getTime())}
            >
              <Text
                style={[styles.dayText, selected && styles.dayTextSelected]}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE = 32;

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  nav: {
    fontSize: 18,
    color: colors.textSecondary,
    paddingHorizontal: 8,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekdayLabel: {
    width: CELL_SIZE,
    textAlign: "center",
    fontSize: 12,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dayCell: {
    borderRadius: CELL_SIZE / 2,
  },
  dayCellSelected: {
    backgroundColor: colors.accent,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  dayText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  dayTextSelected: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
});
