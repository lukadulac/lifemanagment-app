import React from "react";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BalanceCard } from "../features/money/components/BalanceCard";
import { ExtraExpensesCard } from "../features/money/components/ExtraExpensesCard";
import { FixedExpensesCard } from "../features/money/components/FixedExpensesCard";
import { MonthlyIncomeCard } from "../features/money/components/MonthlyIncomeCard";
import { SavingsCard } from "../features/money/components/SavingsCard";

import { useMoneyManager } from "../features/money/hooks/useMoneyManager";

export function Money() {
	//TODO:Razmisli o logici za money managment i meseci - da li ce se meseci menjati i kako ce se cuvati stanje za svaki mesec
	const { width } = useWindowDimensions();
	const isLg = width >= 1024;

	const {
		// ui
		loading,
		error,

		// month
		month,
		setMonth,

		// monthly income
		monthlyIncome,
		saveMonthlyIncome,

		// totals + balance
		balance,
		totalExpense,
		fixedTotal,
		savingsTotal,

		// fixed
		fixedExpenses,
		fixedTitle,
		setFixedTitle,
		fixedAmount,
		setFixedAmount,
		addFixedExpense,
		deleteFixedExpense,

		// extra expenses
		money,
		setMoney,
		description,
		setDescription,
		expenseTransactions,
		addExtraExpense,
		deleteTransaction,

		// savings
		savings,
		savingsAmount,
		setSavingsAmount,
		savingsNote,
		setSavingsNote,
		addSavings,
		deleteSavings,
	} = useMoneyManager();

	if (loading) {
		return (
			<View style={[styles.page, styles.center]}>
				<ActivityIndicator />
			</View>
		);
	}

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: "#1E2838" }}
			edges={["top"]}
		>
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
							items={savings.map((item) => ({
								...item,
								note: item.note ?? undefined,
							}))}
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
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	page: { padding: 16, paddingBottom: 24, backgroundColor: "#1E2838" },
	shell: { width: "100%", maxWidth: 1152, alignSelf: "center" },

	center: { flex: 1, alignItems: "center", justifyContent: "center" },

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
