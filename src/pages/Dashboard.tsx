import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const Dashboard = () => {
	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: "#1E2838" }}
			edges={["top"]}
		>
			<View style={styles.container}>
				<Text style={styles.h1}>Dashboard</Text>
				<Text style={styles.text}>
					Ovo je RN placeholder. Sledeće prepisujemo UI iz web verzije.
				</Text>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, gap: 8 },
	h1: { fontSize: 22, fontWeight: "700", color: "white" },
	text: { fontSize: 18, color: "#D1D5DB" },
});
