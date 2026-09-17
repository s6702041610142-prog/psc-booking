import React, { useState } from 'react';
import { 
  Database, 
  Server, 
  Code2, 
  ShieldCheck, 
  Layers, 
  Copy, 
  Check, 
  Cpu, 
  Table, 
  FileJson,
  Terminal
} from 'lucide-react';

export const SystemArchitectureModal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'db' | 'api' | 'frontend' | 'backend'>('db');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sqlSchemaCode = `-- ==========================================================
-- PSC CLASSROOM BOOKING SYSTEM (วิทยาลัยเทคโนโลยีพงษ์สวัสดิ์)
-- Relational Database Schema (PostgreSQL / MySQL 8.0+)
-- ==========================================================

-- 1. Departments Table (ภาควิชา/สาขาวิชา)
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    dept_code VARCHAR(20) UNIQUE NOT NULL, -- e.g. 'IT', 'DIGITAL_MEDIA'
    name_th VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (ผู้ใช้งาน: นักศึกษา, อาจารย์, เจ้าหน้าที่อาคาร)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_code VARCHAR(30) UNIQUE NOT NULL, -- รหัสนักศึกษา (เช่น 66209010042) หรือ รหัสอาจารย์ (เช่น T-IT-204)
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(25),
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Rooms Table (ข้อมูลห้องเรียนและห้องปฏิบัติการ)
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(30) UNIQUE NOT NULL, -- e.g. 'LAB-301', 'ROOM-201'
    name VARCHAR(150) NOT NULL,
    building VARCHAR(100) NOT NULL, -- e.g. 'อาคาร 3 ศูนย์ไอที'
    floor INT NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    room_type VARCHAR(30) NOT NULL CHECK (room_type IN ('computer_lab', 'lecture', 'studio', 'conference')),
    open_time TIME NOT NULL DEFAULT '08:00:00',
    close_time TIME NOT NULL DEFAULT '18:00:00',
    allow_instant_teacher BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'closed')),
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Equipments Catalog (รายการอุปกรณ์มาตรฐาน)
CREATE TABLE equipments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL -- 'computer', 'projector', 'audio', 'aircon'
);

-- 5. Room Equipments Mapping (อุปกรณ์ประจำห้องและความพร้อมใช้งาน)
CREATE TABLE room_equipments (
    id SERIAL PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    equipment_id INT NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    condition_status VARCHAR(20) DEFAULT 'good' CHECK (condition_status IN ('good', 'fair', 'repair')),
    CONSTRAINT uq_room_equipment UNIQUE (room_id, equipment_id)
);

-- 6. Bookings Table (รายการจองห้องเรียน)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(40) UNIQUE NOT NULL, -- e.g. 'PSC-2609-001'
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    subject_code VARCHAR(30),
    subject_name VARCHAR(150),
    attendee_count INT NOT NULL,
    advisor_teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_booking_time CHECK (start_time < end_time)
);

-- Indexing for high-performance conflict queries & calendar views
CREATE INDEX idx_bookings_conflict ON bookings (room_id, booking_date, start_time, end_time) 
    WHERE status IN ('approved', 'pending');
CREATE INDEX idx_bookings_user ON bookings (user_id);
CREATE INDEX idx_bookings_date ON bookings (booking_date);

-- 7. Booking Approvals & Audit Trail (บันทึกการอนุมัติ/ปฏิเสธ)
CREATE TABLE booking_approvals (
    id SERIAL PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected')),
    rejection_reason TEXT,
    approval_notes TEXT,
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  const backendCode = `// ===============================================================
// Backend Logic: Double-Booking Prevention & ACID Transaction
// Technology: Node.js (Express.js) + PostgreSQL / MySQL
// ===============================================================

import { Request, Response } from 'express';
import { Pool } from 'pg'; // PostgreSQL Client Pool

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * POST /api/bookings
 * จองห้องเรียนพร้อม Transaction Lock ป้องกันการจองซ้อน (Race Condition Prevention)
 */
export async function createBooking(req: Request, res: Response) {
  const client = await pool.connect();

  try {
    const {
      roomId,
      bookingDate,
      startTime,
      endTime,
      purpose,
      attendeeCount,
      subjectCode,
      advisorTeacherId
    } = req.body;
    
    // ดึง user จาก JWT Token (req.user)
    const currentUser = (req as any).user; 

    // 1. Validation เบื้องต้น
    if (!roomId || !bookingDate || !startTime || !endTime || !purpose) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ error: 'เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด' });
    }

    // 2. เริ่มต้น ACID Database Transaction
    await client.query('BEGIN');

    // 3. ตรวจสอบข้อมูลห้อง และล็อคแถวห้องชั่วคราวเพื่อป้องกัน concurrent conflicts
    const roomQuery = await client.query(
      'SELECT id, name, capacity, allow_instant_teacher, status FROM rooms WHERE id = $1 FOR UPDATE',
      [roomId]
    );

    if (roomQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'ไม่พบข้อมูลห้องเรียนที่ระบุ' });
    }

    const room = roomQuery.rows[0];
    if (room.status !== 'available') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'ห้องเรียนนี้อยู่ในระหว่างปิดปรับปรุง' });
    }

    if (attendeeCount > room.capacity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: \`จำนวนผู้เข้าร่วมเกินความจุห้อง (\${room.capacity} คน)\` });
    }

    // 4. CORE CONFLICT CHECK: ตรวจสอบการจองซ้อนทับ (Double-Booking Check)
    // เงื่อนไขเวลาชนกัน: (A_start < B_end) AND (A_end > B_start)
    const conflictQuery = await client.query(
      \`SELECT id, booking_number, start_time, end_time, status 
       FROM bookings 
       WHERE room_id = $1 
         AND booking_date = $2 
         AND status IN ('approved', 'pending')
         AND (start_time < $4 AND end_time > $3)
       FOR UPDATE\`,
      [roomId, bookingDate, startTime, endTime]
    );

    if (conflictQuery.rows.length > 0) {
      await client.query('ROLLBACK');
      const conflict = conflictQuery.rows[0];
      return res.status(409).json({
        error: 'ช่วงเวลานี้มีการจองซ้อนทับแล้ว ไม่สามารถทำรายการได้',
        conflictDetails: {
          bookingNumber: conflict.booking_number,
          time: \`\${conflict.start_time} - \${conflict.end_time}\`,
          status: conflict.status
        }
      });
    }

    // 5. กำหนดสถานะตามนโยบาย PSC (อาจารย์จองห้องทั่วไป -> อนุมัติทันที, นักศึกษา -> รออนุมัติ)
    const isInstant = currentUser.role === 'teacher' && room.allow_instant_teacher;
    const initialStatus = isInstant ? 'approved' : 'pending';
    const bookingNumber = \`PSC-\${Date.now().toString().slice(-6)}\`;

    // 6. บันทึกข้อมูลลงตาราง bookings
    const insertResult = await client.query(
      \`INSERT INTO bookings (
        booking_number, room_id, user_id, booking_date, start_time, end_time,
        purpose, attendee_count, subject_code, advisor_teacher_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *\`,
      [
        bookingNumber, roomId, currentUser.id, bookingDate, startTime, endTime,
        purpose, attendeeCount, subjectCode, advisorTeacherId, initialStatus
      ]
    );

    // 7. Commit Transaction ปลอดภัย 100%
    await client.query('COMMIT');

    return res.status(201).json({
      message: isInstant ? 'จองห้องเรียนสำเร็จและได้รับการอนุมัติทันที' : 'ส่งคำขอจองห้องเรียนสำเร็จ รอการอนุมัติ',
      booking: insertResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing booking:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการประมวลผลคำขอจอง' });
  } finally {
    client.release();
  }
}`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#002D62] to-[#0A3D7A] text-white p-6 rounded-2xl shadow-md border-b-4 border-[#FF6600]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FF6600]/20 border border-[#FF6600]/40 flex items-center justify-center text-[#FFAA00]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">พิมพ์เขียวสถาปัตยกรรมระบบ (System Architecture & Blueprint)</h2>
            <p className="text-xs text-slate-200">
              PSC Classroom Booking System • วิทยาลัยเทคโนโลยีพงษ์สวัสดิ์
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveSection('db')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeSection === 'db'
              ? 'bg-[#002D62] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-[#FF6600]" />
          <span>ส่วนที่ 1: Database Schema</span>
        </button>

        <button
          onClick={() => setActiveSection('api')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeSection === 'api'
              ? 'bg-[#002D62] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Server className="w-4 h-4 text-[#FF6600]" />
          <span>ส่วนที่ 2: RESTful API Endpoints</span>
        </button>

        <button
          onClick={() => setActiveSection('frontend')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeSection === 'frontend'
              ? 'bg-[#002D62] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4 text-[#FF6600]" />
          <span>ส่วนที่ 3: Frontend Architecture</span>
        </button>

        <button
          onClick={() => setActiveSection('backend')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeSection === 'backend'
              ? 'bg-[#002D62] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4 text-[#FF6600]" />
          <span>ส่วนที่ 4: Backend Logic & Lock</span>
        </button>
      </div>

      {/* SECTION 1: DATABASE SCHEMA */}
      {activeSection === 'db' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-[#002D62] flex items-center gap-2">
              <Table className="w-5 h-5 text-[#FF6600]" />
              โครงสร้างฐานข้อมูลเชิงสัมพันธ์ (Relational Schema Overview)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ออกแบบรองรับ ACID Compliance ป้องกันข้อมูลการจองผิดพลาด มีความสัมพันธ์ Foreign Key ชัดเจน และทำ B-Tree Partial Index เพื่อการสืบค้นตรวจจับการจองซ้อนที่รวดเร็วระดับมิลลิวินาที
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800">1. users</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  PK: id (UUID), รหัสผู้ใช้ (user_code: นศ./อาจารย์), email, role, department_id (FK)
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800">2. rooms</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  PK: id (UUID), room_code, building, floor, capacity, room_type, open/close time
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800">3. bookings</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  PK: id (UUID), room_id (FK), user_id (FK), date, start_time, end_time, status, advisor_id (FK)
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800">4. room_equipments & equipments</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  ตารางเชื่อมรายการอุปกรณ์คอมฯ, โปรเจกเตอร์, เครื่องปรับอากาศประจำแต่ละห้อง
                </div>
              </div>
            </div>
          </div>

          {/* SQL Code Block */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-xs shadow-xl">
            <div className="bg-slate-800/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
              <span className="text-slate-300 font-mono flex items-center gap-2">
                <Database className="w-4 h-4 text-[#FF6600]" />
                psc_classroom_schema.sql
              </span>
              <button
                onClick={() => handleCopy('sql', sqlSchemaCode)}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'sql' ? 'คัดลอกแล้ว' : 'คัดลอก SQL'}</span>
              </button>
            </div>
            <pre className="p-4 text-emerald-400 font-mono overflow-x-auto max-h-96 leading-relaxed">
              <code>{sqlSchemaCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* SECTION 2: API ENDPOINTS */}
      {activeSection === 'api' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-base font-bold text-[#002D62] flex items-center gap-2">
              <Server className="w-5 h-5 text-[#FF6600]" />
              RESTful API Specifications
            </h3>
            <p className="text-xs text-slate-600">
              สถาปัตยกรรม API สำหรับระบบจองห้องเรียนวิทยาลัยเทคโนโลยีพงษ์สวัสดิ์ รองรับ JWT Authentication และ RBAC (Role-Based Access Control)
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#002D62] text-white">
                  <tr>
                    <th className="p-3 font-semibold">Method</th>
                    <th className="p-3 font-semibold">Endpoint</th>
                    <th className="p-3 font-semibold">สิทธิ์ (Role)</th>
                    <th className="p-3 font-semibold">คำอธิบาย</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold font-mono">POST</span></td>
                    <td className="p-3 font-mono font-semibold">/api/auth/login</td>
                    <td className="p-3 text-slate-500">Public</td>
                    <td className="p-3">เข้าสู่ระบบด้วยรหัสนักศึกษา/รหัสอาจารย์ + Password</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">GET</span></td>
                    <td className="p-3 font-mono font-semibold">/api/rooms</td>
                    <td className="p-3 text-slate-500">All</td>
                    <td className="p-3">ดึงรายการห้องเรียนทั้งหมด พร้อมสเปกอุปกรณ์ และสถานะ</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">GET</span></td>
                    <td className="p-3 font-mono font-semibold">/api/rooms/:id/schedule</td>
                    <td className="p-3 text-slate-500">All</td>
                    <td className="p-3">ดึงตารางการใช้งานห้องรายวัน/รายสัปดาห์ (Query: date)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold font-mono">POST</span></td>
                    <td className="p-3 font-mono font-semibold">/api/bookings</td>
                    <td className="p-3 text-slate-500">Student, Teacher</td>
                    <td className="p-3">สร้างรายการจองห้องเรียน พร้อมเช็คห้องว่าง Realtime</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-mono">PUT</span></td>
                    <td className="p-3 font-mono font-semibold">/api/bookings/:id/approve</td>
                    <td className="p-3 text-[#FF6600] font-bold">Teacher, Admin</td>
                    <td className="p-3">อนุมัติคำขอจองห้องเรียน (Approval Workflow)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-mono">PUT</span></td>
                    <td className="p-3 font-mono font-semibold">/api/bookings/:id/reject</td>
                    <td className="p-3 text-[#FF6600] font-bold">Teacher, Admin</td>
                    <td className="p-3">ปฏิเสธคำขอจอง พร้อมระบุเหตุผล (Rejection Reason)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold font-mono">DELETE</span></td>
                    <td className="p-3 font-mono font-semibold">/api/bookings/:id</td>
                    <td className="p-3 text-slate-500">Owner, Admin</td>
                    <td className="p-3">ยกเลิกรายการจองห้องเรียนของตนเอง</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">GET</span></td>
                    <td className="p-3 font-mono font-semibold">/api/dashboard/stats</td>
                    <td className="p-3 text-[#002D62] font-bold">Admin</td>
                    <td className="p-3">สรุปสถิติภาพรวม อัตราการใช้ห้อง Peak Hours สำหรับงานอาคาร</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: FRONTEND ARCHITECTURE */}
      {activeSection === 'frontend' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <h3 className="text-base font-bold text-[#002D62]">
              โครงสร้างส่วนหน้า (Frontend UI & Design System)
            </h3>
            <p className="text-slate-600 leading-relaxed">
              พัฒนาด้วย <strong>React 19 + Tailwind CSS</strong> ออกแบบรองรับมือถือและพีซี (Responsive) สไตล์วิทยาลัยเทคโนโลยีพงษ์สวัสดิ์ (PSC) 
              เน้นอัตลักษณ์โทนสี <strong>น้ำเงินเข้ม (#002D62)</strong> สื่อถึงความน่าเชื่อถือ มั่นคงทางวิชาการ และ <strong>สีส้มสดใส (#FF6600)</strong> สื่อถึงความคิดสร้างสรรค์ พลังของคนรุ่นใหม่และสายอาชีวะ
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800">State Architecture</div>
                <div className="text-slate-500 mt-1">
                  แยกข้อมูลห้อง (rooms), การจอง (bookings) และ Role Simulation เพื่อให้ทดสอบได้ครบทุกบทบาททันที
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800">Live Conflict Feedback</div>
                <div className="text-slate-500 mt-1">
                  คำนวณการทับซ้อนของเวลา (startA &lt; endB && endA &gt; startB) ทันทีที่ผู้ใช้ปรับสล็อต
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800">Visual Matrix Calendar</div>
                <div className="text-slate-500 mt-1">
                  ตาราง Matrix Grid แสดงตารางห้องและช่วงเวลาว่างแบบเรียลไทม์ คลิกจองจากช่องว่างได้ทันที
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: BACKEND SAMPLE CODE */}
      {activeSection === 'backend' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-base font-bold text-[#002D62] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#FF6600]" />
              การป้องกันการจองซ้อนด้วย Database Transaction & Row Lock
            </h3>
            <p className="text-xs text-slate-600">
              โค้ด Node.js (Express) + PostgreSQL สาธิตการใช้ <code>BEGIN ... COMMIT / ROLLBACK</code> และคำสั่ง <code>SELECT ... FOR UPDATE</code> เพื่อป้องกันปัญหา Race Condition แม้มีคำขอเข้ามาพร้อมกันในเสี้ยววินาที
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-xs shadow-xl">
            <div className="bg-slate-800/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
              <span className="text-slate-300 font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#FF6600]" />
                server/controllers/bookingController.ts
              </span>
              <button
                onClick={() => handleCopy('backend', backendCode)}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                {copiedKey === 'backend' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'backend' ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}</span>
              </button>
            </div>
            <pre className="p-4 text-emerald-400 font-mono overflow-x-auto max-h-96 leading-relaxed">
              <code>{backendCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
