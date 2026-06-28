import { BIBLE_BOOKS } from "./bibleBooks";
export interface BibleData { meta:{name:string;abbr:string}; books:Record<string,Record<number,Record<number,string>>>; }

export function parseTWFile(text: string, abbr = "??"): BibleData {
  const t = text.trim().replace(/^\uFEFF/, "");
  if (t.startsWith("{")) return parseJson(JSON.parse(t));
  if (t.startsWith("<")) return parseXml(t, abbr);
  return parsePipe(t);
}

function parseJson(o: any): BibleData {
  const abbr = o.translation || o.abbr || "??";
  const books: BibleData["books"] = {};
  for (const [bk, chs] of Object.entries<any>(o.books || {})) {
    books[bk] = {};
    for (const [ch, vvs] of Object.entries<any>(chs)) {
      books[bk][+ch] = {};
      for (const [vs, tx] of Object.entries<any>(vvs)) books[bk][+ch][+vs] = tx;
    }
  }
  return { meta: { name: o.name || abbr, abbr }, books };
}

function parseXml(text: string, abbr: string): BibleData {
  const books: BibleData["books"] = {};
  const bRe = /<BIBLEBOOK[^>]+bname="([^"]+)"[^>]*>([\s\S]*?)<\/BIBLEBOOK>/gi;
  for (const [, bname, bc] of text.matchAll(bRe)) {
    books[bname] = {};
    const cRe = /<CHAPTER[^>]+cnumber="(\d+)"[^>]*>([\s\S]*?)<\/CHAPTER>/gi;
    for (const [, cn, cc] of bc.matchAll(cRe)) {
      books[bname][+cn] = {};
      const vRe = /<VERS[^>]+vnumber="(\d+)"[^>]*>([\s\S]*?)<\/VERS>/gi;
      for (const [, vn, vt] of cc.matchAll(vRe))
        books[bname][+cn][+vn] = vt.replace(/<[^>]+>/g, "").trim();
    }
  }
  const nm = text.match(/biblename="([^"]+)"/i);
  return { meta: { name: nm?.[1] || abbr, abbr }, books };
}

function parsePipe(text: string): BibleData {
  const lines = text.split(/\r?\n/);
  const meta = { name: "Unknown", abbr: "??" };
  const books: BibleData["books"] = {};
  let done = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (!done && !line.includes("|")) {
      const ci = line.indexOf(":");
      if (ci > 0) {
        const k = line.slice(0, ci).trim().toLowerCase();
        const v = line.slice(ci + 1).trim();
        if (k === "name") meta.name = v;
        else if (k === "abbr") meta.abbr = v;
      }
      continue;
    }
    done = true;
    const p = line.split("|");
    if (p.length < 4) continue;
    const [code, ch, vs, ...rest] = p;
    const bk = BIBLE_BOOKS.find(b => b.code === code)?.name || code;
    if (!books[bk]) books[bk] = {};
    if (!books[bk][+ch]) books[bk][+ch] = {};
    books[bk][+ch][+vs] = rest.join("|").trim();
  }
  return { meta, books };
}

export function getChapter(data: BibleData | null, book: string, chapter: number) {
  const ch = data?.books?.[book]?.[chapter];
  if (!ch) return [];
  return Object.entries(ch).map(([v, t]) => ({ verse: +v, text: t })).sort((a, b) => a.verse - b.verse);
}

export function getChapterCount(data: BibleData | null, book: string) {
  const bk = data?.books?.[book];
  if (!bk) return 0;
  return Math.max(...Object.keys(bk).map(Number));
}

export function searchBible(data: BibleData, q: string, max = 300) {
  const query = q.toLowerCase();
  const res: { book: string; chapter: number; verse: number; text: string }[] = [];
  for (const [book, chs] of Object.entries(data.books))
    for (const [ch, vvs] of Object.entries(chs))
      for (const [vs, tx] of Object.entries(vvs))
        if (tx.toLowerCase().includes(query)) {
          res.push({ book, chapter: +ch, verse: +vs, text: tx });
          if (res.length >= max) return res;
        }
  return res;
}

export function shortRef(bookName: string, ch: number, vs: number) {
  const b = BIBLE_BOOKS.find(b => b.name === bookName);
  return `${b?.short ?? bookName.slice(0, 3)}.${ch}.${vs}`;
}
