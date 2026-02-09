import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabaseClient';

export const Settings = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Settings</Text>

      <Pressable
        accessibilityRole="button"
        style={styles.btn}
        onPress={() => supabase.auth.signOut()}
      >
        <Text style={styles.btnText}>Logout</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  h1: { fontSize: 22, fontWeight: '700' },
  btn: { paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#444', alignItems: 'center' },
  btnText: { fontWeight: '600' },
});
