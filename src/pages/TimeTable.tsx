import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DayCalendarView } from "../features/timetable/components/DayCalendarView";
import { EventDetailsModal } from "../features/timetable/components/EventDetailsModal";
import { EventEditorModal } from "../features/timetable/components/EventEditorModal";
import { MonthCalendarView } from "../features/timetable/components/MonthCalendarView";
import { WeekCalendarView } from "../features/timetable/components/WeekCalendarView";
import {
	DAY_END_MINUTE,
	LEGACY_STORAGE_KEY,
} from "../features/timetable/timetable.constants";
import { timetableService } from "../features/timetable/timetable.service";
import { timeTableStyles as styles } from "../features/timetable/timetable.styles";
import type {
	CalendarItem,
	CalendarView,
	DraftItem,
} from "../features/timetable/timetable.types";
import {
	addDays,
	addMonthsClamped,
	clampHour,
	createDraft,
	formatDayHeadline,
	formatMonthLabel,
	formatWeekLabel,
	fromDayKey,
	getMonthMatrix,
	isCalendarItem,
	normalizeItems,
	startOfDay,
	startOfWeek,
	toDayKey,
} from "../features/timetable/timetable.utils";

type PersistenceMode = "remote" | "local";

async function loadLegacyItems(): Promise<CalendarItem[]> {
	try {
		const raw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
		if (!raw) return [];

		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];

		return normalizeItems(parsed.filter(isCalendarItem));
	} catch (error) {
		console.log("TIMETABLE LEGACY LOAD ERROR:", error);
		return [];
	}
}

export const TimeTable = () => {
	const [view, setView] = useState<CalendarView>("month");
	const [selectedDate, setSelectedDate] = useState<Date>(() =>
		startOfDay(new Date()),
	);
	const [items, setItems] = useState<CalendarItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [persistenceMode, setPersistenceMode] =
		useState<PersistenceMode>("remote");
	const [loadError, setLoadError] = useState<string | null>(null);

	const [modalOpen, setModalOpen] = useState(false);
	const [draft, setDraft] = useState<DraftItem>(() =>
		createDraft(toDayKey(new Date()), new Date().getHours()),
	);
	const [formError, setFormError] = useState<string | null>(null);

	const [detailsItem, setDetailsItem] = useState<CalendarItem | null>(null);

	useEffect(() => {
		let active = true;

		(async () => {
			try {
				setLoadError(null);

				const remoteItems = await timetableService.fetchEvents();
				if (!active) return;

				setPersistenceMode("remote");
				let nextItems = normalizeItems(remoteItems);

				if (nextItems.length === 0) {
					const legacyItems = await loadLegacyItems();
					if (!active) return;

					if (legacyItems.length > 0) {
						try {
							const migrated =
								await timetableService.bulkUpsertEvents(legacyItems);
							if (!active) return;

							nextItems = normalizeItems(migrated);
							await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
						} catch (migrationError) {
							console.log("TIMETABLE MIGRATION ERROR:", migrationError);
							setPersistenceMode("local");
							nextItems = legacyItems;
							setLoadError(
								"Ne mogu da prebacim stare podatke u bazu. Trenutno se cuva lokalno na ovom uredjaju.",
							);
						}
					}
				}

				if (!active) return;
				setItems(nextItems);
			} catch (error) {
				console.log("TIMETABLE LOAD ERROR:", error);
				const legacyItems = await loadLegacyItems();

				if (!active) return;
				setPersistenceMode("local");
				setItems(legacyItems);
				setLoadError(
					"Kalendar tabela jos nije dostupna. Podaci se privremeno cuvaju lokalno na ovom uredjaju.",
				);
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		})();

		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		if (loading || persistenceMode !== "local") return;
		AsyncStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(items)).catch(
			(error) => console.log("TIMETABLE LOCAL SAVE ERROR:", error),
		);
	}, [items, loading, persistenceMode]);

	const selectedDayKey = useMemo(() => toDayKey(selectedDate), [selectedDate]);
	const todayKey = toDayKey(new Date());

	const itemsByDay = useMemo(() => {
		const map = new Map<string, CalendarItem[]>();

		for (const item of items) {
			const start = new Date(item.start);
			if (Number.isNaN(start.getTime())) continue;

			const key = toDayKey(start);
			const existing = map.get(key);
			if (existing) {
				existing.push(item);
			} else {
				map.set(key, [item]);
			}
		}

		for (const dayItems of map.values()) {
			dayItems.sort(
				(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
			);
		}

		return map;
	}, [items]);

	const selectedDayItems = useMemo(
		() => itemsByDay.get(selectedDayKey) ?? [],
		[itemsByDay, selectedDayKey],
	);

	const monthMatrix = useMemo(
		() => getMonthMatrix(selectedDate),
		[selectedDate],
	);
	const weekDays = useMemo(() => {
		const start = startOfWeek(selectedDate);
		return Array.from({ length: 7 }, (_, i) => addDays(start, i));
	}, [selectedDate]);

	const navLabel = useMemo(() => {
		switch (view) {
			case "month":
				return formatMonthLabel(selectedDate);
			case "week":
				return formatWeekLabel(selectedDate);
			case "day":
				return formatDayHeadline(selectedDate);
			default:
				return "";
		}
	}, [selectedDate, view]);

	const openCreate = (dayKey: string, hour?: number) => {
		const initialHour = clampHour(hour ?? new Date().getHours());
		setDraft(createDraft(dayKey, initialHour));
		setFormError(null);
		setModalOpen(true);
	};

	const openEdit = (item: CalendarItem) => {
		const start = new Date(item.start);
		const end = new Date(item.end);

		const startMinute = Number.isNaN(start.getTime())
			? 9 * 60
			: start.getHours() * 60 + start.getMinutes();
		let endMinute = Number.isNaN(end.getTime())
			? startMinute + 60
			: end.getHours() * 60 + end.getMinutes();

		if (
			!Number.isNaN(start.getTime()) &&
			!Number.isNaN(end.getTime()) &&
			toDayKey(end) !== toDayKey(start) &&
			endMinute === 0
		) {
			endMinute = DAY_END_MINUTE;
		}

		if (endMinute <= startMinute) {
			endMinute = Math.min(startMinute + 60, DAY_END_MINUTE);
		}

		setDraft({
			id: item.id,
			title: item.title,
			notes: item.notes ?? "",
			dayKey: toDayKey(Number.isNaN(start.getTime()) ? new Date() : start),
			startMinute,
			endMinute,
		});
		setFormError(null);
		setModalOpen(true);
	};

	const openFromDetails = () => {
		if (!detailsItem) return;
		const item = detailsItem;
		setDetailsItem(null);
		openEdit(item);
	};

	const closeModal = () => {
		if (saving) return;
		setModalOpen(false);
		setFormError(null);
	};

	const saveDraft = async () => {
		const title = draft.title.trim();

		if (!title) {
			setFormError("Naslov je obavezan.");
			return;
		}

		if (draft.endMinute <= draft.startMinute) {
			setFormError("Kraj mora biti posle pocetka.");
			return;
		}

		const start = fromDayKey(draft.dayKey);
		start.setHours(
			Math.floor(draft.startMinute / 60),
			draft.startMinute % 60,
			0,
			0,
		);

		const end = fromDayKey(draft.dayKey);
		end.setHours(Math.floor(draft.endMinute / 60), draft.endMinute % 60, 0, 0);

		const payload: CalendarItem = {
			id: draft.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
			title,
			notes: draft.notes.trim() || undefined,
			start: start.toISOString(),
			end: end.toISOString(),
		};

		setSaving(true);
		setFormError(null);

		try {
			if (persistenceMode === "remote") {
				const saved = await timetableService.upsertEvent(payload);
				setItems((prev) => {
					if (draft.id) {
						return normalizeItems(
							prev.map((item) => (item.id === draft.id ? saved : item)),
						);
					}
					return normalizeItems([...prev, saved]);
				});
			} else {
				setItems((prev) => {
					if (draft.id) {
						return normalizeItems(
							prev.map((item) => (item.id === draft.id ? payload : item)),
						);
					}
					return normalizeItems([...prev, payload]);
				});
			}

			setSelectedDate(startOfDay(start));
			setModalOpen(false);
			setFormError(null);
		} catch (error: any) {
			console.log("TIMETABLE SAVE ERROR:", error);
			setFormError(error?.message ?? "Ne mogu da sacuvam unos.");
		} finally {
			setSaving(false);
		}
	};

	const deleteDraft = () => {
		if (!draft.id || saving) return;

		Alert.alert(
			"Obrisi unos",
			"Da li si siguran da zelis da obrises ovaj unos?",
			[
				{ text: "Otkazi", style: "cancel" },
				{
					text: "Obrisi",
					style: "destructive",
					onPress: async () => {
						try {
							setSaving(true);
							if (persistenceMode === "remote") {
								await timetableService.deleteEvent(draft.id as string);
							}

							setItems((prev) => prev.filter((item) => item.id !== draft.id));
							setDetailsItem((prev) => (prev?.id === draft.id ? null : prev));
							setModalOpen(false);
							setFormError(null);
						} catch (error: any) {
							console.log("TIMETABLE DELETE ERROR:", error);
							setFormError(error?.message ?? "Ne mogu da obrisem unos.");
						} finally {
							setSaving(false);
						}
					},
				},
			],
		);
	};

	const moveCursor = (direction: -1 | 1) => {
		setSelectedDate((prev) => {
			switch (view) {
				case "month":
					return addMonthsClamped(prev, direction);
				case "week":
					return addDays(prev, direction * 7);
				case "day":
					return addDays(prev, direction);
				default:
					return prev;
			}
		});
	};

	const resetToToday = () => {
		setSelectedDate(startOfDay(new Date()));
	};

	if (loading) {
		return (
			<View style={[styles.page, styles.center]}>
				<ActivityIndicator color="#34D399" />
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.page} edges={["top"]}>
			<View style={styles.container}>
				<View style={styles.headerRow}>
					<Text style={styles.h1}>Organizacija vremena</Text>
					<Pressable
						style={styles.addMainBtn}
						onPress={() => openCreate(selectedDayKey)}
					>
						<Ionicons name="add" size={18} color="#1E2838" />
						<Text style={styles.addMainBtnText}>Novi unos</Text>
					</Pressable>
				</View>

				<Text style={styles.subtitle}>
					Mesecni, nedeljni i dnevni pregled obaveza i zadataka po satu.
				</Text>

				{loadError ? <Text style={styles.warningText}>{loadError}</Text> : null}

				<View style={styles.segment}>
					{(["month", "week", "day"] as CalendarView[]).map((mode) => (
						<Pressable
							key={mode}
							style={[
								styles.segmentBtn,
								view === mode && styles.segmentBtnActive,
							]}
							onPress={() => setView(mode)}
						>
							<Text
								style={[
									styles.segmentBtnText,
									view === mode && styles.segmentBtnTextActive,
								]}
							>
								{mode === "month"
									? "Mesec"
									: mode === "week"
										? "Nedelja"
										: "Dan"}
							</Text>
						</Pressable>
					))}
				</View>

				<View style={styles.navRow}>
					<Pressable style={styles.iconBtn} onPress={() => moveCursor(-1)}>
						<Ionicons name="chevron-back" size={18} color="#D1D5DB" />
					</Pressable>

					<Text style={styles.navLabel}>{navLabel}</Text>

					<Pressable style={styles.iconBtn} onPress={() => moveCursor(1)}>
						<Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
					</Pressable>

					<Pressable style={styles.todayBtn} onPress={resetToToday}>
						<Text style={styles.todayBtnText}>Danas</Text>
					</Pressable>
				</View>

				{view === "month" ? (
					<MonthCalendarView
						monthMatrix={monthMatrix}
						itemsByDay={itemsByDay}
						selectedDate={selectedDate}
						selectedDayKey={selectedDayKey}
						todayKey={todayKey}
						onSelectDate={(date) => setSelectedDate(startOfDay(date))}
						onOpenCreate={openCreate}
						onOpenDetails={(item) => setDetailsItem(item)}
					/>
				) : null}

				{view === "week" ? (
					<WeekCalendarView
						weekDays={weekDays}
						itemsByDay={itemsByDay}
						selectedDayKey={selectedDayKey}
						todayKey={todayKey}
						onSelectDate={(date) => setSelectedDate(startOfDay(date))}
						onOpenCreate={openCreate}
						onOpenEdit={openEdit}
					/>
				) : null}

				{view === "day" ? (
					<DayCalendarView
						selectedDayItems={selectedDayItems}
						selectedDayKey={selectedDayKey}
						onOpenCreate={openCreate}
						onOpenEdit={openEdit}
					/>
				) : null}
			</View>

			<EventDetailsModal
				visible={detailsItem !== null}
				item={detailsItem}
				onClose={() => setDetailsItem(null)}
				onEdit={openFromDetails}
			/>

			<EventEditorModal
				visible={modalOpen}
				draft={draft}
				formError={formError}
				saving={saving}
				onClose={closeModal}
				onSave={saveDraft}
				onDelete={deleteDraft}
				onTitleChange={(title) => setDraft((prev) => ({ ...prev, title }))}
				onPrevDay={() =>
					setDraft((prev) => ({
						...prev,
						dayKey: toDayKey(addDays(fromDayKey(prev.dayKey), -1)),
					}))
				}
				onNextDay={() =>
					setDraft((prev) => ({
						...prev,
						dayKey: toDayKey(addDays(fromDayKey(prev.dayKey), 1)),
					}))
				}
				onStartMinuteChange={(startMinute) =>
					setDraft((prev) => {
						const nextEnd =
							prev.endMinute <= startMinute
								? Math.min(startMinute + 60, DAY_END_MINUTE)
								: prev.endMinute;
						return {
							...prev,
							startMinute,
							endMinute: nextEnd,
						};
					})
				}
				onEndMinuteChange={(endMinute) =>
					setDraft((prev) => ({ ...prev, endMinute }))
				}
				onNotesChange={(notes) => setDraft((prev) => ({ ...prev, notes }))}
			/>
		</SafeAreaView>
	);
};
