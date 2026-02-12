import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { shoppingListService } from "./shoppingList.service";
import type {
	ShoppingList,
	ShoppingListInvite,
	ShoppingListItem,
	ShoppingListMember,
} from "./shoppingList.types";

export function useShoppingList() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);

	const [lists, setLists] = useState<ShoppingList[]>([]);
	const [activeListId, setActiveListId] = useState<string | null>(null);
	const [items, setItems] = useState<ShoppingListItem[]>([]);
	const [members, setMembers] = useState<ShoppingListMember[]>([]);

	const [newItemText, setNewItemText] = useState("");
	const [newListName, setNewListName] = useState("");
	const [joinCode, setJoinCode] = useState("");
	const [addMemberIdentifier, setAddMemberIdentifier] = useState("");

	const [lastInvite, setLastInvite] = useState<ShoppingListInvite | null>(null);
	const [membersLoading, setMembersLoading] = useState(false);

	const activeList = useMemo(
		() => lists.find((list) => list.id === activeListId) ?? null,
		[lists, activeListId],
	);

	const refreshLists = useCallback(async () => {
		const nextLists = await shoppingListService.fetchLists();
		setLists(nextLists);

		if (nextLists.length === 0) {
			setActiveListId(null);
			setItems([]);
			setMembers([]);
			return;
		}

		setActiveListId((prev) => {
			if (prev && nextLists.some((list) => list.id === prev)) return prev;
			return nextLists[0].id;
		});
	}, []);

	const refreshItems = useCallback(async (listId: string) => {
		const nextItems = await shoppingListService.fetchItems(listId);
		setItems(nextItems);
	}, []);

	const refreshMembers = useCallback(async (listId: string) => {
		setMembersLoading(true);
		try {
			const nextMembers = await shoppingListService.fetchMembers(listId);
			setMembers(nextMembers);
		} finally {
			setMembersLoading(false);
		}
	}, []);

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				setLoading(true);
				setError(null);
				const userId = await shoppingListService.fetchCurrentUserId();
				if (!active) return;
				setCurrentUserId(userId);
				await refreshLists();
			} catch (e: any) {
				if (!active) return;
				setError(e?.message ?? "Ne mogu da ucitam spiskove.");
			} finally {
				if (active) setLoading(false);
			}
		})();

		return () => {
			active = false;
		};
	}, [refreshLists]);

	useEffect(() => {
		if (!activeListId) return;
		refreshItems(activeListId).catch((e: any) => setError(e?.message ?? "Ne mogu da ucitam stavke."));
		refreshMembers(activeListId).catch((e: any) => setError(e?.message ?? "Ne mogu da ucitam clanove."));
	}, [activeListId, refreshItems, refreshMembers]);

	useEffect(() => {
		if (!activeListId) return;
		const unsubscribe = shoppingListService.subscribeToListItems(activeListId, () => {
			refreshItems(activeListId).catch(() => undefined);
		});
		return () => unsubscribe();
	}, [activeListId, refreshItems]);

	useEffect(() => {
		if (!activeListId) return;
		const unsubscribe = shoppingListService.subscribeToListMembers(activeListId, () => {
			refreshMembers(activeListId).catch(() => undefined);
			refreshLists().catch(() => undefined);
		});
		return () => unsubscribe();
	}, [activeListId, refreshMembers, refreshLists]);

	useEffect(() => {
		if (!activeListId) return;
		const unsubscribe = shoppingListService.subscribeToListMeta(activeListId, () => {
			refreshLists().catch(() => undefined);
		});
		return () => unsubscribe();
	}, [activeListId, refreshLists]);

	useEffect(() => {
		if (!currentUserId) return;
		const unsubscribe = shoppingListService.subscribeToUserMemberships(currentUserId, () => {
			refreshLists().catch(() => undefined);
		});
		return () => unsubscribe();
	}, [currentUserId, refreshLists]);

	const createList = useCallback(async () => {
		const trimmed = newListName.trim();
		if (!trimmed) return false;

		try {
			setSaving(true);
			setError(null);
			const created = await shoppingListService.createList(trimmed);
			setNewListName("");
			await refreshLists();
			setActiveListId(created.id);
			return true;
		} catch (e: any) {
			setError(e?.message ?? "Ne mogu da napravim listu.");
			return false;
		} finally {
			setSaving(false);
		}
	}, [newListName, refreshLists]);

	const joinByCode = useCallback(async () => {
		const code = joinCode.trim().toUpperCase();
		if (!code) return false;

		try {
			setSaving(true);
			setError(null);
			const listId = await shoppingListService.joinByCode(code);
			setJoinCode("");
			await refreshLists();
			setActiveListId(listId);
			return true;
		} catch (e: any) {
			setError(e?.message ?? "Ne mogu da se pridruzim listi.");
			return false;
		} finally {
			setSaving(false);
		}
	}, [joinCode, refreshLists]);

	const addItem = useCallback(async () => {
		if (!activeListId) return;
		const text = newItemText.trim();
		if (!text) return;

		try {
			setSaving(true);
			setError(null);
			setNewItemText("");
			await shoppingListService.addItem(activeListId, text);
			await refreshItems(activeListId);
		} catch (e: any) {
			setError(e?.message ?? "Ne mogu da dodam stavku.");
		} finally {
			setSaving(false);
		}
	}, [activeListId, newItemText, refreshItems]);

	const toggleDone = useCallback(async (item: ShoppingListItem) => {
		try {
			await shoppingListService.toggleItemDone(item.id, !item.isDone);
			setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, isDone: !x.isDone } : x)));
		} catch (e: any) {
			setError(e?.message ?? "Ne mogu da izmenim stavku.");
		}
	}, []);

	const deleteItem = useCallback((item: ShoppingListItem) => {
		Alert.alert("Obrisi stavku", `Obrisati \"${item.text}\"?`, [
			{ text: "Odustani", style: "cancel" },
			{
				text: "Obrisi",
				style: "destructive",
				onPress: async () => {
					try {
						await shoppingListService.deleteItem(item.id);
						setItems((prev) => prev.filter((x) => x.id !== item.id));
					} catch (e: any) {
						setError(e?.message ?? "Ne mogu da obrisem stavku.");
					}
				},
			},
		]);
	}, []);

	const generateInvite = useCallback(async () => {
		if (!activeListId) return;
		try {
			setSaving(true);
			setError(null);
			const invite = await shoppingListService.createInviteCode(activeListId);
			setLastInvite(invite);
		} catch (e: any) {
			setError(e?.message ?? "Ne mogu da napravim invite kod.");
		} finally {
			setSaving(false);
		}
	}, [activeListId]);

	const addMember = useCallback(async () => {
		if (!activeListId) return false;
		const identifier = addMemberIdentifier.trim();
		if (!identifier) return false;

		try {
			setSaving(true);
			setError(null);
			await shoppingListService.addMemberByIdentifier(activeListId, identifier);
			setAddMemberIdentifier("");
			await refreshMembers(activeListId);
			return true;
		} catch (e: any) {
			setError(e?.message ?? "Ne mogu da dodam clana.");
			return false;
		} finally {
			setSaving(false);
		}
	}, [activeListId, addMemberIdentifier, refreshMembers]);

	const deleteActiveList = useCallback(async () => {
		if (!activeListId) return false;
		try {
			setSaving(true);
			setError(null);
			await shoppingListService.deleteList(activeListId);
			await refreshLists();
			return true;
		} catch (e: any) {
			setError(e?.message ?? "Ne mogu da obrisem listu.");
			return false;
		} finally {
			setSaving(false);
		}
	}, [activeListId, refreshLists]);

	return {
		loading,
		saving,
		error,
		currentUserId,
		lists,
		activeList,
		activeListId,
		items,
		members,
		membersLoading,
		newItemText,
		newListName,
		joinCode,
		addMemberIdentifier,
		lastInvite,
		setActiveListId,
		setNewItemText,
		setNewListName,
		setJoinCode,
		setAddMemberIdentifier,
		setLastInvite,
		createList,
		joinByCode,
		addItem,
		toggleDone,
		deleteItem,
		generateInvite,
		addMember,
		deleteActiveList,
	};
}
