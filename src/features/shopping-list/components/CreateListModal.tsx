import React from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { shoppingListStyles as styles } from "../shoppingList.styles";

type Props = {
	visible: boolean;
	value: string;
	onChange: (value: string) => void;
	onClose: () => void;
	onSubmit: () => void;
};

export function CreateListModal({ visible, value, onChange, onClose, onSubmit }: Props) {
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View style={styles.modalBackdrop}>
				<View style={styles.modalCard}>
					<Text style={styles.modalTitle}>Nova lista</Text>
					<TextInput
						value={value}
						onChangeText={onChange}
						placeholder="Npr. Kuca"
						placeholderTextColor="#6B7280"
						style={styles.modalInput}
					/>
					<View style={styles.modalActions}>
						<Pressable style={styles.ghostBtn} onPress={onClose}>
							<Text style={styles.ghostBtnText}>Odustani</Text>
						</Pressable>
						<Pressable style={styles.primaryBtn} onPress={onSubmit}>
							<Text style={styles.primaryBtnText}>Kreiraj</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}
