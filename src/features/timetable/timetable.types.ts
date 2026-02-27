export type CalendarView = "month" | "week" | "day";

export type CalendarItem = {
	id: string;
	title: string;
	notes?: string;
	start: string;
	end: string;
};

export type DraftItem = {
	id?: string;
	title: string;
	notes: string;
	dayKey: string;
	startMinute: number;
	endMinute: number;
};
