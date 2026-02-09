import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const Dashboard = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Dashboard</Text>
      <Text style={styles.text}>Ovo je RN placeholder. Sledeće prepisujemo UI iz web verzije.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  h1: { fontSize: 22, fontWeight: '700' },
  text: { fontSize: 14 },
});
