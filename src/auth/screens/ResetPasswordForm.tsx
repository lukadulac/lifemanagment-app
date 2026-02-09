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
	onBack: () => void;
	onSuccess?: (msg: string) => void;
};

export function ResetPasswordForm({ onBack, onSuccess }: Props) {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [cooldown, setCooldown] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const runCooldown = () => {
		setCooldown(true);
		setTimeout(() => setCooldown(false), 60_000);
	};

	const submit = async () => {
		if (!email.trim()) {
			setError("Unesi email prvo.");
			return;
		}
		if (cooldown) return;

		setLoading(true);
		setError(null);

		try {
			await authService.resetPassword({
				email,
				redirectTo: "moneytime://update-password",
			});
			onSuccess?.(`Reset link je poslat na ${email.trim()}. Proveri email.`);
			runCooldown();
		} catch (e: any) {
			setError(e?.message ?? "Greška pri resetu.");
			runCooldown();
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
				value={email}
				onChangeText={setEmail}
				placeholder="Email"
				keyboardType="email-address"
				autoCapitalize="none"
				style={styles.input}
				placeholderTextColor="#6B7280"
			/>

			<Pressable
				onPress={submit}
				disabled={loading || cooldown}
				style={[styles.primaryBtn, (loading || cooldown) && styles.btnDisabled]}
			>
				{loading ? (
					<ActivityIndicator />
				) : (
					<Text style={styles.primaryBtnText}>
						{cooldown ? "Sačekaj malo..." : "Pošalji reset link"}
					</Text>
				)}
			</Pressable>

			<Pressable onPress={onBack}>
				<Text style={styles.link}>Back to login</Text>
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
