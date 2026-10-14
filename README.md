# PrintCraft 3D Studio (Palantir White Technical Edition)

> แพลตฟอร์มรับพิมพ์ 3D อัตโนมัติ (Autonomous 3D Fabrication Platform) ที่มาพร้อมระบบ 3D Viewer & Slicer Simulation, การคำนวณและประเมินราคาชิ้นงานทันที, ระบบชำระเงินผ่าน PromptPay QR พร้อมแนบสลิป, ระบบจัดการหลังบ้าน (Backoffice Admin) สำหรับดาวน์โหลดไฟล์ STL ไปพิมพ์ และระบบรักษาความปลอดภัยแบบ Role-Based Authentication

---

## 🌟 ฟีเจอร์หลัก (Key Highlights)

### 1. ฝั่งลูกค้า (Customer & Fabrication Studio)
- **3D STL Viewer (Three.js)**:
  - รองรับการลากวางไฟล์ STL (Binary & ASCII) จากคอมพิวเตอร์ หรือเลือกชิ้นงานตัวอย่าง (3DBenchy, Drone Motor Mount, MagSafe Case)
  - หมุนรอบทิศทาง 360°, ซูมเข้า-ออก, แพนมุมกล้อง, แสดงเส้นตารางพิมพ์ขนาด 256×256 mm (Bambu Lab / Prusa Build Plate)
- **Slicer Layer Simulator (จำลองการตัดสไลซ์ทีละเลเยอร์)**:
  - มีปุ่ม **SLICER VIEW** พร้อมแถบ Slider ให้สไลด์ดูการตัดตามแนวแกน Z
  - แสดง Layer Counter (เช่น `Layer 120 of 240`) และความสูงจริง `Z = 24.00 mm` แบบ Real-time
  - จำลองความหนาแน่นและโครงสร้างถักภายใน (Infill Patterns)
- **การปรับแต่งค่าการพิมพ์ (Print Configuration)**:
  - **Material**: PLA, PETG, ABS, TPU (Flexible), Resin (SLA 8K) พร้อมความหนาแน่นและเรทราคา
  - **Colors**: สีฟิลาเมนต์หลากหลายเฉดสี (Galaxy Blue, Jet Black, Pure White, Sunset Orange ฯลฯ)
  - **Print Resolution / Layer Height**: Draft (0.28mm), Standard (0.20mm), High (0.16mm), Ultra Fine (0.12mm)
  - **Infill % & Pattern**: 10% - 100% พร้อมลาย Grid, Gyroid, Honeycomb, Triangles
  - **Supports**: เปิด/ปิด การสร้างโครงสร้างค้ำยันสำหรับ Overhang > 45°
  - **Quantity**: ปรับจำนวนชิ้นงานพร้อมคำนวณราคายกชุด
- **Instant Price Valuation (คำนวณราคาอัตโนมัติ)**:
  - คำนวณปริมาตรชิ้นงานจริง (Volume $cm^3$) จากสูตร Signed Volume of Tetrahedrons
  - คำนวณน้ำหนักเนื้อพลาสติกที่ใช้จริง (Net Weight g)
  - ประมาณเวลาพิมพ์เสร็จ (Estimated Print Time)
  - แจกแจงต้นทุนอย่างโปร่งใสตามสไตล์ Palantir White Data Spec (ค่าฟิลาเมนต์, ค่าเวลาเครื่องจักร, ค่าเตรียมฐานพิมพ์)
- **PromptPay QR Code & Slip Attachment**:
  - สร้าง QR Code พร้อมเพย์ตามมาตรฐาน EMVCo อัตโนมัติ โดยระบุยอดเงินตรงกับออเดอร์
  - อัปโหลดสลิปโอนเงินพร้อมพรีวิวตรวจสอบได้ทันที
- **Customer Order Tracking**:
  - ค้นหาด้วย Order ID (เช่น `ORD-2026-9041`) หรือ Email
  - แสดง Fabrication Lifecycle Steps: ได้รับออเดอร์ ➔ ตรวจสลิป ➔ กำลังพิมพ์ ➔ จัดส่งแล้ว
  - อัปเดตสลิปย้อนหลังได้ในกรณีที่ยังไม่ได้แนบตอนสั่ง

---

### 2. ฝั่งผู้ดูแลระบบ (Admin & Backoffice Security)
- **Security & Access Control**:
  - ระบบป้องกันการเข้าถึงมั่ว มี **Admin PIN Gate** (ค่าเริ่มต้น: `9876`) และ Master Admin Account (`admin@printcraft3d.com`)
  - หน้าต่างและ API endpoints ทั้งหมดได้รับการปกป้องด้วย Session Role Check (`ADMIN` vs `USER`)
- **Telemetry & Production Dashboard**:
  - สรุปสถิติยอดขายรวม (Total Revenue THB), จำนวนคำสั่งพิมพ์, ออเดอร์ที่รอตรวจสลิป, ชิ้นงานที่กำลังพิมพ์, ปริมาณฟิลาเมนต์ที่ใช้ (kg)
  - ตัวกรองสถานะออเดอร์และช่องค้นหาด่วน
- **Secure STL Download for Operators**:
  - ปุ่มคลิกเดียวสำหรับให้เจ้าหน้าที่และช่างพิมพ์ **ดาวน์โหลดไฟล์ STL ต้นฉบับของลูกค้า** ไปเปิดใน PrusaSlicer, Bambu Studio หรือ Cura เพื่อสั่งพิมพ์จริง
- **Slip Inspection & Status Management**:
  - ระบบซูมดูรูปสลิปโอนเงินของลูกค้าเพื่อตรวจสอบความถูกต้อง
  - ปุ่มเปลี่ยนสถานะการทำงาน: `ยืนยันสลิป (Verify)` ➔ `กำลังพิมพ์ (Printing)` ➔ `พิมพ์สำเร็จ (Completed)` ➔ `จัดส่งแล้ว (Shipped)`
  - ช่องกรอกเลขพัสดุ (Tracking Number) เพื่อส่งให้ลูกค้าติดตามสถานะ
  - ระบบบันทึก Staff Notes ภายใน (เช่น หมายเลขเครื่องพิมพ์, อุณหภูมิเตาพิมพ์)

---

### 3. ระบบยืนยันตัวตน (Authentication)
- รองรับ **Google Account Sign-In** (NextAuth Google Provider)
- รองรับ **Email Authentication** สำหรับลูกค้าทั่วไป
- รองรับ **Admin Master Login / Staff PIN Quick Access**

---

### 4. ดีไซน์สไตล์ Palantir White Technical Theme
- สีขาวสะอาดตา คมชัด (`#ffffff` / `#f8fafc`)
- Typography ชัดเจน สไตล์ Palantir Foundry / Blueprint
- กรอบและเส้นแบ่ง 1px Hairline (`border-slate-200`)
- ตัวเลขสถิติและหน่วยวัดแบบ Monospaced Font (`mm`, `cm³`, `g`, `min`, `THB`)
- Status Chips และ Badge สีสันแสดงสถานะงานอย่างชัดเจน

---

## 🚀 วิธีการติดตั้งและรันในเครื่อง (Local Setup)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ตั้งค่าตัวแปรแวดล้อม (Environment Variables)
cp .env.example .env

# 3. เริ่มต้นเซิร์ฟเวอร์สำหรับ Development
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

---

## 🔑 ข้อมูลเข้าสู่ระบบเริ่มต้น (Default Credentials)

- **Admin Portal URL**: `/admin`
- **Admin Quick PIN**: `9876`
- **Admin Email**: `admin@printcraft3d.com`
- **Admin Password**: `AdminPrintcraft2026!`
- **PromptPay Number**: กำหนดได้ในไฟล์ `.env` (`NEXT_PUBLIC_PROMPTPAY_NUMBER`)

---

## 🛠️ โครงสร้างเทคโนโลยี (Tech Stack)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Palantir White Technical Theme)
- **3D Engine**: Three.js, STLLoader, OrbitControls
- **Auth**: NextAuth.js (Google OAuth & Role-Protected Credentials)
- **Payments**: EMVCo PromptPay QR Code Engine
- **Icons**: Lucide React
