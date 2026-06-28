import { BIBLE_BOOKS } from "./bibleBooks";

export interface BibleData {
  meta: { name: string; abbr: string; lang: string; year: string };
  books: Record<string, Record<number, Record<number, string>>>;
}

export function parseTWFile(text: string, abbr = "??"): BibleData {
  const t = text.trim().replace(/^\uFEFF/, "");
  if (t.startsWith("{")) return parseTWJson(JSON.parse(t));
  if (t.startsWith("<")) return parseTWXml(t, abbr);
  return parseTWPipe(t);
}

function parseTWJson(obj: any): BibleData {
  const abbr = obj.translation || obj.abbr || "??";
  const name = obj.name || abbr;
  const books: BibleData["books"] = {};
  for (const [bk, chs] of Object.entries<any>(obj.books || {})) {
    books[bk] = {};
    for (const [ch, vvs] of Object.entries<any>(chs)) {
      books[bk][+ch] = {};
      for (const [vs, txt] of Object.entries<any>(vvs))
        books[bk][+ch][+vs] = txt;
    }
  }
  return { meta: { name, abbr, lang: "en", year: "" }, books };
}

function parseTWXml(text: string, fileAbbr: string): BibleData {
  const books: BibleData["books"] = {};
  const bookMatches = text.matchAll(/<BIBLEBOOK[^>]+bname="([^"]+)"[^>]*>([\s\S]*?)<\/BIBLEBOOK>/gi);
  for (const [, bname, bookContent] of bookMatches) {
    books[bname] = {};
    const chMatches = bookContent.matchAll(/<CHAPTER[^>]+cnumber="(\d+)"[^>]*>([\s\S]*?)<\/CHAPTER>/gi);
    for (const [, cn, chContent] of chMatches) {
      const ch = +cn;
      books[bname][ch] = {};
      const vMatches = chContent.matchAll(/<VERS[^>]+vnumber="(\d+)"[^>]*>([\s\S]*?)<\/VERS>/gi);
      for (const [, vn, vtext] of vMatches)
        books[bname][ch][+vn] = vtext.replace(/<[^>]+>/g, "").trim();
    }
  }
  const nameMatch = text.match(/biblename="([^"]+)"/i);
  return { meta: { name: nameMatch?.[1] || fileAbbr, abbr: fileAbbr, lang: "en", year: "" }, books };
}

function parseTWPipe(text: string): BibleData {
  const lines = text.split(/\r?\n/);
  const meta = { name: "Unknown", abbr: "??", lang: "en", year: "" };
  const books: BibleData["books"] = {};
  let done = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (!done && line.includes(":") && !line.includes("|")) {
      const ci = line.indexOf(":");
      const k = line.slice(0, ci).trim().toLowerCase();
      const v = line.slice(ci + 1).trim();
      if (k === "name") meta.name = v;
      else if (k === "abbr") meta.abbr = v;
      continue;
    }
    done = true;
    const parts = line.split("|");
    if (parts.length < 4) continue;
    const [code, ch, vs, ...rest] = parts;
    const txt = rest.join("|").trim();
    const bk = BIBLE_BOOKS.find((b) => b.code === code)?.name || code;
    if (!books[bk]) books[bk] = {};
    if (!books[bk][+ch]) books[bk][+ch] = {};
    books[bk][+ch][+vs] = txt;
  }
  return { meta, books };
}

export function getChapter(data: BibleData | null, book: string, chapter: number) {
  const ch = data?.books?.[book]?.[chapter];
  if (!ch) return [];
  return Object.entries(ch)
    .map(([v, t]) => ({ verse: +v, text: t }))
    .sort((a, b) => a.verse - b.verse);
}

export function getChapterCount(data: BibleData | null, book: string): number {
  const bk = data?.books?.[book];
  if (!bk) return 0;
  return Math.max(...Object.keys(bk).map(Number));
}

export function searchBible(data: BibleData, query: string, max = 200) {
  const q = query.toLowerCase();
  const results: Array<{ book: string; chapter: number; verse: number; text: string }> = [];
  for (const [book, chs] of Object.entries(data.books)) {
    for (const [ch, vvs] of Object.entries(chs)) {
      for (const [vs, txt] of Object.entries(vvs)) {
        if (txt.toLowerCase().includes(q)) {
          results.push({ book, chapter: +ch, verse: +vs, text: txt });
          if (results.length >= max) return results;
        }
      }
    }
  }
  return results;
}

export function formatShortRef(bookName: string, chapter: number, verse: number) {
  const b = BIBLE_BOOKS.find((b) => b.name === bookName);
  return `${b?.short ?? bookName.slice(0, 3)}.${chapter}.${verse}`;
}
