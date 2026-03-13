import { StyleSheet, Text, View, Image, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import { supabase } from "@/services/supabaseClient";

export default function Index() {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.replace("/run");
      } else {
        router.replace("/login");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/images/run.png")} style={styles.logo} />
      <Text style={styles.title}>Run Tracker</Text>
      <Text style={styles.caption}>วิ่งเพื่อสุขภาพ</Text>
      <ActivityIndicator size="large" color="#69dfff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  logo: { width: 200, height: 200, marginBottom: 50 },
  title: {
    fontFamily: "Prompt_700Bold",
    fontSize: 40,
    color: "#69dfff",
    marginBottom: 10,
  },
  caption: {
    fontFamily: "Prompt_400Regular",
    fontSize: 20,
    color: "#616161",
    marginBottom: 50,
  },
});
