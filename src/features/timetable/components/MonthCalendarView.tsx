import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { TYPE_META, WEEKDAY_SHORT } from "../timetable.constants";
import { timeTableStyles as styles } from "../timetable.styles";
import type { CalendarItem } from "../timetable.types";
import { formatHour, toDayKey } from "../timetable.utils";

type MonthCalendarViewProps = {
	monthMatrix: Date[];
	itemsByDay: Map<string, CalendarItem[]>;
	selectedDate: Date;
	selectedDayKey: string;
	todayKey: string;
	onSelectDate: (date: Date) => void;
	onOpenDetails: (item: CalendarItem) => void;
};

export function MonthCalendarView({
	monthMatrix,
	itemsByDay,
	selectedDate,
	selectedDayKey,
	todayKey,
	onSelectDate,
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
							onPress={() => onSelectDate(dayDate)}
						>
							<Text style={[styles.dayNumber, !isCurrentMonth && styles.dayNumberMuted]}>
								{dayDate.getDate()}
							</Text>

							{dayItems.slice(0, 2).map((item) => {
								const meta = TYPE_META[item.type];
								const start = new Date(item.start);
								const startHour = Number.isNaN(start.getTime()) ? 0 : start.getHours();

								return (
									<Pressable
										key={item.id}
										style={[
											styles.monthItemChip,
											{
												backgroundColor: meta.bg,
												borderColor: meta.color,
											},
										]}
										onPress={(event) => {
											event.stopPropagation();
											onSelectDate(dayDate);
											onOpenDetails(item);
										}}
									>
										<Text
											style={[styles.monthItemChipText, { color: meta.color }]}
											numberOfLines={1}
										>
											{`${formatHour(startHour)} ${item.title}`}
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
