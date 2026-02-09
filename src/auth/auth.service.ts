import { supabase } from "../lib/supabaseClient";
import type {
    ResetPasswordInput,
    SignInInput,
    SignUpInput,
    UpdatePasswordInput,
} from "./auth.types";

const normalize = (s: string) => s.trim().toLowerCase();
const isEmail = (v: string) => v.includes("@");

async function resolveEmailFromIdentifier(identifier: string): Promise<string> {
	const id = normalize(identifier);
	if (isEmail(id)) return id;

	// username -> email iz profiles
	const { data, error } = await supabase
		.from("profiles")
		.select("email")
		.eq("username", id)
		.maybeSingle();

	if (error) throw error;
	if (!data?.email) throw new Error("Pogrešan username/email ili lozinka.");

	return data.email;
}

export const authService = {
	async signIn(input: SignInInput) {
		const email = await resolveEmailFromIdentifier(input.identifier);
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password: input.password,
		});
		if (error) throw error;
		return data;
	},

	async signUp(input: SignUpInput) {
		const email = normalize(input.email);
		const username = normalize(input.username);

		const { data, error } = await supabase.auth.signUp({
			email,
			password: input.password,
		});
		if (error) throw error;

		const userId = data.user?.id;
		if (userId) {
			// upisi u profiles: username + email (da radi username login)
			const { error: upErr } = await supabase
				.from("profiles")
				.upsert({ id: userId, username, email }, { onConflict: "id" });

			if (upErr) throw upErr;
		}

		return data;
	},

	async resetPassword(input: ResetPasswordInput) {
		const email = normalize(input.email);
		const redirectTo = input.redirectTo ?? "moneytime://update-password";

		const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo,
		});
		if (error) throw error;
		return data;
	},

	async updatePassword(input: UpdatePasswordInput) {
		const { data, error } = await supabase.auth.updateUser({
			password: input.password,
		});
		if (error) throw error;
		return data;
	},

	async signOut() {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	},
};
