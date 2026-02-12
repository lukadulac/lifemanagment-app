import React from "react";
import { Pressable, Text, View } from "react-native";
import { TYPE_META } from "../timetable.constants";
import { timeTableStyles as styles } from "../timetable.styles";
import type { CalendarItem } from "../timetable.types";
import { formatEventRange } from "../timetable.utils";

type EventCardProps = {
	item: CalendarItem;
	onPress: () => void;
};

export function EventCard({ item, onPress }: EventCardProps) {
	const meta = TYPE_META[item.type];

	return (
		<Pressable
			onPress={onPress}
			style={[
				styles.eventCard,
				{
					backgroundColor: meta.bg,
					borderColor: meta.color,
				},
			]}
		>
			<View style={styles.eventCardTop}>
				<Text style={styles.eventTitle} numberOfLines={1}>
					{item.title}
				</Text>
				<Text style={[styles.eventType, { color: meta.color }]}>{meta.label}</Text>
			</View>

			<Text style={styles.eventTime}>{formatEventRange(item)}</Text>

			{item.notes ? (
				<Text style={styles.eventNotes} numberOfLines={2}>
					{item.notes}
				</Text>
			) : null}
		</Pressable>
	);
}
