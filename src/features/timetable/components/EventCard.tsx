import React from "react";
import { Pressable, Text, View } from "react-native";
import { timeTableStyles as styles } from "../timetable.styles";
import type { CalendarItem } from "../timetable.types";
import { formatEventRange } from "../timetable.utils";

type EventCardProps = {
	item: CalendarItem;
	onPress: () => void;
};

export function EventCard({ item, onPress }: EventCardProps) {
	return (
		<Pressable
			onPress={onPress}
			style={[
				styles.eventCard,
				{
					backgroundColor: "rgba(52,211,153,0.14)",
					borderColor: "#34D399",
				},
			]}
		>
			<View style={styles.eventCardTop}>
				<Text style={styles.eventTitle} numberOfLines={1}>
					{item.title}
				</Text>
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
