import React, { useEffect, useMemo, useState } from 'react';
import * as Linking from 'expo-linking';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../../lib/supabaseClient';

function parseHashParams(url: string): Record<string, string> {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return {};
  const hash = url.slice(hashIndex + 1);
  const params = new URLSearchParams(hash);
  const out: Record<string, string> = {};
  params.forEach((v, k) => (out[k] = v));
  return out;
}

export const UpdatePasswordScreen = () => {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => password.length >= 6 && password === confirm, [password, confirm]);

  useEffect(() => {
    // On open: grab tokens from deep link and set supabase session.
    const init = async () => {
      try {
        const initial = await Linking.getInitialURL();
        if (initial) {
          const p = parseHashParams(initial);
          if (p.access_token && p.refresh_token) {
            await supabase.auth.setSession({
              access_token: p.access_token,
              refresh_token: p.refresh_token,
            });
          }
        }
      } catch (e) {
        // ignore
      } finally {
        setReady(true);
      }
    };

    void init();

    const sub = Linking.addEventListener('url', async ({ url }) => {
      const p = parseHashParams(url);
      if (p.access_token && p.refresh_token) {
        await supabase.auth.setSession({
          access_token: p.access_token,
          refresh_token: p.refresh_token,
        });
      }
      setReady(true);
    });

    return () => sub.remove();
  }, []);

  const onUpdate = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      Alert.alert('Uspešno', 'Password je promenjen. Možeš da se uloguješ.');
      // optional: supabase.auth.signOut();
    } catch (e: any) {
      Alert.alert('Greška', e?.message ?? 'Neuspešna promena lozinke.');
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.text}>Učitavanje...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.h1}>Update password</Text>
        <Text style={styles.subtitle}>Unesi novu lozinku (min 6 karaktera)</Text>

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Nova lozinka"
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Potvrdi lozinku"
          secureTextEntry
          style={styles.input}
        />

        <Pressable
          accessibilityRole="button"
          onPress={onUpdate}
          disabled={!canSubmit || loading}
          style={[styles.primaryBtn, (!canSubmit || loading) && styles.btnDisabled]}
        >
          {loading ? <ActivityIndicator /> : <Text style={styles.primaryBtnText}>Promeni lozinku</Text>}
        </Pressable>

        {!canSubmit ? (
          <Text style={styles.hint}>
            {password.length < 6 ? 'Lozinka mora imati bar 6 karaktera.' : 'Lozinke se ne poklapaju.'}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  text: { fontSize: 14 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 420, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#333', gap: 10 },
  h1: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { textAlign: 'center', opacity: 0.75, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#444', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  primaryBtn: { paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#444', alignItems: 'center' },
  primaryBtnText: { fontWeight: '600' },
  btnDisabled: { opacity: 0.6 },
  hint: { fontSize: 12, opacity: 0.75, textAlign: 'center', marginTop: 4 },
});
