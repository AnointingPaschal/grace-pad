# ✝ Grace Pad — React Native Bible & Notes App

Gospel notes + 10-translation Bible reader. Built with Expo SDK 53.

## Run on Termux

```bash
npm install --legacy-peer-deps
npx expo start --tunnel
```

Then open **Expo Go** and scan the QR code.

## First launch
All 10 Bible translations are bundled in the app. On first load each translation is parsed once and cached — after that it's instant, even offline.

## Features
- 10 Bibles bundled (AMP ASV ESV KJV MSG NASB NIV NKJV NLT RSV)
- Per-verse translation switching — tap any abbreviation instantly
- Verse highlights saved per-device
- Real-time search with OT/NT filter and keyword highlighting
- Book → Chapter → Verse cascade navigation (bottom sheets)
- Google Docs-style notes grid
- Rich text notes with verse insertion
- Firebase Firestore sync across devices
- Google Sign-In
