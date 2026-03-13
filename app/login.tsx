import { StyleSheet, Text, View } from "react-native";
import React from "react";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function Login() {
  return (
    <View style={styles.outContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign In</Text>
        <GoogleSignInButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 20,
    width: '90%',
  },
  title: {
    fontFamily: "Prompt_700Bold",
    fontSize: 40,
    color: "#69dfff",
    marginBottom: 10,
  },
  outContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#69dfff",
    padding: 10,
  },
});
