import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Easing,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Modal from "react-native-modal";
import { MonthKey, lastMonths, monthLabel } from "../utils/moneyFormat";

type Props = {
	value: MonthKey;
	onChange: (m: MonthKey) => void;
	monthsCount?: number; // default 6
};

export function MonthDropdown({ value, onChange, monthsCount = 6 }: Props) {
	const [open, setOpen] = useState(false);

	const months = useMemo(() => lastMonths(monthsCount), [monthsCount]);
	const selectedLabel = monthLabel(value);

	const rotateAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.timing(rotateAnim, {
			toValue: open ? 1 : 0,
			duration: 180,
			easing: Easing.out(Easing.ease),
			useNativeDriver: true,
		}).start();
	}, [open]);
	const rotate = rotateAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "180deg"],
	});

	return (
		<>
			<Pressable
				onPress={() => setOpen(true)}
				style={({ pressed }) => [styles.trigger, pressed && { opacity: 0.85 }]}
			>
				<Text style={styles.triggerText} numberOfLines={1}>
					{selectedLabel}
				</Text>
				<Animated.View style={{ transform: [{ rotate }] }}>
					<Image
						source={require("../../../../assets/images/down-arrow.png")}
						style={styles.chevIcon}
						resizeMode="contain"
					/>
				</Animated.View>
			</Pressable>

			<Modal
				isVisible={open}
				onBackdropPress={() => setOpen(false)}
				onBackButtonPress={() => setOpen(false)}
				backdropOpacity={0.35}
				useNativeDriver
				style={styles.modal}
			>
				<View style={styles.sheet}>
					<Text style={styles.sheetTitle}>Izaberi mesec</Text>

					<FlatList
						data={months}
						keyExtractor={(k) => k}
						ItemSeparatorComponent={() => <View style={styles.sep} />}
						renderItem={({ item }) => {
							const active = item === value;

							return (
								<Pressable
									onPress={() => {
										onChange(item);
										setOpen(false);
									}}
									style={({ pressed }) => [
										styles.item,
										active && styles.itemActive,
										pressed && { opacity: 0.85 },
									]}
								>
									<Text
										style={[styles.itemText, active && styles.itemTextActive]}
									>
										{monthLabel(item)}
									</Text>
									{active ? <Text style={styles.check}>✓</Text> : null}
								</Pressable>
							);
						}}
					/>

					<Pressable onPress={() => setOpen(false)} style={styles.closeBtn}>
						<Text style={styles.closeText}>Zatvori</Text>
					</Pressable>
				</View>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	trigger: {
		height: 42,
		width: "100%",
		paddingHorizontal: 12,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#4B5563", // gray-600
		backgroundColor: "#111827", // gray-900
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	triggerText: {
		color: "white",
		fontSize: 14,
		fontWeight: "600",
		flex: 1,
		paddingRight: 8,
	},
	chevIcon: {
		width: 16,
		height: 16,
		tintColor: "#FFFFFF", // ⬅️ bela boja
	},

	chev: {
		color: "white",
		opacity: 0.9,
		fontSize: 14,
		width: 18,
		textAlign: "right",
	},

	modal: {
		justifyContent: "center",
		margin: 16,
	},
	sheet: {
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#374151", // gray-700
		backgroundColor: "#1F2937", // gray-800
		padding: 14,
		maxHeight: 420,
	},
	sheetTitle: {
		color: "white",
		fontSize: 16,
		fontWeight: "800",
		marginBottom: 10,
		textAlign: "center",
	},
	sep: {
		height: 1,
		backgroundColor: "#374151",
		opacity: 0.8,
	},
	item: {
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderRadius: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	itemActive: {
		backgroundColor: "#111827",
		borderWidth: 1,
		borderColor: "#4B5563",
	},
	itemText: {
		color: "#E5E7EB",
		fontSize: 14,
		fontWeight: "600",
	},
	itemTextActive: {
		color: "white",
	},
	check: {
		color: "#34D399", // green-400
		fontWeight: "900",
		fontSize: 16,
	},

	closeBtn: {
		marginTop: 12,
		height: 42,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#4B5563",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#111827",
	},
	closeText: {
		color: "white",
		fontWeight: "800",
	},
});
