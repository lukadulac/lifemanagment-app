import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { shoppingListStyles as styles } from "../shoppingList.styles";
import type { ShoppingList } from "../shoppingList.types";

type Props = {
	visible: boolean;
	lists: ShoppingList[];
	activeListId: string | null;
	onClose: () => void;
	onSelect: (listId: string) => void;
};

export function SelectListModal({ visible, lists, activeListId, onClose, onSelect }: Props) {
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View style={styles.modalBackdrop}>
				<View style={styles.modalCard}>
					<Text style={styles.modalTitle}>Izaberi listu</Text>
					<ScrollView>
						{lists.map((list) => (
							<Pressable
								key={list.id}
								style={[
									styles.listOption,
									activeListId === list.id && styles.listOptionActive,
								]}
								onPress={() => onSelect(list.id)}
							>
								<Text style={styles.listOptionText}>{list.name}</Text>
								{activeListId === list.id ? (
									<Ionicons name="checkmark" size={16} color="#34D399" />
								) : null}
							</Pressable>
						))}
					</ScrollView>
					<View style={styles.modalActions}>
						<Pressable style={styles.ghostBtn} onPress={onClose}>
							<Text style={styles.ghostBtnText}>Zatvori</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}
