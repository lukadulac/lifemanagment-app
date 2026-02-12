import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Account } from "../pages/Account";
import { Dashboard } from "../pages/Dashboard";
import { Money } from "../pages/Money";
import { Time } from "../pages/Time";
import { TimeTable } from "../pages/TimeTable";

const Tab = createBottomTabNavigator();

export function MainTabs() {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,

				tabBarStyle: {
					backgroundColor: "#111827",
					borderTopColor: "#374151",
					borderTopWidth: 1,
					height: 84,
					paddingBottom: 10,
					paddingTop: 8,
					paddingLeft: 10,
					paddingRight: 10,
				},

				tabBarActiveTintColor: "#34D399",
				tabBarInactiveTintColor: "#9CA3AF",

				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: "600",
				},

				tabBarIcon: ({ focused, color, size }) => {
					let iconName: keyof typeof Ionicons.glyphMap;

					switch (route.name) {
						case "Dashboard":
							iconName = focused ? "speedometer" : "speedometer-outline";
							break;
						case "Novac":
							iconName = focused ? "wallet" : "wallet-outline";
							break;
						case "Time":
							iconName = focused ? "time" : "time-outline";
							break;
						case "Vreme":
							iconName = focused ? "calendar" : "calendar-outline";
							break;
						case "Nalog":
							iconName = focused ? "person" : "person-outline";
							break;
						default:
							iconName = "ellipse";
					}

					return <Ionicons name={iconName} size={size} color={color} />;
				},
			})}
		>
			<Tab.Screen name="Dashboard" component={Dashboard} />
			<Tab.Screen name="Novac" component={Money} />
			<Tab.Screen name="Time" component={Time} />
			<Tab.Screen name="Vreme" component={TimeTable} />
			<Tab.Screen name="Nalog" component={Account} />
		</Tab.Navigator>
	);
}
