export const C = {
  DARK_BLUE: "#160A47",
  MID_BLUE:  "#2D1777",
  MAROON:    "#7B1515",
  GOLD:      "#C8971B",
  WHITE:     "#FFFFFF",
  BG:        "#F8F9FA",
};

export const TRANSLATIONS = [
  { abbr:"AMP",  name:"Amplified Bible",             file:"AMP.tw"  },
  { abbr:"ASV",  name:"American Standard Version",   file:"ASV.tw"  },
  { abbr:"ESV",  name:"English Standard Version",    file:"ESV.tw"  },
  { abbr:"KJV",  name:"King James Version",          file:"KJV.tw"  },
  { abbr:"MSG",  name:"The Message",                 file:"MSG.tw"  },
  { abbr:"NASB", name:"New American Standard Bible", file:"NASB.tw" },
  { abbr:"NIV",  name:"New International Version",   file:"NIV.tw"  },
  { abbr:"NKJV", name:"New King James Version",      file:"NKJV.tw" },
  { abbr:"NLT",  name:"New Living Translation",      file:"NLT.tw"  },
  { abbr:"RSV",  name:"Revised Standard Version",    file:"RSV.tw"  },
] as const;

export const BIBLE_ASSETS: Record<string, any> = {
  AMP:  require("../assets/bibles/AMP.tw"),
  ASV:  require("../assets/bibles/ASV.tw"),
  ESV:  require("../assets/bibles/ESV.tw"),
  KJV:  require("../assets/bibles/KJV.tw"),
  MSG:  require("../assets/bibles/MSG.tw"),
  NASB: require("../assets/bibles/NASB.tw"),
  NIV:  require("../assets/bibles/NIV.tw"),
  NKJV: require("../assets/bibles/NKJV.tw"),
  NLT:  require("../assets/bibles/NLT.tw"),
  RSV:  require("../assets/bibles/RSV.tw"),
};

export const NOTE_CATEGORIES = [
  { id:"sermon",   label:"Sermon",      color:"#7C3AED", bg:"#F5F3FF" },
  { id:"study",    label:"Bible Study", color:"#1D4ED8", bg:"#EFF6FF" },
  { id:"prayer",   label:"Prayer",      color:"#DB2777", bg:"#FDF2F8" },
  { id:"devotion", label:"Devotional",  color:"#15803D", bg:"#F0FDF4" },
  { id:"general",  label:"General",     color:"#B45309", bg:"#FFFBEB" },
];

export const NOTE_COLORS = [
  { id:"white",  bg:"#FFFFFF", border:"#E5E7EB" },
  { id:"yellow", bg:"#FEF9C3", border:"#FDE68A" },
  { id:"blue",   bg:"#DBEAFE", border:"#BFDBFE" },
  { id:"green",  bg:"#DCFCE7", border:"#BBF7D0" },
  { id:"pink",   bg:"#FCE7F3", border:"#FBCFE8" },
  { id:"purple", bg:"#F3E8FF", border:"#E9D5FF" },
];
