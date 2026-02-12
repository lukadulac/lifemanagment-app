import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { HOURS, TYPE_META } from "../timetable.constants";
import { timeTableStyles as styles } from "../timetable.styles";
import type { CalendarItemType, DraftItem } from "../timetable.types";
import { formatDayHeadline, formatHour, fromDayKey } from "../timetable.utils";

type EventEditorModalProps = {
	visible: boolean;
	draft: DraftItem;
	formError: string | null;
	endHourOptions: number[];
	saving: boolean;
	onClose: () => void;
	onSave: () => void;
	onDelete: () => void;
	onTitleChange: (title: string) => void;
	onTypeChange: (type: CalendarItemType) => void;
	onPrevDay: () => void;
	onNextDay: () => void;
	onStartHourChange: (hour: number) => void;
	onEndHourChange: (hour: number) => void;
	onNotesChange: (notes: string) => void;
};

type TimeField = "start" | "end";

export function EventEditorModal({
	visible,
	draft,
	formError,
	endHourOptions,
	saving,
	onClose,
	onSave,
	onDelete,
	onTitleChange,
	onTypeChange,
	onPrevDay,
	onNextDay,
	onStartHourChange,
	onEndHourChange,
	onNotesChange,
	}: EventEditorModalProps) {
	const [timePickerField, setTimePickerField] = useState<TimeField | null>(null);

	useEffect(() => {
		if (!visible) {
			setTimePickerField(null);
		}
	}, [visible]);

	const timeOptions = useMemo(() => {
		if (!timePickerField) return [];
		return timePickerField === "start" ? HOURS : endHourOptions;
	}, [timePickerField, endHourOptions]);

	const selectedTime = timePickerField === "start" ? draft.startHour : draft.endHour;

	const toggleTimePicker = (field: TimeField) => {
		if (saving) return;
		setTimePickerField((prev) => (prev === field ? null : field));
	};

	const applyPickedHour = (hour: number) => {
		if (!timePickerField) return;

		if (timePickerField === "start") {
			onStartHourChange(hour);
		} else {
			onEndHourChange(hour);
		}
		setTimePickerField(null);
	};

	return (
		<>
			<Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>{draft.id ? "Izmeni unos" : "Novi unos"}</Text>
							<Pressable onPress={onClose} disabled={saving}>
								<Ionicons name="close" size={22} color="#E5E7EB" />
							</Pressable>
						</View>

						<Text style={styles.fieldLabel}>Naslov</Text>
						<TextInput
							value={draft.title}
							onChangeText={onTitleChange}
							placeholder="Npr. Trening, Sastanak..."
							placeholderTextColor="#6B7280"
							style={styles.input}
							editable={!saving}
						/>

						<Text style={styles.fieldLabel}>Tip unosa</Text>
						<View style={styles.typeRow}>
							{(["obligation", "task"] as CalendarItemType[]).map((type) => (
								<Pressable
									key={type}
									style={[
										styles.typeBtn,
										draft.type === type && {
											borderColor: TYPE_META[type].color,
											backgroundColor: TYPE_META[type].bg,
										},
									]}
									onPress={() => onTypeChange(type)}
									disabled={saving}
								>
									<Text
										style={[
											styles.typeBtnText,
											draft.type === type && { color: TYPE_META[type].color },
										]}
									>
										{TYPE_META[type].label}
									</Text>
								</Pressable>
							))}
						</View>

						<Text style={styles.fieldLabel}>Datum</Text>
						<View style={styles.datePickerRow}>
							<Pressable style={styles.iconBtn} onPress={onPrevDay} disabled={saving}>
								<Ionicons name="chevron-back" size={16} color="#D1D5DB" />
							</Pressable>

							<Text style={styles.datePickerText}>
								{formatDayHeadline(fromDayKey(draft.dayKey))}
							</Text>

							<Pressable style={styles.iconBtn} onPress={onNextDay} disabled={saving}>
								<Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
							</Pressable>
						</View>

							<View style={styles.timeFieldRow}>
								<View style={styles.timeFieldColumn}>
									<Text style={styles.fieldLabel}>Pocetak</Text>
									<Pressable
										style={styles.timeFieldBtn}
										onPress={() => toggleTimePicker("start")}
										disabled={saving}
									>
										<Text style={styles.timeFieldBtnText}>{formatHour(draft.startHour)}</Text>
										<Ionicons name="chevron-down" size={16} color="#FFFFFF" />
									</Pressable>
							</View>

								<View style={styles.timeFieldColumn}>
									<Text style={styles.fieldLabel}>Kraj</Text>
									<Pressable
										style={styles.timeFieldBtn}
										onPress={() => toggleTimePicker("end")}
										disabled={saving}
									>
										<Text style={styles.timeFieldBtnText}>{formatHour(draft.endHour)}</Text>
										<Ionicons name="chevron-down" size={16} color="#FFFFFF" />
									</Pressable>
								</View>
							</View>

							{timePickerField ? (
								<View style={styles.inlineTimePicker}>
									<View style={styles.inlineTimePickerHeader}>
										<Text style={styles.inlineTimePickerTitle}>
											{timePickerField === "start"
												? "Izaberi vreme pocetka"
												: "Izaberi vreme kraja"}
										</Text>
										<Pressable onPress={() => setTimePickerField(null)}>
											<Ionicons name="close" size={18} color="#E5E7EB" />
										</Pressable>
									</View>

									<ScrollView style={styles.inlineTimePickerList} nestedScrollEnabled>
										{timeOptions.map((hour) => {
											const selected = hour === selectedTime;
											return (
												<Pressable
													key={hour}
													style={[
														styles.inlineTimePickerOption,
														selected && styles.inlineTimePickerOptionSelected,
													]}
													onPress={() => applyPickedHour(hour)}
												>
													<Text
														style={[
															styles.inlineTimePickerOptionText,
															selected && styles.inlineTimePickerOptionTextSelected,
														]}
													>
														{formatHour(hour)}
													</Text>
												</Pressable>
											);
										})}
									</ScrollView>
								</View>
							) : null}

							<Text style={styles.fieldLabel}>Napomena</Text>
							<TextInput
								value={draft.notes}
							onChangeText={onNotesChange}
							placeholder="Opcionalno..."
							placeholderTextColor="#6B7280"
							style={[styles.input, styles.notesInput]}
							multiline
							textAlignVertical="top"
							editable={!saving}
						/>

						{formError ? <Text style={styles.formError}>{formError}</Text> : null}

						<View style={styles.modalActions}>
							{draft.id ? (
								<Pressable
									style={styles.deleteBtn}
									onPress={onDelete}
									disabled={saving}
								>
									<Text style={styles.deleteBtnText}>Obrisi</Text>
								</Pressable>
							) : null}

							<Pressable style={styles.cancelBtn} onPress={onClose} disabled={saving}>
								<Text style={styles.cancelBtnText}>Otkazi</Text>
							</Pressable>

							<Pressable style={styles.saveBtn} onPress={onSave} disabled={saving}>
								<Text style={styles.saveBtnText}>{saving ? "Cuvam..." : "Sacuvaj"}</Text>
							</Pressable>
						</View>
					</View>
					</View>
				</Modal>
		</>
	);
}
