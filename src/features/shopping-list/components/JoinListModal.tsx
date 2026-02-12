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

export function JoinListModal({ visible, value, onChange, onClose, onSubmit }: Props) {
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View style={styles.modalBackdrop}>
				<View style={styles.modalCard}>
					<Text style={styles.modalTitle}>Pridruzi se listi</Text>
					<TextInput
						value={value}
						onChangeText={(v) => onChange(v.toUpperCase())}
						placeholder="Invite kod"
						placeholderTextColor="#6B7280"
						style={styles.modalInput}
						autoCapitalize="characters"
					/>
					<View style={styles.modalActions}>
						<Pressable style={styles.ghostBtn} onPress={onClose}>
							<Text style={styles.ghostBtnText}>Odustani</Text>
						</Pressable>
						<Pressable style={styles.primaryBtn} onPress={onSubmit}>
							<Text style={styles.primaryBtnText}>Pridruzi se</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}
