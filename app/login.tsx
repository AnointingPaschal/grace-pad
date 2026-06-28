import { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { C } from "../src/constants";

const FEATURES = [
  {icon:"book-outline",      text:"10 Bible translations — AMP, KJV, NIV, ESV, NLT and more"},
  {icon:"swap-horizontal",   text:"Per-verse translation switching, instant & offline"},
  {icon:"pencil-outline",    text:"Rich gospel note editor with verse insertion"},
  {icon:"search-outline",    text:"Real-time scripture search with OT/NT filter"},
  {icon:"cloud-done-outline",text:"Notes synced across all devices via Google"},
];

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (user) router.replace("/(app)"); }, [user]);

  return (
    <LinearGradient colors={[C.DARK_BLUE,"#3B1D8C","#160A47"]} style={s.bg}>
      {/* Cross logo */}
      <View style={s.logo}>
        <Text style={s.cross}>✝</Text>
        <Text style={s.name}>Grace Pad</Text>
        <Text style={s.tag}>Your sacred space for gospel notes & Bible study</Text>
      </View>

      {/* Features */}
      <View style={s.features}>
        {FEATURES.map(f=>(
          <View key={f.text} style={s.feat}>
            <Ionicons name={f.icon as any} size={16} color={C.GOLD}/>
            <Text style={s.featTxt}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* Verse */}
      <View style={s.verse}>
        <Text style={s.vt}>"Thy word is a lamp unto my feet, and a light unto my path."</Text>
        <Text style={s.vr}>— Psalm 119:105 KJV</Text>
      </View>

      {/* Button */}
      <TouchableOpacity onPress={signIn} style={s.btn} disabled={loading}>
        <Ionicons name="logo-google" size={20} color={C.DARK_BLUE}/>
        <Text style={s.btnTxt}>Continue with Google</Text>
      </TouchableOpacity>
      <Text style={s.foot}>Your notes sync securely to your Google account</Text>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  bg:      {flex:1,paddingHorizontal:28,paddingTop:80,paddingBottom:40,gap:24},
  logo:    {alignItems:"center",gap:8},
  cross:   {fontSize:56,color:C.GOLD},
  name:    {fontSize:36,fontWeight:"700",color:"#fff",fontFamily:"serif"},
  tag:     {fontSize:13,color:"rgba(255,255,255,0.5)",textAlign:"center"},
  features:{gap:12},
  feat:    {flexDirection:"row",gap:12,alignItems:"flex-start"},
  featTxt: {fontSize:14,color:"rgba(255,255,255,0.75)",flex:1,lineHeight:20},
  verse:   {backgroundColor:"rgba(255,255,255,0.08)",borderRadius:16,padding:18,borderLeftWidth:3,borderLeftColor:C.GOLD},
  vt:      {fontSize:15,color:"rgba(255,255,255,0.85)",fontStyle:"italic",fontFamily:"serif",lineHeight:24,marginBottom:8},
  vr:      {fontSize:12,color:C.GOLD,fontWeight:"700",letterSpacing:0.5},
  btn:     {flexDirection:"row",alignItems:"center",justifyContent:"center",gap:12,backgroundColor:"#fff",borderRadius:50,paddingVertical:14,shadowColor:"#000",shadowOpacity:0.2,shadowRadius:8,elevation:4},
  btnTxt:  {fontSize:16,fontWeight:"700",color:C.DARK_BLUE},
  foot:    {fontSize:11,color:"rgba(255,255,255,0.3)",textAlign:"center"},
});
