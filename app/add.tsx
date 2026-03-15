import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/services/supabaseClient";
import { router, useFocusEffect } from "expo-router";
export default function Add() {
  //สร้าง state เพื่อจัการกับข้อมูล
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("เช้า");
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  //ฟังก์ชันเปิดกล้องถ่ายภาพหรือเลือกรูปจากแกลเลอรี่
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("ขออณุญาตเข้าถึงกล้องเพื่อถ่ายภาพ");
      return;
    }

    //เปิดกล้อง
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    //หลังจาดถ่ายภาพเรียบร้อย เอาไป เก็บใน state ที่ต้องการ
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setBase64Image(result.assets[0].base64 || null);
    }
  };

  //ฟังก์ชันบันทึกข้อมูลจากที่ผู้ใช้ป้อน/เลือกไปไว้ที่ supabase
  // ฟังก์ชันบันทึกข้อมูลจากที่ผู้ใช้ป้อน/เลือกไปไว้ที่ supabase
  const handleSaveToSupabase = async () => {
    // Validation location distance image
    if (!location || !distance || !image) {
      Alert.alert("คำเตือน", "กรุณากรอกข้อมูลให้ครบ และเลือกรูปภาพ");
      return;
    }

    // 1. ดึงข้อมูล User ปัจจุบัน ✨
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("ข้อผิดพลาด", "ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่");
      return;
    }

    // อัปโหลดรูปไปยัง bucket storage supabase
    let image_url = "";
    const fileName = `image_${Date.now()}.jpg`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("run_bk")
      .upload(filePath, decode(base64Image || ""), {
        contentType: "image/jpeg",
      });
    if (uploadError) throw uploadError;

    // เอา url ของรูปจาก bucket
    image_url = supabase.storage.from("run_bk").getPublicUrl(filePath)
      .data.publicUrl;

    // บันทึกข้อมูลไปยัง table database supabase
    const { error: insertError } = await supabase.from("runs").insert([
      {
        location: location,
        distance: distance,
        time_of_day: timeOfDay,
        run_date: new Date().toISOString().split("T")[0],
        image_url: image_url,
        user_id: user.id,
      },
    ]);

    if (insertError) {
      Alert.alert("เกิดข้อผิดพลาด", insertError.message);
      return;
    }

    Alert.alert("สําเร็จ", "ข้อมูลถูกบันทึกเรียบร้อยแล้ว");
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.scollV} contentContainerStyle={{ padding: 20 }}>
        {/*ช่องใส่สถานที่*/}
        <Text style={styles.titleShow}>สถานที่วิ่ง</Text>
        <TextInput
          placeholder="เช่น สวนลุมพินี"
          style={styles.inputValue}
          value={location}
          onChangeText={setLocation}
        ></TextInput>

        {/*ช่องใส่ระยะทาง*/}
        <Text style={styles.titleShow}>ระยะทาง (กิโลเมตร)</Text>
        <TextInput
          placeholder="เช่น 5.2"
          keyboardType="numeric"
          style={styles.inputValue}
          value={distance}
          onChangeText={setDistance}
        ></TextInput>

        <Text style={styles.titleShow}>ช่วงเวลา</Text>
        <View style={styles.timerun}>
          {/*ปุ่มเช้า*/}
          <TouchableOpacity
            style={[
              styles.btntimeselect,
              timeOfDay === "เช้า" && styles.btntimeselectactive,
            ]}
            onPress={() => setTimeOfDay("เช้า")}
          >
            <Text
              style={[
                styles.txtbtntimeselect,
                timeOfDay === "เช้า" && styles.txtbtntimeselectactive,
              ]}
            >
              เช้า
            </Text>
          </TouchableOpacity>

          {/*ปุ่มเย็น*/}
          <TouchableOpacity
            style={[
              styles.btntimeselect,
              timeOfDay === "เย็น" && styles.btntimeselectactive,
            ]}
            onPress={() => setTimeOfDay("เย็น")}
          >
            <Text
              style={[
                styles.txtbtntimeselect,
                timeOfDay === "เย็น" && styles.txtbtntimeselectactive,
              ]}
            >
              เย็น
            </Text>
          </TouchableOpacity>
        </View>

        {/*ปุ่มถ่ายภาพ*/}
        <Text style={styles.titleShow}>รูปภาพสถานที่</Text>
        <TouchableOpacity style={styles.takePhotobtn} onPress={handleTakePhoto}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={{ width: "100%", height: 200 }}
            />
          ) : (
            <View style={styles.takePhoto}>
              <Ionicons name="camera" size={30} color="#d3d3d3" />
              <Text style={styles.txttakePhoto}>กดเพื่อถ่ายภาพ</Text>
            </View>
          )}
        </TouchableOpacity>

        {/*ปุ่มบันทึก*/}
        <TouchableOpacity style={styles.btnSave} onPress={handleSaveToSupabase}>
          <Text style={styles.btnTxtSave}>บันทึกข้อมมูล</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  scollV: {
    flex: 1,
  },
  titleShow: {
    fontSize: 20,
    fontFamily: "Prompt_700Bold",
    marginBottom: 10,
  },
  inputValue: {
    fontSize: 16,
    fontFamily: "Prompt_400Regular",
    marginBottom: 20,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#e9e9e9",
  },
  timerun: {
    flexDirection: "row",
    marginBottom: 20,
  },
  btntimeselect: {
    backgroundColor: "#e3e3e3",
    width: 70,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 30,
    marginRight: 10,
  },
  btntimeselectactive: {
    backgroundColor: "#69dfff",
    width: 70,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 30,
    marginRight: 10,
  },
  txtbtntimeselect: {
    fontSize: 16,
    fontFamily: "Prompt_400Regular",
    color: "#fff",
  },
  txtbtntimeselectactive: {
    fontSize: 16,
    fontFamily: "Prompt_700Bold",
    color: "#fff",
  },
  takePhoto: {
    alignItems: "center",
  },
  takePhotobtn: {
    width: "100%",
    height: 200,
    backgroundColor: "#e9e9e9",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  txttakePhoto: {
    fontSize: 16,
    fontFamily: "Prompt_400Regular",
    color: "#d3d3d3",
  },
  btnSave: {
    width: "100%",
    height: 60,
    backgroundColor: "#69dfff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  btnTxtSave: {
    fontSize: 16,
    fontFamily: "Prompt_700Bold",
    color: "#fff",
  },
});
