import { supabase } from "../../lib/supabaseClient";
import type {
	ShoppingList,
	ShoppingListInvite,
	ShoppingListItem,
	ShoppingListMember,
} from "./shoppingList.types";

type ProfileRow = {
	id: string;
	username: string | null;
	email: string | null;
};

function randomInviteCode(length = 6): string {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += alphabet[Math.floor(Math.random() * alphabet.length)];
	}
	return result;
}

async function getUserOrThrow() {
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();
	if (error) throw error;
	if (!user) throw new Error("Nisi ulogovan.");
	return user;
}

async function getProfilesMap(userIds: string[]) {
	if (userIds.length === 0) return new Map<string, ProfileRow>();

	const { data, error } = await supabase
		.from("profiles")
		.select("id, username, email")
		.in("id", userIds);

	if (error) throw error;
	return new Map((data ?? []).map((row) => [row.id, row as ProfileRow]));
}

async function resolveUserIdByIdentifier(identifier: string): Promise<string> {
	const value = identifier.trim().toLowerCase();
	if (!value) throw new Error("Unesi username ili email.");

	let query = supabase.from("profiles").select("id, username, email");
	if (value.includes("@")) {
		query = query.eq("email", value);
	} else {
		query = query.eq("username", value);
	}

	const { data, error } = await query.maybeSingle();
	if (error) throw error;
	if (!data?.id) throw new Error("Korisnik nije pronadjen.");

	return data.id;
}

export const shoppingListService = {
	async fetchCurrentUserId(): Promise<string> {
		const user = await getUserOrThrow();
		return user.id;
	},

	async fetchLists(): Promise<ShoppingList[]> {
		const user = await getUserOrThrow();

		const { data, error } = await supabase
			.from("shopping_list_members")
			.select("shopping_lists(id, name, owner_id, created_at)")
			.eq("user_id", user.id);

		if (error) throw error;

		const lists: ShoppingList[] = [];
		for (const row of data ?? []) {
			const list = Array.isArray(row.shopping_lists)
				? row.shopping_lists[0]
				: row.shopping_lists;
			if (!list) continue;
			lists.push({
				id: list.id,
				name: list.name,
				ownerId: list.owner_id,
				createdAt: list.created_at,
			});
		}

		return lists.sort((a, b) => a.name.localeCompare(b.name));
	},

	async createList(name: string): Promise<ShoppingList> {
		const { data: listId, error: rpcError } = await supabase.rpc(
			"create_shopping_list",
			{
				p_name: name.trim(),
			},
		);
		if (rpcError) throw rpcError;
		if (!listId) throw new Error("Ne mogu da kreiram listu.");

		const { data: listRow, error: fetchErr } = await supabase
			.from("shopping_lists")
			.select("id, name, owner_id, created_at")
			.eq("id", listId)
			.single();

		if (fetchErr) throw fetchErr;

		return {
			id: listRow.id,
			name: listRow.name,
			ownerId: listRow.owner_id,
			createdAt: listRow.created_at,
		};
	},

	async addMemberByIdentifier(listId: string, identifier: string): Promise<void> {
		const userId = await resolveUserIdByIdentifier(identifier);
		const { error } = await supabase
			.from("shopping_list_members")
			.insert({ list_id: listId, user_id: userId, role: "member" });
		if (error) throw error;
	},

	async deleteList(listId: string): Promise<void> {
		const { error } = await supabase
			.from("shopping_lists")
			.delete()
			.eq("id", listId);
		if (error) throw error;
	},

	async fetchMembers(listId: string): Promise<ShoppingListMember[]> {
		const { data, error } = await supabase
			.from("shopping_list_members")
			.select("list_id, user_id, role, joined_at")
			.eq("list_id", listId)
			.order("joined_at", { ascending: true });

		if (error) throw error;

		const userIds = (data ?? []).map((m) => m.user_id);
		const profilesMap = await getProfilesMap(userIds);

		return (data ?? []).map((row) => {
			const profile = profilesMap.get(row.user_id);
			return {
				listId: row.list_id,
				userId: row.user_id,
				role: row.role,
				joinedAt: row.joined_at,
				username: profile?.username ?? null,
				email: profile?.email ?? null,
			};
		});
	},

	async fetchItems(listId: string): Promise<ShoppingListItem[]> {
		const { data, error } = await supabase
			.from("shopping_list_items")
			.select("id, list_id, text, is_done, created_by, created_at, updated_at")
			.eq("list_id", listId)
			.order("created_at", { ascending: false });

		if (error) throw error;

		const creatorIds = Array.from(new Set((data ?? []).map((x) => x.created_by)));
		const profilesMap = await getProfilesMap(creatorIds);

		return (data ?? []).map((row) => ({
			id: row.id,
			listId: row.list_id,
			text: row.text,
			isDone: row.is_done,
			createdBy: row.created_by,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			creatorName:
				profilesMap.get(row.created_by)?.username ??
				profilesMap.get(row.created_by)?.email ??
				null,
		}));
	},

	async addItem(listId: string, text: string): Promise<ShoppingListItem> {
		const user = await getUserOrThrow();

		const { data, error } = await supabase
			.from("shopping_list_items")
			.insert({ list_id: listId, text: text.trim(), created_by: user.id })
			.select("id, list_id, text, is_done, created_by, created_at, updated_at")
			.single();

		if (error) throw error;

		const profilesMap = await getProfilesMap([user.id]);
		const profile = profilesMap.get(user.id);

		return {
			id: data.id,
			listId: data.list_id,
			text: data.text,
			isDone: data.is_done,
			createdBy: data.created_by,
			createdAt: data.created_at,
			updatedAt: data.updated_at,
			creatorName: profile?.username ?? profile?.email ?? null,
		};
	},

	async toggleItemDone(itemId: string, isDone: boolean): Promise<void> {
		const { error } = await supabase
			.from("shopping_list_items")
			.update({ is_done: isDone })
			.eq("id", itemId);
		if (error) throw error;
	},

	async deleteItem(itemId: string): Promise<void> {
		const { error } = await supabase
			.from("shopping_list_items")
			.delete()
			.eq("id", itemId);
		if (error) throw error;
	},

	async createInviteCode(listId: string): Promise<ShoppingListInvite> {
		const user = await getUserOrThrow();
		let tries = 0;
		while (tries < 5) {
			const code = randomInviteCode(6);

			const { data, error } = await supabase
				.from("shopping_list_invites")
				.insert({ list_id: listId, code, created_by: user.id })
				.select("id, list_id, code, created_at, expires_at, revoked_at, use_count, max_uses")
				.single();

			if (!error) {
				return {
					id: data.id,
					listId: data.list_id,
					code: data.code,
					createdAt: data.created_at,
					expiresAt: data.expires_at,
					revokedAt: data.revoked_at,
					useCount: data.use_count,
					maxUses: data.max_uses,
				};
			}

			if (String(error.code) !== "23505") {
				throw error;
			}

			tries += 1;
		}

		throw new Error("Ne mogu da generisem invite kod. Pokusaj ponovo.");
	},

	async joinByCode(code: string): Promise<string> {
		const { data, error } = await supabase.rpc("join_list_by_code", {
			p_code: code.trim().toUpperCase(),
		});

		if (error) throw error;
		if (!data) throw new Error("Neispravan invite kod.");

		return data as string;
	},

	subscribeToListItems(listId: string, onChange: () => void) {
		const channel = supabase
			.channel(`shopping-list-items-${listId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "shopping_list_items",
					filter: `list_id=eq.${listId}`,
				},
				onChange,
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	},
};
