import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	RotatingTabPreview,
	type TabPreviewItem,
} from "../features/dashboard/components/RotatingTabPreview";
import { useMoneyManager } from "../features/money/hooks/useMoneyManager";
import { formatCurrency, formatDate } from "../features/money/utils/moneyFormat";
import { useShoppingList } from "../features/shopping-list/useShoppingList";
import { timetableService } from "../features/timetable/timetable.service";
import type { CalendarItem } from "../features/timetable/timetable.types";
import { formatHour, normalizeItems, toDayKey } from "../features/timetable/timetable.utils";
import { supabase } from "../lib/supabaseClient";
import type { MainTabParamList } from "../navigation/MainTabs";

type PreviewRoute = Exclude<keyof MainTabParamList, "Dashboard">;

type Navigation = BottomTabNavigationProp<MainTabParamList, "Dashboard">;

function getNextEventLabel(item: CalendarItem | null): string {
	if (!item) return "Nema narednih obaveza";

	const start = new Date(item.start);
	if (Number.isNaN(start.getTime())) return "Nepoznat termin";

	return `${formatDate(start)} ${formatHour(start.getHours())}`;
}

export const Dashboard = () => {
	const navigation = useNavigation<Navigation>();

	const moneyState = useMoneyManager();
	const listState = useShoppingList();

	const [eventsLoading, setEventsLoading] = useState(true);
	const [eventsError, setEventsError] = useState<string | null>(null);
	const [events, setEvents] = useState<CalendarItem[]>([]);

	const [accountLoading, setAccountLoading] = useState(true);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountEmail, setAccountEmail] = useState<string | null>(null);

	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				setEventsLoading(true);
				setEventsError(null);
				const rows = await timetableService.fetchEvents();
				if (!mounted) return;
				setEvents(normalizeItems(rows));
			} catch (error: any) {
				if (!mounted) return;
				setEventsError(error?.message ?? "Ne mogu da ucitam kalendar preview.");
			} finally {
				if (mounted) setEventsLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				setAccountLoading(true);

				const { data: sessionData } = await supabase.auth.getSession();
				const sessionUser = sessionData.session?.user;
				if (!sessionUser) {
					if (!mounted) return;
					setAccountName(null);
					setAccountEmail(null);
					return;
				}

				if (!mounted) return;
				setAccountEmail(sessionUser.email ?? null);

				const { data: profile } = await supabase
					.from("profiles")
					.select("username")
					.eq("id", sessionUser.id)
					.maybeSingle();

				if (!mounted) return;
				setAccountName(profile?.username ?? null);
			} catch {
				if (!mounted) return;
				setAccountName(null);
				setAccountEmail(null);
			} finally {
				if (mounted) setAccountLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	const pendingItems = useMemo(
		() => listState.items.filter((item) => !item.isDone).length,
		[listState.items],
	);

	const todayItems = useMemo(() => {
		const todayKey = toDayKey(new Date());
		return events.filter((item) => {
			const start = new Date(item.start);
			return !Number.isNaN(start.getTime()) && toDayKey(start) === todayKey;
		});
	}, [events]);

	const nextEvent = useMemo(() => {
		const now = Date.now();
		return (
			events.find((item) => {
				const end = new Date(item.end).getTime();
				return Number.isFinite(end) && end >= now;
			}) ?? null
		);
	}, [events]);

	const accountDisplayName =
		accountName?.trim() || accountEmail?.split("@")[0] || "Nalog";

	const previewItems = useMemo<TabPreviewItem<PreviewRoute>[]>(() => {
		const moneyTotalOut =
			moneyState.totalExpense + moneyState.fixedTotal + moneyState.savingsTotal;

		return [
			{
				route: "Novac",
				title: "Novac",
				prompt: "Pogledaj trenutno stanje budzeta za ovaj mesec.",
				stats: [
					{
						label: "Bilans",
						value: moneyState.loading
							? "Ucitam..."
							: `${formatCurrency(moneyState.balance)} RSD`,
					},
					{
						label: "Troskovi",
						value: moneyState.loading
							? "Ucitam..."
							: `${formatCurrency(moneyTotalOut)} RSD`,
					},
				],
			},
			{
				route: "Spisak",
				title: "Spisak",
				prompt: "Brz pregled aktivne shopping liste i preostalih stavki.",
				stats: [
					{
						label: "Preostalo",
						value: listState.loading
							? "Ucitam..."
							: `${pendingItems}/${listState.items.length}`,
					},
					{
						label: "Lista",
						value: listState.loading
							? "Ucitam..."
							: (listState.activeList?.name ?? "Nema aktivne"),
					},
				],
			},
			{
				route: "Vreme",
				title: "Vreme",
				prompt: "Pogledaj danasnje obaveze i naredni termin.",
				stats: [
					{
						label: "Danas",
						value: eventsLoading ? "Ucitam..." : `${todayItems.length} unosa`,
					},
					{
						label: "Sledece",
						value: eventsLoading ? "Ucitam..." : getNextEventLabel(nextEvent),
					},
				],
			},
			{
				route: "Nalog",
				title: "Nalog",
				prompt: "Proveri username i status prijave profila.",
				stats: [
					{
						label: "Korisnik",
						value: accountLoading ? "Ucitam..." : accountDisplayName,
					},
					{
						label: "Email",
						value: accountLoading ? "Ucitam..." : (accountEmail ?? "Nije dostupan"),
					},
				],
			},
		];
	}, [
		accountDisplayName,
		accountEmail,
		accountLoading,
		eventsLoading,
		listState.activeList?.name,
		listState.items.length,
		listState.loading,
		moneyState.balance,
		moneyState.fixedTotal,
		moneyState.loading,
		moneyState.savingsTotal,
		moneyState.totalExpense,
		nextEvent,
		pendingItems,
		todayItems.length,
	]);

	useEffect(() => {
		if (activeIndex >= previewItems.length) {
			setActiveIndex(0);
		}
	}, [activeIndex, previewItems.length]);

	const hasAnyLoading =
		moneyState.loading || listState.loading || eventsLoading || accountLoading;
	const warning = [moneyState.error, listState.error, eventsError]
		.filter((value): value is string => Boolean(value))
		.join(" • ");

	const openTab = (route: PreviewRoute) => {
		navigation.navigate(route);
	};

	return (
		<SafeAreaView style={styles.page} edges={["top"]}>
			<ScrollView contentContainerStyle={styles.container}>
				<Text style={styles.title}>Dashboard</Text>
				<Text style={styles.subtitle}>
					Pregled svih tabova na jednom mestu sa kljucnim podacima.
				</Text>

				<RotatingTabPreview
					items={previewItems}
					activeIndex={activeIndex}
					onChange={setActiveIndex}
					onOpen={openTab}
				/>

				<View style={styles.grid}>
					{previewItems.map((item, index) => {
						const isActive = index === activeIndex;
						return (
							<Pressable
								key={item.route}
								onPress={() => openTab(item.route)}
								style={[styles.card, isActive && styles.cardActive]}
							>
								<Text style={styles.cardTitle}>{item.title}</Text>
								<Text style={styles.cardPrompt}>{item.prompt}</Text>
								{item.stats.slice(0, 2).map((stat) => (
									<View key={`${item.route}-${stat.label}`} style={styles.cardStatRow}>
										<Text style={styles.cardStatLabel}>{stat.label}</Text>
										<Text style={styles.cardStatValue} numberOfLines={1}>
											{stat.value}
										</Text>
									</View>
								))}
							</Pressable>
						);
					})}
				</View>

				{hasAnyLoading ? (
					<View style={styles.loadingRow}>
						<ActivityIndicator color="#34D399" />
						<Text style={styles.loadingText}>Osvezavam dashboard preview...</Text>
					</View>
				) : null}

				{warning.length > 0 ? <Text style={styles.warning}>{warning}</Text> : null}
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	page: {
		flex: 1,
		backgroundColor: "#1E2838",
	},
	container: {
		padding: 16,
		paddingBottom: 24,
		gap: 14,
	},
	title: {
		fontSize: 30,
		fontWeight: "800",
		color: "white",
	},
	subtitle: {
		fontSize: 14,
		lineHeight: 20,
		color: "#D1D5DB",
	},
	grid: {
		gap: 12,
	},
	card: {
		borderWidth: 1,
		borderColor: "#374151",
		backgroundColor: "#111827",
		borderRadius: 16,
		padding: 12,
		gap: 8,
	},
	cardActive: {
		borderColor: "#34D399",
		backgroundColor: "#0E1A2B",
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "800",
		color: "white",
	},
	cardPrompt: {
		fontSize: 13,
		lineHeight: 18,
		color: "#9CA3AF",
	},
	cardStatRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: 8,
		borderTopWidth: 1,
		borderTopColor: "#1F2937",
		paddingTop: 8,
	},
	cardStatLabel: {
		fontSize: 12,
		color: "#9CA3AF",
		fontWeight: "700",
	},
	cardStatValue: {
		maxWidth: "70%",
		fontSize: 13,
		color: "#F3F4F6",
		fontWeight: "700",
	},
	loadingRow: {
		marginTop: 4,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	loadingText: {
		color: "#A7F3D0",
		fontSize: 12,
	},
	warning: {
		color: "#FCA5A5",
		fontSize: 12,
		lineHeight: 18,
	},
});
