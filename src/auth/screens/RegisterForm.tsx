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

type Props = {
	onSwitch: () => void;
	onSuccess?: (msg: string) => void;
};

export function RegisterForm({ onSwitch, onSuccess }: Props) {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const submit = async () => {
		setLoading(true);
		setError(null);

		const u = username.trim().toLowerCase();
		const e = email.trim().toLowerCase();

		if (u.length < 3 || u.includes(" ")) {
			setError("Username mora imati bar 3 karaktera i bez razmaka.");
			setLoading(false);
			return;
		}
		if (!e || !e.includes("@")) {
			setError("Unesi validan email.");
			setLoading(false);
			return;
		}
		if (password.length < 6) {
			setError("Password mora imati bar 6 karaktera.");
			setLoading(false);
			return;
		}

		try {
			await authService.signUp({ username: u, email: e, password });
			onSuccess?.("Proveri email da potvrdiš registraciju.");
		} catch (e: any) {
			setError(e?.message ?? "Greška pri registraciji.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={{ gap: 10 }}>
			{error ? (
				<View style={styles.errorBox}>
					<Text style={styles.errorText}>{error}</Text>
				</View>
			) : null}

			<TextInput
				value={username}
				onChangeText={setUsername}
				placeholder="Username"
				autoCapitalize="none"
				style={styles.input}
				placeholderTextColor="#6B7280"
			/>

			<TextInput
				value={email}
				onChangeText={setEmail}
				placeholder="Email"
				keyboardType="email-address"
				autoCapitalize="none"
				style={styles.input}
				placeholderTextColor="#6B7280"
			/>

			<TextInput
				value={password}
				onChangeText={setPassword}
				placeholder="Password (min 6)"
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
					<Text style={styles.primaryBtnText}>Register</Text>
				)}
			</Pressable>

			<Pressable onPress={onSwitch}>
				<Text style={styles.link}>Već imate nalog? Prijavite se</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
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

	link: {
		textAlign: "center",
		textDecorationLine: "underline",
		marginTop: 4,
		color: "#D1D5DB",
	},

	errorBox: {
		padding: 10,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#a33",
	},
	errorText: { fontSize: 13, color: "white" },
});
