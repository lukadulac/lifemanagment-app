import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const TimeTable = () => (
	<SafeAreaView style={{ flex: 1, backgroundColor: "#1E2838" }}>
		<View style={styles.container}>
			<Text style={styles.h1}>Timetable</Text>
			<Text style={styles.text}>Placeholder.</Text>
		</View>
	</SafeAreaView>
);

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, gap: 8 },
	h1: { fontSize: 22, fontWeight: "700", color: "white" },
	text: { fontSize: 14, color: "#D1D5DB" },
});
