import React from "react";
import {
    Pressable,
    StyleProp,
    Text,
    TextInput,
    View,
    ViewStyle,
} from "react-native";
import { moneyStyles as s } from "../money.styles";
import { formatCurrency, formatDate } from "../utils/moneyFormat";

export type ExtraExpenseItem = {
	id: string;
	amount: number;
	description?: string;
	date: string;
};

type Props = {
	money: number | null;
	description: string;
	onMoneyChange: (n: number | null) => void;
	onDescriptionChange: (s: string) => void;
	items: ExtraExpenseItem[];
	onAdd: () => void;
	onDelete: (id: string) => void;
	total: number;
	cardStyle?: StyleProp<ViewStyle>;
};

export function ExtraExpensesCard({
	money,
	description,
	onMoneyChange,
	onDescriptionChange,
	items,
	onAdd,
	onDelete,
	total,
	cardStyle,
}: Props) {
	const isDisabled = !money || money <= 0;

	return (
		<View style={[s.card, cardStyle]}>
			<View style={[s.rowBetween, { marginBottom: 14 }]}>
				<Text style={s.title}>Dodatni troškovi</Text>
				<Text style={{ color: "#FCA5A5", fontWeight: "800" }}>
					-{formatCurrency(total)} RSD
				</Text>
			</View>

			<View style={{ gap: 10, marginBottom: 12 }}>
				<TextInput
					keyboardType="numeric"
					placeholder="Iznos (RSD)"
					placeholderTextColor="#6B7280"
					value={money === null ? "" : String(money)}
					onChangeText={(t) => onMoneyChange(t ? Number(t) : null)}
					style={s.input}
				/>

				<TextInput
					placeholder="Opis (npr. Putovanje, Večera...)"
					placeholderTextColor="#6B7280"
					value={description}
					onChangeText={onDescriptionChange}
					style={s.input}
				/>

				<Pressable
					onPress={onAdd}
					disabled={isDisabled}
					style={[s.btnRed, isDisabled && s.btnDisabled]}
				>
					<Text style={s.btnText}>Dodaj trošak</Text>
				</Pressable>
			</View>

			<View style={{ gap: 10 }}>
				{items.length === 0 && (
					<Text style={{ color: "#9CA3AF" }}>Nema dodatnih troškova.</Text>
				)}

				{items.map((x) => (
					<View key={x.id} style={s.listItem}>
						<View style={{ flex: 1, paddingRight: 12 }}>
							<Text style={{ color: "white", fontWeight: "800" }}>
								-{formatCurrency(Number(x.amount))} RSD
							</Text>
							<Text style={s.listItemSub}>
								{(x.description?.trim() ? x.description : "Trošak") +
									" • " +
									formatDate(x.date)}
							</Text>
						</View>

						<Pressable onPress={() => onDelete(String(x.id))}>
							<Text style={s.linkRed}>Obriši</Text>
						</Pressable>
					</View>
				))}
			</View>
		</View>
	);
}
