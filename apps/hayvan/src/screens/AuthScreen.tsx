import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useI18n } from '../i18n/useI18n';

type Mode = 'signin' | 'signup';

interface Props {
  onContinueOffline: () => void;
}

export function AuthScreen({ onContinueOffline }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const localizeError = (msg: string): string => {
    if (/invalid login/i.test(msg)) return t('auth.errInvalidLogin' as any);
    if (/already registered/i.test(msg)) return t('auth.errAlreadyRegistered' as any);
    if (/email/i.test(msg) && /not confirmed/i.test(msg)) return t('auth.errNotConfirmed' as any);
    if (/network/i.test(msg)) return t('auth.errNetwork' as any);
    return msg;
  };

  const handleEmail = async () => {
    if (!isSupabaseConfigured) {
      setError(t('auth.errorNotConfigured' as any));
      return;
    }
    if (!email.trim() || password.length < 6) {
      setError(t('auth.errorInvalidInput' as any));
      return;
    }
    setError(null); setInfo(null); setLoading(true);
    try {
      if (mode === 'signin') {
        const { error: e } = await supabase.auth.signInWithPassword({
          email: email.trim(), password,
        });
        if (e) setError(localizeError(e.message));
      } else {
        const { error: e } = await supabase.auth.signUp({
          email: email.trim(), password,
        });
        if (e) setError(localizeError(e.message));
        else setInfo(t('auth.infoEmailSent' as any));
      }
    } catch {
      setError(t('auth.errorGeneric' as any));
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    if (!isSupabaseConfigured) {
      setError(t('auth.errorNotConfiguredShort' as any));
      return;
    }
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        setError(t('auth.errorAppleFailed' as any));
        return;
      }
      const { error: e } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (e) setError(localizeError(e.message));
    } catch (err: unknown) {
      if ((err as { code?: string })?.code !== 'ERR_REQUEST_CANCELED') {
        setError(t('auth.errorAppleError' as any));
      }
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + Spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.symbol}>✦</Text>
      <Text style={styles.title}>TURA</Text>
      <Text style={styles.subtitle}>
        {t('auth.subtitle' as any)}
      </Text>

      <View style={styles.divider} />

      {Platform.OS === 'ios' && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={
            mode === 'signin'
              ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              : AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
          }
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={BorderRadius.round}
          style={styles.appleBtn}
          onPress={handleApple}
        />
      )}

      <Text style={styles.orLabel}>{t('auth.orLabel' as any)}</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.emailPlaceholder' as any)}
        placeholderTextColor={Colors.textMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.passwordPlaceholder' as any)}
        placeholderTextColor={Colors.textMuted}
        secureTextEntry
        autoCapitalize="none"
      />

      {error && <Text style={styles.error}>{error}</Text>}
      {info && <Text style={styles.info}>{info}</Text>}

      <TouchableOpacity
        style={[styles.primaryBtn, { opacity: loading ? 0.5 : 1 }]}
        onPress={handleEmail}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#1A1208" />
          : <Text style={styles.primaryBtnText}>
              {mode === 'signin' ? t('auth.signinBtn' as any) : t('auth.signupBtn' as any)}
            </Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null); }}
        style={styles.switchBtn}
      >
        <Text style={styles.switchText}>
          {mode === 'signin' ? t('auth.toSignup' as any) : t('auth.toSignin' as any)}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomSection}>
        <View style={styles.dividerThin} />
        <TouchableOpacity onPress={onContinueOffline} style={styles.offlineBtn}>
          <Text style={styles.offlineText}>{t('auth.offlineBtn' as any)}</Text>
          <Text style={styles.offlineHint}>{t('auth.offlineHint' as any)}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  symbol: {
    fontSize: 36,
    color: Colors.gold,
    opacity: 0.7,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.size.sm * 1.7,
    marginTop: Spacing.sm,
  },
  divider: {
    width: 32, height: 1,
    backgroundColor: Colors.gold,
    opacity: 0.3,
    marginVertical: Spacing.xl,
  },
  appleBtn: {
    width: '100%',
    height: 48,
    marginBottom: Spacing.sm,
  },
  orLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginVertical: Spacing.md,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundCard,
    marginBottom: Spacing.sm,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  primaryBtnText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: '#1A1208',
    letterSpacing: 1,
  },
  switchBtn: { paddingVertical: Spacing.md },
  switchText: {
    fontSize: Typography.size.sm,
    color: Colors.gold,
    opacity: 0.8,
  },
  error: {
    fontSize: Typography.size.xs,
    color: '#E57373',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  info: {
    fontSize: Typography.size.xs,
    color: Colors.tealLight,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  bottomSection: { width: '100%', marginTop: Spacing.xl, alignItems: 'center' },
  dividerThin: {
    width: '100%', height: 1,
    backgroundColor: Colors.divider,
    marginBottom: Spacing.lg,
  },
  offlineBtn: { alignItems: 'center', paddingVertical: Spacing.md },
  offlineText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  offlineHint: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
