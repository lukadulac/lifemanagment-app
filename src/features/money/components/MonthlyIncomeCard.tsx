import React, { useEffect, useMemo, useState } from "react";
import {
	Pressable,
	StyleProp,
	Text,
	TextInput,
	View,
	ViewStyle,
} from "react-native";
import { moneyStyles as s } from "../money.styles";
import { MonthKey } from "../utils/moneyFormat";
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
	const [incomeInput, setIncomeInput] = useState(
		String(Number.isFinite(monthlyIncome) ? Math.trunc(monthlyIncome) : 0),
	);

	useEffect(() => {
		setIncomeInput(
			String(Number.isFinite(monthlyIncome) ? Math.trunc(monthlyIncome) : 0),
		);
	}, [monthlyIncome, month]);

	const parsedIncome = useMemo(() => {
		if (!incomeInput.trim()) return 0;
		return Number(incomeInput);
	}, [incomeInput]);

	const isDirty = Number.isFinite(parsedIncome) && parsedIncome !== monthlyIncome;

	const handleIncomeChange = (text: string) => {
		const sanitized = text.replace(/[^\d]/g, "");
		setIncomeInput(sanitized);
	};

	const handleSave = () => {
		if (!isDirty) return;
		onSave(parsedIncome);
	};

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
							keyboardType="number-pad"
							value={incomeInput}
							onChangeText={handleIncomeChange}
							onBlur={handleSave}
							onSubmitEditing={handleSave}
							placeholder="0"
							placeholderTextColor="#6B7280"
							style={s.input}
						/>

						<Pressable
							onPress={handleSave}
							disabled={!isDirty}
							style={[s.btnBlue, !isDirty && s.btnDisabled]}
						>
							<Text style={s.btnText}>Sačuvaj prihod</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</View>
	);
}
