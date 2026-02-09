import { Picker } from "@react-native-picker/picker";
import React from "react";
import { StyleProp, Text, TextInput, View, ViewStyle } from "react-native";
import { moneyStyles as s } from "../money.styles";
import {
	MonthKey,
	formatCurrency,
	lastMonths,
	monthLabel,
} from "../utils/moneyFormat";

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
					<Text style={s.title}>Mesečni Budget</Text>

					{/* Picker wrapper */}
					<View
						style={{
							borderWidth: 1,
							borderColor: "#4B5563",
							backgroundColor: "#111827",
							borderRadius: 10,
							height: 42, // ⬅️ smanjena visina
							justifyContent: "center",
							overflow: "hidden",
							minWidth: "100%",
						}}
					>
						<Picker
							selectedValue={month}
							onValueChange={(v) => onMonthChange(v as MonthKey)}
							dropdownIconColor="white"
							mode="dropdown" // ⬅️ Android: pravi dropdown
							style={{
								color: "white",
								height: 42, // ⬅️ mora isto kao wrapper
							}}
							itemStyle={{
								height: 42, // ⬅️ iOS: visina stavke
								color: "white",
								fontSize: 14,
							}}
						>
							{months.map((k) => (
								<Picker.Item key={k} value={k} label={monthLabel(k)} />
							))}
						</Picker>
					</View>
				</View>

				<View style={[s.pill, { borderColor: "#14532D" /* green-900 */ }]}>
					<Text style={{ color: "#34D399", fontSize: 12, marginBottom: 6 }}>
						Ukupni prihod (za mesec)
					</Text>

					<View style={{ gap: 10 }}>
						<TextInput
							keyboardType="numeric"
							placeholder="npr. 120000"
							placeholderTextColor="#6B7280"
							value={String(Number.isFinite(monthlyIncome) ? monthlyIncome : 0)}
							onChangeText={(t) => onSave(t ? Number(t) : 0)}
							style={s.input}
						/>

						<Text style={{ color: "#86EFAC", fontWeight: "700" }}>
							{formatCurrency(monthlyIncome)} RSD
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}
