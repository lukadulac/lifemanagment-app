import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
	Modal,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { timeTableStyles as styles } from "../timetable.styles";
import type { DraftItem } from "../timetable.types";
import {
	formatDayHeadline,
	formatMinuteOfDay,
	fromDayKey,
} from "../timetable.utils";

type EventEditorModalProps = {
	visible: boolean;
	draft: DraftItem;
	formError: string | null;
	saving: boolean;
	onClose: () => void;
	onSave: () => void;
	onDelete: () => void;
	onTitleChange: (title: string) => void;
	onPrevDay: () => void;
	onNextDay: () => void;
	onStartMinuteChange: (minute: number) => void;
	onEndMinuteChange: (minute: number) => void;
	onNotesChange: (notes: string) => void;
};

type TimeField = "start" | "end";

export function EventEditorModal({
	visible,
	draft,
	formError,
	saving,
	onClose,
	onSave,
	onDelete,
	onTitleChange,
	onPrevDay,
	onNextDay,
	onStartMinuteChange,
	onEndMinuteChange,
	onNotesChange,
}: EventEditorModalProps) {
	const [timePickerField, setTimePickerField] = useState<TimeField | null>(
		null,
	);
	const hourOptions = useMemo(() => Array.from({ length: 25 }, (_, i) => i), []);
	const minuteOptions = useMemo(
		() => Array.from({ length: 60 }, (_, i) => i),
		[],
	);

	useEffect(() => {
		if (!visible) {
			setTimePickerField(null);
		}
	}, [visible]);

	const selectedTime =
		timePickerField === "start" ? draft.startMinute : draft.endMinute;
	const selectedHour = Math.floor(selectedTime / 60);
	const selectedMinute = selectedHour >= 24 ? 0 : selectedTime % 60;
	const minuteDisabled = selectedHour >= 24;

	const toggleTimePicker = (field: TimeField) => {
		if (saving) return;
		setTimePickerField((prev) => (prev === field ? null : field));
	};

	const applyPickedHour = (hour: number) => {
		if (!timePickerField) return;
		const nextMinute = hour >= 24 ? 24 * 60 : hour * 60 + selectedMinute;

		if (timePickerField === "start") {
			onStartMinuteChange(nextMinute);
		} else {
			onEndMinuteChange(nextMinute);
		}
	};

	const applyPickedMinute = (minute: number) => {
		if (!timePickerField || minuteDisabled) return;
		const nextMinute = selectedHour * 60 + minute;

		if (timePickerField === "start") {
			onStartMinuteChange(nextMinute);
		} else {
			onEndMinuteChange(nextMinute);
		}
	};

	return (
		<>
			<Modal
				visible={visible}
				animationType="slide"
				transparent
				onRequestClose={onClose}
			>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>
								{draft.id ? "Izmeni unos" : "Novi unos"}
							</Text>
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

						<Text style={styles.fieldLabel}>Datum</Text>
						<View style={styles.datePickerRow}>
							<Pressable
								style={styles.iconBtn}
								onPress={onPrevDay}
								disabled={saving}
							>
								<Ionicons name="chevron-back" size={16} color="#D1D5DB" />
							</Pressable>

							<Text style={styles.datePickerText}>
								{formatDayHeadline(fromDayKey(draft.dayKey))}
							</Text>

							<Pressable
								style={styles.iconBtn}
								onPress={onNextDay}
								disabled={saving}
							>
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
									<Text style={styles.timeFieldBtnText}>
										{formatMinuteOfDay(draft.startMinute)}
									</Text>
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
									<Text style={styles.timeFieldBtnText}>
										{formatMinuteOfDay(draft.endMinute)}
									</Text>
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

								<View style={styles.timePickerGrid}>
									<View style={styles.timePickerColumn}>
										<Text style={styles.timePickerColumnTitle}>Sat</Text>
										<ScrollView
											style={styles.inlineTimePickerList}
											nestedScrollEnabled
										>
											{hourOptions.map((hour) => {
												const selected = hour === selectedHour;
												return (
													<Pressable
														key={`hour-${hour}`}
														style={[
															styles.inlineTimePickerOption,
															selected &&
																styles.inlineTimePickerOptionSelected,
														]}
														onPress={() => applyPickedHour(hour)}
													>
														<Text
															style={[
																styles.inlineTimePickerOptionText,
																selected &&
																	styles.inlineTimePickerOptionTextSelected,
															]}
														>
															{String(hour).padStart(2, "0")}
														</Text>
													</Pressable>
												);
											})}
										</ScrollView>
									</View>

									<View style={styles.timePickerColumn}>
										<Text style={styles.timePickerColumnTitle}>Minut</Text>
										<ScrollView
											style={styles.inlineTimePickerList}
											nestedScrollEnabled
										>
											{minuteOptions.map((minute) => {
												const selected =
													!minuteDisabled && minute === selectedMinute;
												return (
													<Pressable
														key={`minute-${minute}`}
														style={[
															styles.inlineTimePickerOption,
															selected &&
																styles.inlineTimePickerOptionSelected,
															minuteDisabled &&
																styles.inlineTimePickerOptionDisabled,
														]}
														onPress={() => applyPickedMinute(minute)}
														disabled={minuteDisabled}
													>
														<Text
															style={[
																styles.inlineTimePickerOptionText,
																selected &&
																	styles.inlineTimePickerOptionTextSelected,
																minuteDisabled &&
																	styles.inlineTimePickerOptionTextDisabled,
															]}
														>
															{String(minute).padStart(2, "0")}
														</Text>
													</Pressable>
												);
											})}
										</ScrollView>
									</View>
								</View>
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

						{formError ? (
							<Text style={styles.formError}>{formError}</Text>
						) : null}

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

							<Pressable
								style={styles.cancelBtn}
								onPress={onClose}
								disabled={saving}
							>
								<Text style={styles.cancelBtnText}>Otkazi</Text>
							</Pressable>

							<Pressable
								style={styles.saveBtn}
								onPress={onSave}
								disabled={saving}
							>
								<Text style={styles.saveBtnText}>
									{saving ? "Cuvam..." : "Sacuvaj"}
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
}
