import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { uploadAvatarFromBase64Async } from "./profile.service";

type Props = {
	avatarUrl?: string | null;
	displayName?: string | null;
	onAvatarChanged?: (url: string) => void;
};

export default function ProfilePhotoSection({
	avatarUrl,
	displayName,
	onAvatarChanged,
}: Props) {
	const [open, setOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const hasAvatar = !!avatarUrl;

	const initials = useMemo(() => {
		const s = (displayName ?? "U").trim();
		return (s[0] ?? "U").toUpperCase();
	}, [displayName]);

	const pickAndUpload = async () => {
		setSaving(true);
		try {
			const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (!perm.granted) throw new Error("Dozvoli pristup galeriji.");

			const res = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				quality: 0.85,
				allowsEditing: true,
				aspect: [1, 1],
				base64: true,
			});
			const asset = res.assets?.[0];
			if (!asset?.base64) throw new Error("Nema base64 slike.");

			if (res.canceled) return;

			const uri = res.assets[0]?.uri;
			if (!uri) throw new Error("Nema slike.");

			const url = await uploadAvatarFromBase64Async(asset.base64, asset.uri);
			onAvatarChanged?.(url);
		} catch (e: any) {
			setError(e?.message ?? "Greška pri uploadu.");
			console.log("AVATAR ERROR:", e);
			console.log(e?.message ?? e);
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<View>
				{error ? (
					<View
						style={{
							padding: 10,
							borderRadius: 12,
							borderWidth: 1,
							borderColor: "#a33",
						}}
					>
						<Text style={{ color: "white" }}>{error}</Text>
					</View>
				) : null}

				<Pressable
					onPress={() => (hasAvatar ? setOpen(true) : pickAndUpload())}
					style={s.avatarWrap}
				>
					{hasAvatar ? (
						<Image
							source={{ uri: `${avatarUrl}?t=${Date.now()}` }}
							style={s.avatar}
							onError={(e) => console.log("AVATAR IMAGE ERROR:", e.nativeEvent)}
						/>
					) : (
						<View style={s.placeholder}>
							<Text style={s.initials}>{initials}</Text>
						</View>
					)}
				</Pressable>
			</View>

			<Modal
				visible={open}
				transparent
				animationType="fade"
				onRequestClose={() => setOpen(false)}
			>
				<View style={s.backdrop}>
					<View style={s.sheet}>
						<Pressable onPress={() => setOpen(false)} style={s.closeX}>
							<Text style={s.closeText}>✕</Text>
						</Pressable>

						{hasAvatar ? (
							<Image
								source={{ uri: `${avatarUrl}?t=${Date.now()}` }}
								style={s.bigImage}
								onError={(e) => console.log("BIG IMAGE ERROR:", e.nativeEvent)}
							/>
						) : null}

						<Pressable
							onPress={pickAndUpload}
							style={[s.btn, saving && { opacity: 0.6 }]}
							disabled={saving}
						>
							{saving ? (
								<ActivityIndicator />
							) : (
								<Text style={s.btnText}>Izmeni sliku</Text>
							)}
						</Pressable>

						<Pressable onPress={() => setOpen(false)} style={s.btnGhost}>
							<Text style={s.btnGhostText}>Zatvori</Text>
						</Pressable>
					</View>
				</View>
			</Modal>
		</>
	);
}

const s = StyleSheet.create({
	// card: {
	// 	borderWidth: 1,
	// 	borderColor: "#374151",
	// 	backgroundColor: "#111827",
	// 	borderRadius: 16,
	// 	padding: 14,
	// 	gap: 12,
	// },
	cardTitle: { color: "white", fontSize: 16, fontWeight: "900" },

	avatarWrap: { alignSelf: "center" },
	avatar: {
		width: 110,
		height: 110,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#4B5563",
	},
	placeholder: {
		width: 110,
		height: 110,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#4B5563",
		backgroundColor: "#0F172A",
		alignItems: "center",
		justifyContent: "center",
	},
	initials: { color: "white", fontSize: 40, fontWeight: "900" },

	btn: {
		borderRadius: 12,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: "#444",
		alignItems: "center",
		backgroundColor: "#0F172A",
	},
	btnText: { color: "white", fontWeight: "900", fontSize: 16 },

	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.75)",
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
	},
	sheet: {
		width: "100%",
		maxWidth: 520,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#374151",
		backgroundColor: "#111827",
		padding: 14,
		gap: 12,
	},
	closeX: { alignSelf: "flex-end", padding: 6 },
	closeText: { color: "white", fontSize: 18, fontWeight: "900" },

	bigImage: {
		width: "100%",
		height: 360,
		borderRadius: 16,
		backgroundColor: "#0F172A",
	},

	btnGhost: {
		borderRadius: 12,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: "#374151",
		alignItems: "center",
	},
	btnGhostText: { color: "#D1D5DB", fontWeight: "900" },
});
