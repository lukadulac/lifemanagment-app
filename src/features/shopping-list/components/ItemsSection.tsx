import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { shoppingListStyles as styles } from "../shoppingList.styles";
import type { ShoppingListItem } from "../shoppingList.types";
import { formatDate } from "../shoppingList.utils";

type Props = {
	items: ShoppingListItem[];
	newItemText: string;
	saving: boolean;
	onChangeText: (value: string) => void;
	onAdd: () => void;
	onToggle: (item: ShoppingListItem) => void;
	onDelete: (item: ShoppingListItem) => void;
};

export function ItemsSection({
	items,
	newItemText,
	saving,
	onChangeText,
	onAdd,
	onToggle,
	onDelete,
}: Props) {
	return (
		<>
			<View style={styles.addRow}>
				<TextInput
					value={newItemText}
					onChangeText={onChangeText}
					placeholder="Dodaj stavku (npr. hleb)"
					placeholderTextColor="#6B7280"
					style={styles.input}
					editable={!saving}
					onSubmitEditing={onAdd}
				/>
				<Pressable style={styles.addBtn} onPress={onAdd} disabled={saving}>
					<Text style={styles.addBtnText}>Dodaj</Text>
				</Pressable>
			</View>

			<ScrollView style={styles.listWrap}>
				{items.length === 0 ? (
					<Text style={styles.emptyText}>Lista je prazna.</Text>
				) : (
					items.map((item) => (
						<View key={item.id} style={[styles.card, item.isDone && styles.cardDone]}>
							<View style={styles.itemRow}>
								<Pressable
									style={[styles.checkbox, item.isDone && styles.checkboxDone]}
									onPress={() => onToggle(item)}
								>
									{item.isDone ? (
										<Ionicons name="checkmark" size={14} color="#34D399" />
									) : null}
								</Pressable>

								<Text style={[styles.itemText, item.isDone && styles.itemTextDone]}>
									{item.text}
								</Text>

								<Pressable style={styles.deleteBtn} onPress={() => onDelete(item)}>
									<Ionicons name="trash-outline" size={14} color="#FCA5A5" />
								</Pressable>
							</View>

							<Text style={styles.meta}>
								{`Dodao: ${item.creatorName ?? "Neko"} • ${formatDate(item.createdAt)}`}
							</Text>
						</View>
					))
				)}
			</ScrollView>
		</>
	);
}
