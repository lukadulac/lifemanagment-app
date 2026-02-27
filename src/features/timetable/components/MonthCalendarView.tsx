import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { WEEKDAY_SHORT } from "../timetable.constants";
import { timeTableStyles as styles } from "../timetable.styles";
import type { CalendarItem } from "../timetable.types";
import { formatMinuteOfDay, toDayKey } from "../timetable.utils";

type MonthCalendarViewProps = {
	monthMatrix: Date[];
	itemsByDay: Map<string, CalendarItem[]>;
	selectedDate: Date;
	selectedDayKey: string;
	todayKey: string;
	onSelectDate: (date: Date) => void;
	onOpenCreate: (dayKey: string, hour?: number) => void;
	onOpenDetails: (item: CalendarItem) => void;
};

export function MonthCalendarView({
	monthMatrix,
	itemsByDay,
	selectedDate,
	selectedDayKey,
	todayKey,
	onSelectDate,
	onOpenCreate,
	onOpenDetails,
}: MonthCalendarViewProps) {
	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			style={styles.viewWrap}
			contentContainerStyle={styles.monthContent}
		>
			<View style={styles.weekLabelRow}>
				{WEEKDAY_SHORT.map((weekday) => (
					<Text key={weekday} style={styles.weekLabel}>
						{weekday}
					</Text>
				))}
			</View>

			<View style={styles.monthGrid}>
				{monthMatrix.map((dayDate) => {
					const key = toDayKey(dayDate);
					const dayItems = itemsByDay.get(key) ?? [];
					const selected = key === selectedDayKey;
					const isCurrentMonth = dayDate.getMonth() === selectedDate.getMonth();
					const isToday = key === todayKey;

					return (
						<Pressable
							key={key}
							style={[
								styles.dayCell,
								!isCurrentMonth && styles.dayCellMuted,
								selected && styles.dayCellSelected,
								isToday && styles.dayCellToday,
							]}
							onPress={() => {
								onSelectDate(dayDate);
								onOpenCreate(key, 9);
							}}
						>
							<Text style={[styles.dayNumber, !isCurrentMonth && styles.dayNumberMuted]}>
								{dayDate.getDate()}
							</Text>

							{dayItems.slice(0, 2).map((item) => {
								const start = new Date(item.start);
								const startMinute = Number.isNaN(start.getTime())
									? 0
									: start.getHours() * 60 + start.getMinutes();

								return (
									<Pressable
										key={item.id}
										style={[
											styles.monthItemChip,
											{
												backgroundColor: "rgba(52,211,153,0.14)",
												borderColor: "#34D399",
											},
										]}
										onPress={(event) => {
											event.stopPropagation();
											onSelectDate(dayDate);
											onOpenDetails(item);
										}}
									>
										<Text
											style={[styles.monthItemChipText, { color: "#34D399" }]}
											numberOfLines={1}
										>
											{`${formatMinuteOfDay(startMinute)} ${item.title}`}
										</Text>
									</Pressable>
								);
							})}

							{dayItems.length > 2 ? (
								<Text style={styles.moreCount}>+{dayItems.length - 2}</Text>
							) : null}
						</Pressable>
					);
				})}
			</View>
		</ScrollView>
	);
}
