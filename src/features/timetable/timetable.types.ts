export type CalendarView = "month" | "week" | "day";

export type CalendarItemType = "obligation" | "task";

export type CalendarItem = {
	id: string;
	title: string;
	notes?: string;
	type: CalendarItemType;
	start: string;
	end: string;
};

export type DraftItem = {
	id?: string;
	title: string;
	notes: string;
	type: CalendarItemType;
	dayKey: string;
	startHour: number;
	endHour: number;
};
