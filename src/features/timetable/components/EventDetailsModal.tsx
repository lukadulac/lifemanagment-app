import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { TYPE_META } from "../timetable.constants";
import { timeTableStyles as styles } from "../timetable.styles";
import type { CalendarItem } from "../timetable.types";
import { formatDayHeadline, formatEventRange, startOfDay } from "../timetable.utils";

type EventDetailsModalProps = {
	visible: boolean;
	item: CalendarItem | null;
	onClose: () => void;
	onEdit: () => void;
};

export function EventDetailsModal({
	visible,
	item,
	onClose,
	onEdit,
}: EventDetailsModalProps) {
	if (!item) return null;

	const meta = TYPE_META[item.type];
	const startDate = new Date(item.start);
	const dayLabel = Number.isNaN(startDate.getTime())
		? ""
		: formatDayHeadline(startOfDay(startDate));

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View style={styles.detailsBackdrop}>
				<View style={styles.detailsCard}>
					<View style={styles.detailsTopRow}>
						<Text style={styles.detailsTitle} numberOfLines={2}>
							{item.title}
						</Text>
						<Pressable onPress={onClose} style={styles.detailsCloseBtn}>
							<Ionicons name="close" size={18} color="#E5E7EB" />
						</Pressable>
					</View>

					<View style={[styles.detailsTypeBadge, { borderColor: meta.color, backgroundColor: meta.bg }]}>
						<Text style={[styles.detailsTypeBadgeText, { color: meta.color }]}>{meta.label}</Text>
					</View>

					<Text style={styles.detailsMetaText}>{dayLabel}</Text>
					<Text style={styles.detailsMetaText}>{formatEventRange(item)}</Text>

					{item.notes ? <Text style={styles.detailsNotes}>{item.notes}</Text> : null}

					<View style={styles.detailsActions}>
						<Pressable style={styles.detailsSecondaryBtn} onPress={onClose}>
							<Text style={styles.detailsSecondaryBtnText}>Zatvori</Text>
						</Pressable>

						<Pressable style={styles.detailsPrimaryBtn} onPress={onEdit}>
							<Text style={styles.detailsPrimaryBtnText}>Izmeni</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}
