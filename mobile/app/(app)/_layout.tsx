import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/AuthContext";
import { useBible } from "../../src/contexts/BibleContext";

const DARK_BLUE = "#160A47";
const GOLD = "#C8971B";

function TopHeader() {
  const { user, signOut } = useAuth();
  const { setGlobalSearch, setActiveSheet } = useBible();

  return (
    <View style={h.header}>
      {/* Left: Bible + Notes tabs */}
      <View style={h.tabs}>
        <TabBtn label="Bible" icon="book" href="/(app)" />
        <TabBtn label="Notes" icon="pencil" href="/(app)/notes" />
        <TouchableOpacity onPress={() => {}} style={h.tab}>
          <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.6)" />
          <Text style={h.tabLabel}>Search</Text>
        </TouchableOpacity>
      </View>
      {/* Right: profile */}
      {user?.photoURL && (
        <TouchableOpacity onPress={signOut}>
          <View style={h.avatar}>
            <Text style={h.avatarLetter}>{user.displayName?.[0] ?? "G"}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

function TabBtn({ label, icon, href }: { label: string; icon: string; href: string }) {
  return (
    <TouchableOpacity style={h.tab}>
      <Ionicons name={`${icon}-outline` as any} size={16} color="rgba(255,255,255,0.7)" />
      <Text style={h.tabLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function AppLayout() {
  const { user, loading } = useAuth();
  const { setActiveSheet } = useBible();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading]);

  if (!user) return null;

  return (
    <Tabs
      screenOptions={{
        header: () => <TopHeader />,
        tabBarStyle: { backgroundColor:"white", borderTopWidth:1, borderTopColor:"#E5E7EB", height:56+insets.bottom, paddingBottom:insets.bottom },
        tabBarActiveTintColor: DARK_BLUE,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: { fontSize:10, fontWeight:"600" },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: "Bible",
        tabBarIcon: ({ color, size }) => <Ionicons name="location-outline" onPress={() => setActiveSheet("book")} size={size} color={color} />,
        tabBarButton: (props) => (
          <View style={{ flex:1, flexDirection:"row" }}>
            <TouchableOpacity {...props as any} style={{ flex:1, alignItems:"center", justifyContent:"center" }} onPress={() => setActiveSheet("book")}>
              <Ionicons name="location-outline" size={22} color={DARK_BLUE} />
              <Text style={{ fontSize:10, fontWeight:"600", color:DARK_BLUE, marginTop:2 }}>Book</Text>
            </TouchableOpacity>
          </View>
        ),
      }} />
      <Tabs.Screen name="notes/index" options={{
        title:"Chapters",
        tabBarButton: (props) => (
          <TouchableOpacity style={{ flex:1, alignItems:"center", justifyContent:"center" }} onPress={() => setActiveSheet("chapter")}>
            <Ionicons name="list-outline" size={22} color={DARK_BLUE} />
            <Text style={{ fontSize:10, fontWeight:"600", color:DARK_BLUE, marginTop:2 }}>Chapters</Text>
          </TouchableOpacity>
        ),
      }} />
      <Tabs.Screen name="notes/[id]" options={{ href:null }} />
    </Tabs>
  );
}

const h = StyleSheet.create({
  header: { backgroundColor:DARK_BLUE, flexDirection:"row", alignItems:"center", paddingHorizontal:12, paddingTop:52, paddingBottom:10, gap:8 },
  tabs: { flex:1, flexDirection:"row", gap:4 },
  tab: { flexDirection:"row", alignItems:"center", gap:5, paddingHorizontal:10, paddingVertical:7, borderRadius:10 },
  tabLabel: { fontSize:13, fontWeight:"600", color:"rgba(255,255,255,0.6)" },
  avatar: { width:32, height:32, borderRadius:16, backgroundColor:"rgba(255,255,255,0.15)", alignItems:"center", justifyContent:"center" },
  avatarLetter: { fontSize:15, fontWeight:"700", color:"white" },
});
