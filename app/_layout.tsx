import { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "../src/contexts/AuthContext";
import { BibleProvider } from "../src/contexts/BibleContext";
import { NotesProvider } from "../src/contexts/NotesContext";

SplashScreen.preventAutoHideAsync();

export default function Root() {
  useEffect(() => { SplashScreen.hideAsync(); }, []);
  return (
    <GestureHandlerRootView style={{flex:1}}>
      <SafeAreaProvider>
        <AuthProvider>
          <BibleProvider>
            <NotesProvider>
              <Stack screenOptions={{headerShown:false}}>
                <Stack.Screen name="login"/>
                <Stack.Screen name="(app)"/>
              </Stack>
            </NotesProvider>
          </BibleProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
