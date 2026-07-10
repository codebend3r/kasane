import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth, useAuthEmail, useAuthStatus } from "@/state/auth";
import type { PressableState } from "@/types";
import { FONT } from "@/theme";

type Mode = "signIn" | "signUp";

const MODE_COPY: Record<
  Mode,
  { title: string; submit: string; switchLabel: string }
> = {
  signIn: {
    title: "Sign in",
    submit: "Sign in",
    switchLabel: "Need an account? Create one",
  },
  signUp: {
    title: "Create account",
    submit: "Create account",
    switchLabel: "Already have an account? Sign in",
  },
};

export default function LoginScreen() {
  const status = useAuthStatus();

  return (
    <View style={styles.root}>
      <View style={styles.panel}>
        <Text style={styles.eyebrow}>Account</Text>
        {status === "loading" && <ActivityIndicator color="#7c5cff" />}
        {status === "signedIn" && <AccountView />}
        {status === "signedOut" && <AuthForm />}
      </View>
    </View>
  );
}

function AccountView() {
  const email = useAuthEmail();
  const signOut = useAuth((s) => s.signOut);
  const [error, setError] = useState<string | null>(null);

  const onSignOut = async () => {
    setError(null);
    const message = await signOut();
    if (message) setError(message);
  };

  return (
    <View style={styles.stack}>
      <Text style={styles.title}>Signed in</Text>
      <Text style={styles.emailLine}>{email ?? "—"}</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable
        onPress={onSignOut}
        style={({ hovered, pressed }: PressableState) => [
          styles.button,
          { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
        ]}
      >
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

function AuthForm() {
  const signIn = useAuth((s) => s.signIn);
  const signUp = useAuth((s) => s.signUp);
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const copy = MODE_COPY[mode];
  const canSubmit = !busy && !!email.trim() && !!password;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    const action = mode === "signIn" ? signIn : signUp;
    const message = await action(email.trim(), password);
    setBusy(false);
    if (message) {
      setError(message);
    } else if (mode === "signUp") {
      setConfirmationSent(true);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "signIn" ? "signUp" : "signIn"));
    setError(null);
  };

  if (confirmationSent) {
    return (
      <View style={styles.stack}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.hint}>
          We sent a confirmation link to {email.trim()}. Click it, then sign in
          here.
        </Text>
        <Pressable
          onPress={() => {
            setConfirmationSent(false);
            setMode("signIn");
            setPassword("");
          }}
          style={({ hovered, pressed }: PressableState) => [
            styles.button,
            { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>Back to sign in</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <Text style={styles.title}>{copy.title}</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#6b7177"
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        keyboardType="email-address"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#6b7177"
        style={styles.input}
        secureTextEntry
        autoCapitalize="none"
        autoComplete={mode === "signIn" ? "password" : "password-new"}
        onSubmitEditing={submit}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable
        onPress={submit}
        disabled={!canSubmit}
        style={({ hovered, pressed }: PressableState) => [
          styles.button,
          !canSubmit && styles.buttonDisabled,
          { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
        ]}
      >
        {busy ? (
          <ActivityIndicator color="#0c0c0e" />
        ) : (
          <Text style={styles.buttonText}>{copy.submit}</Text>
        )}
      </Pressable>
      <Pressable
        onPress={switchMode}
        hitSlop={6}
        style={({ hovered, pressed }: PressableState) => [
          { opacity: pressed ? 0.6 : hovered ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.switchLabel}>{copy.switchLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, alignItems: "center" },
  panel: {
    width: "100%",
    maxWidth: 420,
    gap: 16,
    paddingTop: 32,
  },
  stack: { gap: 16 },
  eyebrow: {
    color: "#7c5cff",
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  title: {
    color: "#f5f5f5",
    fontSize: 22,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  emailLine: {
    color: "#cfd2d6",
    fontSize: 16,
    fontFamily: FONT.medium,
  },
  hint: {
    color: "#cfd2d6",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONT.regular,
  },
  input: {
    backgroundColor: "#17181b",
    color: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: FONT.medium,
    borderLeftWidth: 4,
    borderLeftColor: "#7c5cff",
  },
  error: {
    color: "#ff7c5c",
    fontSize: 14,
    fontFamily: FONT.medium,
  },
  button: {
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: "#7c5cff",
  },
  buttonDisabled: { backgroundColor: "#2a2c30" },
  buttonText: {
    color: "#0c0c0e",
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  switchLabel: {
    color: "#9aa0a6",
    fontSize: 13,
    fontFamily: FONT.medium,
  },
});
