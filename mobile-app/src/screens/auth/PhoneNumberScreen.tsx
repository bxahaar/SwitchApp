import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthStackParamList } from '../../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../config/theme';
import { normalizePhoneNumber, formatPhoneNumber } from '../../utils/persianNumber';
import apiClient from '../../services/api/client';
import { ENDPOINTS } from '../../config/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneNumber'>;

export default function PhoneNumberScreen({ navigation }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    // Validate phone number
    if (phoneNumber.length < 10) {
      setError('شماره تلفن نامعتبر است');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const normalized = normalizePhoneNumber(phoneNumber);
      
      await apiClient.post(ENDPOINTS.SEND_OTP, {
        phoneNumber: normalized,
        language: 'fa',
      });

      // Success - navigate to OTP screen
      navigation.navigate('OTPVerification', { phoneNumber: normalized });
    } catch (err: any) {
      const message = err.response?.data?.error || 'خطا در ارسال کد تایید';
      setError(message);
      Alert.alert('خطا', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Switch</Text>
            <Text style={styles.subtitle}>مدیریت سرویس خودرو</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>ورود به حساب کاربری</Text>
            <Text style={styles.description}>
              لطفا شماره موبایل خود را وارد کنید
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  setError('');
                }}
                keyboardType="phone-pad"
                maxLength={11}
                textAlign="right"
                editable={!loading}
              />
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.button,
                (loading || phoneNumber.length < 10) && styles.buttonDisabled,
              ]}
              onPress={handleSendOTP}
              disabled={loading || phoneNumber.length < 10}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <Text style={styles.buttonText}>ارسال کد تایید</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              با ورود به حساب کاربری، شرایط و قوانین را می‌پذیرید
            </Text>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.background,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.background,
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.lg,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    textAlign: 'right',
    marginBottom: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginTop: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  termsText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
