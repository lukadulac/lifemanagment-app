import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Page = "Dashboard" | "Novac" | "Spisak" | "Vreme" | "Nalog";

interface UIState {
	page: Page;
	setPage: (page: Page) => void;
}

export const useUI = create<UIState>()(
	persist(
		(set) => ({
			page: "Dashboard",
			setPage: (page) => set({ page }),
		}),
		{
			name: "ui-storage",
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
