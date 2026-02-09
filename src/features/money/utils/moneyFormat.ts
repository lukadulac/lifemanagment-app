export function formatCurrency(n: number) {
	const x = Number.isFinite(n) ? n : 0;
	const s = Math.round(x).toString();
	const withDots = s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	return withDots;
}

export function formatDate(isoOrDate: string | number | Date) {
	const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
	if (isNaN(d.getTime())) return "";
	const dd = String(d.getDate()).padStart(2, "0");
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const yyyy = d.getFullYear();
	return `${dd}.${mm}.${yyyy}.`;
}

export type MonthKey = `${number}-${string}`;

export function monthLabel(key: MonthKey) {
	const [y, m] = key.split("-");
	const mi = Number(m) - 1;
	const names = [
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
	return `${names[mi] ?? m} ${y}`;
}

export function lastMonths(count = 6): MonthKey[] {
	const out: MonthKey[] = [];
	const d = new Date();
	for (let i = 0; i < count; i++) {
		const x = new Date(d);
		x.setMonth(x.getMonth() - i);
		const y = x.getFullYear();
		const m = String(x.getMonth() + 1).padStart(2, "0");
		out.push(`${y}-${m}` as MonthKey);
	}
	return out;
}
