import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../../lib/supabaseClient';

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const title = useMemo(() => {
    if (isReset) return 'Reset password 🔑';
    return isLogin ? 'Welcome back 👋' : 'Create account ✨';
  }, [isLogin, isReset]);

  const subtitle = useMemo(() => {
    if (isReset) return 'Unesi email i poslaćemo ti link za reset';
    return isLogin ? 'Login da upravljaš novcem & vremenom' : 'Kreni da upravljaš novcem & vremenom';
  }, [isLogin, isReset]);

  const runCooldown = () => {
    setCooldown(true);
    setTimeout(() => setCooldown(false), 60_000);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError('Unesi email.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password mora imati bar 6 karaktera.');
      setLoading(false);
      return;
    }

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password });

    if (error) setError(error.message);
    else {
      setMessage(isLogin ? 'Uspešno logovan!' : 'Proveri email da potvrdiš registraciju.');
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Unesi email prvo.');
      return;
    }
    if (cooldown) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    // IMPORTANT: set your Expo scheme (e.g. moneytime) and use it here:
    const redirectTo = 'moneytime://update-password';

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      runCooldown();
      return;
    }

    setMessage(`Reset link je poslat na ${email}. Proveri email.`);
    runCooldown();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.h1}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {message ? (
          <View style={styles.okBox}>
            <Text style={styles.okText}>{message}</Text>
          </View>
        ) : null}

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        {!isReset ? (
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password (min 6)"
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={isReset ? handleReset : handleSubmit}
          disabled={loading || (isReset && cooldown)}
          style={[styles.primaryBtn, (loading || (isReset && cooldown)) && styles.btnDisabled]}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.primaryBtnText}>
              {isReset ? (cooldown ? 'Sačekaj malo...' : 'Pošalji reset link') : isLogin ? 'Login' : 'Register'}
            </Text>
          )}
        </Pressable>

        {isLogin && !isReset ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setIsReset(true);
              setError(null);
              setMessage(null);
            }}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
        ) : null}

        {isReset ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setIsReset(false);
              setError(null);
              setMessage(null);
            }}
          >
            <Text style={styles.link}>Back to login</Text>
          </Pressable>
        ) : null}

        {!isReset ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setIsLogin((v) => !v);
              setError(null);
              setMessage(null);
            }}
          >
            <Text style={styles.link}>
              {isLogin ? 'Nemate nalog? Registrujte se' : 'Već imate nalog? Prijavite se'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 420, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#333', gap: 10 },
  h1: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { textAlign: 'center', opacity: 0.75, marginBottom: 4 },

  input: { borderWidth: 1, borderColor: '#444', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },

  primaryBtn: { paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#444', alignItems: 'center' },
  primaryBtnText: { fontWeight: '600' },
  btnDisabled: { opacity: 0.6 },

  link: { textAlign: 'center', textDecorationLine: 'underline', marginTop: 4 },

  errorBox: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#a33' },
  errorText: { fontSize: 13 },

  okBox: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#2a6' },
  okText: { fontSize: 13 },
});
