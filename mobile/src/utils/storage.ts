import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const BIBLE_CACHE_DIR = `${FileSystem.cacheDirectory}bibles/`;
const HL_KEY = "grace-pad-highlights";
const HIGHLIGHTS_KEY = "grace-pad-verse-highlights";

export const TRANSLATIONS = [
  { id:"amp",  abbr:"AMP",  name:"Amplified Bible",             file:"AMP.tw"  },
  { id:"asv",  abbr:"ASV",  name:"American Standard Version",   file:"ASV.tw"  },
  { id:"esv",  abbr:"ESV",  name:"English Standard Version",    file:"ESV.tw"  },
  { id:"kjv",  abbr:"KJV",  name:"King James Version",          file:"KJV.tw"  },
  { id:"msg",  abbr:"MSG",  name:"The Message",                 file:"MSG.tw"  },
  { id:"nasb", abbr:"NASB", name:"New American Standard Bible", file:"NASB.tw" },
  { id:"niv",  abbr:"NIV",  name:"New International Version",   file:"NIV.tw"  },
  { id:"nkjv", abbr:"NKJV", name:"New King James Version",      file:"NKJV.tw" },
  { id:"nlt",  abbr:"NLT",  name:"New Living Translation",      file:"NLT.tw"  },
  { id:"rsv",  abbr:"RSV",  name:"Revised Standard Version",    file:"RSV.tw"  },
];

const BASE_URL = "https://grace-pad.vercel.app/bibles";

export async function loadBibleText(abbr: string, file: string): Promise<string> {
  await FileSystem.makeDirectoryAsync(BIBLE_CACHE_DIR, { intermediates: true });
  const cached = `${BIBLE_CACHE_DIR}${file}`;
  const info = await FileSystem.getInfoAsync(cached);
  if (info.exists) {
    return await FileSystem.readAsStringAsync(cached);
  }
  const text = await fetch(`${BASE_URL}/${file}?v=4`).then((r) => r.text());
  await FileSystem.writeAsStringAsync(cached, text);
  return text;
}

export async function getHighlight(key: string): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(HIGHLIGHTS_KEY);
    return raw ? JSON.parse(raw)[key] || null : null;
  } catch { return null; }
}

export async function saveHighlight(key: string, color: string | null) {
  try {
    const raw = await AsyncStorage.getItem(HIGHLIGHTS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    if (color) all[key] = color; else delete all[key];
    await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(all));
  } catch {}
}

export async function getAllHighlights(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(HIGHLIGHTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
