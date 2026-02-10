import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfilePhotoSection from "../auth/components/user/ProfilePhotoSection";
import UsernameEditModal from "../auth/components/user/UsernameEditModal";
import { supabase } from "../lib/supabaseClient";

export function Account() {
	const [editOpen, setEditOpen] = useState(false);
	const [username, setUsername] = useState("");
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [current, setCurrent] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [msg, setMsg] = useState<string | null>(null);
	const [err, setErr] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				setLoading(true);
				setErr(null);
				setMsg(null);

				const { data: sess, error: sessErr } = await supabase.auth.getSession();
				if (sessErr) throw sessErr;

				const userId = sess.session?.user.id;
				const email = sess.session?.user.email ?? null;

				if (!userId) {
					if (!mounted) return;
					setErr("Nisi ulogovan.");
					return;
				}

				// 1) učitaj profil (username + avatar_url)
				const { data: profile, error: profileErr } = await supabase
					.from("profiles")
					.select("username, avatar_url, email")
					.eq("id", userId)
					.maybeSingle();

				if (profileErr) throw profileErr;

				if (!mounted) return;

				setCurrent(profile?.username ?? null);
				setUsername(profile?.username ?? "");
				setAvatarUrl(profile?.avatar_url ?? null);

				console.log("LOADED AVATAR URL:", profile?.avatar_url);

				// 2) opcionalno: upiši email u profiles ako fali
				if (email && profile?.email !== email) {
					const { error: upErr } = await supabase
						.from("profiles")
						.upsert({ id: userId, email }, { onConflict: "id" });

					if (upErr) console.log("EMAIL UPSERT ERROR:", upErr);
				}
			} catch (e: any) {
				console.log("ACCOUNT LOAD ERROR:", e);
				if (!mounted) return;
				setErr(e?.message ?? "Greška pri učitavanju profila.");
			} finally {
				if (!mounted) return;
				setLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);
	useEffect(() => {
		console.log("AVATAR STATE:", avatarUrl);
	}, [avatarUrl]);

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
				<View style={styles.headerContainer}>
					<Text style={styles.h1}>Hello {current ?? "there"}👋</Text>
					<ProfilePhotoSection
						avatarUrl={avatarUrl}
						displayName={current}
						onAvatarChanged={(url) => setAvatarUrl(url)}
					/>
				</View>

				<View style={styles.card}>
					<View style={styles.rowBetween}>
						<View>
							<Text style={styles.labelSmall}>Username</Text>
							<Text style={styles.value}>{current ?? "nije postavljen"}</Text>
						</View>

						<Pressable style={styles.editBtn} onPress={() => setEditOpen(true)}>
							<Text style={styles.editBtnText}>Izmeni</Text>
						</Pressable>
					</View>
				</View>

				<UsernameEditModal
					visible={editOpen}
					onClose={() => setEditOpen(false)}
					initialUsername={current}
					onSaved={(u) => {
						setCurrent(u);
						setMsg("Username sačuvan ✅");
					}}
				/>
				<View style={{ marginTop: 16 }}>
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
	headerContainer: {
		flexDirection: "row",

		justifyContent: "space-between",
		marginBottom: 24,
	},
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
	card: {
		borderWidth: 1,
		borderColor: "#374151",
		backgroundColor: "#111827",
		borderRadius: 16,
		padding: 14,
		gap: 12,
	},
	cardTitle: { color: "white", fontSize: 16, fontWeight: "900" },
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	labelSmall: { color: "#9CA3AF", fontWeight: "700" },
	value: { color: "white", fontSize: 18, fontWeight: "800", marginTop: 2 },

	editBtn: {
		borderWidth: 1,
		borderColor: "#4B5563",
		backgroundColor: "#0F172A",
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 12,
	},
	editBtnText: { color: "white", fontWeight: "900" },
});
