# Car Service Manager - Mobile App

A professional, production-ready React Native mobile app for managing and tracking car services with dual language support (English & Persian / RTL & LTR).

## 🎯 Features

- **OTP-based Authentication** (Phone number login)
- **Multi-car Management** (Add, edit, delete cars)
- **Service Tracking** (Complete service history with timeline)
- **Smart Reminders** (Date-based and mileage-based)
- **Insurance & Technical Inspection** tracking
- **Educational Insights** (Instagram Stories-style blog)
- **Dual Language Support** (Persian / English with RTL/LTR)
- **Dark/Light Theme** support
- **Offline Support** (Queue operations when offline)
- **Persian Calendar** (Jalali date picker and formatting)
- **Persian Numerals** (Support for Persian and Arabic number input)

## 📱 Platforms

- iOS (11.0+)
- Android (API 21+)

## 🛠 Tech Stack

- **Framework:** Expo SDK 50 + React Native
- **Language:** TypeScript
- **Navigation:** React Navigation v6
- **State Management:** React Context API
- **Styling:** React Native StyleSheet
- **HTTP Client:** Axios
- **Secure Storage:** expo-secure-store
- **Date Handling:** moment-jalaali
- **i18n:** i18n-js + expo-localization

## 📋 Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on physical device (optional)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Backend

Edit `src/config/api.ts` and add your Supabase credentials:

```typescript
export const API_CONFIG = {
  SUPABASE_URL: 'https://your-project-ref.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',
  BASE_URL: 'https://your-project-ref.supabase.co/functions/v1/make-server-cd2dec47',
};
```

### 3. Start Development Server

```bash
npm start
```

This will open Expo DevTools. You can then:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app on physical device

### 4. Run on Specific Platform

```bash
# iOS
npm run ios

# Android
npm run android
```

## 📱 Build for Production

### Setup EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project
eas build:configure
```

### Build Android APK

```bash
# Development build
eas build -p android --profile development

# Production build
eas build -p android --profile production
```

### Build iOS IPA

```bash
# Development build
eas build -p ios --profile development

# Production build (requires Apple Developer account)
eas build -p ios --profile production
```

## 📂 Project Structure

```
mobile-app/
├── App.tsx                 # Root component
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── babel.config.js        # Babel config
├── assets/                # Images, fonts, icons
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
└── src/
    ├── config/            # Configuration files
    │   ├── api.ts         # API configuration
    │   ├── theme.ts       # Theme colors & styles
    │   └── i18n.ts        # Translations
    ├── contexts/          # React Context providers
    │   ├── AuthContext.tsx
    │   ├── ProfileContext.tsx
    │   └── CarsContext.tsx
    ├── navigation/        # Navigation setup
    │   ├── RootNavigator.tsx
    │   ├── AuthNavigator.tsx
    │   └── MainNavigator.tsx
    ├── screens/           # Screen components
    │   ├── auth/
    │   │   ├── PhoneNumberScreen.tsx
    │   │   └── OTPVerificationScreen.tsx
    │   ├── dashboard/
    │   │   └── DashboardScreen.tsx
    │   ├── services/
    │   │   ├── AddServiceScreen.tsx
    │   │   ├── ServiceHistoryScreen.tsx
    │   │   └── ServiceDetailsScreen.tsx
    │   ├── reminders/
    │   │   └── RemindersScreen.tsx
    │   ├── cars/
    │   │   ├── CarManagementScreen.tsx
    │   │   └── AddCarScreen.tsx
    │   └── settings/
    │       └── SettingsScreen.tsx
    ├── components/        # Reusable components
    │   ├── common/
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Card.tsx
    │   │   └── Loading.tsx
    │   ├── cars/
    │   │   └── CarCard.tsx
    │   └── services/
    │       └── ServiceCard.tsx
    ├── services/          # API services
    │   └── api/
    │       ├── client.ts
    │       ├── auth.service.ts
    │       ├── cars.service.ts
    │       ├── services.service.ts
    │       └── reminders.service.ts
    ├── utils/             # Utility functions
    │   ├── storage.ts
    │   ├── persianNumber.ts
    │   ├── jalaliDate.ts
    │   └── format.ts
    └── types/             # TypeScript types
        └── index.ts
```

## 🔧 Configuration

### Environment Variables

Create `.env` file (optional, can use `api.ts` instead):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_BASE_URL=https://your-project-ref.supabase.co/functions/v1/make-server-cd2dec47
```

### Theme Customization

Edit `src/config/theme.ts` to customize colors, spacing, typography, etc.

### Language/Translations

Add or modify translations in `src/config/i18n.ts`.

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## 📝 Key Features Implementation

### Persian/Arabic Number Support

The app supports input in Persian, Arabic, and English numerals. All number inputs automatically normalize to English for API calls.

```typescript
import { toPersianNumber, toEnglishNumber } from '@/utils/persianNumber';

// Display: ۱۲۳۴۵
const displayed = toPersianNumber(12345);

// Input parsing: "۱۲۳۴۵" → 12345
const parsed = parseNumber("۱۲۳۴۵");
```

### Jalali Calendar

Dates are displayed in Persian calendar with Persian numerals when language is set to Persian.

```typescript
import { formatPersianDate } from '@/utils/jalaliDate';

// "۱۳ فروردین ۱۴۰۴"
const formatted = formatPersianDate(new Date());
```

### RTL Support

The app automatically switches to RTL layout when Persian language is selected.

## 🔐 Security

- **Secure Token Storage:** Uses `expo-secure-store` for access/refresh tokens
- **Auto Token Refresh:** Automatically refreshes expired tokens
- **API Security:** All requests include proper authorization headers
- **Input Validation:** Client-side validation before API calls

## 🌐 API Integration

See `/docs/FRONTEND_BACKEND_INTEGRATION.md` for complete API integration guide.

## 📖 Documentation

- [Setup Guide](./QUICKSTART.md) - Quick setup instructions
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Detailed implementation details
- [Project Summary](./PROJECT_SUMMARY.md) - Project overview and architecture
- [API Integration](/docs/FRONTEND_BACKEND_INTEGRATION.md) - Complete API integration map
- [Backend Setup](/supabase/SETUP_GUIDE.md) - Backend configuration guide

## 🤝 Contributing

This is a production-ready template. Feel free to customize for your specific needs.

## 📄 License

MIT License - Feel free to use for your projects

## 🆘 Troubleshooting

### iOS Build Issues

```bash
# Clear iOS build cache
cd ios && pod install && cd ..
```

### Android Build Issues

```bash
# Clear Android build cache
cd android && ./gradlew clean && cd ..
```

### Metro Bundler Issues

```bash
# Clear Metro cache
expo start -c
```

### Can't connect to backend

1. Check `src/config/api.ts` has correct Supabase URL and keys
2. Ensure backend is deployed and running
3. Check device/simulator internet connection
4. Verify API endpoint URLs are correct

## 📞 Support

For backend setup, see `/supabase/SETUP_GUIDE.md`
For API integration, see `/docs/FRONTEND_BACKEND_INTEGRATION.md`

---

Built with ❤️ using Expo and React Native
