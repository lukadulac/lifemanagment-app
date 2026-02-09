import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as
	| string
	| undefined;

if (!supabaseUrl || !supabaseAnonKey) {
	// Don't crash the app in dev; just make it obvious.
	// eslint-disable-next-line no-console
	console.warn(
		"Missing Supabase env vars. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.",
	);
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
	auth: {
		storage: AsyncStorage,
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: false,
	},
});
