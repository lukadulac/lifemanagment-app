import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { AuthMode } from "../auth.types";
import { LoginForm } from "../screens/LoginForm";
import { RegisterForm } from "../screens/RegisterForm";
import { ResetPasswordForm } from "../screens/ResetPasswordForm";

export function AuthCard() {
	const [mode, setMode] = useState<AuthMode>("login");
	const [message, setMessage] = useState<string | null>(null);

	const title = useMemo(() => {
		if (mode === "reset") return "Reset password 🔑";
		return mode === "login" ? "Welcome back 👋" : "Create account ✨";
	}, [mode]);

	const subtitle = useMemo(() => {
		if (mode === "reset") return "Unesi email i poslaćemo ti link za reset";
		return mode === "login"
			? "Login da upravljaš novcem & vremenom"
			: "Kreni da upravljaš novcem & vremenom";
	}, [mode]);

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<Text style={styles.h1}>{title}</Text>
				<Text style={styles.subtitle}>{subtitle}</Text>

				{message ? (
					<View style={styles.okBox}>
						<Text style={styles.okText}>{message}</Text>
					</View>
				) : null}

				{mode === "login" ? (
					<LoginForm
						onForgot={() => {
							setMode("reset");
							setMessage(null);
						}}
						onSwitch={() => {
							setMode("register");
							setMessage(null);
						}}
						onSuccess={(m) => setMessage(m)}
					/>
				) : null}

				{mode === "register" ? (
					<RegisterForm
						onSwitch={() => {
							setMode("login");
							setMessage(null);
						}}
						onSuccess={(m) => setMessage(m)}
					/>
				) : null}

				{mode === "reset" ? (
					<ResetPasswordForm
						onBack={() => {
							setMode("login");
							setMessage(null);
						}}
						onSuccess={(m) => setMessage(m)}
					/>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
	},
	card: {
		width: "100%",
		maxWidth: 420,
		padding: 16,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#333",
		gap: 10,
		backgroundColor: "#0F172A",
	},
	h1: { fontSize: 22, fontWeight: "800", textAlign: "center", color: "white" },
	subtitle: {
		textAlign: "center",
		opacity: 0.8,
		marginBottom: 4,
		color: "#D1D5DB",
	},

	okBox: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "#2a6" },
	okText: { fontSize: 13, color: "white" },
});
