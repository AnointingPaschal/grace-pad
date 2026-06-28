import { useRef, useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useBible } from "../../contexts/BibleContext";
import { OT_BOOKS, NT_BOOKS, BIBLE_BOOKS } from "../../utils/bibleBooks";
import VerseCard from "./VerseCard";

const DARK_BLUE = "#160A47";
const MAROON    = "#7B1515";
const OT_SET    = new Set(OT_BOOKS.map(b => b.name));
const NT_SET    = new Set(NT_BOOKS.map(b => b.name));

interface Props {
  onInsertToNote?: (book:string,ch:number,vs:number,text:string,abbr:string) => void;
}

export default function BibleReader({ onInsertToNote }: Props) {
  const {
    currentBook, currentChapter, currentVerses, totalChapters,
    isLoading, globalTranslation, navigateTo,
    activeSheet, setActiveSheet, globalSearch, setGlobalSearch,
    searchAllLoaded, getBookChapterCount,
  } = useBible();

  const [testament,     setTestament]     = useState<"OT"|"NT">("NT");
  const [searchFilter,  setSearchFilter]  = useState<"ALL"|"OT"|"NT">("ALL");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const debouncer  = useRef<ReturnType<typeof setTimeout>>();
  const listRef    = useRef<FlatList>(null);
  const bookSheet  = useRef<BottomSheet>(null);
  const chapSheet  = useRef<BottomSheet>(null);
  const verseSheet = useRef<BottomSheet>(null);

  const openBook    = () => { bookSheet.current?.snapToIndex(0);  setActiveSheet(null); };
  const openChap    = () => { chapSheet.current?.snapToIndex(0);  setActiveSheet(null); };
  const openVerse   = () => { verseSheet.current?.snapToIndex(0); setActiveSheet(null); };
  const closeBook   = () => bookSheet.current?.close();
  const closeChap   = () => chapSheet.current?.close();
  const closeVerse  = () => verseSheet.current?.close();

  // Context-driven sheet opening (from bottom nav)
  useEffect(() => {
    if (!activeSheet) return;
    if (activeSheet === "book")    openBook();
    if (activeSheet === "chapter") openChap();
    if (activeSheet === "verse")   openVerse();
  }, [activeSheet]);

  // Scroll to top on chapter change
  useEffect(() => { listRef.current?.scrollToOffset({ offset: 0, animated: false }); }, [currentBook, currentChapter]);

  // Real-time search
  useEffect(() => {
    clearTimeout(debouncer.current);
    if (!globalSearch.trim()) { setSearchResults([]); return; }
    debouncer.current = setTimeout(() => setSearchResults(searchAllLoaded(globalSearch, 500)), 150);
  }, [globalSearch]);

  // Cascade: book → chapter → verse
  const selectBook = (name: string) => {
    navigateTo(name, 1);
    closeBook();
    setTimeout(() => chapSheet.current?.snapToIndex(0), 350);
  };
  const selectChapter = (ch: number) => {
    navigateTo(currentBook, ch);
    closeChap();
    setTimeout(() => verseSheet.current?.snapToIndex(0), 350);
  };
  const selectVerse = (v: number) => {
    closeVerse();
    setTimeout(() => {
      const idx = currentVerses.findIndex(x => x.verse === v);
      if (idx >= 0) listRef.current?.scrollToIndex({ index: idx, animated: true });
    }, 150);
  };

  const bookObj  = BIBLE_BOOKS.find(b => b.name === currentBook);
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);
  const isSearch = !!globalSearch.trim();

  const filteredResults = isSearch
    ? searchFilter === "OT" ? searchResults.filter(r => OT_SET.has(r.book))
    : searchFilter === "NT" ? searchResults.filter(r => NT_SET.has(r.book))
    : searchResults
    : [];

  const renderVerse = ({ item }: { item: { verse:number; text:string } }) => (
    <VerseCard book={currentBook} chapter={currentChapter}
      verse={item.verse} text={item.text} onInsertToNote={onInsertToNote} />
  );

  const renderSearchResult = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => { navigateTo(item.book, item.chapter); setGlobalSearch(""); }}>
      <VerseCard book={item.book} chapter={item.chapter} verse={item.verse}
        text={item.text} onInsertToNote={onInsertToNote} searchQuery={globalSearch} />
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      {/* Bible sub-header */}
      <LinearGradient colors={[DARK_BLUE,"#2D1777"]} style={s.header}>
        <TouchableOpacity onPress={openBook} style={s.bookBtn}>
          <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={s.bookRef}>{bookObj?.short ?? currentBook}.{currentChapter}</Text>
        </TouchableOpacity>

        {/* Search input */}
        <View style={s.searchBox}>
          <Ionicons name="search" size={14} color="rgba(255,255,255,0.6)" />
          <TextInput
            value={globalSearch}
            onChangeText={setGlobalSearch}
            placeholder="Search…"
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={s.searchInput}
          />
          {!!globalSearch && (
            <TouchableOpacity onPress={() => setGlobalSearch("")}>
              <Ionicons name="close" size={14} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* OT/NT filter tabs for search */}
      {isSearch && (
        <View style={s.filterTabs}>
          {(["ALL","OT","NT"] as const).map(f => (
            <TouchableOpacity key={f} onPress={() => setSearchFilter(f)} style={s.filterTab}>
              <Text style={[s.filterTabText, searchFilter===f && s.filterTabActive]}>
                {f==="ALL" ? "All Results" : f==="OT" ? "Old Testament" : "New Testament"}
              </Text>
              {searchFilter===f && <View style={s.filterUnderline} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Verse list / search results */}
      {isLoading && !isSearch ? (
        <View style={s.loading}>
          <ActivityIndicator color={DARK_BLUE} />
          <Text style={s.loadingText}>Loading {globalTranslation}…</Text>
        </View>
      ) : isSearch ? (
        <FlatList
          data={filteredResults}
          keyExtractor={(_, i) => `sr-${i}`}
          renderItem={renderSearchResult}
          ListEmptyComponent={
            <View style={s.empty}><Text style={s.emptyText}>No results for "{globalSearch}"</Text></View>
          }
          ListHeaderComponent={
            filteredResults.length > 0
              ? <View style={s.resultsHeader}>
                  <Text style={s.resultsCount}>{filteredResults.length} result{filteredResults.length!==1?"s":""} in {globalTranslation}</Text>
                </View>
              : null
          }
        />
      ) : (
        <FlatList
          ref={listRef}
          data={currentVerses}
          keyExtractor={item => `v-${item.verse}`}
          renderItem={renderVerse}
          getItemLayout={(_, index) => ({ length: 140, offset: 140 * index, index })}
        />
      )}

      {/* ══ BOOK BOTTOM SHEET ══ */}
      <BottomSheet ref={bookSheet} index={-1} snapPoints={["80%"]} enablePanDownToClose
        backgroundStyle={s.sheet} handleIndicatorStyle={s.handle}>
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>Choose Book</Text>
          <TouchableOpacity onPress={closeBook}><Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" /></TouchableOpacity>
        </View>
        {/* OT / NT tabs */}
        <View style={s.sheetTabs}>
          {(["OT","NT"] as const).map(t => (
            <TouchableOpacity key={t} onPress={() => setTestament(t)} style={s.sheetTab}>
              <Text style={[s.sheetTabText, testament===t && s.sheetTabActive]}>
                {t==="OT" ? "Old Testament" : "New Testament"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <BottomSheetFlatList
          data={testament==="OT" ? OT_BOOKS : NT_BOOKS}
          keyExtractor={b => b.code}
          numColumns={2}
          columnWrapperStyle={{ gap:8, paddingHorizontal:16 }}
          contentContainerStyle={{ gap:8, paddingBottom:40, paddingTop:8 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={[s.bookItem, item.name===currentBook && s.bookItemActive]}
              onPress={() => selectBook(item.name)}>
              <Text style={[s.bookItemText, item.name===currentBook && s.bookItemTextActive]}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </BottomSheet>

      {/* ══ CHAPTER BOTTOM SHEET ══ */}
      <BottomSheet ref={chapSheet} index={-1} snapPoints={["50%"]} enablePanDownToClose
        backgroundStyle={s.sheet} handleIndicatorStyle={s.handle}>
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>Chapters</Text>
          <TouchableOpacity onPress={closeChap}><Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" /></TouchableOpacity>
        </View>
        <BottomSheetFlatList
          data={chapters}
          keyExtractor={c => `ch-${c}`}
          numColumns={6}
          columnWrapperStyle={{ gap:8, paddingHorizontal:16 }}
          contentContainerStyle={{ gap:8, paddingBottom:40, paddingTop:8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.numBtn, item===currentChapter && s.numBtnActive]}
              onPress={() => selectChapter(item)}>
              <Text style={[s.numBtnText, item===currentChapter && s.numBtnTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </BottomSheet>

      {/* ══ VERSE BOTTOM SHEET ══ */}
      <BottomSheet ref={verseSheet} index={-1} snapPoints={["50%"]} enablePanDownToClose
        backgroundStyle={s.sheet} handleIndicatorStyle={s.handle}>
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>{bookObj?.short} {currentChapter} — Verses</Text>
          <TouchableOpacity onPress={closeVerse}><Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" /></TouchableOpacity>
        </View>
        <BottomSheetFlatList
          data={currentVerses}
          keyExtractor={v => `vs-${v.verse}`}
          numColumns={7}
          columnWrapperStyle={{ gap:6, paddingHorizontal:16 }}
          contentContainerStyle={{ gap:6, paddingBottom:40, paddingTop:8 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.numBtnSm} onPress={() => selectVerse(item.verse)}>
              <Text style={s.numBtnSmText}>{item.verse}</Text>
            </TouchableOpacity>
          )}
        />
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex:1, backgroundColor:"white" },
  header:      { flexDirection:"row", alignItems:"center", paddingHorizontal:12, paddingVertical:10, gap:10 },
  bookBtn:     { flexDirection:"row", alignItems:"center", gap:6, flex:1 },
  bookRef:     { fontSize:17, fontWeight:"700", color:"white", fontFamily:"Georgia" },
  searchBox:   { flexDirection:"row", alignItems:"center", gap:6, backgroundColor:"rgba(255,255,255,0.12)", borderRadius:10, paddingHorizontal:10, paddingVertical:7, flex:1 },
  searchInput: { flex:1, fontSize:13, color:"white", padding:0 },
  filterTabs:  { flexDirection:"row", borderBottomWidth:1, borderBottomColor:"#F3F4F6" },
  filterTab:   { flex:1, alignItems:"center", paddingVertical:10 },
  filterTabText:  { fontSize:12, fontWeight:"600", color:"#9CA3AF" },
  filterTabActive:{ color:DARK_BLUE },
  filterUnderline:{ position:"absolute", bottom:0, left:16, right:16, height:2, backgroundColor:DARK_BLUE },
  loading:     { flex:1, alignItems:"center", justifyContent:"center", gap:12 },
  loadingText: { fontSize:13, color:"#9CA3AF" },
  empty:       { padding:40, alignItems:"center" },
  emptyText:   { color:"#9CA3AF", fontSize:14 },
  resultsHeader: { paddingHorizontal:16, paddingVertical:8, backgroundColor:"#F9FAFB" },
  resultsCount:  { fontSize:12, color:"#9CA3AF" },
  sheet:       { backgroundColor:DARK_BLUE },
  handle:      { backgroundColor:"rgba(255,255,255,0.3)" },
  sheetHeader: { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingHorizontal:20, paddingVertical:14 },
  sheetTitle:  { fontSize:17, fontWeight:"700", color:"white", fontFamily:"Georgia" },
  sheetTabs:   { flexDirection:"row", marginHorizontal:16, marginBottom:8, backgroundColor:"rgba(255,255,255,0.1)", borderRadius:10, padding:4 },
  sheetTab:    { flex:1, paddingVertical:8, alignItems:"center" },
  sheetTabText:{ fontSize:13, fontWeight:"600", color:"rgba(255,255,255,0.5)" },
  sheetTabActive: { color:"white" },
  bookItem:    { flex:1, backgroundColor:"rgba(255,255,255,0.08)", borderRadius:10, paddingVertical:10, paddingHorizontal:8 },
  bookItemActive: { backgroundColor:"rgba(255,255,255,0.22)" },
  bookItemText:   { fontSize:13, color:"rgba(255,255,255,0.8)" },
  bookItemTextActive: { color:"white", fontWeight:"700" },
  numBtn:      { flex:1, aspectRatio:1, borderRadius:8, borderWidth:1.5, borderColor:"rgba(255,255,255,0.25)", alignItems:"center", justifyContent:"center", minWidth:44 },
  numBtnActive:{ backgroundColor:"white", borderColor:"white" },
  numBtnText:  { fontSize:13, fontWeight:"700", color:"rgba(255,255,255,0.9)" },
  numBtnTextActive: { color:DARK_BLUE },
  numBtnSm:    { flex:1, height:36, borderRadius:7, borderWidth:1, borderColor:"rgba(255,255,255,0.25)", alignItems:"center", justifyContent:"center", minWidth:38 },
  numBtnSmText:{ fontSize:12, fontWeight:"700", color:"rgba(255,255,255,0.9)" },
});
