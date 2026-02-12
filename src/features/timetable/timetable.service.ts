import { supabase } from "../../lib/supabaseClient";
import type { CalendarItem } from "./timetable.types";
import { normalizeItems } from "./timetable.utils";

type CalendarEventRow = {
	id: string;
	user_id: string;
	title: string;
	notes: string | null;
	type: "obligation" | "task";
	start_at: string;
	end_at: string;
};

const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getUserOrThrow() {
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error) throw error;
	if (!user) throw new Error("User not authenticated");
	return user;
}

function rowToCalendarItem(row: CalendarEventRow): CalendarItem {
	return {
		id: row.id,
		title: row.title,
		notes: row.notes ?? undefined,
		type: row.type,
		start: row.start_at,
		end: row.end_at,
	};
}

function toDbPayload(item: CalendarItem, userId: string) {
	const base = {
		user_id: userId,
		title: item.title,
		notes: item.notes ?? null,
		type: item.type,
		start_at: item.start,
		end_at: item.end,
	};

	if (UUID_REGEX.test(item.id)) {
		return { id: item.id, ...base };
	}

	return base;
}

export const timetableService = {
	async fetchEvents(): Promise<CalendarItem[]> {
		const user = await getUserOrThrow();

		const { data, error } = await supabase
			.from("calendar_events")
			.select("id, user_id, title, notes, type, start_at, end_at")
			.eq("user_id", user.id)
			.order("start_at", { ascending: true });

		if (error) throw error;

		return normalizeItems((data ?? []).map((row) => rowToCalendarItem(row as CalendarEventRow)));
	},

	async upsertEvent(item: CalendarItem): Promise<CalendarItem> {
		const user = await getUserOrThrow();

		const payload = toDbPayload(item, user.id);

		const { data, error } = await supabase
			.from("calendar_events")
			.upsert(payload, { onConflict: "id" })
			.select("id, user_id, title, notes, type, start_at, end_at")
			.single();

		if (error) throw error;
		return rowToCalendarItem(data as CalendarEventRow);
	},

	async bulkUpsertEvents(items: CalendarItem[]): Promise<CalendarItem[]> {
		if (items.length === 0) return [];

		const user = await getUserOrThrow();
		const payload = items.map((item) => toDbPayload(item, user.id));

		const { data, error } = await supabase
			.from("calendar_events")
			.upsert(payload, { onConflict: "id" })
			.select("id, user_id, title, notes, type, start_at, end_at");

		if (error) throw error;

		return normalizeItems((data ?? []).map((row) => rowToCalendarItem(row as CalendarEventRow)));
	},

	async deleteEvent(id: string): Promise<void> {
		const { error } = await supabase.from("calendar_events").delete().eq("id", id);
		if (error) throw error;
	},
};
