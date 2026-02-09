import React from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import { moneyStyles as s } from "../money.styles";
import { formatCurrency } from "../utils/moneyFormat";

type Props = {
	balance: number;
	totalIncome: number;
	totalExpense: number;
	cardStyle?: StyleProp<ViewStyle>;
};

export function BalanceCard({
	balance,
	totalIncome,
	totalExpense,
	cardStyle,
}: Props) {
	const isPos = balance >= 0;

	return (
		<View style={[s.card, cardStyle]}>
			<View style={{ alignItems: "center" }}>
				<Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
					Trenutno Stanje
				</Text>

				<Text
					style={{
						fontSize: 40,
						fontWeight: "900",
						color: isPos ? "#34D399" : "#F87171",
					}}
				>
					{formatCurrency(balance)} RSD
				</Text>
			</View>

			<View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
				<View style={[s.pill, { flex: 1, borderColor: "#14532D" }]}>
					<Text style={{ color: "#34D399", fontSize: 12, marginBottom: 6 }}>
						Prihodi
					</Text>
					<Text style={{ color: "#86EFAC", fontSize: 20, fontWeight: "800" }}>
						+{formatCurrency(totalIncome)}
					</Text>
				</View>

				<View style={[s.pill, { flex: 1, borderColor: "#7F1D1D" }]}>
					<Text style={{ color: "#F87171", fontSize: 12, marginBottom: 6 }}>
						Rashodi
					</Text>
					<Text style={{ color: "#FCA5A5", fontSize: 20, fontWeight: "800" }}>
						-{formatCurrency(totalExpense)}
					</Text>
				</View>
			</View>
		</View>
	);
}
