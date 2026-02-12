import {
	MONTH_NAMES,
	MONTH_SHORT,
	WEEKDAY_LONG,
} from "./timetable.constants";
import type { CalendarItem, DraftItem } from "./timetable.types";

export function pad2(value: number): string {
	return value.toString().padStart(2, "0");
}

export function startOfDay(date: Date): Date {
	const next = new Date(date);
	next.setHours(0, 0, 0, 0);
	return next;
}

export function addDays(date: Date, days: number): Date {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}

function daysInMonth(year: number, monthIndex: number): number {
	return new Date(year, monthIndex + 1, 0).getDate();
}

export function addMonthsClamped(date: Date, amount: number): Date {
	const next = new Date(date);
	const day = next.getDate();
	next.setDate(1);
	next.setMonth(next.getMonth() + amount);
	const maxDay = daysInMonth(next.getFullYear(), next.getMonth());
	next.setDate(Math.min(day, maxDay));
	return startOfDay(next);
}

export function getWeekdayIndexMondayFirst(date: Date): number {
	const day = date.getDay();
	return day === 0 ? 6 : day - 1;
}

export function startOfWeek(date: Date): Date {
	const mondayIndex = getWeekdayIndexMondayFirst(date);
	return startOfDay(addDays(date, -mondayIndex));
}

export function toDayKey(date: Date): string {
	return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function fromDayKey(dayKey: string): Date {
	const [yearRaw, monthRaw, dayRaw] = dayKey.split("-");
	const year = Number(yearRaw);
	const month = Number(monthRaw);
	const day = Number(dayRaw);

	if (
		!Number.isFinite(year) ||
		!Number.isFinite(month) ||
		!Number.isFinite(day) ||
		month < 1 ||
		month > 12 ||
		day < 1 ||
		day > 31
	) {
		return startOfDay(new Date());
	}

	return new Date(year, month - 1, day);
}

export function getMonthMatrix(cursor: Date): Date[] {
	const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
	const firstCell = startOfWeek(firstOfMonth);
	return Array.from({ length: 42 }, (_, i) => addDays(firstCell, i));
}

export function formatMonthLabel(date: Date): string {
	return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDayHeadline(date: Date): string {
	const weekday = WEEKDAY_LONG[getWeekdayIndexMondayFirst(date)];
	return `${weekday}, ${date.getDate()}. ${MONTH_SHORT[date.getMonth()]}`;
}

export function formatWeekLabel(date: Date): string {
	const start = startOfWeek(date);
	const end = addDays(start, 6);
	return `${start.getDate()}. ${MONTH_SHORT[start.getMonth()]} - ${end.getDate()}. ${MONTH_SHORT[end.getMonth()]} ${end.getFullYear()}`;
}

export function formatHour(hour: number): string {
	return `${pad2(hour)}:00`;
}

export function formatEventRange(item: CalendarItem): string {
	const start = new Date(item.start);
	const end = new Date(item.end);

	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
		return "";
	}

	let endHour = end.getHours();
	if (toDayKey(end) !== toDayKey(start) && endHour === 0) {
		endHour = 24;
	}

	return `${pad2(start.getHours())}:00 - ${pad2(endHour)}:00`;
}

export function sortByStart(a: CalendarItem, b: CalendarItem): number {
	const first = new Date(a.start).getTime();
	const second = new Date(b.start).getTime();
	return first - second;
}

export function clampHour(hour: number): number {
	if (hour < 0) return 0;
	if (hour > 23) return 23;
	return hour;
}

export function createDraft(dayKey: string, initialHour: number): DraftItem {
	const safeStart = clampHour(initialHour);
	return {
		title: "",
		notes: "",
		type: "obligation",
		dayKey,
		startHour: safeStart,
		endHour: Math.min(safeStart + 1, 24),
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function isCalendarItem(value: unknown): value is CalendarItem {
	if (!isRecord(value)) return false;

	return (
		typeof value.id === "string" &&
		typeof value.title === "string" &&
		typeof value.start === "string" &&
		typeof value.end === "string" &&
		(value.type === "obligation" || value.type === "task") &&
		(value.notes === undefined || typeof value.notes === "string")
	);
}

export function normalizeItems(items: CalendarItem[]): CalendarItem[] {
	return [...items].sort(sortByStart);
}
