import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CreateListModal } from "../features/shopping-list/components/CreateListModal";
import { ItemsSection } from "../features/shopping-list/components/ItemsSection";
import { JoinListModal } from "../features/shopping-list/components/JoinListModal";
import { MembersModal } from "../features/shopping-list/components/MembersModal";
import { SelectListModal } from "../features/shopping-list/components/SelectListModal";
import { ShoppingTopBar } from "../features/shopping-list/components/ShoppingTopBar";
import { shoppingListStyles as styles } from "../features/shopping-list/shoppingList.styles";
import { useShoppingList } from "../features/shopping-list/useShoppingList";

export const List = () => {
	const state = useShoppingList();
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [joinModalOpen, setJoinModalOpen] = useState(false);
	const [listsModalOpen, setListsModalOpen] = useState(false);
	const [membersModalOpen, setMembersModalOpen] = useState(false);

	if (state.loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator color="#34D399" />
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.page} edges={["top"]}>
			<View style={styles.container}>
				<Text style={styles.h1}>Spisak</Text>

				<ShoppingTopBar
					activeList={state.activeList}
					onOpenLists={() => setListsModalOpen(true)}
					onOpenCreate={() => setCreateModalOpen(true)}
					onOpenJoin={() => setJoinModalOpen(true)}
					onOpenMembers={() => {
						state.setLastInvite(null);
						setMembersModalOpen(true);
					}}
					membersDisabled={!state.activeListId}
					showDelete={
						!!state.activeList &&
						!!state.currentUserId &&
						state.activeList.ownerId === state.currentUserId
					}
					deleteDisabled={state.saving || !state.activeListId}
					onDeleteList={() => {
						if (!state.activeList) return;
						Alert.alert(
							"Obrisi listu",
							`Da li sigurno zelis da obrises listu \"${state.activeList.name}\"?`,
							[
								{ text: "Odustani", style: "cancel" },
								{
									text: "Obrisi",
									style: "destructive",
									onPress: () => {
										state.deleteActiveList().catch(() => undefined);
									},
								},
							],
						);
					}}
				/>

				{state.error ? (
					<Text style={styles.errorText}>{state.error}</Text>
				) : null}

				{state.activeListId ? (
					<ItemsSection
						items={state.items}
						newItemText={state.newItemText}
						saving={state.saving}
						onChangeText={state.setNewItemText}
						onAdd={state.addItem}
						onToggle={state.toggleDone}
						onDelete={state.deleteItem}
					/>
				) : (
					<Text style={styles.emptyText}>
						Nemas nijednu listu. Napravi novu ili unesi invite kod.
					</Text>
				)}
			</View>

			<CreateListModal
				visible={createModalOpen}
				value={state.newListName}
				onChange={state.setNewListName}
				onClose={() => setCreateModalOpen(false)}
				onSubmit={async () => {
					const ok = await state.createList();
					if (ok) setCreateModalOpen(false);
				}}
			/>

			<JoinListModal
				visible={joinModalOpen}
				value={state.joinCode}
				onChange={state.setJoinCode}
				onClose={() => setJoinModalOpen(false)}
				onSubmit={async () => {
					const ok = await state.joinByCode();
					if (ok) setJoinModalOpen(false);
				}}
			/>

			<SelectListModal
				visible={listsModalOpen}
				lists={state.lists}
				activeListId={state.activeListId}
				onClose={() => setListsModalOpen(false)}
				onSelect={(listId) => {
					state.setActiveListId(listId);
					setListsModalOpen(false);
				}}
			/>

			<MembersModal
				visible={membersModalOpen}
				membersLoading={state.membersLoading}
				members={state.members}
				invite={state.lastInvite}
				addMemberValue={state.addMemberIdentifier}
				saving={state.saving}
				onChangeAddMemberValue={state.setAddMemberIdentifier}
				onAddMember={state.addMember}
				onGenerateInvite={state.generateInvite}
				onClose={() => setMembersModalOpen(false)}
			/>
		</SafeAreaView>
	);
};
