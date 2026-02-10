import { supabase } from "../../../lib/supabaseClient";

const base64ToUint8Array = (base64: string) => {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
};

export async function uploadAvatarFromBase64Async(
	base64: string,
	originalUri?: string,
): Promise<string> {
	const { data: sess } = await supabase.auth.getSession();
	const user = sess.session?.user;
	if (!user) throw new Error("Nisi ulogovan.");

	const ext = (originalUri?.split(".").pop() || "jpg").toLowerCase();
	const path = `${user.id}/avatar-${Date.now()}.${ext}`;

	const bytes = base64ToUint8Array(base64);

	const { error: uploadError } = await supabase.storage
		.from("avatars")
		.upload(path, bytes, {
			contentType: ext === "png" ? "image/png" : "image/jpeg",
			upsert: true,
		});

	if (uploadError) {
		console.log("UPLOAD ERROR:", uploadError);
		throw uploadError;
	}

	const { data } = supabase.storage.from("avatars").getPublicUrl(path);
	const avatarUrl = data.publicUrl;

	const { error: dbErr } = await supabase
		.from("profiles")
		.upsert(
			{ id: user.id, avatar_url: avatarUrl, email: user.email },
			{ onConflict: "id" },
		);

	if (dbErr) {
		console.log("DB ERROR:", dbErr);
		throw dbErr;
	}

	return avatarUrl;
}
