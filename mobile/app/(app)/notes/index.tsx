import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNotes, NOTE_CATEGORIES, NOTE_COLORS } from "../../../src/contexts/NotesContext";
import type { Note } from "../../../src/contexts/NotesContext";

const DARK_BLUE = "#160A47";
const MAROON = "#7B1515";

function NoteCard({ note, onOpen }: { note: Note; onOpen: () => void }) {
  const color = NOTE_COLORS.find(c => c.id === note.color) ?? NOTE_COLORS[0];
  const cat   = NOTE_CATEGORIES.find(c => c.id === note.category);
  const plain = note.content?.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,150) ?? "";
  const date  = note.updatedAt?.toDate?.()?.toLocaleDateString("en-US",{month:"short",day:"numeric"}) ?? "";

  return (
    <Pressable onPress={onOpen} style={[s.card, { backgroundColor: color.bg, borderColor: color.border }]}>
      {/* Preview area */}
      <View style={s.preview}>
        {plain
          ? <Text style={s.previewText} numberOfLines={8}>{plain}</Text>
          : <Ionicons name="document-outline" size={28} color="#E5E7EB" />
        }
      </View>
      {/* Footer */}
      <View style={s.footer}>
        <View style={[s.catDot, { backgroundColor: cat?.color ?? "#9CA3AF" }]} />
        <View style={s.footerText}>
          <Text style={s.cardTitle} numberOfLines={1}>{note.title || "Untitled"}</Text>
          <Text style={s.cardDate}>{date}</Text>
        </View>
        <Ionicons name="ellipsis-vertical" size={14} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

export default function NotesScreen() {
  const { notes, loading, createNote } = useNotes();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const handleNew = async () => {
    const id = await createNote({ title:"New Note" });
    router.push(`/(app)/notes/${id}`);
  };

  const filtered = notes.filter(n => {
    const matchCat  = filterCat === "all" || n.category === filterCat;
    const matchText = !search || (n.title + " " + (n.content?.replace(/<[^>]*>/g," ")||"")).toLowerCase().includes(search.toLowerCase());
    return matchCat && matchText;
  });

  const pinned   = filtered.filter(n => n.isPinned);
  const unpinned = filtered.filter(n => !n.isPinned);

  if (loading) return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
      <ActivityIndicator color={DARK_BLUE} />
    </View>
  );

  return (
    <View style={{ flex:1, backgroundColor:"white" }}>
      {/* Search + filter */}
      <View style={s.searchBar}>
        <View style={s.searchInput}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search notes…" placeholderTextColor="#9CA3AF" style={s.searchText} />
        </View>
        <TouchableOpacity onPress={handleNew} style={[s.newBtn, { backgroundColor: DARK_BLUE }]}>
          <Ionicons name="add" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Category pills */}
      <FlatList horizontal showsHorizontalScrollIndicator={false}
        data={[{ id:"all", label:"All", color:DARK_BLUE, bg:"#EEF2FF" }, ...NOTE_CATEGORIES]}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal:12, paddingVertical:8, gap:8 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setFilterCat(item.id)}
            style={[s.pill, filterCat===item.id ? { backgroundColor:item.color } : { backgroundColor:item.bg }]}>
            <Text style={[s.pillText, { color: filterCat===item.id ? "white" : item.color }]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Notes grid */}
      {notes.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="document-text-outline" size={48} color="#E5E7EB" />
          <Text style={s.emptyTitle}>No notes yet</Text>
          <Text style={s.emptyText}>Start capturing your gospel insights</Text>
          <TouchableOpacity onPress={handleNew} style={[s.emptyBtn, { backgroundColor:DARK_BLUE }]}>
            <Ionicons name="add" size={18} color="white" />
            <Text style={s.emptyBtnText}>Create First Note</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[...pinned, ...unpinned]}
          keyExtractor={n => n.id}
          numColumns={2}
          columnWrapperStyle={{ gap:10, paddingHorizontal:12 }}
          contentContainerStyle={{ gap:10, paddingTop:4, paddingBottom:80 }}
          renderItem={({ item }) => (
            <NoteCard note={item} onOpen={() => router.push(`/(app)/notes/${item.id}`)} />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity onPress={handleNew} style={s.fab}>
        <LinearGradient colors={[DARK_BLUE,"#3B1D8C"]} style={s.fabGrad}>
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  searchBar:   { flexDirection:"row", gap:8, padding:12, paddingBottom:4 },
  searchInput: { flex:1, flexDirection:"row", alignItems:"center", gap:8, backgroundColor:"#F3F4F6", borderRadius:14, paddingHorizontal:12, paddingVertical:10 },
  searchText:  { flex:1, fontSize:14, color:"#111827" },
  newBtn:      { width:44, height:44, borderRadius:14, alignItems:"center", justifyContent:"center" },
  pill:        { paddingHorizontal:14, paddingVertical:6, borderRadius:20 },
  pillText:    { fontSize:12, fontWeight:"700" },
  card:        { flex:1, borderRadius:14, borderWidth:1.5, overflow:"hidden", height:200 },
  preview:     { flex:1, padding:10, alignItems:undefined, justifyContent:undefined },
  previewText: { fontSize:6.5, color:"#6B7280", lineHeight:10 },
  footer:      { flexDirection:"row", alignItems:"center", gap:6, paddingHorizontal:8, paddingVertical:8, backgroundColor:"rgba(0,0,0,0.03)", borderTopWidth:1, borderTopColor:"rgba(0,0,0,0.05)" },
  catDot:      { width:8, height:8, borderRadius:4, shrink:0 },
  footerText:  { flex:1 },
  cardTitle:   { fontSize:11, fontWeight:"700", color:"#1F2937" },
  cardDate:    { fontSize:9, color:"#9CA3AF" },
  empty:       { flex:1, alignItems:"center", justifyContent:"center", gap:12, padding:32 },
  emptyTitle:  { fontSize:20, fontWeight:"700", color:"#111827", fontFamily:"Georgia" },
  emptyText:   { fontSize:14, color:"#9CA3AF", textAlign:"center" },
  emptyBtn:    { flexDirection:"row", alignItems:"center", gap:8, paddingHorizontal:24, paddingVertical:12, borderRadius:16, marginTop:8 },
  emptyBtnText:{ fontSize:15, fontWeight:"700", color:"white" },
  fab:         { position:"absolute", right:20, bottom:20, borderRadius:18, overflow:"hidden", shadowColor:"#000", shadowOpacity:0.25, shadowRadius:8, elevation:6 },
  fabGrad:     { width:56, height:56, alignItems:"center", justifyContent:"center" },
});
