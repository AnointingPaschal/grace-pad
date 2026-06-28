import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../src/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const DARK_BLUE = "#160A47";
const GOLD = "#C8971B";
const MAROON = "#7B1515";

export default function LoginScreen() {
  const { user, signIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => { if (user) router.replace("/(app)"); }, [user]);

  return (
    <LinearGradient colors={[DARK_BLUE, "#3B1D8C"]} style={s.container}>
      {/* Logo */}
      <View style={s.logoArea}>
        <View style={s.crossContainer}>
          <Text style={s.crossVert}>│</Text>
          <Text style={s.crossH}>──┼──</Text>
        </View>
        <Text style={s.appName}>Grace Pad</Text>
        <Text style={s.tagline}>Your sacred space for gospel notes & Bible study</Text>
      </View>

      {/* Features */}
      <View style={s.features}>
        {[
          { icon: "book-outline",   text: "10 Bible translations with per-verse switching" },
          { icon: "pencil-outline", text: "Rich gospel note editor with verse insertion"   },
          { icon: "search-outline", text: "Real-time scripture search"                      },
          { icon: "cloud-outline",  text: "Synced across all your devices via Google"       },
        ].map(({ icon, text }) => (
          <View key={text} style={s.feature}>
            <Ionicons name={icon as any} size={16} color={GOLD} />
            <Text style={s.featureText}>{text}</Text>
          </View>
        ))}
      </View>

      {/* Verse of the day */}
      <View style={s.verse}>
        <Text style={s.verseText}>
          "Thy word is a lamp unto my feet, and a light unto my path."
        </Text>
        <Text style={s.verseRef}>— Psalm 119:105 KJV</Text>
      </View>

      {/* Sign in button */}
      <TouchableOpacity onPress={signIn} style={s.signInBtn} disabled={loading}>
        <Ionicons name="logo-google" size={20} color={DARK_BLUE} />
        <Text style={s.signInText}>Continue with Google</Text>
      </TouchableOpacity>

      <Text style={s.footer}>Your notes sync securely to your Google account</Text>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container:     { flex:1, alignItems:"center", justifyContent:"center", padding:32, gap:28 },
  logoArea:      { alignItems:"center", gap:8 },
  crossContainer:{ marginBottom:4, alignItems:"center" },
  crossVert:     { fontSize:40, color:GOLD, lineHeight:20 },
  crossH:        { fontSize:18, color:GOLD, marginTop:-8 },
  appName:       { fontSize:36, fontWeight:"700", color:"white", fontFamily:"Georgia" },
  tagline:       { fontSize:14, color:"rgba(255,255,255,0.5)", textAlign:"center", lineHeight:20 },
  features:      { gap:12, alignSelf:"stretch" },
  feature:       { flexDirection:"row", gap:12, alignItems:"flex-start" },
  featureText:   { fontSize:14, color:"rgba(255,255,255,0.7)", flex:1, lineHeight:20 },
  verse:         { backgroundColor:"rgba(255,255,255,0.08)", borderRadius:16, padding:18, alignSelf:"stretch", borderLeftWidth:3, borderLeftColor:GOLD },
  verseText:     { fontSize:15, color:"rgba(255,255,255,0.85)", fontStyle:"italic", fontFamily:"Georgia", lineHeight:24, marginBottom:8 },
  verseRef:      { fontSize:12, color:GOLD, fontWeight:"700", letterSpacing:0.5 },
  signInBtn:     { flexDirection:"row", alignItems:"center", gap:12, backgroundColor:"white", borderRadius:50, paddingVertical:14, paddingHorizontal:28, alignSelf:"stretch", justifyContent:"center", shadowColor:"#000", shadowOpacity:0.2, shadowRadius:8, elevation:4 },
  signInText:    { fontSize:16, fontWeight:"700", color:DARK_BLUE },
  footer:        { fontSize:11, color:"rgba(255,255,255,0.3)", textAlign:"center" },
});
