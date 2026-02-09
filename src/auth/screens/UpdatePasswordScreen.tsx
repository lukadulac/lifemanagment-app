import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { authService } from "../auth.service";

export function UpdatePasswordScreen() {
	const [password, setPassword] = useState("");
	const [password2, setPassword2] = useState("");
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<string | null>(null);
	const [err, setErr] = useState<string | null>(null);

	const submit = async () => {
		setErr(null);
		setMsg(null);

		if (password.length < 6)
			return setErr("Password mora imati bar 6 karaktera.");
		if (password !== password2) return setErr("Passwordi se ne poklapaju.");

		setLoading(true);
		try {
			await authService.updatePassword({ password });
			setMsg("Password uspešno promenjen. Možeš da se uloguješ.");
		} catch (e: any) {
			setErr(e?.message ?? "Greška pri promeni passworda.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<Text style={styles.h1}>Promena lozinke</Text>

				{err ? (
					<View style={styles.errorBox}>
						<Text style={styles.errorText}>{err}</Text>
					</View>
				) : null}

				{msg ? (
					<View style={styles.okBox}>
						<Text style={styles.okText}>{msg}</Text>
					</View>
				) : null}

				<TextInput
					value={password}
					onChangeText={setPassword}
					placeholder="Nova lozinka (min 6)"
					secureTextEntry
					autoCapitalize="none"
					style={styles.input}
					placeholderTextColor="#6B7280"
				/>
				<TextInput
					value={password2}
					onChangeText={setPassword2}
					placeholder="Ponovi novu lozinku"
					secureTextEntry
					autoCapitalize="none"
					style={styles.input}
					placeholderTextColor="#6B7280"
				/>

				<Pressable
					onPress={submit}
					disabled={loading}
					style={[styles.primaryBtn, loading && styles.btnDisabled]}
				>
					{loading ? (
						<ActivityIndicator />
					) : (
						<Text style={styles.primaryBtnText}>Sačuvaj</Text>
					)}
				</Pressable>
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

	input: {
		borderWidth: 1,
		borderColor: "#444",
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		color: "white",
	},

	primaryBtn: {
		paddingVertical: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#444",
		alignItems: "center",
	},
	primaryBtnText: { fontWeight: "700", color: "white" },
	btnDisabled: { opacity: 0.6 },

	errorBox: {
		padding: 10,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#a33",
	},
	errorText: { fontSize: 13, color: "white" },

	okBox: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "#2a6" },
	okText: { fontSize: 13, color: "white" },
});
