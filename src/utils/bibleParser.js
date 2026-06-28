import { BIBLE_BOOKS, BOOK_BY_NAME } from "./bibleBooks";

/**
 * Grace Pad Bible Parser
 * Supports two formats:
 *
 * 1. JSON .tw format (preferred):
 *    { "translation": "KJV", "books": { "Genesis": { "1": { "1": "text" } } } }
 *
 * 2. Pipe-delimited .tw format (legacy):
 *    name: King James Version\nabbr: KJV\nGEN|1|1|text...
 */

export function parseTWFile(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    return parseTWJson(JSON.parse(trimmed));
  }
  return parseTWPipe(text);
}

/** Parse JSON .tw format */
function parseTWJson(obj) {
  const abbr = obj.translation || obj.abbr || "??";
  const name = obj.name || abbr;
  const books = {};

  for (const [bookName, chapters] of Object.entries(obj.books || {})) {
    books[bookName] = {};
    for (const [ch, verses] of Object.entries(chapters)) {
      books[bookName][parseInt(ch, 10)] = {};
      for (const [vs, text] of Object.entries(verses)) {
        books[bookName][parseInt(ch, 10)][parseInt(vs, 10)] = text;
      }
    }
  }

  return { meta: { name, abbr, lang: "en", year: "" }, books };
}

/** Parse pipe-delimited .tw format */
function parseTWPipe(text) {
  const lines = text.split(/\r?\n/);
  const meta = { name: "Unknown", abbr: "??", lang: "en", year: "" };
  const books = {};
  let headerDone = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    if (!headerDone) {
      if (line.includes(":") && !line.includes("|")) {
        const colonIdx = line.indexOf(":");
        const key = line.slice(0, colonIdx).trim().toLowerCase();
        const val = line.slice(colonIdx + 1).trim();
        if (key === "name") meta.name = val;
        else if (key === "abbr" || key === "abbreviation") meta.abbr = val;
        else if (key === "lang") meta.lang = val;
        else if (key === "year") meta.year = val;
        continue;
      }
      headerDone = true;
    }

    const parts = line.split("|");
    if (parts.length < 4) continue;
    const [bookCode, chapter, verse, ...textParts] = parts;
    const text2 = textParts.join("|").trim();
    const ch = parseInt(chapter, 10);
    const vs = parseInt(verse, 10);
    if (!bookCode || isNaN(ch) || isNaN(vs) || !text2) continue;

    // Convert code → full name if possible
    const bookObj = BIBLE_BOOKS.find((b) => b.code === bookCode);
    const bookKey = bookObj?.name || bookCode;

    if (!books[bookKey]) books[bookKey] = {};
    if (!books[bookKey][ch]) books[bookKey][ch] = {};
    books[bookKey][ch][vs] = text2;
  }

  return { meta, books };
}

export function getVerse(bibleData, book, chapter, verse) {
  return bibleData?.books?.[book]?.[chapter]?.[verse] ?? null;
}

export function getChapter(bibleData, book, chapter) {
  const chapterData = bibleData?.books?.[book]?.[chapter];
  if (!chapterData) return [];
  return Object.entries(chapterData)
    .map(([v, text]) => ({ verse: parseInt(v, 10), text }))
    .sort((a, b) => a.verse - b.verse);
}

export function getChapterCount(bibleData, book) {
  const bookData = bibleData?.books?.[book];
  if (!bookData) return 0;
  return Math.max(...Object.keys(bookData).map(Number));
}

export function getVerseCount(bibleData, book, chapter) {
  const chapterData = bibleData?.books?.[book]?.[chapter];
  if (!chapterData) return 0;
  return Math.max(...Object.keys(chapterData).map(Number));
}

export function searchBible(bibleData, query, maxResults = 200) {
  if (!query || !bibleData?.books) return [];
  const q = query.toLowerCase();
  const results = [];
  for (const [book, chapters] of Object.entries(bibleData.books)) {
    for (const [chapter, verses] of Object.entries(chapters)) {
      for (const [verse, text] of Object.entries(verses)) {
        if (text.toLowerCase().includes(q)) {
          results.push({ book, chapter: +chapter, verse: +verse, text });
          if (results.length >= maxResults) return results;
        }
      }
    }
  }
  return results;
}

export async function loadTWFromURL(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`);
  return parseTWFile(await res.text());
}

export function loadTWFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try { resolve(parseTWFile(e.target.result)); }
      catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function formatShortRef(bookName, chapter, verse) {
  const bookObj = BIBLE_BOOKS.find((b) => b.name === bookName);
  const short = bookObj?.short ?? bookName.slice(0, 3);
  return `${short}.${chapter}.${verse}`;
}
