export type ShoppingListRole = "owner" | "member";

export type ShoppingList = {
	id: string;
	name: string;
	ownerId: string;
	createdAt: string;
};

export type ShoppingListMember = {
	listId: string;
	userId: string;
	role: ShoppingListRole;
	joinedAt: string;
	username: string | null;
	email: string | null;
};

export type ShoppingListItem = {
	id: string;
	listId: string;
	text: string;
	isDone: boolean;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	creatorName: string | null;
};

export type ShoppingListInvite = {
	id: string;
	listId: string;
	code: string;
	createdAt: string;
	expiresAt: string | null;
	revokedAt: string | null;
	useCount: number;
	maxUses: number | null;
};
