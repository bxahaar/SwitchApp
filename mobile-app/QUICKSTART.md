# Quick Start Guide - Car Service Manager Mobile App

Get the app running in 5 minutes!

## ⚡ Quick Setup

### 1. Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check npm
npm --version

# Install Expo CLI globally (if not installed)
npm install -g expo-cli
```

### 2. Install Dependencies

```bash
cd mobile-app
npm install
```

This will install all required packages including:
- React Native & Expo
- React Navigation
- Axios for API calls
- Persian date/number utilities
- Secure storage
- And more...

### 3. Configure Backend Connection

**IMPORTANT:** Edit `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT-REF.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR-ANON-KEY-HERE',
  BASE_URL: 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/make-server-cd2dec47',
};
```

Replace:
- `YOUR-PROJECT-REF` with your Supabase project reference
- `YOUR-ANON-KEY-HERE` with your Supabase anonymous key

**Where to find these:**
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy "Project URL" and "anon public" key

### 4. Start the App

```bash
npm start
```

This opens Expo DevTools in your browser.

### 5. Run on Device/Simulator

**Option A: Physical Device (Recommended)**
1. Install "Expo Go" app from:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scan the QR code shown in terminal/browser
3. App will load on your device

**Option B: iOS Simulator (Mac only)**
```bash
npm run ios
# Or press 'i' in the Expo DevTools terminal
```

**Option C: Android Emulator**
```bash
npm run android
# Or press 'a' in the Expo DevTools terminal
```

## 🎯 First Launch

1. **App opens** → You see splash screen
2. **Login screen** appears
3. Enter phone number (e.g., `09123456789` or `+989123456789`)
4. Tap "Send Code"
5. Enter OTP code received via SMS
6. **Dashboard loads** with your cars and services

## 🔧 Common Issues & Solutions

### Issue: "Network request failed"

**Solution:** Check backend configuration
```bash
# Verify your API config
cat src/config/api.ts

# Make sure URLs don't contain "your-project-ref"
```

### Issue: "Expo CLI not found"

**Solution:** Install globally
```bash
npm install -g expo-cli
```

### Issue: Can't connect on physical device

**Solution:** Ensure same WiFi network
- Phone and computer must be on same WiFi
- Some corporate/public WiFi blocks device discovery
- Try USB connection: `expo start --tunnel`

### Issue: Metro bundler won't start

**Solution:** Clear cache
```bash
expo start -c
```

### Issue: iOS build fails

**Solution:** Update CocoaPods
```bash
cd ios
pod install
cd ..
```

### Issue: Android build fails

**Solution:** Clean build
```bash
cd android
./gradlew clean
cd ..
```

## 📱 Test Features

Once app is running, try these features:

1. **Login Flow**
   - Enter phone number
   - Receive OTP
   - Login successful

2. **Add Your First Car**
   - Tap "Add Car" on dashboard
   - Fill in brand, model, year
   - Save

3. **Add a Service**
   - Select car
   - Tap "Add Service"
   - Choose service type (e.g., Oil Change)
   - Select checklist items
   - Save

4. **Set a Reminder**
   - Go to "Upcoming Services"
   - Tap "+"
   - Set due date or mileage
   - Save

## 🎨 Customization Quick Tips

### Change Primary Color

Edit `src/config/theme.ts`:
```typescript
export const COLORS = {
  primary: '#5E59C0', // Change this hex color
  // ...
};
```

### Add/Edit Translations

Edit `src/config/i18n.ts`:
```typescript
const translations = {
  fa: {
    myNewKey: 'متن فارسی',
  },
  en: {
    myNewKey: 'English text',
  },
};
```

Use in code:
```typescript
import i18n from '@/config/i18n';
<Text>{i18n.t('myNewKey')}</Text>
```

## 🚀 Building for Production

### Android APK

```bash
# First time setup
eas build:configure

# Build
eas build -p android --profile production
```

### iOS IPA

```bash
# Requires Apple Developer account
eas build -p ios --profile production
```

## 📚 Next Steps

1. **Read full README:** `./README.md`
2. **Check implementation guide:** `./IMPLEMENTATION_GUIDE.md`
3. **Review API integration:** `/docs/FRONTEND_BACKEND_INTEGRATION.md`
4. **Backend setup:** `/supabase/SETUP_GUIDE.md`

## 🆘 Need Help?

### Backend Not Working?

1. Check Supabase dashboard - is project running?
2. Verify API credentials in `src/config/api.ts`
3. Test backend endpoints with `curl`:
   ```bash
   curl https://YOUR-PROJECT.supabase.co/functions/v1/make-server-cd2dec47/health
   ```

### App Not Connecting?

1. Check console for errors (React Native Debugger)
2. Verify network connection
3. Try `expo start --tunnel` for network issues
4. Check API logs in Supabase dashboard

### Persian Text Not Showing Correctly?

1. Ensure language is set to 'fa' in settings
2. Check that RTL is enabled
3. Restart app after language change

## ✅ Checklist

Before reporting issues, verify:

- [ ] Node.js 18+ installed
- [ ] All npm packages installed (`npm install`)
- [ ] Backend credentials configured in `src/config/api.ts`
- [ ] Backend is deployed and running
- [ ] Phone/computer on same WiFi (for physical device)
- [ ] Expo Go app installed (for physical device)

## 🎉 Success!

If you see the dashboard with the ability to add cars and services, you're all set! 

Start building features or customize the app for your needs.

---

**Estimated setup time:** 5-10 minutes (assuming backend is already deployed)

**Questions?** Check `/mobile-app/README.md` or `/docs/` folder for detailed documentation.
