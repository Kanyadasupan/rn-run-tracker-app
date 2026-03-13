import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  FlatList,
} from "react-native";
import React, { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "@/services/supabaseClient";

import { RunsType } from "@/types/runstype";

const run = require("@/assets/images/run.png");

export default function Run() {
  //สร้าง state เก็บข้อมูลที่ดึงมาจากsupabase
  const [runs, setRuns] = React.useState<RunsType[]>([]);

  //สร้างฟังก์ชันดึงข้อมูลรายการวิ่งจาก supabase
  const fetchRuns = async () => {
    //ดึง
    const { data, error } = await supabase.from("runs").select("*");
    //ตรวจสอบ error
    if (error) {
      Alert.alert("คำเตือน", "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      return;
    }
    //กำหนดข้อมูลที่ดึงมาให้กับ state
    setRuns(data as RunsType[]);
  };
  //เรียกใช้ฟังก์ชันดึงข้อมูล (fetchRuns)
  useFocusEffect(
    useCallback(() => {
      fetchRuns();
    }, []),
  );

  //สร้างฟังก์ชันแสดงหน้าตาของแต่ละรายการที่ flatlist
  const renderItem = ({ item }: { item: RunsType }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Image source={{ uri: item.image_url }} style={styles.cardImage} />
        <View style={styles.distanceBadge}>
          <Text style={styles.locationText}>{item.location}</Text>
          <Text style={styles.dateText}>
            {(() => {
              const date = new Date(item.run_date);
              const buddhistYear = "พ.ศ. " + (date.getFullYear() + 543);
              return (
                new Intl.DateTimeFormat("th-TH", {
                  month: "long",
                  day: "numeric",
                }).format(date) +
                " " +
                buddhistYear
              );
            })()}
          </Text>
        </View>
        <Text style={styles.distanceText}>{item.distance} km</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/*ส่วนแสดงรูปด้านบน*/}
      <Image source={run} style={styles.imglogo} />

      {/*ส่วนแสดงรายการวิ่ง*/}
      <FlatList
        data={runs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/add")}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    width: 75,
    height: 75,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#69dfff",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    borderRadius: 50,
    shadowColor: "#000",
  },
  imglogo: {
    width: 120,
    height: 120,
    marginTop: 20,
    margin: "auto",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    // Shadow สำหรับ iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Elevation สำหรับ Android
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 10,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  distanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationText: {
    fontFamily: "prompt_700Bold",
    fontSize: 18,
    color: "#333",
    marginBottom: 4,
  },
  dateText: {
    fontFamily: "prompt_400Regular",
    fontSize: 14,
    color: "#888",
  },
  distanceText: {
    fontFamily: "prompt_700Bold",
    fontSize: 14,
    color: "#69dfff",
  },
  listPadding: {
    padding: 20,
    paddingBottom: 100, // เว้นที่ให้ FAB
  },
});
