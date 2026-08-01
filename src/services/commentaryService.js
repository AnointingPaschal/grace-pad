import { db } from "../firebase";
import {
  doc, getDoc, setDoc, serverTimestamp,
} from "firebase/firestore";

const BASE = "https://bible.helloao.org/api";

export const BOOK_CODES = {
  "Genesis":"GEN","Exodus":"EXO","Leviticus":"LEV","Numbers":"NUM",
  "Deuteronomy":"DEU","Joshua":"JOS","Judges":"JDG","Ruth":"RUT",
  "1 Samuel":"1SA","2 Samuel":"2SA","1 Kings":"1KI","2 Kings":"2KI",
  "1 Chronicles":"1CH","2 Chronicles":"2CH","Ezra":"EZR","Nehemiah":"NEH",
  "Esther":"EST","Job":"JOB","Psalms":"PSA","Proverbs":"PRO",
  "Ecclesiastes":"ECC","Song of Solomon":"SNG","Isaiah":"ISA",
  "Jeremiah":"JER","Lamentations":"LAM","Ezekiel":"EZK","Daniel":"DAN",
  "Hosea":"HOS","Joel":"JOL","Amos":"AMO","Obadiah":"OBA","Jonah":"JON",
  "Micah":"MIC","Nahum":"NAM","Habakkuk":"HAB","Zephaniah":"ZEP",
  "Haggai":"HAG","Zechariah":"ZEC","Malachi":"MAL",
  "Matthew":"MAT","Mark":"MRK","Luke":"LUK","John":"JHN","Acts":"ACT",
  "Romans":"ROM","1 Corinthians":"1CO","2 Corinthians":"2CO",
  "Galatians":"GAL","Ephesians":"EPH","Philippians":"PHP",
  "Colossians":"COL","1 Thessalonians":"1TH","2 Thessalonians":"2TH",
  "1 Timothy":"1TI","2 Timothy":"2TI","Titus":"TIT","Philemon":"PHM",
  "Hebrews":"HEB","James":"JAS","1 Peter":"1PE","2 Peter":"2PE",
  "1 John":"1JN","2 John":"2JN","3 John":"3JN","Jude":"JUD","Revelation":"REV",
};

export const COMMENTARIES = [
  { id: "tyndale",     name: "Tyndale Open Study Notes", short: "Tyndale" },
  { id: "adam-clarke", name: "Adam Clarke Commentary",    short: "Clarke"  },
];

const memCache = new Map();

export async function getCommentaryChapter(commentaryId, bookName, chapter) {
  const bookCode = BOOK_CODES[bookName];
  if (!bookCode) return null;

  const cacheKey    = `${commentaryId}:${bookCode}:${chapter}`;
  const firestoreId = `${commentaryId}_${bookCode}_${chapter}`;

  if (memCache.has(cacheKey)) return memCache.get(cacheKey);

  // 1. Firestore cache
  try {
    const snap = await getDoc(doc(db, "commentaries", firestoreId));
    if (snap.exists()) {
      const data = snap.data();
      memCache.set(cacheKey, data.payload);
      return data.payload;
    }
  } catch (e) {
    console.warn("Firestore read failed:", e);
  }

  // 2. Fetch from API
  try {
    const res = await fetch(`${BASE}/c/${commentaryId}/${bookCode}/${chapter}.json`);
    if (!res.ok) return null;
    const data = await res.json();

    // 3. Save to Firestore
    try {
      await setDoc(doc(db, "commentaries", firestoreId), {
        commentaryId,
        bookCode,
        bookName,
        chapter,
        payload: data,
        cachedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("Firestore write failed:", e);
    }

    memCache.set(cacheKey, data);
    return data;
  } catch (e) {
    console.warn("API fetch failed:", e);
    return null;
  }
}

export async function getCrossReferences(bookName, chapter) {
  const bookCode = BOOK_CODES[bookName];
  if (!bookCode) return null;

  const cacheKey    = `xref:${bookCode}:${chapter}`;
  const firestoreId = `xref_${bookCode}_${chapter}`;

  if (memCache.has(cacheKey)) return memCache.get(cacheKey);

  try {
    const snap = await getDoc(doc(db, "crossRefs", firestoreId));
    if (snap.exists()) {
      const data = snap.data();
      memCache.set(cacheKey, data.payload);
      return data.payload;
    }
  } catch (e) {
    console.warn("Firestore read failed:", e);
  }

  try {
    const res = await fetch(`${BASE}/d/open-cross-ref/${bookCode}/${chapter}.json`);
    if (!res.ok) return null;
    const data = await res.json();

    try {
      await setDoc(doc(db, "crossRefs", firestoreId), {
        bookCode, bookName, chapter,
        payload: data,
        cachedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("Firestore write failed:", e);
    }

    memCache.set(cacheKey, data);
    return data;
  } catch (e) {
    console.warn("API fetch failed:", e);
    return null;
  }
}

/**
 * Extract verse commentary text.
 * Handles both Tyndale (sparse, study-note style) and
 * Adam Clarke (dense, every-verse style).
 */
export function getVerseCommentary(chapterData, verseNumber) {
  const content = chapterData?.chapter?.content;
  if (!content) return null;

  const verse = content.find(v => v.type === "verse" && v.number === verseNumber);
  if (!verse) return null;

  const text = verse.content
    .map(c => {
      if (typeof c === "string") return c;
      if (c.text)    return c.text;
      if (c.heading) return `\n${c.heading}\n`;
      return "";
    })
    .join("")
    .trim();

  return text || null;
}

/** Get chapter introduction text if available */
export function getChapterIntro(chapterData) {
  return chapterData?.chapter?.introduction ?? null;
}

/** Get set of verse numbers that have commentary */
export function getCommentedVerses(chapterData) {
  const content = chapterData?.chapter?.content;
  if (!content) return new Set();
  return new Set(
    content
      .filter(v => v.type === "verse" && v.content?.length > 0)
      .map(v => v.number)
  );
}

/** Extract cross-references for a single verse */
export function getVerseCrossRefs(crossRefData, verseNumber) {
  const content = crossRefData?.chapter?.content;
  if (!content) return [];
  const verse = content.find(v => v.verse === verseNumber);
  return verse?.references ?? [];
}
