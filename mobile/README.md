# Grace Pad — React Native (Expo SDK 54)

Gospel notes, multi-translation Bible reader, and scripture search — as a native mobile app.

## Quick Start

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your device, or press `a` for Android emulator / `i` for iOS simulator.

## Setup Required

### 1. Google OAuth Client IDs

In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials:

**For Android:**
- Create OAuth Client ID → Android
- Package name: `com.gracepad.app`
- SHA-1: run `cd android && ./gradlew signingReport` (after `npx expo prebuild`)

**For iOS:**
- Create OAuth Client ID → iOS
- Bundle ID: `com.gracepad.app`

Add them to `src/contexts/AuthContext.tsx`:
```typescript
const ANDROID_CLIENT_ID = "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com";
const IOS_CLIENT_ID     = "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com";
```

> **Expo Go testing**: With only the `webClientId`, Google Sign-In still works via web OAuth flow.

### 2. Firebase (already configured)

The Firebase project `grace-pad` is already set up. For production builds you'll need to add:
- `google-services.json` → `android/app/`
- `GoogleService-Info.plist` → `ios/`

Download these from [Firebase Console](https://console.firebase.google.com) → Project Settings → Your apps.

## Bible Files

Bible translations are fetched from `https://grace-pad.vercel.app/bibles/` on first use and cached to device storage. No bundling needed.

All 10 translations load in parallel on startup for instant switching:
AMP · ASV · ESV · KJV · MSG · NASB · NIV · NKJV · NLT · RSV

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## Features

| Feature | Status |
|---------|--------|
| Google Sign-In (Firebase Auth) | ✅ |
| Notes (Firestore sync, real-time) | ✅ |
| Rich text editor (pell-rich-editor) | ✅ |
| Bible reader (10 translations) | ✅ |
| Per-verse translation switching | ✅ |
| Verse highlighting (AsyncStorage) | ✅ |
| Real-time scripture search | ✅ |
| OT/NT search filter | ✅ |
| Book→Chapter→Verse cascade nav | ✅ |
| Insert verse into notes | ✅ |
| Notes grid (Google Docs style) | ✅ |
| Category + colour tags | ✅ |
| Pin notes | ✅ |
| Offline Bible caching | ✅ |
