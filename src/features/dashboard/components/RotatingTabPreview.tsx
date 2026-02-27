import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type PreviewStat = {
	label: string;
	value: string;
};

export type TabPreviewItem<RouteName extends string> = {
	route: RouteName;
	title: string;
	prompt: string;
	stats: PreviewStat[];
};

type RotatingTabPreviewProps<RouteName extends string> = {
	items: TabPreviewItem<RouteName>[];
	activeIndex: number;
	onChange: (index: number) => void;
	onOpen: (route: RouteName) => void;
};

export function RotatingTabPreview<RouteName extends string>({
	items,
	activeIndex,
	onChange,
	onOpen,
}: RotatingTabPreviewProps<RouteName>) {
	if (items.length === 0) return null;

	const safeIndex = Math.min(activeIndex, items.length - 1);
	const activeItem = items[safeIndex];

	return (
		<View style={styles.wrap}>
			<View style={styles.selectorRow}>
				{items.map((item, index) => {
					const selected = index === safeIndex;
					return (
						<Pressable
							key={item.route}
							onPress={() => onChange(index)}
							style={[styles.selectorChip, selected && styles.selectorChipActive]}
						>
							<Text
								style={[
									styles.selectorChipText,
									selected && styles.selectorChipTextActive,
								]}
							>
								{item.title}
							</Text>
						</Pressable>
					);
				})}
			</View>

			<View style={styles.card}>
				<View style={styles.cardTop}>
					<Text style={styles.cardTitle}>{activeItem.title}</Text>
					<View style={styles.promptBadge}>
						<Text style={styles.promptBadgeText}>Prompt</Text>
					</View>
				</View>

				<Text style={styles.prompt}>{activeItem.prompt}</Text>

				<View style={styles.statsRow}>
					{activeItem.stats.slice(0, 2).map((stat) => (
						<View key={stat.label} style={styles.statBox}>
							<Text style={styles.statLabel}>{stat.label}</Text>
							<Text style={styles.statValue}>{stat.value}</Text>
						</View>
					))}
				</View>

				<Pressable
					style={styles.openBtn}
					onPress={() => onOpen(activeItem.route)}
				>
					<Text style={styles.openBtnText}>Otvori tab</Text>
					<Ionicons name="arrow-forward" size={16} color="#1E2838" />
				</Pressable>
			</View>

			<View style={styles.dotsRow}>
				{items.map((item, index) => (
					<Pressable
						key={`${item.route}-dot`}
						onPress={() => onChange(index)}
						style={[styles.dot, index === safeIndex && styles.dotActive]}
					/>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: {
		gap: 12,
	},
	selectorRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	selectorChip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#374151",
		backgroundColor: "#0F172A",
	},
	selectorChipActive: {
		borderColor: "#34D399",
		backgroundColor: "rgba(52, 211, 153, 0.12)",
	},
	selectorChipText: {
		color: "#9CA3AF",
		fontSize: 12,
		fontWeight: "700",
	},
	selectorChipTextActive: {
		color: "#D1FAE5",
	},
	card: {
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#374151",
		backgroundColor: "#111827",
		padding: 14,
		gap: 12,
	},
	cardTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	cardTitle: {
		color: "white",
		fontSize: 18,
		fontWeight: "800",
	},
	promptBadge: {
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 4,
		backgroundColor: "rgba(52, 211, 153, 0.18)",
	},
	promptBadgeText: {
		color: "#6EE7B7",
		fontWeight: "700",
		fontSize: 11,
	},
	prompt: {
		color: "#D1D5DB",
		fontSize: 14,
		lineHeight: 20,
	},
	statsRow: {
		flexDirection: "row",
		gap: 10,
	},
	statBox: {
		flex: 1,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#334155",
		backgroundColor: "#0B1220",
		padding: 10,
		gap: 4,
	},
	statLabel: {
		color: "#9CA3AF",
		fontSize: 12,
	},
	statValue: {
		color: "white",
		fontSize: 16,
		fontWeight: "800",
	},
	openBtn: {
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 9,
		backgroundColor: "#34D399",
		borderRadius: 10,
	},
	openBtnText: {
		color: "#1E2838",
		fontWeight: "800",
		fontSize: 13,
	},
	dotsRow: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 8,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 999,
		backgroundColor: "#4B5563",
	},
	dotActive: {
		backgroundColor: "#34D399",
		width: 18,
	},
});
