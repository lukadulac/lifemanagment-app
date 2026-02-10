import { supabase } from "../../lib/supabaseClient";
import type {
  FixedExpense,
  MonthKey,
  MonthlyIncome,
  SavingsEntry,
  Transaction,
  TransactionInsert,
} from "./money.types";

const getUserOrThrow = async () => {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error("User not authenticated");
	return user;
};

export const moneyService = {
	async fetchTransactions(month: MonthKey): Promise<Transaction[]> {
		const { data, error } = await supabase
			.from("transactions")
			.select("*")
			.eq("month", month)
			.order("date", { ascending: false });

		if (error) {
			console.error("Error fetching transactions:", error);
			throw error;
		}

		return data ?? [];
	},

	async addTransaction(month: MonthKey, tx: TransactionInsert) {
		const { data, error } = await supabase
			.from("transactions")
			.insert([{ ...tx, month }])
			.select("*")
			.single();

		if (error) throw error;
		return data;
	},

	async deleteTransaction(id: string): Promise<void> {
		const { error } = await supabase.from("transactions").delete().eq("id", id);

		if (error) {
			console.error("Error deleting transaction:", error);
			throw error;
		}
	},

	calculateTotalIncome: (transactions: Transaction[]): number => {
		return transactions
			.filter((t) => t.type === "income")
			.reduce((sum, t) => sum + Number(t.amount), 0);
	},

	calculateTotalExpense: (transactions: Transaction[]): number => {
		return transactions
			.filter((t) => t.type === "expense")
			.reduce((sum, t) => sum + Number(t.amount), 0);
	},

	calculateBalance: (transactions: Transaction[]): number => {
		const income = moneyService.calculateTotalIncome(transactions);
		const expense = moneyService.calculateTotalExpense(transactions);
		return income - expense;
	},

	formatCurrency: (amount: number): string => {
		return amount.toLocaleString("sr-RS", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	},

	formatDate: (dateString: string): string => {
		return new Date(dateString).toLocaleString("sr-RS", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	},

	async fetchMonthlyIncome(month: MonthKey): Promise<MonthlyIncome | null> {
		const user = await getUserOrThrow();

		const { data, error } = await supabase
			.from("monthly_income")
			.select("*")
			.eq("user_id", user.id)
			.eq("month", month)
			.maybeSingle();

		if (error) throw error;
		return data ?? null;
	},

	async upsertMonthlyIncome(
		month: MonthKey,
		amount: number,
	): Promise<MonthlyIncome> {
		const user = await getUserOrThrow();

		const { data, error } = await supabase
			.from("monthly_income")
			.upsert(
				{ user_id: user.id, month, amount },
				{ onConflict: "user_id,month" },
			)
			.select()
			.single();

		if (error) throw error;
		return data;
	},

	async fetchFixedExpenses(month: MonthKey) {
		const { data, error } = await supabase
			.from("fixed_expenses")
			.select("*")
			.eq("month", month)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data ?? [];
	},

	async addFixedExpense(month: MonthKey, title: string, amount: number) {
		const { data, error } = await supabase
			.from("fixed_expenses")
			.insert([{ title, amount, month }])
			.select("*")
			.single();

		if (error) throw error;
		return data;
	},

	async deleteFixedExpense(id: string): Promise<void> {
		const { error } = await supabase
			.from("fixed_expenses")
			.delete()
			.eq("id", id);
		if (error) throw error;
	},

	async fetchSavings(month: MonthKey): Promise<SavingsEntry[]> {
		const user = await getUserOrThrow();

		const { data, error } = await supabase
			.from("savings_entries")
			.select("*")
			.eq("user_id", user.id)
			.eq("month", month)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data ?? [];
	},

	async addSavings(
		month: MonthKey,
		amount: number,
		note?: string,
	): Promise<SavingsEntry> {
		const user = await getUserOrThrow();

		const { data, error } = await supabase
			.from("savings_entries")
			.insert({ user_id: user.id, month, amount, note: note || null })
			.select()
			.single();

		if (error) throw error;
		return data;
	},

	async deleteSavings(id: string): Promise<void> {
		const { error } = await supabase
			.from("savings_entries")
			.delete()
			.eq("id", id);
		if (error) throw error;
	},

	calculateFixedTotal: (fixed: FixedExpense[]) =>
		fixed.reduce((sum, x) => sum + Number(x.amount), 0),

	calculateSavingsTotal: (savings: SavingsEntry[]) =>
		savings.reduce((sum, x) => sum + Number(x.amount), 0),
};
