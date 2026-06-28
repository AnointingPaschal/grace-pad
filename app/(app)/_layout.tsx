import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Image } from "react-native";
import { Slot, useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";
import { useBible } from "../../src/contexts/BibleContext";
import { useNotes } from "../../src/contexts/NotesContext";
import { C } from "../../src/constants";

export default function AppLayout() {
  const { user, signOut, loading } = useAuth();
  const { setActiveSheet, globalSearch, setGlobalSearch } = useBible();
  const { createNote } = useNotes();
  const router     = useRouter();
  const pathname   = usePathname();
  const insets     = useSafeAreaInsets();
  const [showSearch, setShowSearch] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => { if (!loading && !user) router.replace("/login"); }, [user, loading]);
  if (!user) return null;

  const isBible = pathname === "/(app)" || pathname === "/(app)/bible" || pathname === "/";
  const isNotes = pathname.startsWith("/(app)/notes") || pathname.startsWith("/notes");

  const goNewNote = async () => {
    const id = await createNote({ title:"New Note" });
    router.push(`/(app)/notes/${id}`);
  };

  const openSheet = (sheet: string) => {
    if (!isBible) { router.replace("/(app)"); setTimeout(()=>setActiveSheet(sheet),250); }
    else setActiveSheet(sheet);
  };

  return (
    <View style={{flex:1,backgroundColor:"#fff"}}>
      {/* ── TOP HEADER: Bible | Notes | Search | Profile ── */}
      <LinearGradient colors={[C.DARK_BLUE, C.MID_BLUE]}
        style={[s.header, {paddingTop: insets.top + 8}]}>
        <View style={s.navTabs}>
          {/* Bible tab */}
          <TouchableOpacity onPress={()=>{setShowSearch(false);router.replace("/(app)");}}
            style={[s.tab, isBible&&s.tabActive]}>
            <Ionicons name="book-outline" size={15} color={isBible?"#fff":"rgba(255,255,255,0.55)"}/>
            <Text style={[s.tabTxt, isBible&&s.tabTxtActive]}>Bible</Text>
          </TouchableOpacity>
          {/* Notes tab */}
          <TouchableOpacity onPress={()=>{setShowSearch(false);router.push("/(app)/notes");}}
            style={[s.tab, isNotes&&s.tabActive]}>
            <Ionicons name="pencil-outline" size={15} color={isNotes?"#fff":"rgba(255,255,255,0.55)"}/>
            <Text style={[s.tabTxt, isNotes&&s.tabTxtActive]}>Notes</Text>
          </TouchableOpacity>
          {/* Search tab */}
          <TouchableOpacity onPress={()=>{setShowSearch(s=>!s);if(!isBible)router.replace("/(app)");}}
            style={[s.tab, showSearch&&s.tabActive]}>
            <Ionicons name="search-outline" size={15} color={showSearch?"#fff":"rgba(255,255,255,0.55)"}/>
            <Text style={[s.tabTxt, showSearch&&s.tabTxtActive]}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <TouchableOpacity onPress={()=>setProfileOpen(p=>!p)}>
          {user.photoURL
            ? <Image source={{uri:user.photoURL}} style={s.avatar}/>
            : <View style={s.avatarFb}><Text style={s.avatarLetter}>{user.displayName?.[0]??"G"}</Text></View>}
        </TouchableOpacity>
      </LinearGradient>

      {/* Expandable search input */}
      {showSearch && (
        <View style={s.searchBar}>
          <Ionicons name="search" size={16} color="#9CA3AF"/>
          <Text style={{flex:1,fontSize:14,color:"#374151"}} onPress={()=>{}}>
            {/* TextInput embedded in BibleReader handles this via globalSearch context */}
          </Text>
        </View>
      )}

      {/* Profile dropdown */}
      {profileOpen && (
        <>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={()=>setProfileOpen(false)}/>
          <View style={[s.profileDrop,{top:insets.top+60}]}>
            <LinearGradient colors={[C.DARK_BLUE,C.MID_BLUE]} style={s.profileHdr}>
              {user.photoURL&&<Image source={{uri:user.photoURL}} style={s.profileAvatar}/>}
              <Text style={s.profileName} numberOfLines={1}>{user.displayName}</Text>
              <Text style={s.profileEmail} numberOfLines={1}>{user.email}</Text>
            </LinearGradient>
            <TouchableOpacity style={s.signOutBtn} onPress={()=>{signOut();setProfileOpen(false);}}>
              <Ionicons name="log-out-outline" size={16} color="#EF4444"/>
              <Text style={s.signOutTxt}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── PAGE CONTENT ── */}
      <View style={{flex:1}}>
        <Slot/>
      </View>

      {/* ── BOTTOM NAV: Book | Chapters | Verses ── */}
      <View style={[s.bottomNav, {paddingBottom: insets.bottom + 4}]}>
        {[
          {label:"Book",     icon:"location-outline",    sheet:"book"},
          {label:"Chapters", icon:"list-outline",        sheet:"chapter"},
          {label:"Verses",   icon:"reorder-three-outline",sheet:"verse"},
        ].map(({label,icon,sheet})=>(
          <TouchableOpacity key={sheet} onPress={()=>openSheet(sheet)} style={s.navBtn}>
            <Ionicons name={icon as any} size={22} color={C.DARK_BLUE}/>
            <Text style={s.navLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header:      {flexDirection:"row",alignItems:"center",paddingHorizontal:10,paddingBottom:10,gap:8},
  navTabs:     {flex:1,flexDirection:"row",gap:4},
  tab:         {flexDirection:"row",alignItems:"center",gap:5,paddingHorizontal:10,paddingVertical:7,borderRadius:10},
  tabActive:   {backgroundColor:"rgba(255,255,255,0.18)"},
  tabTxt:      {fontSize:13,fontWeight:"600",color:"rgba(255,255,255,0.55)"},
  tabTxtActive:{color:"#fff"},
  avatar:      {width:34,height:34,borderRadius:17,borderWidth:2,borderColor:"rgba(255,255,255,0.3)"},
  avatarFb:    {width:34,height:34,borderRadius:17,backgroundColor:"rgba(255,255,255,0.15)",alignItems:"center",justifyContent:"center"},
  avatarLetter:{fontSize:15,fontWeight:"700",color:"#fff"},
  searchBar:   {flexDirection:"row",alignItems:"center",gap:8,paddingHorizontal:14,paddingVertical:10,backgroundColor:"#F9FAFB",borderBottomWidth:1,borderBottomColor:"#E5E7EB"},
  profileDrop: {position:"absolute",right:12,zIndex:100,width:220,backgroundColor:"#fff",borderRadius:16,overflow:"hidden",shadowColor:"#000",shadowOpacity:0.15,shadowRadius:12,elevation:10},
  profileHdr:  {padding:14},
  profileAvatar:{width:40,height:40,borderRadius:20,marginBottom:8},
  profileName: {fontSize:14,fontWeight:"700",color:"#fff"},
  profileEmail:{fontSize:12,color:"rgba(255,255,255,0.6)"},
  signOutBtn:  {flexDirection:"row",alignItems:"center",gap:8,padding:14},
  signOutTxt:  {fontSize:14,color:"#EF4444",fontWeight:"600"},
  bottomNav:   {flexDirection:"row",backgroundColor:"#fff",borderTopWidth:1,borderTopColor:"#E5E7EB"},
  navBtn:      {flex:1,alignItems:"center",justifyContent:"center",paddingVertical:10,gap:3},
  navLabel:    {fontSize:10,fontWeight:"700",color:C.DARK_BLUE},
});
