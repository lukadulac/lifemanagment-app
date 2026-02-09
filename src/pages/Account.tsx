import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabaseClient";

export function Account() {
	const [username, setUsername] = useState("");
	const [current, setCurrent] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [msg, setMsg] = useState<string | null>(null);
	const [err, setErr] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			setLoading(true);
			setErr(null);
			setMsg(null);

			const { data: sess } = await supabase.auth.getSession();
			const userId = sess.session?.user.id;
			const email = sess.session?.user.email;

			if (!userId) {
				setErr("Nisi ulogovan.");
				setLoading(false);
				return;
			}

			// učitaj postojeći username
			const { data, error } = await supabase
				.from("profiles")
				.select("username")
				.eq("id", userId)
				.maybeSingle();

			if (!error) {
				setCurrent(data?.username ?? null);
				setUsername(data?.username ?? "");
			}

			// (opciono) upiši email u profiles ako fali (da radi username login)
			if (email) {
				await supabase
					.from("profiles")
					.upsert({ id: userId, email }, { onConflict: "id" });
			}

			setLoading(false);
		})();
	}, []);

	const save = async () => {
		setSaving(true);
		setErr(null);
		setMsg(null);

		const u = username.trim().toLowerCase();

		if (u.length < 3) {
			setErr("Username mora imati bar 3 karaktera.");
			setSaving(false);
			return;
		}
		if (!/^[a-z0-9._]+$/.test(u)) {
			setErr("Dozvoljeno: slova, brojevi, tačka i donja crta.");
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

		// upsert u profiles (username + email)
		const { error } = await supabase
			.from("profiles")
			.upsert({ id: userId, username: u, email }, { onConflict: "id" });

		if (error) {
			// unique violation username/email
			setErr(
				error.message.includes("duplicate")
					? "Username je zauzet."
					: error.message,
			);
		} else {
			setCurrent(u);
			setMsg("Username sačuvan ✅");
		}

		setSaving(false);
	};

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
			<View style={styles.page}>
				<Text style={styles.h1}>Account</Text>

				{err ? <Text style={styles.err}>{err}</Text> : null}
				{msg ? <Text style={styles.ok}>{msg}</Text> : null}

				<Text style={styles.label}>Username</Text>
				<TextInput
					value={username}
					onChangeText={setUsername}
					autoCapitalize="none"
					style={styles.input}
				/>

				<Text style={styles.hint}>
					Trenutni: {current ?? "nije postavljen"}
				</Text>

				<Pressable
					onPress={save}
					disabled={saving}
					style={[styles.btn, saving && { opacity: 0.6 }]}
				>
					{saving ? (
						<ActivityIndicator />
					) : (
						<Text style={styles.btnText}>Sačuvaj</Text>
					)}
				</Pressable>
				<View style={{ marginTop: 24 }}>
					<Pressable
						accessibilityRole="button"
						style={styles.btn2}
						onPress={() => supabase.auth.signOut()}
					>
						<Text style={styles.btn2Text}>Logout</Text>
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	page: { flex: 1, padding: 16, backgroundColor: "#1E2838" },
	center: { alignItems: "center", justifyContent: "center" },
	h1: { color: "white", fontSize: 24, fontWeight: "800", marginBottom: 12 },

	label: {
		color: "#D1D5DB",
		marginTop: 10,
		marginBottom: 8,
		fontWeight: "700",
		fontSize: 16,
	},
	input: {
		borderWidth: 1,
		borderColor: "#444",
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		color: "white",
		fontSize: 18,
	},
	hint: { color: "#9CA3AF", marginTop: 8, fontSize: 18 },

	btn: {
		marginTop: 12,
		borderRadius: 12,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: "#444",
		alignItems: "center",
	},
	btnText: { color: "white", fontWeight: "800", fontSize: 18 },

	err: { color: "#F87171", marginBottom: 8 },
	ok: { color: "#34D399", marginBottom: 8 },

	btn2: {
		marginTop: 12,
		borderRadius: 12,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: "#F87171",
		alignItems: "center",
	},
	btn2Text: { color: "#F87171", fontWeight: "800", fontSize: 18 },
});
