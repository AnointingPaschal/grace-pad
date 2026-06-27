<div align="center">
  <h1>✝ Grace Pad</h1>
  <p><strong>Your sacred space for Gospel notes, Bible study, and spiritual journaling.</strong></p>
  <p>
    <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
    <img alt="Firebase" src="https://img.shields.io/badge/Firebase-Cloud-FFCA28?logo=firebase&logoColor=black" />
    <img alt="Vercel" src="https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel" />
    <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss&logoColor=white" />
  </p>
</div>

---

## ✨ Features

- **Google One Tap auth** – Signs in automatically using the device's logged-in Google account, just like Google Docs — no separate password needed
- **Real-time cloud sync** – Notes saved to Firestore (Google Cloud) and accessible on every device where you're signed in
- **Rich gospel note editor** – Full TipTap editor with bold, italic, headings, blockquotes, lists, highlighting in 5 colors, and direct verse insertion
- **Multi-translation Bible reader** – Upload unlimited `.tw` Bible files; comes pre-loaded with a KJV sample
- **Study Room** – Side-by-side Bible & note editor; click any verse to insert it directly into your notes
- **Bible verse search** – Search across the entire loaded translation by keyword
- **Note categories** – Sermon, Bible Study, Prayer, Devotional, General
- **Pin notes** – Keep important notes at the top
- **Beautiful UI** – Deep-indigo sidebar, gold accents, Playfair Display headings, EB Garamond scripture text

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/AnointingPaschal/grace-pad.git
cd grace-pad
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Create a project**
2. Enable **Authentication** → Sign-in method → **Google**
3. Enable **Firestore Database** (start in production mode)
4. Enable **Storage** (for Bible file uploads)
5. Go to **Project Settings → General → Your apps** → **Add a Web app**
6. Copy your config values

### 3. Google One Tap Setup

In [Google Cloud Console](https://console.cloud.google.com/):
1. Select the same project as your Firebase project
2. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Add to **Authorized JavaScript origins**:
   - `http://localhost:5173` (dev)
   - `https://your-vercel-domain.vercel.app` (production)
5. Copy the **Client ID**

### 4. Environment Variables

```bash
cp .env.example .env.local
# Fill in your values in .env.local
```

### 5. Firestore Security Rules

In Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 6. Firebase Storage Rules

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

### 7. Run Locally

```bash
npm run dev
# Open http://localhost:5173
```

---

## 📖 Bible File Format (.tw)

Grace Pad uses a simple pipe-delimited `.tw` format. Example:

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

**Columns:** `BOOK_CODE | CHAPTER | VERSE | Text`

Book codes follow the standard 3-letter abbreviation (GEN, EXO, LEV … MAT, MRK, LUK, JHN … REV).

Upload `.tw` files from the **Sidebar → Upload Bible** button. Files are stored in your personal Firebase Storage folder.

---

## ☁️ Deploy to Vercel

1. Push to GitHub (already done ✅)
2. Go to [vercel.com](https://vercel.com) → **Import Project** → your GitHub repo
3. Add **Environment Variables** (same as `.env.local`)
4. In **Build Settings**: Framework = **Vite**, Output = `dist`
5. Deploy!

After deploying, add your Vercel domain to the **Authorized JavaScript origins** in Google Cloud Console.

---

## 🗂 Project Structure

```
grace-pad/
├── public/
│   └── bibles/
│       └── kjv-sample.tw       # Sample Bible (key chapters)
├── src/
│   ├── components/
│   │   ├── auth/Login.jsx       # Google One Tap + fallback button
│   │   ├── bible/BibleViewer.jsx# Bible reader with search & highlighting
│   │   ├── layout/              # AppLayout, Sidebar
│   │   ├── notes/               # NoteCard, NoteEditor (TipTap)
│   │   └── ui/                  # VersePickerModal, LoadingScreen
│   ├── contexts/
│   │   ├── AuthContext.jsx      # Firebase Auth + Google One Tap
│   │   ├── NotesContext.jsx     # Firestore CRUD + real-time sync
│   │   └── BibleContext.jsx     # .tw parsing + Firebase Storage uploads
│   ├── pages/
│   │   ├── HomePage.jsx         # Dashboard with daily verse
│   │   ├── BiblePage.jsx        # Full-screen Bible reader
│   │   ├── NotesPage.jsx        # Notes grid + editor
│   │   └── StudyPage.jsx        # Split Bible + Notes view
│   └── utils/
│       ├── bibleParser.js       # .tw file parser
│       └── bibleBooks.js        # 66-book registry
├── .env.example                 # Environment variable template
└── vercel.json                  # Vercel deployment config
```

---

## 🛡 Security

- Notes are user-scoped by `userId` in Firestore; rules prevent cross-user access
- Bible files are stored under `bibles/{userId}/` in Firebase Storage
- Google One Tap uses short-lived ID tokens; no passwords are stored
- All API keys are server-side Firebase credentials (not exposed)

---

<div align="center">
  <p>Built with ❤️ for the Kingdom</p>
  <p><em>"Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105</em></p>
</div>
