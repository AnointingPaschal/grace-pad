# ✝️ Grace Pad

> Your sacred space for Gospel notes, multi-translation Bible study, and spiritual journaling.

Grace Pad is a full-featured, beautifully designed web app for Christians. Sign in with your Google account — the same one on your device — and your notes sync instantly across every device, just like Google Docs.

---

## ✨ Features

- **Google Sign-In** — One-tap sign-in using your device's existing Google account. No separate password.
- **Rich Note Editor** — TipTap-powered editor with bold, italic, headings, lists, quotes, highlights (5 study colors), and verse insertion.
- **Multi-Translation Bible** — Upload `.tw` Bible files and switch between translations instantly.
- **Verse Insertion** — Browse book → chapter → verse and insert any verse into your notes as a formatted blockquote.
- **Bible Search** — Full-text search across the loaded translation.
- **Study Room** — Side-by-side Bible + Notes split view.
- **Note Categories** — Sermon, Bible Study, Prayer, Devotional, General.
- **Study Highlights** — 5 highlight colors: General, Promise, Command, Grace, Prophecy.
- **Pin & Tags** — Pin important notes, add tags for organization.
- **Cloud Sync** — Everything syncs to Google Cloud (Firebase) in real time.
- **Works on Any Device** — Sign in with your Google account anywhere.

---

## 🚀 Setup

### 1. Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable **Authentication** → Sign-in method → **Google**
4. Enable **Firestore Database** (start in test mode, then apply rules below)
5. Enable **Storage**
6. Go to Project Settings → Your apps → **Add Web App**
7. Copy the config values

### 2. Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials → Create credentials → OAuth 2.0 Client ID
3. Application type: **Web application**
4. Add your domain to Authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `https://your-app.vercel.app` (production)
5. Copy the Client ID

### 3. Environment Variables

Create a `.env` file (never commit this):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 4. Firestore Security Rules

In Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### 5. Storage Rules

In Firebase Console → Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /bibles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Run Locally

```bash
npm install
npm run dev
```

---

## 📖 Bible `.tw` Format

Grace Pad uses a simple pipe-separated format for Bible files:

```
# Grace Pad Bible Format v1.0
name: New King James Version
abbr: NKJV
lang: en
year: 1982

GEN|1|1|In the beginning God created the heavens and the earth.
GEN|1|2|The earth was without form, and void; and darkness was on the face of the deep.
JHN|3|16|For God so loved the world that He gave His only begotten Son...
```

**Converting from XML:**
- Use an OSIS or USFM converter to extract `BOOK|CHAPTER|VERSE|TEXT` lines
- Save with `.tw` extension
- Upload via sidebar in the app

A sample KJV file is included at `public/bibles/kjv-sample.tw`.

---

## 🌐 Deploy to Vercel

1. Push this repo to GitHub ✅
2. Import project in [Vercel](https://vercel.com)
3. Set all `VITE_*` environment variables in Vercel project settings
4. Deploy — it auto-detects Vite

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Auth | Firebase Auth (Google One Tap) |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Editor | TipTap v2 |
| Routing | React Router v6 |
| Icons | Lucide React |
| Fonts | Playfair Display · EB Garamond · Inter |

---

*"Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105*
