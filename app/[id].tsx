import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";

import { supabase } from "@/services/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";

export default function RunDetail() {
  
  //สร้างตัวแปรเก็ยข้อมูลที่ส่งมา ณ ที่นี้ คือ id ผ่าน useLocationSearchParams
  const { id } = useLocalSearchParams();

  //สร้าง state เก็บข้อมูลที่ดึงมาจากsupabase และใช้กับหน้าจอเพื่อให้ผู้ใช้ได้ปรับแก้
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("เช้า");
  const [imageUrl, setImageUrl] = useState("");
  const [updating, setUpdating] = useState(false);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [oldImageUrl, setOldImageUrl] = useState("");
  useEffect(() => {
    fetchRun();
  }, [id]);

  //สร้างฟังก์ชันดึงข้อมูลรายการวิ่งจาก supabase ตาม id ที่ส่งมา
  const fetchRun = async () => {
    const { data, error } = await supabase
      .from("runs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    setLocation(data.location);
    setDistance(data.distance.toString());
    setTimeOfDay(data.time_of_day);
    setImageUrl(data.image_url);
    setIsImageChanged(false);

    setOldImageUrl(data.image_url);
  };
  // ฟังก์ชันจัดการสิทธิ์การเข้าถึง
  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraRollStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();

      if (cameraRollStatus !== "granted" || cameraStatus !== "granted") {
        Alert.alert(
          "ขออภัย",
          "แอปต้องการสิทธิ์เข้าถึงกล้องและอัลบั้มรูปภาพเพื่อใช้งานฟีเจอร์นี้",
        );
        return false;
      }
    }
    return true;
  };

  // ฟังก์ชันเปิดเมนูเลือกวิธีเปลี่ยนรูป (ถ่ายใหม่ / แกลเลอรี่)
  const handleChangeImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // สร้างเมนูตัวเลือก
    Alert.alert("แก้ไขรูปภาพ", "เลือกช่องทางที่คุณต้องการเปลี่ยนรูปภาพ", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "📷 ถ่ายรูปภาพใหม่",
        onPress: () => launchPicker("camera"),
      },
      {
        text: "🖼️ เลือกจากแกลเลอรี่",
        onPress: () => launchPicker("library"),
      },
    ]);
  };

  // ฟังก์ชันเปิดกล้องหรือแกลเลอรี่
  const launchPicker = async (type: "camera" | "library") => {
    let result;
    const commonConfig = {
      allowsEditing: true,
      aspect: [16, 9] as [number, number],
      quality: 0.5,
      base64: true,
    };

    if (type === "camera") {
      result = await ImagePicker.launchCameraAsync(commonConfig);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(commonConfig);
    }

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
      setBase64Image(result.assets[0].base64 || null);
      setIsImageChanged(true);
    }
  };

  // ฟังก์ชันอัปโหลดรูปใหม่
  const uploadNewImage = async () => {
    if (!base64Image) return null;

    const fileName = `image_${Date.now()}.jpg`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("run_bk")
      .upload(filePath, decode(base64Image), {
        contentType: "image/jpeg",
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("run_bk").getPublicUrl(filePath);
    return data.publicUrl;
  };

  //ฟังก์ชันแก้ไข
  const handleUpdateRunClick = async () => {
    if (!location || !distance) {
      Alert.alert("คำเตือน", "กรุณากรอกสถานที่และระยะทางให้ครบถ้วน");
      return;
    }

    Alert.alert("บันทึกการแก้ไข", "คุณต้องการบันทึกข้อมูลหรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "บันทึก",
        onPress: async () => {
          setUpdating(true);
          try {
            let finalImageUrl = imageUrl;

            if (isImageChanged && base64Image) {
              const oldUrlToDelete = oldImageUrl;

              console.log("กำลังอัปโหลดรูปภาพใหม่...");
              const newUrl = await uploadNewImage();

              if (newUrl) {
                finalImageUrl = newUrl;

                if (oldUrlToDelete) {
                  console.log("ลบรูปเก่าทิ้งทันที...");
                  const oldFileName = oldUrlToDelete
                    .split("/")
                    .pop()
                    ?.split("?")[0];

                  if (oldFileName) {
                    await supabase.storage.from("run_bk").remove([oldFileName]);
                    console.log("ลบรูปเก่าสำเร็จ:", oldFileName);
                  }
                }
              }
            }

            console.log("⏳ กำลังอัปเดตข้อมูลใน DB...");
            const { error: updateError } = await supabase
              .from("runs")
              .update({
                location: location,
                distance: parseFloat(distance),
                time_of_day: timeOfDay,
                image_url: finalImageUrl,
              })
              .eq("id", id);

            if (updateError) throw updateError;

            setIsImageChanged(false);
            setBase64Image(null);
            Alert.alert("สำเร็จ", "แก้ไขข้อมูลเรียบร้อยแล้ว");
            router.back();
          } catch (error) {
            let errorMessage = "เกิดข้อผิดพลาดที่ไม่รู้จัก";
            if (error instanceof Error) {
              errorMessage = error.message;
            } else if (typeof error === "string") {
              errorMessage = error;
            }
            Alert.alert("Error", "เกิดข้อผิดพลาด: " + errorMessage);
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  //ฟังก์ชันลบ
  const handleDeleteRunClick = async () => {
    //ก่อนลบให้ถามผู้ใช้ก่อนว่าจะลบ
    Alert.alert("ลบรายการวิ่ง", "คุณต้องการลบรายการวิ่งนี้หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          //ลบข้อมูลออกจาก table->supabase
          const { error: tableError } = await supabase
            .from("runs")
            .delete()
            .eq("id", id);
          if (tableError) throw tableError;

          //ลบข้อมูลออกจาก storage->supabase
          if (imageUrl) {
            const fileName = imageUrl.split("/").pop()?.split("?")[0];
            if (fileName) {
              console.log("กำลังลบรูปภาพออกจาก Storage:", fileName);
              const { error: storageError } = await supabase.storage
                .from("run_bk")
                .remove([fileName]);

              if (storageError) {
                console.error(
                  "Warning: ลบรูปใน Storage ไม่สำเร็จ:",
                  storageError.message,
                );
              }
            }
          }

          Alert.alert("สำเร็จ", "รายการวิ่งถูกลบเรียบร้อยแล้ว");
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ส่วนแสดงรูปภาพ */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={handleChangeImage}
        activeOpacity={0.8}
      >
        {imageUrl ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            {/* สัญลักษณ์บอกให้แก้ไขรูปภาพ (Badge) */}
            <View style={styles.editBadge}>
              <Ionicons name="camera-reverse" size={18} color="#FFF" />
              <Text style={styles.editBadgeText}>แก้ไขรูป</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.mainImage, styles.noImage]}>
            <Ionicons name="image-outline" size={60} color="#DDD" />
            <Text style={styles.noImageText}>กดเพื่อเพิ่มรูปภาพประกอบ</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ฟอร์มแก้ไขข้อมูล */}
      <View style={styles.formCard}>
        <Text style={styles.label}>สถานที่</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>ระยะทาง (กม.)</Text>
        <TextInput
          style={styles.input}
          value={distance}
          onChangeText={setDistance}
          keyboardType="numeric"
        />

        <Text style={styles.label}>ช่วงเวลา</Text>
        <View style={styles.row}>
          {/* {(['เช้า', 'เย็น'] as const).map((time) => (
<TouchableOpacity
              key={time}
              style={[styles.chip, timeOfDay === time && styles.chipActive]}
              onPress={() => setTimeOfDay(time)}
>
<Text style={[styles.chipText, timeOfDay === time && styles.chipTextActive]}>
                {time}
</Text>
</TouchableOpacity>
          ))} */}
          <TouchableOpacity
            style={[styles.chip, timeOfDay === "เช้า" && styles.chipActive]}
            onPress={() => setTimeOfDay("เช้า")}
          >
            <Text
              style={[
                styles.chipText,
                timeOfDay === "เช้า" && styles.chipTextActive,
              ]}
            >
              เช้า
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, timeOfDay === "เย็น" && styles.chipActive]}
            onPress={() => setTimeOfDay("เย็น")}
          >
            <Text
              style={[
                styles.chipText,
                timeOfDay === "เย็น" && styles.chipTextActive,
              ]}
            >
              เย็น
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.updateButton, updating && styles.buttonDisabled]}
          disabled={updating}
          onPress={handleUpdateRunClick}
        >
          {updating ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.updateButtonText}>บันทึกการแก้ไข</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteRunClick}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>ลบรายการนี้</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#EEE",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },
  noImageText: {
    fontFamily: "Kanit_400Regular",
    color: "#AAA",
    marginTop: 10,
  },
  formCard: {
    backgroundColor: "#FFF",
    height: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontFamily: "Kanit_700Bold",
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
    textTransform: "uppercase",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingVertical: 10,
    fontFamily: "Kanit_400Regular",
    fontSize: 18,
    color: "#69dfff",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  chipActive: {
    backgroundColor: "#69dfff",
  },
  chipText: {
    fontFamily: "Kanit_400Regular",
    color: "#666",
  },
  chipTextActive: {
    color: "#FFF",
  },
  updateButton: {
    backgroundColor: "#69dfff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  updateButtonText: {
    color: "#FFF",
    fontFamily: "Kanit_700Bold",
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    padding: 10,
  },
  deleteButtonText: {
    color: "#FF3B30",
    fontFamily: "Kanit_400Regular",
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  editBadge: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  editBadgeText: {
    color: "#FFF",
    fontFamily: "Kanit_400Regular",
    fontSize: 12,
    marginLeft: 5,
  },
});
