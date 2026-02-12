import React from "react";
import {
	ActivityIndicator,
	Alert,
	Clipboard,
	Modal,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";
import { shoppingListStyles as styles } from "../shoppingList.styles";
import type { ShoppingListInvite, ShoppingListMember } from "../shoppingList.types";
import { formatDate, getMemberLabel } from "../shoppingList.utils";

type Props = {
	visible: boolean;
	membersLoading: boolean;
	members: ShoppingListMember[];
	invite: ShoppingListInvite | null;
	addMemberValue: string;
	saving: boolean;
	onChangeAddMemberValue: (value: string) => void;
	onAddMember: () => void;
	onGenerateInvite: () => void;
	onClose: () => void;
};

export function MembersModal({
	visible,
	membersLoading,
	members,
	invite,
	addMemberValue,
	saving,
	onChangeAddMemberValue,
	onAddMember,
	onGenerateInvite,
	onClose,
}: Props) {
	const handleCopyInvite = () => {
		if (!invite?.code) return;
		Clipboard.setString(invite.code);
		Alert.alert("Kopirano", "Invite kod je kopiran.");
	};

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View style={styles.modalBackdrop}>
				<View style={styles.modalCard}>
					<Text style={styles.modalTitle}>Clanovi liste</Text>

					{membersLoading ? (
						<ActivityIndicator color="#34D399" />
					) : members.length === 0 ? (
						<Text style={styles.emptyText}>Nema clanova.</Text>
					) : (
						members.map((member) => (
							<View key={member.userId} style={styles.membersRow}>
								<View>
									<Text style={styles.membersName}>{getMemberLabel(member)}</Text>
									<Text style={styles.membersRole}>{member.role}</Text>
								</View>
								<Text style={styles.meta}>{formatDate(member.joinedAt)}</Text>
							</View>
						))
					)}

					<TextInput
						value={addMemberValue}
						onChangeText={onChangeAddMemberValue}
						placeholder="Username ili email"
						placeholderTextColor="#6B7280"
						style={styles.modalInput}
						autoCapitalize="none"
					/>
					<View style={styles.modalActions}>
						<Pressable style={styles.ghostBtn} onPress={onAddMember} disabled={saving}>
							<Text style={styles.ghostBtnText}>Dodaj clana</Text>
						</Pressable>
						<Pressable style={styles.primaryBtn} onPress={onGenerateInvite} disabled={saving}>
							<Text style={styles.primaryBtnText}>Pozovi kodom</Text>
						</Pressable>
					</View>

					{invite ? (
						<View style={styles.inviteBox}>
							<Text style={styles.inviteLabel}>Invite kod</Text>
							<Text style={styles.inviteCode}>{invite.code}</Text>
							<View style={styles.inviteActions}>
								<Pressable style={styles.inviteCopyBtn} onPress={handleCopyInvite}>
									<Text style={styles.inviteCopyBtnText}>Copy</Text>
								</Pressable>
							</View>
						</View>
					) : null}

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
