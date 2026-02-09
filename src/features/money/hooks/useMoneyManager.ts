import { useEffect, useMemo, useState } from "react";
import type {
	FixedExpense,
	MonthKey,
	SavingsEntry,
	Transaction,
	TransactionInsert,
} from "../money.types";
import { moneyService } from "../money.service";

const getMonthKey = (d = new Date()): MonthKey => {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	return `${y}-${m}` as MonthKey;
};

export const useMoneyManager = () => {
	const [money, setMoney] = useState<number | null>(null);
	const [description, setDescription] = useState("");
	const [transactions, setTransactions] = useState<Transaction[]>([]);

	// NEW
	const [month, setMonth] = useState<MonthKey>(getMonthKey());
	const [monthlyIncome, setMonthlyIncome] = useState<number>(0);

	const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
	const [fixedTitle, setFixedTitle] = useState("");
	const [fixedAmount, setFixedAmount] = useState<number | null>(null);

	const [savings, setSavings] = useState<SavingsEntry[]>([]);
	const [savingsAmount, setSavingsAmount] = useState<number | null>(null);
	const [savingsNote, setSavingsNote] = useState("");

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		void loadAll();
	}, [month]);

	const loadAll = async () => {
		try {
			setLoading(true);
			setError(null);

			const [tx, incomeRow, fixed, sav] = await Promise.all([
				moneyService.fetchTransactions(),
				moneyService.fetchMonthlyIncome(month),
				moneyService.fetchFixedExpenses(),
				moneyService.fetchSavings(month),
			]);

			setTransactions(tx);
			setMonthlyIncome(Number(incomeRow?.amount ?? 0));
			setFixedExpenses(fixed);
			setSavings(sav);
		} catch (err) {
			console.error(err);
			setError("Failed to load data");
		} finally {
			setLoading(false);
		}
	};

	const addTransaction = async (type: "income" | "expense") => {
		if (money === null || money === 0) return;

		try {
			const newTransaction: TransactionInsert = {
				amount: money,
				description: description || (type === "income" ? "Prihod" : "Rashod"),
				type,
			};

			const addedTransaction =
				await moneyService.addTransaction(newTransaction);
			if (addedTransaction)
				setTransactions([addedTransaction, ...transactions]);

			setMoney(null);
			setDescription("");
		} catch (err) {
			console.error(err);
			setError("Failed to add transaction");
		}
	};

	const deleteTransaction = async (id: string) => {
		try {
			await moneyService.deleteTransaction(id);
			setTransactions(transactions.filter((t) => t.id !== id));
		} catch (err) {
			console.error(err);
			setError("Failed to delete transaction");
		}
	};

	const saveMonthlyIncome = async (amount: number) => {
		try {
			setError(null);
			const row = await moneyService.upsertMonthlyIncome(month, amount);
			setMonthlyIncome(Number(row.amount));
		} catch (err) {
			console.error(err);
			setError("Failed to save monthly income");
		}
	};

	const addFixedExpense = async () => {
		if (!fixedTitle.trim() || fixedAmount === null || fixedAmount <= 0) return;

		try {
			setError(null);
			const added = await moneyService.addFixedExpense(
				fixedTitle.trim(),
				fixedAmount,
			);
			setFixedExpenses([added, ...fixedExpenses]);
			setFixedTitle("");
			setFixedAmount(null);
		} catch (err) {
			console.error(err);
			setError("Failed to add fixed expense");
		}
	};

	const deleteFixedExpense = async (id: string) => {
		try {
			setError(null);
			await moneyService.deleteFixedExpense(id);
			setFixedExpenses(fixedExpenses.filter((x) => x.id !== id));
		} catch (err) {
			console.error(err);
			setError("Failed to delete fixed expense");
		}
	};

	const addSavings = async () => {
		if (savingsAmount === null || savingsAmount <= 0) return;

		try {
			setError(null);
			const added = await moneyService.addSavings(
				month,
				savingsAmount,
				savingsNote,
			);
			setSavings([added, ...savings]);
			setSavingsAmount(null);
			setSavingsNote("");
		} catch (err) {
			console.error(err);
			setError("Failed to add savings");
		}
	};

	const deleteSavings = async (id: string) => {
		try {
			setError(null);
			await moneyService.deleteSavings(id);
			setSavings(savings.filter((x) => x.id !== id));
		} catch (err) {
			console.error(err);
			setError("Failed to delete savings");
		}
	};

	const expenseTransactions = useMemo(
		() => transactions.filter((t) => t.type === "expense"),
		[transactions],
	);

	// totals
	const totalExpense = useMemo(
		() => moneyService.calculateTotalExpense(transactions),
		[transactions],
	);
	const fixedTotal = useMemo(
		() => moneyService.calculateFixedTotal(fixedExpenses),
		[fixedExpenses],
	);
	const savingsTotal = useMemo(
		() => moneyService.calculateSavingsTotal(savings),
		[savings],
	);
	const addExtraExpense = async () => addTransaction("expense");

	const balance = useMemo(() => {
		return (
			Number(monthlyIncome) -
			Number(totalExpense) -
			Number(fixedTotal) -
			Number(savingsTotal)
		);
	}, [monthlyIncome, totalExpense, fixedTotal, savingsTotal]);

	return {
		//extra expense
		expenseTransactions,
		addExtraExpense,
		// month
		month,
		setMonth,

		// monthly income
		monthlyIncome,
		saveMonthlyIncome,

		// fixed
		fixedExpenses,
		fixedTitle,
		setFixedTitle,
		fixedAmount,
		setFixedAmount,
		addFixedExpense,
		deleteFixedExpense,
		fixedTotal,

		// savings
		savings,
		savingsAmount,
		setSavingsAmount,
		savingsNote,
		setSavingsNote,
		addSavings,
		deleteSavings,
		savingsTotal,

		// existing tx (ti možeš da koristiš samo expense ako hoćeš)
		money,
		setMoney,
		description,
		setDescription,
		transactions,
		addTransaction,
		deleteTransaction,
		totalExpense,

		// computed
		balance,

		// ui
		loading,
		error,
	};
};
