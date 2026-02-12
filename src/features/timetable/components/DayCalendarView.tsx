import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { HOURS } from "../timetable.constants";
import { timeTableStyles as styles } from "../timetable.styles";
import type { CalendarItem } from "../timetable.types";
import { formatHour } from "../timetable.utils";
import { EventCard } from "./EventCard";

type DayCalendarViewProps = {
	selectedDayItems: CalendarItem[];
	selectedDayKey: string;
	onOpenCreate: (dayKey: string, hour?: number) => void;
	onOpenEdit: (item: CalendarItem) => void;
};

export function DayCalendarView({
	selectedDayItems,
	selectedDayKey,
	onOpenCreate,
	onOpenEdit,
}: DayCalendarViewProps) {
	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			style={styles.viewWrap}
			contentContainerStyle={styles.dayContent}
		>
			{HOURS.map((hour) => {
				const hourItems = selectedDayItems.filter((item) => {
					const start = new Date(item.start);
					return !Number.isNaN(start.getTime()) && start.getHours() === hour;
				});

				return (
					<View key={hour} style={styles.hourRow}>
						<View style={styles.hourHead}>
							<Text style={styles.hourLabel}>{formatHour(hour)}</Text>
							<Pressable style={styles.hourAddBtn} onPress={() => onOpenCreate(selectedDayKey, hour)}>
								<Ionicons name="add-circle-outline" size={20} color="#9CA3AF" />
							</Pressable>
						</View>

						<View style={styles.hourBody}>
							{hourItems.length === 0 ? (
								<Text style={styles.hourEmptyText}>Nema unosa</Text>
							) : (
								hourItems.map((item) => (
									<EventCard key={item.id} item={item} onPress={() => onOpenEdit(item)} />
								))
							)}
						</View>
					</View>
				);
			})}
		</ScrollView>
	);
}
