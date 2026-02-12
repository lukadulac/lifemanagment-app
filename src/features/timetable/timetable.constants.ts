import type { CalendarItemType } from "./timetable.types";

export const LEGACY_STORAGE_KEY = "timetable-events-v1";

export const WEEKDAY_SHORT = ["Pon", "Uto", "Sre", "Cet", "Pet", "Sub", "Ned"];
export const WEEKDAY_LONG = [
	"Ponedeljak",
	"Utorak",
	"Sreda",
	"Cetvrtak",
	"Petak",
	"Subota",
	"Nedelja",
];

export const MONTH_NAMES = [
	"Januar",
	"Februar",
	"Mart",
	"April",
	"Maj",
	"Jun",
	"Jul",
	"Avgust",
	"Septembar",
	"Oktobar",
	"Novembar",
	"Decembar",
];

export const MONTH_SHORT = [
	"jan",
	"feb",
	"mar",
	"apr",
	"maj",
	"jun",
	"jul",
	"avg",
	"sep",
	"okt",
	"nov",
	"dec",
];

export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const END_HOURS = Array.from({ length: 24 }, (_, i) => i + 1);

export const TYPE_META: Record<
	CalendarItemType,
	{ label: string; color: string; bg: string }
> = {
	obligation: {
		label: "Obaveza",
		color: "#34D399",
		bg: "rgba(52,211,153,0.14)",
	},
	task: {
		label: "Zadatak",
		color: "#60A5FA",
		bg: "rgba(96,165,250,0.14)",
	},
};
