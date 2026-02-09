import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import { Dashboard } from "../pages/Dashboard";
import { Money } from "../pages/Money";
import { Settings } from "../pages/Settings";
import { Time } from "../pages/Time";
import { TimeTable } from "../pages/TimeTable";

export type MainTabParamList = {
	Dashboard: undefined;
	Money: undefined;
	Time: undefined;
	Timetable: undefined;
	Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
	return (
		<Tab.Navigator screenOptions={{ headerShown: true }}>
			<Tab.Screen name="Dashboard" component={Dashboard} />
			<Tab.Screen name="Money" component={Money} />
			<Tab.Screen name="Time" component={Time} />
			<Tab.Screen name="Timetable" component={TimeTable} />
			<Tab.Screen name="Settings" component={Settings} />
		</Tab.Navigator>
	);
};
