export function formatDate(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";

	return date.toLocaleString("sr-RS", {
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function getMemberLabel(member: {
	username: string | null;
	email: string | null;
	userId: string;
}): string {
	return member.username ?? member.email ?? member.userId.slice(0, 8);
}
