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

export type SavingItem = { id: string; amount: number; note?: string };

type Props = {
	items: SavingItem[];
	amount: number | null;
	setAmount: (n: number | null) => void;
	note: string;
	setNote: (s: string) => void;
	onAdd: () => void;
	onDelete: (id: string) => void;
	total: number;
	cardStyle?: StyleProp<ViewStyle>;
};

export function SavingsCard({
	items,
	amount,
	setAmount,
	note,
	setNote,
	onAdd,
	onDelete,
	total,
	cardStyle,
}: Props) {
	const disabled = !amount || amount <= 0;

	return (
		<View style={[s.card, cardStyle]}>
			<View style={[s.rowBetween, { marginBottom: 14 }]}>
				<Text style={s.title}>Štednja</Text>
				<Text style={{ color: "#93C5FD", fontWeight: "800" }}>
					U Šteku: {formatCurrency(total)} RSD
				</Text>
			</View>

			<View style={{ gap: 10, marginBottom: 12 }}>
				<TextInput
					keyboardType="numeric"
					placeholder="npr. 5000"
					placeholderTextColor="#6B7280"
					value={amount === null ? "" : String(amount)}
					onChangeText={(t) => setAmount(t ? Number(t) : null)}
					style={s.input}
				/>

				<TextInput
					placeholder="Napomena (opciono) npr. 'Januar'"
					placeholderTextColor="#6B7280"
					value={note}
					onChangeText={setNote}
					style={s.input}
				/>

				<Pressable
					onPress={onAdd}
					disabled={disabled}
					style={[s.btnBlue, disabled && s.btnDisabled]}
				>
					<Text style={s.btnText}>Dodaj štednju</Text>
				</Pressable>
			</View>

			<View style={{ gap: 10 }}>
				{items.length === 0 && (
					<Text style={{ color: "#9CA3AF" }}>
						Nema unosa štednje za ovaj mesec.
					</Text>
				)}

				{items.map((x) => (
					<View key={x.id} style={s.listItem}>
						<View style={{ flex: 1, paddingRight: 12 }}>
							<Text style={{ color: "white", fontWeight: "800" }}>
								{formatCurrency(Number(x.amount))} RSD
							</Text>
							{!!x.note && <Text style={s.listItemSub}>{x.note}</Text>}
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
