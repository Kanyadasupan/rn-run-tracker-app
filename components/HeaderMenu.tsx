import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/services/supabaseClient";

{/* กำหนดว่า Component นี้ต้องรับค่า userName เข้ามา */}
interface HeaderMenuProps {
  userName: string;
  userEmail: string;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ userName, userEmail }) => {
  {/* ฟังก์ชันออกจากระบบ */}
  const handleLogout = async () => {
    console.log("ออกจากระบบแล้ว!");

    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    }
  };

  return (
    <Menu>
      {/* ตัวปุ่มจุด 3 จุด */}
      <MenuTrigger
        customStyles={{ triggerWrapper: { padding: 10, paddingRight: 15 } }}
      >
        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
      </MenuTrigger>

      {/* กล่องเมนูที่ห้อยลงมา */}
      <MenuOptions
        customStyles={{
          optionsContainer: {
            borderRadius: 10,
            marginTop: 40,
            padding: 10,
            width: 200,
          },
        }}
      >
        {/* ชื่อบัญชี */}
        <MenuOption disableTouchable>
          <Text style={styles.userNameText} numberOfLines={1}>
            {userName}
          </Text>
          {userEmail ? (
            <Text style={styles.userEmailText} numberOfLines={1}>
              {userEmail}
            </Text>
          ) : null}
        </MenuOption>

        <View style={styles.divider} />

        {/* ปุ่มออกจากระบบ */}
        <MenuOption disableTouchable>
          <TouchableOpacity
            activeOpacity={0.4}
            onPress={handleLogout}
            style={styles.logoutContainer}
          >
            <View style={styles.logoutContainer}>
              <Ionicons
                name="log-out-outline"
                size={22}
                color="#ff4444"
                style={styles.logoutIcon}
              />
              <Text style={styles.logoutText}>ออกจากระบบ</Text>
            </View>
          </TouchableOpacity>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
};

const styles = StyleSheet.create({
  userNameText: {
    fontFamily: "Prompt_600SemiBold",
    color: "#69dfff",
    fontSize: 18,
    textAlign: "left",
  },
  userEmailText: {
    fontFamily: "Prompt_400Regular",
    color: "#a1a1a1",
    fontSize: 12,
    marginTop: 2,
    textAlign: "left",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 5,
  },
  logoutText: {
    fontFamily: "Prompt_400Regular",
    color: "#ff4444",
    fontSize: 16,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
});

export default HeaderMenu;
