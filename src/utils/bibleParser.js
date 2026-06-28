import { BIBLE_BOOKS } from "./bibleBooks";

/**
 * Grace Pad Bible Parser — supports 3 formats:
 *
 * 1. JSON .tw  { "translation":"KJV", "books":{ "Genesis":{ "1":{ "1":"text" } } } }
 * 2. Zefania XML  <XMLBIBLE biblename="..."><BIBLEBOOK bname="Genesis">
 *                   <CHAPTER cnumber="1"><VERS vnumber="1">text</VERS>
 * 3. Pipe-delimited  name: KJV\nGEN|1|1|text
 */

export function parseTWFile(text, abbr = "??") {
  const t = text.trim().replace(/^\uFEFF/, ""); // strip BOM
  if (t.startsWith("{")) return parseTWJson(JSON.parse(t));
  if (t.startsWith("<")) return parseTWXml(t, abbr);
  return parseTWPipe(t);
}

/* ── JSON format ── */
function parseTWJson(obj) {
  const abbr = obj.translation || obj.abbr || "??";
  const name = obj.name || abbr;
  const books = {};
  for (const [bk, chs] of Object.entries(obj.books || {})) {
    books[bk] = {};
    for (const [ch, vvs] of Object.entries(chs)) {
      books[bk][+ch] = {};
      for (const [vs, txt] of Object.entries(vvs)) books[bk][+ch][+vs] = txt;
    }
  }
  return { meta: { name, abbr, lang: "en", year: "" }, books };
}

/* ── Zefania XML format ── */
function parseTWXml(text, fileAbbr) {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(text, "text/xml");
  const root   = doc.querySelector("XMLBIBLE");
  const name   = root?.getAttribute("biblename") || fileAbbr;
  const books  = {};

  for (const bookEl of doc.querySelectorAll("BIBLEBOOK")) {
    const bname = bookEl.getAttribute("bname");
    if (!bname) continue;
    books[bname] = {};
    for (const chEl of bookEl.querySelectorAll("CHAPTER")) {
      const ch = parseInt(chEl.getAttribute("cnumber"), 10);
      if (isNaN(ch)) continue;
      books[bname][ch] = {};
      for (const vEl of chEl.querySelectorAll("VERS")) {
        const vs = parseInt(vEl.getAttribute("vnumber"), 10);
        if (!isNaN(vs)) books[bname][ch][vs] = vEl.textContent.trim();
      }
    }
  }
  return { meta: { name, abbr: fileAbbr, lang: "en", year: "" }, books };
}

/* ── Pipe-delimited format ── */
function parseTWPipe(text) {
  const lines = text.split(/\r?\n/);
  const meta  = { name: "Unknown", abbr: "??", lang: "en", year: "" };
  const books = {};
  let headerDone = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (!headerDone && line.includes(":") && !line.includes("|")) {
      const ci  = line.indexOf(":");
      const key = line.slice(0, ci).trim().toLowerCase();
      const val = line.slice(ci + 1).trim();
      if (key === "name") meta.name = val;
      else if (key === "abbr") meta.abbr = val;
      else if (key === "lang") meta.lang = val;
      else if (key === "year") meta.year = val;
      continue;
    }
    headerDone = true;
    const parts = line.split("|");
    if (parts.length < 4) continue;
    const [code, ch, vs, ...rest] = parts;
    const txt = rest.join("|").trim();
    const bk  = (BIBLE_BOOKS.find(b => b.code === code)?.name) || code;
    if (!books[bk]) books[bk] = {};
    if (!books[bk][+ch]) books[bk][+ch] = {};
    books[bk][+ch][+vs] = txt;
  }
  return { meta, books };
}

/* ── Helpers ── */
export function getChapter(bibleData, book, chapter) {
  const ch = bibleData?.books?.[book]?.[chapter];
  if (!ch) return [];
  return Object.entries(ch)
    .map(([v, t]) => ({ verse: +v, text: t }))
    .sort((a, b) => a.verse - b.verse);
}

export function getChapterCount(bibleData, book) {
  const bk = bibleData?.books?.[book];
  if (!bk) return 0;
  return Math.max(...Object.keys(bk).map(Number));
}

export function searchBible(bibleData, query, max = 200) {
  if (!query || !bibleData?.books) return [];
  const q = query.toLowerCase();
  const r = [];
  for (const [book, chs] of Object.entries(bibleData.books)) {
    for (const [ch, vvs] of Object.entries(chs)) {
      for (const [vs, txt] of Object.entries(vvs)) {
        if (txt.toLowerCase().includes(q)) {
          r.push({ book, chapter: +ch, verse: +vs, text: txt });
          if (r.length >= max) return r;
        }
      }
    }
  }
  return r;
}

export async function loadTWFromURL(url, abbr) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return parseTWFile(await res.text(), abbr);
}

export function formatShortRef(bookName, chapter, verse) {
  const b = BIBLE_BOOKS.find(b => b.name === bookName);
  return `${b?.short ?? bookName.slice(0, 3)}.${chapter}.${verse}`;
}
