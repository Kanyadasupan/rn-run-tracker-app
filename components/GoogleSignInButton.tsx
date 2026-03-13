import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "@/services/supabaseClient";

// จัดการ Session บน Mobile Browser
WebBrowser.maybeCompleteAuthSession();

const GoogleSignInButton: React.FC = () => {
  const handleGoogleSignIn = async () => {
    try {
      
      const redirectUri = makeRedirectUri();
      
      console.log("REDIRECT URI:", redirectUri);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: false,
        },
      });
      if (error) throw error;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        // เมื่อล็อกอินเสร็จและเด้งกลับมา ดึงข้อมูล Token มาบันทึกการเข้าสู่ระบบ
        if (result.type === "success" && result.url) {
          console.log(" กลับมาที่แอปสำเร็จ!");
          
          // ดึง access_token และ refresh_token จาก URL ที่ Google ส่งกลับมา
          const urlParams = new URLSearchParams(result.url.split('#')[1]);
          const access_token = urlParams.get('access_token');
          const refresh_token = urlParams.get('refresh_token');

          // บันทึกการเข้าสู่ระบบ
          if (access_token && refresh_token) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (sessionError) throw sessionError;
            console.log("เข้าสู่ระบบเสร็จสมบูรณ์!");
          }
        }
      }
    } catch (error: any) {
      Alert.alert("Login Error", error.message || "Something went wrong");
      console.log("Login Error:", error);
    }
  };

  return (
    <TouchableOpacity style={styles.btnSignIn} onPress={handleGoogleSignIn}>
      <View style={styles.btn}>
        <Image
          source={require("@/assets/images/Google.webp")}
          style={styles.logo}
        />
        <Text style={styles.caption}>Sign in with Google</Text>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  btnSignIn: {
    borderRadius: 10,
    borderColor: "#69dfff",
    borderWidth: 3,
    marginTop: 20,
    width: "100%",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 30,
    height: 31,
    marginRight: 20,
  },
  caption: {
    fontFamily: "Prompt_400Regular",
    fontSize: 20,
    color: "#000000",
  },
});

export default GoogleSignInButton;
