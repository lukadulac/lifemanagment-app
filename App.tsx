import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { AuthScreen } from "./src/auth/screens/AuthScreen";
import { UpdatePasswordScreen } from "./src/auth/screens/UpdatePasswordScreen";
import { supabase } from "./src/lib/supabaseClient";
import { MainTabs } from "./src/navigation/MainTabs";

export type RootStackParamList = {
	Auth: undefined;
	Main: undefined;
	UpdatePassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
	const [user, setUser] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			setUser(data.session?.user ?? null);
			setLoading(false);
		});

		const { data: listener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setUser(session?.user ?? null);
			},
		);

		return () => {
			listener.subscription.unsubscribe();
		};
	}, []);

	if (loading) {
		return (
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
				<ActivityIndicator />
			</View>
		);
	}

	return (
		<NavigationContainer
			linking={{
				prefixes: ["moneytime://"],
				config: {
					screens: {
						UpdatePassword: "update-password",
					},
				},
			}}
		>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{/* AuthCard / login je default kad nema user-a */}
				{!user ? (
					<>
						<Stack.Screen name="Auth" component={AuthScreen} />
						{/* UpdatePassword postoji u stack-u, ali se otvara samo preko deep link-a */}
						<Stack.Screen
							name="UpdatePassword"
							component={UpdatePasswordScreen}
						/>
					</>
				) : (
					<Stack.Screen name="Main" component={MainTabs} />
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}
