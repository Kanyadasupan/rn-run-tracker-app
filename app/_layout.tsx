import {
  Prompt_400Regular,
  Prompt_600SemiBold,
  Prompt_700Bold,
  useFonts,
} from "@expo-google-fonts/prompt";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";
import { Session } from "@supabase/supabase-js";
import HeaderMenu from "@/components/HeaderMenu";
import { MenuProvider } from "react-native-popup-menu";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Prompt_400Regular,
    Prompt_600SemiBold,
    Prompt_700Bold,
  });

  // ตรวจสอบสถานะการล็อกอิน
  useEffect(() => {
    // เช็ค session ปัจจุบัน
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsReady(true);
    });

    // ติดตามการเปลี่ยนแปลง (เช่น ล็อกอินสำเร็จ หรือ กด Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // จัดการเรื่องการเปลี่ยนหน้า
  useEffect(() => {
    if (!isReady || !fontsLoaded) return;

    const inAuthGroup = segments[0] === "login";
    const isSplashScreen = pathname === "/";

    if (isSplashScreen) {
      if (fontsLoaded) {
        SplashScreen.hideAsync();
      }
      return; 
    }
    if (!session && !inAuthGroup) {
      router.replace("/login");
    } else if (session && inAuthGroup) {
      router.replace("/run");
    }
  }, [session, segments, pathname, isReady, fontsLoaded, router]);

  if (!fontsLoaded || !isReady) {
    return null;
  }

  return (
    <MenuProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#69dfff",
          },
          headerTitleStyle: {
            fontFamily: "Prompt_700Bold",
            fontSize: 20,
            color: "#fff",
          },
          headerTintColor: "#fff",
          headerBackButtonDisplayMode: "minimal",
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="add" options={{ title: "เพิ่มรายการวิ่ง" }} />
        <Stack.Screen
          name="run"
          options={{
            title: "Run Tracker",
            headerRight: () => {
              const userName =
                session?.user?.user_metadata?.full_name || "ผู้ใช้งาน";
              const userEmail = session?.user?.email || "";
              return <HeaderMenu userName={userName} userEmail={userEmail} />;
            },
          }}
        />
        <Stack.Screen name="[id]" options={{ title: "รายละเอียดรายการวิ่ง" }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </MenuProvider>
  );
}
