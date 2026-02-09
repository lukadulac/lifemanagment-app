import React from "react";
import { StyleProp, Text, TextInput, View, ViewStyle } from "react-native";
import { moneyStyles as s } from "../money.styles";
import { MonthKey, lastMonths } from "../utils/moneyFormat";
import { MonthDropdown } from "./MonthDropdown";

type Props = {
	month: MonthKey;
	onMonthChange: (m: MonthKey) => void;

	monthlyIncome: number;
	onSave: (n: number) => void;

	cardStyle?: StyleProp<ViewStyle>;
};

export function MonthlyIncomeCard({
	month,
	onMonthChange,
	monthlyIncome,
	onSave,
	cardStyle,
}: Props) {
	const months = lastMonths(6);

	return (
		<View style={[s.card, cardStyle]}>
			<View style={{ gap: 14 }}>
				<Text style={s.title}>Mesečni Budget</Text>

				<View
					style={[
						s.rowBetween,
						{
							gap: 8,
							flexDirection: "column",
							alignItems: "flex-start",
						},
					]}
				>
					<MonthDropdown
						value={month}
						onChange={onMonthChange}
						monthsCount={6}
					/>
				</View>

				<View style={[s.pill, { borderColor: "#14532D" /* green-900 */ }]}>
					<Text style={{ color: "#34D399", fontSize: 12, marginBottom: 6 }}>
						Ukupni prihod (za mesec)
					</Text>

					<View style={{ gap: 10 }}>
						<TextInput
							keyboardType="numeric"
							value={String(Number.isFinite(monthlyIncome) ? monthlyIncome : 0)}
							onChangeText={(t) => onSave(t ? Number(t) : 0)}
							style={s.input}
						/>
					</View>
				</View>
			</View>
		</View>
	);
}
