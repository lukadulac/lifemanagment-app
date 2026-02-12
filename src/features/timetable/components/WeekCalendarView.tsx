import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { MONTH_SHORT, WEEKDAY_LONG } from "../timetable.constants";
import { timeTableStyles as styles } from "../timetable.styles";
import type { CalendarItem } from "../timetable.types";
import { getWeekdayIndexMondayFirst, toDayKey } from "../timetable.utils";
import { EventCard } from "./EventCard";

type WeekCalendarViewProps = {
	weekDays: Date[];
	itemsByDay: Map<string, CalendarItem[]>;
	selectedDayKey: string;
	todayKey: string;
	onSelectDate: (date: Date) => void;
	onOpenCreate: (dayKey: string, hour?: number) => void;
	onOpenEdit: (item: CalendarItem) => void;
};

export function WeekCalendarView({
	weekDays,
	itemsByDay,
	selectedDayKey,
	todayKey,
	onSelectDate,
	onOpenCreate,
	onOpenEdit,
}: WeekCalendarViewProps) {
	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			style={styles.viewWrap}
			contentContainerStyle={styles.weekContent}
		>
			{weekDays.map((dayDate) => {
				const dayKey = toDayKey(dayDate);
				const dayItems = itemsByDay.get(dayKey) ?? [];
				const selected = dayKey === selectedDayKey;
				const isToday = dayKey === todayKey;

				return (
					<View
						key={dayKey}
						style={[
							styles.weekCard,
							selected && styles.weekCardSelected,
							isToday && styles.weekCardToday,
						]}
					>
						<View style={styles.weekCardHead}>
							<Pressable
								style={styles.weekCardHeadLeft}
								onPress={() => onSelectDate(dayDate)}
							>
								<Text style={styles.weekCardTitle}>
									{WEEKDAY_LONG[getWeekdayIndexMondayFirst(dayDate)]}
								</Text>
								<Text style={styles.weekCardDate}>
									{`${dayDate.getDate()}. ${MONTH_SHORT[dayDate.getMonth()]}`}
								</Text>
							</Pressable>

							<Pressable style={styles.weekAddBtn} onPress={() => onOpenCreate(dayKey, 9)}>
								<Ionicons name="add" size={16} color="#34D399" />
							</Pressable>
						</View>

						{dayItems.length === 0 ? (
							<Text style={styles.emptyText}>Nema planiranih unosa.</Text>
						) : (
							dayItems.map((item) => (
								<EventCard key={item.id} item={item} onPress={() => onOpenEdit(item)} />
							))
						)}
					</View>
				);
			})}
		</ScrollView>
	);
}
