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
import { formatCurrency } from "../utils/moneyFormat";

export type FixedExpenseItem = { id: string; title: string; amount: number };

type Props = {
	items: FixedExpenseItem[];
	title: string;
	setTitle: (s: string) => void;
	amount: number | null;
	setAmount: (n: number | null) => void;
	onAdd: () => void;
	onDelete: (id: string) => void;
	total: number;
	cardStyle?: StyleProp<ViewStyle>;
};

export function FixedExpensesCard({
	items,
	title,
	setTitle,
	amount,
	setAmount,
	onAdd,
	onDelete,
	total,
	cardStyle,
}: Props) {
	const disabled = !title.trim() || !amount || amount <= 0;

	return (
		<View style={[s.card, cardStyle]}>
			<View style={[s.rowBetween, { marginBottom: 14 }]}>
				<Text style={s.title}>Fiksni troškovi</Text>
				<Text style={{ color: "#FCA5A5", fontWeight: "800" }}>
					-{formatCurrency(total)} RSD
				</Text>
			</View>

			<View style={{ gap: 10, marginBottom: 12 }}>
				<TextInput
					placeholder="npr. Voda"
					placeholderTextColor="#6B7280"
					value={title}
					onChangeText={setTitle}
					style={s.input}
				/>

				<TextInput
					keyboardType="numeric"
					placeholder="Iznos"
					placeholderTextColor="#6B7280"
					value={amount === null ? "" : String(amount)}
					onChangeText={(t) => setAmount(t ? Number(t) : null)}
					style={s.input}
				/>

				<Pressable
					onPress={onAdd}
					disabled={disabled}
					style={[s.btnRed, disabled && s.btnDisabled]}
				>
					<Text style={s.btnText}>Dodaj trošak</Text>
				</Pressable>
			</View>

			<View style={{ gap: 10 }}>
				{items.length === 0 && (
					<Text style={{ color: "#9CA3AF" }}>
						Nema unetih fiksnih troškova.
					</Text>
				)}

				{items.map((x) => (
					<View key={x.id} style={s.listItem}>
						<View style={{ flex: 1, paddingRight: 12 }}>
							<Text style={s.listItemTitle}>{x.title}</Text>
							<Text style={s.listItemSub}>
								{formatCurrency(Number(x.amount))} RSD
							</Text>
						</View>

						<Pressable onPress={() => onDelete(x.id)}>
							<Text style={s.linkRed}>Obriši</Text>
						</Pressable>
					</View>
				))}
			</View>
		</View>
	);
}
