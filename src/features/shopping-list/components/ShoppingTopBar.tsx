import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { shoppingListStyles as styles } from "../shoppingList.styles";
import type { ShoppingList } from "../shoppingList.types";

type Props = {
	activeList: ShoppingList | null;
	onOpenLists: () => void;
	onOpenCreate: () => void;
	onOpenJoin: () => void;
	onOpenMembers: () => void;
	onDeleteList: () => void;
	membersDisabled?: boolean;
	deleteDisabled?: boolean;
	showDelete?: boolean;
};

export function ShoppingTopBar({
	activeList,
	onOpenLists,
	onOpenCreate,
	onOpenJoin,
	onOpenMembers,
	onDeleteList,
	membersDisabled,
	deleteDisabled,
	showDelete,
}: Props) {
	return (
		<View style={styles.topRow}>
			<Pressable style={styles.listPickerBtn} onPress={onOpenLists}>
				<Text style={styles.listPickerText} numberOfLines={1}>
					{activeList?.name ?? "Izaberi listu"}
				</Text>
				<Ionicons name="chevron-down" size={16} color="#E5E7EB" />
			</Pressable>

			<Pressable style={styles.actionBtn} onPress={onOpenCreate}>
				<Text style={styles.actionBtnText}>Nova lista</Text>
			</Pressable>

			<Pressable style={styles.actionBtn} onPress={onOpenJoin}>
				<Text style={styles.actionBtnText}>Unesi kod</Text>
			</Pressable>

			<Pressable style={styles.actionBtn} onPress={onOpenMembers} disabled={membersDisabled}>
				<Text style={styles.actionBtnText}>Clanovi</Text>
			</Pressable>

			{showDelete ? (
				<Pressable
					style={[styles.actionBtn, styles.actionBtnDanger]}
					onPress={onDeleteList}
					disabled={deleteDisabled}
				>
					<Text style={[styles.actionBtnText, styles.actionBtnDangerText]}>Obrisi</Text>
				</Pressable>
			) : null}
		</View>
	);
}
