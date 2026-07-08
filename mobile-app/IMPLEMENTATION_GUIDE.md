# Implementation Guide - Complete File Structure

This document lists all files that need to be created for a complete React Native app.

## ✅ Already Created Files

```
mobile-app/
├── App.tsx                                    ✅ Created
├── app.json                                   ✅ Created
├── package.json                               ✅ Created
├── tsconfig.json                              ✅ Created
├── README.md                                  ✅ Created
└── src/
    ├── config/
    │   ├── api.ts                            ✅ Created
    │   └── theme.ts                          ✅ Created
    ├── contexts/
    │   ├── AuthContext.tsx                   ✅ Created
    │   ├── ProfileContext.tsx                ✅ Created
    │   └── CarsContext.tsx                   ✅ Created
    ├── navigation/
    │   ├── AuthNavigator.tsx                 ✅ Created
    │   └── MainNavigator.tsx                 ✅ Created
    ├── screens/
    │   └── auth/
    │       └── PhoneNumberScreen.tsx         ✅ Created
    ├── services/
    │   └── api/
    │       └── client.ts                     ✅ Created
    ├── types/
    │   └── index.ts                          ✅ Created
    └── utils/
        ├── persianNumber.ts                  ✅ Created
        ├── jalaliDate.ts                     ✅ Created
        ├── format.ts                         ✅ Created
        └── storage.ts                        ✅ Created
```

## 📝 Files to Create

### 1. Authentication Screens

**src/screens/auth/OTPVerificationScreen.tsx**
```typescript
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { toEnglishNumber } from '../../utils/persianNumber';
import apiClient from '../../services/api/client';
import { ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONT_SIZE } from '../../config/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerification'>;

export default function OTPVerificationScreen({ route, navigation }: Props) {
  const { phoneNumber } = route.params;
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const normalized = toEnglishNumber(value);
    if (!/^\d*$/.test(normalized)) return;

    const newOtp = [...otp];
    newOtp[index] = normalized;
    setOtp(newOtp);

    // Auto-focus next input
    if (normalized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every((digit) => digit) && index === 5) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleVerifyOTP = async (code: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post(ENDPOINTS.VERIFY_OTP, {
        phoneNumber,
        otpCode: code,
      });

      await login(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.user
      );
    } catch (err) {
      Alert.alert('خطا', 'کد وارد شده اشتباه است');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Implement resend OTP
    setCountdown(60);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>کد تایید را وارد کنید</Text>
      <Text style={styles.description}>
        کد ۶ رقمی به شماره {phoneNumber} ارسال شد
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.otpInput}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            editable={!loading}
          />
        ))}
      </View>

      {loading && <ActivityIndicator size="large" color={COLORS.primary} />}

      <TouchableOpacity
        style={[styles.resendButton, countdown > 0 && styles.buttonDisabled]}
        onPress={handleResend}
        disabled={countdown > 0}
      >
        <Text style={styles.resendText}>
          {countdown > 0 ? `ارسال مجدد (${countdown}s)` : 'ارسال مجدد'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: SPACING.xl,
  },
  otpContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  resendButton: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  resendText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
```

### 2. Dashboard Screen

**src/screens/dashboard/DashboardScreen.tsx**
```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCars } from '../../contexts/CarsContext';
import { Dashboard } from '../../types';
import apiClient from '../../services/api/client';
import { ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONT_SIZE } from '../../config/theme';
import { formatPrice, formatMileage } from '../../utils/format';
import { formatPersianDateShort } from '../../utils/jalaliDate';

export default function DashboardScreen() {
  const { cars, setCars, selectedCarId, selectCar } = useCars();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.DASHBOARD);
      setDashboard(response.data);
      setCars(response.data.cars);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const selectedCar = cars.find((c) => c.id === selectedCarId);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>داشبورد</Text>
        </View>

        {/* Selected Car Card */}
        {selectedCar && (
          <View style={styles.carCard}>
            <Text style={styles.carName}>
              {selectedCar.brand} {selectedCar.model}
            </Text>
            <Text style={styles.carMileage}>
              {formatMileage(selectedCar.currentMileage || 0)}
            </Text>
          </View>
        )}

        {/* Upcoming Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سرویس‌های پیش‌رو</Text>
          {dashboard?.upcomingReminders.slice(0, 3).map((reminder) => (
            <TouchableOpacity key={reminder.id} style={styles.reminderCard}>
              <Text style={styles.reminderTitle}>{reminder.title}</Text>
              {reminder.dueDate && (
                <Text style={styles.reminderDate}>
                  {formatPersianDateShort(reminder.dueDate)}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سرویس‌های اخیر</Text>
          {dashboard?.recentServices.slice(0, 5).map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>
                {service.category?.nameFa || 'سرویس'}
              </Text>
              <Text style={styles.serviceDate}>
                {formatPersianDateShort(service.serviceDate)}
              </Text>
              <Text style={styles.serviceCost}>
                {formatPrice(service.cost || 0)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    textAlign: 'right',
  },
  carCard: {
    backgroundColor: COLORS.primary,
    margin: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: 16,
  },
  carName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.background,
    textAlign: 'right',
  },
  carMileage: {
    fontSize: FONT_SIZE.md,
    color: COLORS.background,
    opacity: 0.9,
    textAlign: 'right',
    marginTop: SPACING.sm,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: SPACING.md,
  },
  reminderCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  reminderTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    textAlign: 'right',
  },
  reminderDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  serviceCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  serviceTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    textAlign: 'right',
  },
  serviceDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  serviceCost: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
});
```

### 3. Add Service Screen

**src/screens/services/AddServiceScreen.tsx**
```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE } from '../../config/theme';

export default function AddServiceScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>افزودن سرویس</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.message}>
          این صفحه برای افزودن سرویس جدید است
        </Text>
        {/* Implement service form here */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    textAlign: 'right',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  message: {
    fontSize: FONT_SIZE.md,
    textAlign: 'right',
    color: COLORS.textSecondary,
  },
});
```

### 4. Settings Screen

**src/screens/settings/SettingsScreen.tsx**
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import { COLORS, SPACING, FONT_SIZE } from '../../config/theme';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { language, theme, updateLanguage, updateTheme } = useProfile();

  const handleLogout = () => {
    Alert.alert(
      'خروج از حساب',
      'آیا مطمئن هستید؟',
      [
        { text: 'انصراف', style: 'cancel' },
        { text: 'خروج', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>تنظیمات</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => updateLanguage(language === 'fa' ? 'en' : 'fa')}
        >
          <Text style={styles.settingText}>
            زبان: {language === 'fa' ? 'فارسی' : 'English'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => updateTheme(theme === 'light' ? 'dark' : 'light')}
        >
          <Text style={styles.settingText}>
            تم: {theme === 'light' ? 'روشن' : 'تیره'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>خروج از حساب</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    textAlign: 'right',
  },
  section: {
    padding: SPACING.lg,
  },
  settingItem: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  settingText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'right',
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    marginTop: SPACING.xl,
  },
  logoutText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.background,
    fontWeight: '700',
    textAlign: 'center',
  },
});
```

### 5. Assets Folder

Create these placeholder images in the `assets/` folder:

- **icon.png** (1024x1024) - App icon
- **splash.png** (1284x2778) - Splash screen
- **adaptive-icon.png** (1024x1024) - Android adaptive icon
- **favicon.png** (48x48) - Web favicon (optional)

You can use a simple purple gradient or logo for these.

## 🚀 Running the App

1. Install dependencies:
```bash
cd mobile-app
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Run on device:
- Scan QR code with Expo Go app (iOS/Android)
- Press `i` for iOS simulator
- Press `a` for Android emulator

## 📦 Additional Screens to Implement

Based on the integration guide, create these screens:

- ServiceHistoryScreen
- ServiceDetailsScreen
- UpcomingServicesScreen
- CarManagementScreen
- AddCarScreen
- EditCarScreen
- InsuranceScreen
- TechnicalInspectionScreen
- InsightsScreen

Each follows the same pattern as the examples above.

## 🎨 Common Components to Create

Create reusable components in `src/components/`:

- Button.tsx
- Card.tsx
- Input.tsx
- Loading.tsx
- EmptyState.tsx
- ErrorState.tsx
- Modal.tsx
- DatePicker.tsx

## ✅ Final Checklist

- [ ] All screens created
- [ ] All API services implemented
- [ ] Navigation properly configured
- [ ] Assets added to /assets folder
- [ ] API_CONFIG updated with real credentials
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] RTL layout verified for Persian

## 📚 References

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- Backend API: `/docs/FRONTEND_BACKEND_INTEGRATION.md`
- Database Schema: `/supabase/DATABASE_SCHEMA.md`
