import React, { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { supabase } from "../../../lib/supabaseClient";

type Props = {
	visible: boolean;
	onClose: () => void;
	onSaved?: (newUsername: string) => void;
	initialUsername?: string | null;
};

const normalize = (s: string) => s.trim().toLowerCase();
const isValidUsername = (u: string) => /^[a-z0-9._]+$/.test(u) && u.length >= 3;

export function UsernameEditModal({
	visible,
	onClose,
	onSaved,
	initialUsername,
}: Props) {
	const [username, setUsername] = useState(initialUsername ?? "");
	const [saving, setSaving] = useState(false);
	const [err, setErr] = useState<string | null>(null);

	useEffect(() => {
		if (visible) {
			setUsername(initialUsername ?? "");
			setErr(null);
			setSaving(false);
		}
	}, [visible, initialUsername]);

	const disabled = useMemo(
		() => saving || !isValidUsername(normalize(username)),
		[saving, username],
	);

	const save = async () => {
		setSaving(true);
		setErr(null);

		const u = normalize(username);

		if (!isValidUsername(u)) {
			setErr("Username: min 3, samo slova/brojevi/._");
			setSaving(false);
			return;
		}

		const { data: sess } = await supabase.auth.getSession();
		const userId = sess.session?.user.id;
		const email = sess.session?.user.email;

		if (!userId) {
			setErr("Nisi ulogovan.");
			setSaving(false);
			return;
		}

		const { error } = await supabase
			.from("profiles")
			.upsert({ id: userId, username: u, email }, { onConflict: "id" });

		if (error) {
			setErr(
				error.message.includes("duplicate")
					? "Username je zauzet."
					: error.message,
			);
			setSaving(false);
			return;
		}

		onSaved?.(u);
		setSaving(false);
		onClose();
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<View style={s.backdrop}>
				<View style={s.sheet}>
					<Text style={s.title}>Promeni username</Text>

					{err ? (
						<View style={s.errBox}>
							<Text style={s.errText}>{err}</Text>
						</View>
					) : null}

					<TextInput
						value={username}
						onChangeText={setUsername}
						autoCapitalize="none"
						placeholder="npr. luka.d"
						placeholderTextColor="#6B7280"
						style={s.input}
					/>

					<View style={s.row}>
						<Pressable onPress={onClose} style={s.btnGhost} disabled={saving}>
							<Text style={s.btnGhostText}>Otkaži</Text>
						</Pressable>

						<Pressable
							onPress={save}
							style={[s.btn, disabled && { opacity: 0.6 }]}
							disabled={disabled}
						>
							{saving ? (
								<ActivityIndicator />
							) : (
								<Text style={s.btnText}>Sačuvaj</Text>
							)}
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}

export default UsernameEditModal;

const s = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.55)",
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
	},
	sheet: {
		width: "100%",
		maxWidth: 420,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#374151",
		backgroundColor: "#111827",
		padding: 14,
		gap: 10,
	},
	title: {
		color: "white",
		fontSize: 18,
		fontWeight: "900",
		textAlign: "center",
	},

	input: {
		borderWidth: 1,
		borderColor: "#444",
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		color: "white",
		fontSize: 16,
	},

	errBox: {
		padding: 10,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#a33",
	},
	errText: { color: "white", fontSize: 13 },

	row: { flexDirection: "row", gap: 10, marginTop: 6 },
	btnGhost: {
		flex: 1,
		borderRadius: 12,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: "#374151",
		alignItems: "center",
	},
	btnGhostText: { color: "#D1D5DB", fontWeight: "800" },

	btn: {
		flex: 1,
		borderRadius: 12,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: "#444",
		alignItems: "center",
		backgroundColor: "#0F172A",
	},
	btnText: { color: "white", fontWeight: "900" },
});
