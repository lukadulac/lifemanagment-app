import { StyleSheet } from "react-native";

export const moneyStyles = StyleSheet.create({
	card: {
		backgroundColor: "#1F2937",
		borderWidth: 1,
		borderColor: "#374151",
		borderRadius: 16,
		padding: 16,
		shadowOpacity: 0.25,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 6 },
		elevation: 3,
	},

	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	title: { fontSize: 20, fontWeight: "700", color: "white" },
	subtitle: { fontSize: 18, color: "#9CA3AF" },

	input: {
		borderWidth: 1,
		borderColor: "#4B5563",
		backgroundColor: "#111827",
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		color: "white",
		fontSize: 16,
	},

	btnRed: {
		backgroundColor: "#DC2626",
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: "center",
	},
	btnBlue: {
		backgroundColor: "#2563EB",
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: "center",
	},
	btnDisabled: { opacity: 0.5 },

	btnText: { color: "white", fontWeight: "700" },

	pill: {
		backgroundColor: "#111827",
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
	},

	listItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#111827",
		borderWidth: 1,
		borderColor: "#374151",
		borderRadius: 12,
		padding: 12,
	},
	listItemTitle: { color: "white", fontWeight: "700" },
	listItemSub: { color: "#9CA3AF", fontSize: 12, marginTop: 2 },

	linkRed: { color: "#F87171", fontWeight: "700" },
});
