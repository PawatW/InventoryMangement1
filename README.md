# ระบบจัดการคลังสินค้า (Inventory Management System)

ระบบบริหารคลังสินค้าครบวงจร พัฒนาด้วย Spring Boot (Backend) และ Next.js (Frontend)  
รองรับ 6 บทบาท: Admin, Warehouse, Procurement, Sales, Technician, Foreman

---

## สารบัญ

- [สิ่งที่ต้องติดตั้ง](#สิ่งที่ต้องติดตั้ง)
- [เริ่มต้นด้วย Docker (แนะนำ)](#เริ่มต้นด้วย-docker-แนะนำ)
- [บัญชีผู้ใช้ทดสอบ](#บัญชีผู้ใช้ทดสอบ)
- [ข้อมูลตัวอย่าง](#ข้อมูลตัวอย่าง)
- [รัน Development Mode (ไม่ใช้ Docker)](#รัน-development-mode-ไม่ใช้-docker)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [API Endpoints สำคัญ](#api-endpoints-สำคัญ)

---

## สิ่งที่ต้องติดตั้ง

| เครื่องมือ | เวอร์ชันที่แนะนำ |
|-----------|----------------|
| Docker Desktop | 24+ |
| Docker Compose | v2.20+ (รวมอยู่ใน Docker Desktop) |
| (สำหรับ Dev mode) Java | 21 |
| (สำหรับ Dev mode) Maven | 3.9+ |
| (สำหรับ Dev mode) Node.js | 20+ |
| (สำหรับ Dev mode) PostgreSQL | 15 |

---

## เริ่มต้นด้วย Docker (แนะนำ)

### ขั้นตอนที่ 1 — สร้างไฟล์ `.env`

```bash
cp .env.example .env
```

แก้ไขค่าในไฟล์ `.env`:

```env
DB_PASSWORD=changeme123          # รหัสผ่าน PostgreSQL (ตั้งได้เอง)
JWT_SECRET=<base64-string>       # สร้างด้วย: openssl rand -base64 64
CLOUDINARY_URL=cloudinary://...  # จาก Cloudinary Dashboard (ดูด้านล่าง)
```

> **Cloudinary** ใช้สำหรับอัพโหลดรูปสินค้าและสลิปการชำระเงิน  
> สมัครฟรีได้ที่ [cloudinary.com](https://cloudinary.com) → Dashboard → API Keys  
> หากยังไม่มี ระบบยังทำงานได้แต่การอัพโหลดรูปจะไม่สำเร็จ

### ขั้นตอนที่ 2 — รัน Docker Compose

```bash
docker compose up --build
```

> ครั้งแรกจะใช้เวลา ~5–10 นาที (ดาวน์โหลด dependencies และ build)

### ขั้นตอนที่ 3 — เปิดใช้งาน

| บริการ | URL |
|--------|-----|
| Frontend (หน้าเว็บ) | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| PostgreSQL | localhost:5432 (DB: `inventory`, User: `invuser`) |

### หยุดระบบ

```bash
docker compose down          # หยุด container (ข้อมูลยังคงอยู่)
docker compose down -v       # หยุดและลบข้อมูล database ทั้งหมด
```

### รีเซ็ตข้อมูลทั้งหมด (เริ่มใหม่)

```bash
docker compose down -v
docker compose up --build
```

---

## บัญชีผู้ใช้ทดสอบ

รหัสผ่านทุกบัญชี: **`defaultPassword123`**

| อีเมล | บทบาท | สิทธิ์หลัก |
|-------|--------|-----------|
| `admin@company.com` | **Admin** | เข้าถึงทุกส่วนของระบบ |
| `warehouse@company.com` | **Warehouse** | รับสินค้า, จัดการสต็อก, ใบสั่งซื้อ |
| `procurement@company.com` | **Procurement** | สร้างใบสั่งซื้อ, จัดการซัพพลายเออร์ |
| `sales@company.com` | **Sales** | สร้างคำสั่งซื้อ, จัดการลูกค้า |
| `technician@company.com` | **Technician** | สร้างคำขอเบิกสินค้า |
| `foreman@company.com` | **Foreman** | อนุมัติ/ปฏิเสธคำขอเบิก |

---

## ข้อมูลตัวอย่าง

ระบบ load ข้อมูลตัวอย่าง (`mock-data.sql`) อัตโนมัติเมื่อเริ่มต้นครั้งแรก:

### สินค้าในคลัง (8 รายการ)

| รหัส | ชื่อสินค้า | คงเหลือ | ราคาขาย |
|------|-----------|---------|---------|
| PROD001 | มอเตอร์ไฟฟ้า 3 แรงม้า 380V | 30 ตัว | 3,800 ฿ |
| PROD002 | ปั๊มน้ำซับเมอร์ส 1.5 แรงม้า | 20 ตัว | 4,900 ฿ |
| PROD003 | สายไฟ VCT 2x1.5 มม. | 150 เมตร | 29 ฿/ม. |
| PROD004 | แบตเตอรี่ 12V 100Ah | 15 ลูก | 4,200 ฿ |
| PROD005 | สวิทช์ควบคุมมอเตอร์ 3 เฟส | 50 ชุด | 990 ฿ |
| PROD006 | ตลับลูกปืน 6205-2RS | 80 ลูก | 150 ฿ |
| PROD007 | น้ำมันเครื่อง 10W-40 1 ลิตร | 60 กระป๋อง | 160 ฿ |
| PROD008 | ผ้าเบรกหน้า ชุดซ้าย-ขวา | 25 ชุด | 750 ฿ |

### สถานการณ์ตัวอย่างที่พร้อมทดสอบ

| สถานการณ์ | วิธีทดสอบ |
|-----------|-----------|
| **อนุมัติคำขอเบิก** (REQ00001, REQ00003) | Login ด้วย `foreman` → หน้าคำขอเบิก → กดอนุมัติ |
| **จัดส่งสินค้า FIFO** (REQ00002 — Approved) | Login ด้วย `warehouse` → หน้าคำขอเบิก → กดจัดส่ง |
| **รับสินค้าตามใบสั่งซื้อ** (PO000001, PO000002) | Login ด้วย `warehouse` → ใบสั่งซื้อ → กดรับสินค้า |
| **ยืนยัน/ยกเลิกคำสั่งซื้อ** (ORD00003 — New order) | Login ด้วย `sales` → คำสั่งซื้อ → กดยืนยัน |
| **ดูรายงานการเบิกจ่าย** | Login ด้วย `admin` → หน้ารายงาน |

---

## รัน Development Mode (ไม่ใช้ Docker)

### 1. เริ่ม PostgreSQL

ต้องมี PostgreSQL 15 รันอยู่ สร้าง database:

```sql
CREATE DATABASE inventory;
CREATE USER invuser WITH PASSWORD 'changeme123';
GRANT ALL PRIVILEGES ON DATABASE inventory TO invuser;
```

รัน schema และ mock data:

```bash
psql -U invuser -d inventory -f schema.sql
psql -U invuser -d inventory -f mock-data.sql
```

### 2. รัน Backend

```bash
cd backend

export JDBC_DATABASE_URL="jdbc:postgresql://localhost:5432/inventory"
export SPRING_DATASOURCE_USERNAME="invuser"
export SPRING_DATASOURCE_PASSWORD="changeme123"
export JWT_SECRET="bXlTdXBlclNlY3JldEtleUZvckpXVFRva2VuSW52ZW50b3J5TWFuYWdlbWVudFN5c3RlbTEyMzQ1Njc4OTA="
export CLOUDINARY_URL="cloudinary://key:secret@cloud"

mvn spring-boot:run
```

Backend จะรันที่: http://localhost:8080

### 3. รัน Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend จะรันที่: http://localhost:3000

---

## โครงสร้างโปรเจกต์

```
InventoryMangement1/
├── schema.sql              # DDL: สร้างตารางทั้งหมด
├── mock-data.sql           # ข้อมูลตัวอย่างสำหรับ development
├── docker-compose.yml      # Docker Compose configuration
├── .env.example            # ตัวอย่าง environment variables
│
├── backend/                # Spring Boot (Java 21)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/inventory/
│       ├── config/         # SecurityConfig, CORS
│       ├── controller/     # REST controllers
│       ├── repo/           # JdbcTemplate repositories
│       ├── service/        # Business logic (FIFO, weighted avg cost)
│       ├── security/       # JwtUtil, JwtFilter
│       └── util/           # IdGenerator
│
└── frontend/               # Next.js 14 App Router
    ├── Dockerfile
    ├── app/
    │   ├── page.tsx                    # หน้า Login
    │   └── (dashboard)/
    │       ├── layout.tsx              # Auth guard + AppShell
    │       ├── dashboard/page.tsx      # แดชบอร์ด
    │       ├── inventory/page.tsx      # สินค้า
    │       ├── orders/page.tsx         # คำสั่งซื้อ
    │       ├── requests/page.tsx       # คำขอเบิก
    │       ├── stock/page.tsx          # สต็อก
    │       ├── purchase-orders/page.tsx# ใบสั่งซื้อ
    │       ├── customers/page.tsx      # ลูกค้า
    │       ├── suppliers/page.tsx      # ซัพพลายเออร์
    │       ├── staff/page.tsx          # พนักงาน (Admin)
    │       └── reports/page.tsx        # รายงาน (Admin)
    ├── components/
    │   ├── AuthContext.tsx             # JWT auth state
    │   ├── AppShell.tsx                # Sidebar + navigation
    │   ├── Modal.tsx                   # Reusable modal
    │   └── StatusBadge.tsx             # Status labels
    └── lib/
        ├── api.ts                      # apiFetch (JSON + FormData)
        ├── swr.ts                      # useAuthedSWR hook
        ├── types.ts                    # TypeScript interfaces
        └── config.ts                   # API base URL, role labels
```

---

## API Endpoints สำคัญ

| Method | Path | คำอธิบาย | บทบาท |
|--------|------|----------|-------|
| POST | `/login` | เข้าสู่ระบบ | ทุกคน |
| GET | `/products` | รายการสินค้า | ทุกคน |
| POST | `/products` | เพิ่มสินค้า | WAREHOUSE, PROCUREMENT, ADMIN |
| GET | `/orders` | คำสั่งซื้อทั้งหมด | ADMIN |
| POST | `/orders` | สร้างคำสั่งซื้อ | SALES, ADMIN |
| PATCH | `/orders/{id}/confirm` | ยืนยันคำสั่งซื้อ | SALES, ADMIN |
| GET | `/requests/pending` | คำขอที่รออนุมัติ | FOREMAN, ADMIN |
| PATCH | `/requests/{id}/approve` | อนุมัติคำขอ | FOREMAN, ADMIN |
| POST | `/requests/{id}/fulfill` | จัดส่งสินค้า (FIFO) | WAREHOUSE, ADMIN |
| POST | `/stock/in` | รับสินค้าเข้าคลัง | WAREHOUSE, ADMIN |
| POST | `/purchase-orders` | สร้างใบสั่งซื้อ | WAREHOUSE, PROCUREMENT, ADMIN |
| POST | `/purchase-orders/{id}/receive` | รับสินค้าตามใบสั่งซื้อ | WAREHOUSE, ADMIN |
| GET | `/stock/transactions` | ประวัติการเคลื่อนไหว | ADMIN |
| GET | `/staff` | รายการพนักงาน | ADMIN |

---

## หมายเหตุสำคัญ

- **FIFO**: การจัดส่งสินค้าใช้หลัก First-In First-Out ตาม `received_date` ของแต่ละล็อต
- **Weighted Average Cost**: ราคาทุนเฉลี่ยถ่วงน้ำหนักคำนวณใหม่ทุกครั้งที่รับสินค้า
- **JWT**: Token มีอายุ 150 นาที หลังจากนั้นต้อง Login ใหม่
- **รูปภาพ**: ต้องมี Cloudinary account สำหรับอัพโหลด — หากไม่มีสามารถข้ามขั้นตอนนั้นได้
