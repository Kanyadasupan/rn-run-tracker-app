# 🏃‍♂️ Run Tracker App
### Mobile Application by React Native Expo & Supabase

แอปพลิเคชันสำหรับบันทึกสถานที่และระยะทางการวิ่ง พัฒนาด้วย **React Native Expo** และใช้งาน **Supabase** เป็นระบบหลังบ้าน (Backend) ทั้งในส่วนของฐานข้อมูล การยืนยันตัวตน และการจัดเก็บไฟล์ภาพ

---

## ✨ คุณสมบัติหลัก (Features)

### 🔐 ระบบ Authentication (Supabase Auth)
* **Google Sign-In:** เข้าสู่ระบบได้ง่ายดายผ่านบัญชี Google
* **Auto Redirect:** ระบบจะนำคุณเข้าสู่หน้าหลักทันทีหลังจากเลือกบัญชีและเข้าสู่ระบบสำเร็จ
* **User Profile:** แสดงชื่อผู้ใช้และอีเมลบนหน้าหลักเพื่อยืนยันตัวตน
* **Log out:** ออกจากระบบได้เพียงคลิกเดียวและกลับไปยังหน้า Login

### 📍 การจัดการสถานที่วิ่ง (Place Management)
* **Add Location:** เพิ่มสถานที่วิ่งใหม่ได้ พร้อมระบุชื่อสถานที่ ระยะทาง และเลือกช่วงเวลา (Morning/Evening)
* **Camera Integration:** สามารถถ่ายรูปสถานที่วิ่งจริงผ่านกล้องมือถือได้ทันที
* **Edit & Update:** แก้ไขข้อมูลสถานที่ ระยะทาง หรือเปลี่ยนรูปภาพใหม่ได้ตลอดเวลา
* **Delete:** ลบรายการที่ไม่ต้องการออกได้จากรายการหลัก

### ☁️ การจัดการข้อมูลและรูปภาพ (Database & Storage)
* **Supabase Database:** บันทึกข้อมูลรายการวิ่งอย่างเป็นระบบ
* **Clean Storage Policy:** เมื่อมีการแก้ไขรูปภาพหรือลบรายการ ระบบจะลบรูปภาพเก่าออกจาก **Supabase Storage Bucket** โดยอัตโนมัติ เพื่อประหยัดพื้นที่จัดเก็บข้อมูล

---

## 📱 หน้าจอแอปพลิเคชัน (Screenshots)

### 🚀 เริ่มต้นใช้งาน
| หน้าจอเริ่มต้น | หน้า Sign in | เลือกบัญชี Google |
|---|---|---|
| <img src="https://github.com/user-attachments/assets/379359bf-d7e7-4a57-80e4-416180dcc429" width="200"> | <img src="https://github.com/user-attachments/assets/53b34226-4776-4015-9385-654e009eb47b" width="200"> | <img src="https://github.com/user-attachments/assets/301425e9-1bbf-414e-b92e-b1780edc47f5" width="200"> |

### 🏠 หน้าหลักและเพิ่มข้อมูล
| รายการสถานที่ | การเพิ่มสถานที่ | ถ่ายภาพสถานที่ |
|---|---|---|
| <img src="https://github.com/user-attachments/assets/0254b71d-4741-487b-8e4f-08582c90c3d5" width="200"> | <img src="https://github.com/user-attachments/assets/7424ea53-1fa9-4014-b796-c89d1b82fe19" width="200"> | <img src="https://github.com/user-attachments/assets/7d1ca095-89be-4e29-893e-10e84852179c" width="200"> |

### 🔍 รายละเอียดและการจัดการ
| ข้อมูลสถานที่ | โหมดแก้ไขข้อมูล | ยืนยันการแก้ไข |
|---|---|---|
| <img src="https://github.com/user-attachments/assets/bafb0cc1-3141-444d-be36-f955f74a986d" width="200"> | <img src="https://github.com/user-attachments/assets/81bad8ce-0088-4bd4-b426-d2fc42f815f3" width="200"> | <img src="https://github.com/user-attachments/assets/401ced7c-46a9-4e17-b4ba-203bafa9da1d" width="200"> |

| การลบรายการ | สถานะการโหลด | บันทึกสำเร็จ |
|---|---|---|
| <img src="https://github.com/user-attachments/assets/d55f0442-9615-4299-8dcd-da12ccda7f96" width="200"> | <img src="https://github.com/user-attachments/assets/08d57462-6f01-4fc8-98c5-de09b10b1e0d" width="200"> | <img src="https://github.com/user-attachments/assets/8962579c-fbc4-41ff-be32-727ff821258e" width="200"> |

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

* **Frontend:** React Native (Expo)
* **Backend as a Service (BaaS):** [Supabase](https://supabase.com/)
  * **Authentication:** Google OAuth
  * **Database:** PostgreSQL
  * **Storage:** Bucket สำหรับเก็บรูปภาพสถานที่
* **Icons:** Expo Vector Icons

---

## 📊 Database Schema (Supabase)
โครงสร้างตารางในระบบ Supabase ที่ใช้สำหรับจัดเก็บข้อมูลการเข้าสู่ระบบและรายการสถานที่วิ่ง

<img src="https://github.com/user-attachments/assets/ef864221-02af-413b-822a-305fe363c5a6" width="500">

---

## 👤 ผู้พัฒนา
**Developed by [Kanyada](https://github.com/KanyadaSupan)**
*Student at Southeast Asia University | Digital Technology and Innovation*

---
