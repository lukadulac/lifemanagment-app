import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthCard } from "../components/AuthCard";

export const AuthScreen = () => {
	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: "#1E2838" }}
			edges={["top"]}
		>
			<AuthCard />
		</SafeAreaView>
	);
};
