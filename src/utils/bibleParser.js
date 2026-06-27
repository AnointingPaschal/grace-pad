/**
 * Grace Pad Bible Format (.tw) Parser
 *
 * File format:
 *   # Comments start with #
 *   name: King James Version
 *   abbr: KJV
 *   lang: en
 *   year: 1611
 *   (blank line separates header from verses)
 *   BOOK|CHAPTER|VERSE|Text of the verse here.
 *
 * Example:
 *   GEN|1|1|In the beginning God created the heaven and the earth.
 *   GEN|1|2|And the earth was without form, and void...
 */

/**
 * Parse a .tw Bible file string into a structured object.
 * Returns: { meta, books }
 *   meta: { name, abbr, lang, year }
 *   books: { GEN: { 1: { 1: "In the beginning...", 2: "..." } } }
 */
export function parseTWFile(text) {
  const lines = text.split(/\r?\n/);
  const meta = { name: "Unknown", abbr: "??", lang: "en", year: "" };
  const books = {};

  let headerDone = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    if (!headerDone) {
      // Header key: value pairs
      if (line.includes(":") && !line.includes("|")) {
        const colonIdx = line.indexOf(":");
        const key = line.slice(0, colonIdx).trim().toLowerCase();
        const val = line.slice(colonIdx + 1).trim();
        if (key === "name") meta.name = val;
        else if (key === "abbr" || key === "abbreviation") meta.abbr = val;
        else if (key === "lang" || key === "language") meta.lang = val;
        else if (key === "year") meta.year = val;
        continue;
      }
      // First pipe-separated line marks end of header
      headerDone = true;
    }

    // Verse line: BOOK|CHAPTER|VERSE|Text
    const parts = line.split("|");
    if (parts.length < 4) continue;

    const [book, chapter, verse, ...textParts] = parts;
    const text = textParts.join("|").trim();
    const ch = parseInt(chapter, 10);
    const vs = parseInt(verse, 10);

    if (!book || isNaN(ch) || isNaN(vs) || !text) continue;

    if (!books[book]) books[book] = {};
    if (!books[book][ch]) books[book][ch] = {};
    books[book][ch][vs] = text;
  }

  return { meta, books };
}

/**
 * Look up a single verse. Returns text or null.
 */
export function getVerse(bibleData, book, chapter, verse) {
  return bibleData?.books?.[book]?.[chapter]?.[verse] ?? null;
}

/**
 * Get all verses in a chapter as an array: [{verse, text}]
 */
export function getChapter(bibleData, book, chapter) {
  const chapterData = bibleData?.books?.[book]?.[chapter];
  if (!chapterData) return [];
  return Object.entries(chapterData)
    .map(([v, text]) => ({ verse: parseInt(v, 10), text }))
    .sort((a, b) => a.verse - b.verse);
}

/**
 * Get the number of chapters in a book (from parsed data).
 */
export function getChapterCount(bibleData, book) {
  const bookData = bibleData?.books?.[book];
  if (!bookData) return 0;
  return Math.max(...Object.keys(bookData).map(Number));
}

/**
 * Get the verse count for a chapter.
 */
export function getVerseCount(bibleData, book, chapter) {
  const chapterData = bibleData?.books?.[book]?.[chapter];
  if (!chapterData) return 0;
  return Math.max(...Object.keys(chapterData).map(Number));
}

/**
 * Format a verse reference string.
 * e.g. "John 3:16" or "John 3:16 (KJV)"
 */
export function formatRef(book, chapter, verse, abbr) {
  const suffix = abbr ? ` (${abbr})` : "";
  return `${book} ${chapter}:${verse}${suffix}`;
}

/**
 * Search verses containing a query string.
 * Returns [{book, chapter, verse, text}] (max 200 results)
 */
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

/**
 * Load a .tw file from a URL and return parsed data.
 */
export async function loadTWFromURL(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load Bible: ${res.statusText}`);
  const text = await res.text();
  return parseTWFile(text);
}

/**
 * Load a .tw file from a File object (user upload).
 */
export function loadTWFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve(parseTWFile(e.target.result));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
