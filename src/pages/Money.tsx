import React from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";

import { BalanceCard } from "../features/money/components/BalanceCard";
import { ExtraExpensesCard } from "../features/money/components/ExtraExpensesCard";
import { FixedExpensesCard } from "../features/money/components/FixedExpensesCard";
import { MonthlyIncomeCard } from "../features/money/components/MonthlyIncomeCard";
import { SavingsCard } from "../features/money/components/SavingsCard";

import type { MonthKey } from "../features/money/utils/moneyFormat";

// ovde uveži svoj hook/store/service
// import { useMoneyManager } from "../hooks/useMoneyManager";

export function Money() {
	const { width } = useWindowDimensions();
	const isLg = width >= 1024;

	// TODO: zameni ovim: const vm = useMoneyManager()
	const error: string | null = null;

	const month: MonthKey = "2026-02";
	const setMonth = (_m: MonthKey) => {};

	const monthlyIncome = 0;
	const saveMonthlyIncome = (_n: number) => {};

	const balance = 0;
	const totalExpense = 0;
	const fixedTotal = 0;
	const savingsTotal = 0;

	const fixedExpenses: any[] = [];
	const fixedTitle = "";
	const setFixedTitle = (_s: string) => {};
	const fixedAmount = null as number | null;
	const setFixedAmount = (_n: number | null) => {};
	const addFixedExpense = () => {};
	const deleteFixedExpense = (_id: string) => {};

	const money = null as number | null;
	const setMoney = (_n: number | null) => {};
	const description = "";
	const setDescription = (_s: string) => {};
	const expenseTransactions: any[] = [];
	const addExtraExpense = () => {};
	const deleteTransaction = (_id: string) => {};

	const savings: any[] = [];
	const savingsAmount = null as number | null;
	const setSavingsAmount = (_n: number | null) => {};
	const savingsNote = "";
	const setSavingsNote = (_s: string) => {};
	const addSavings = () => {};
	const deleteSavings = (_id: string) => {};

	return (
		<ScrollView contentContainerStyle={styles.page}>
			<View style={styles.shell}>
				<Text style={styles.h1}>Upravljanje Novcem</Text>

				{!!error && (
					<View style={styles.errorBox}>
						<Text style={styles.errorText}>{error}</Text>
					</View>
				)}

				<View style={isLg ? styles.row2 : styles.row1}>
					<View style={isLg ? styles.col : styles.colFull}>
						<MonthlyIncomeCard
							month={month}
							onMonthChange={setMonth}
							monthlyIncome={monthlyIncome}
							onSave={saveMonthlyIncome}
						/>
					</View>

					<View style={isLg ? styles.col : styles.colFull}>
						<BalanceCard
							balance={balance}
							totalIncome={monthlyIncome}
							totalExpense={totalExpense + fixedTotal + savingsTotal}
						/>
					</View>
				</View>

				<View style={isLg ? styles.row2 : styles.row1}>
					<View style={isLg ? styles.col : styles.colFull}>
						<FixedExpensesCard
							items={fixedExpenses}
							title={fixedTitle}
							setTitle={setFixedTitle}
							amount={fixedAmount}
							setAmount={setFixedAmount}
							onAdd={addFixedExpense}
							onDelete={deleteFixedExpense}
							total={fixedTotal}
						/>
					</View>

					<View style={isLg ? styles.col : styles.colFull}>
						<ExtraExpensesCard
							money={money}
							description={description}
							onMoneyChange={setMoney}
							onDescriptionChange={setDescription}
							items={expenseTransactions}
							onAdd={addExtraExpense}
							onDelete={deleteTransaction}
							total={totalExpense}
						/>
					</View>
				</View>

				<View style={styles.row1}>
					<SavingsCard
						items={savings}
						amount={savingsAmount}
						setAmount={setSavingsAmount}
						note={savingsNote}
						setNote={setSavingsNote}
						onAdd={addSavings}
						onDelete={deleteSavings}
						total={savingsTotal}
					/>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	page: { padding: 16, paddingBottom: 24, backgroundColor: "#1E2838" },
	shell: { width: "100%", maxWidth: 1152, alignSelf: "center" },

	h1: {
		fontSize: 30,
		fontWeight: "800",
		color: "white",
		textAlign: "center",
		marginBottom: 20,
	},

	errorBox: {
		backgroundColor: "rgba(127, 29, 29, 0.18)",
		borderWidth: 1,
		borderColor: "rgba(127, 29, 29, 0.55)",
		borderRadius: 12,
		padding: 12,
		marginBottom: 16,
	},
	errorText: { color: "#F87171" },

	row1: { gap: 16, marginBottom: 16 },
	row2: { flexDirection: "row", gap: 16, marginBottom: 16 },

	col: { flex: 1, minWidth: 0 },
	colFull: { width: "100%" },
});
export default Money;
