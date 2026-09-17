import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  BookOpen, 
  GraduationCap, 
  ShieldAlert, 
  Building,
  Sparkles
} from 'lucide-react';
import { Room, User, Booking } from '../types';
import { PSC_TIME_SLOTS, PSC_USERS, getTodayDateStr } from '../data/mockData';
import { checkBookingConflict } from '../utils/conflictChecker';

interface BookingModalProps {
  room: Room | null;
  currentUser: User;
  existingBookings: Booking[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitBooking: (newBooking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  currentUser,
  existingBookings,
  isOpen,
  onClose,
  onSubmitBooking,
}) => {
  if (!isOpen || !room) return null;

  const [date, setDate] = useState(getTodayDateStr(0));
  const [selectedSlotId, setSelectedSlotId] = useState('s1');
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('10:30');
  const [purpose, setPurpose] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [attendeeCount, setAttendeeCount] = useState(Math.min(30, room.capacity));
  const [advisorTeacherId, setAdvisorTeacherId] = useState(
    PSC_USERS.find((u) => u.role === 'teacher')?.id || ''
  );
  const [formError, setFormError] = useState<string | null>(null);

  // When standard slot is selected, update startTime and endTime
  const handleSlotChange = (slotId: string) => {
    setSelectedSlotId(slotId);
    setIsCustomTime(false);
    const slot = PSC_TIME_SLOTS.find((s) => s.id === slotId);
    if (slot) {
      setStartTime(slot.startTime);
      setEndTime(slot.endTime);
    }
  };

  // Real-time conflict validation
  const conflictResult = useMemo(() => {
    return checkBookingConflict(
      room.id,
      date,
      startTime,
      endTime,
      existingBookings
    );
  }, [room.id, date, startTime, endTime, existingBookings]);

  // Advisor teachers list for student requests
  const teachers = PSC_USERS.filter((u) => u.role === 'teacher');
  const selectedTeacher = teachers.find((t) => t.id === advisorTeacherId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!purpose.trim()) {
      setFormError('กรุณาระบุวัตถุประสงค์การใช้งานห้องเรียน');
      return;
    }

    if (currentUser.role === 'student' && !advisorTeacherId) {
      setFormError('นักศึกษาต้องระบุอาจารย์ผู้รับผิดชอบหรืออาจารย์ที่ปรึกษา');
      return;
    }

    if (attendeeCount <= 0 || attendeeCount > room.capacity) {
      setFormError(`จำนวนผู้เข้าใช้ต้องอยู่ระหว่าง 1 ถึง ${room.capacity} คน`);
      return;
    }

    if (conflictResult.hasConflict) {
      setFormError(conflictResult.conflictReason || 'ช่วงเวลานี้มีการจองซ้อนทับ ไม่สามารถจองได้');
      return;
    }

    // Determine initial status based on PSC College policies:
    // Teachers have instant approval on standard rooms, student requests go to pending approval
    const isInstantApproved =
      currentUser.role === 'teacher' && room.allowInstantBookingForTeachers;

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      bookingNumber: `PSC-${new Date().getFullYear().toString().slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      roomId: room.id,
      roomCode: room.code,
      roomName: room.name,
      userId: currentUser.id,
      userCode: currentUser.code,
      userName: currentUser.name,
      userRole: currentUser.role,
      userDepartment: currentUser.department,
      date,
      startTime,
      endTime,
      purpose,
      subjectCode: subjectCode.trim() || undefined,
      subjectName: subjectName.trim() || undefined,
      attendeeCount,
      advisorTeacherId: currentUser.role === 'student' ? advisorTeacherId : undefined,
      advisorTeacherName: currentUser.role === 'student' ? selectedTeacher?.name : undefined,
      status: isInstantApproved ? 'approved' : 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      approvedBy: isInstantApproved ? currentUser.code : undefined,
      approvedByName: isInstantApproved ? `${currentUser.name} (อนุมัติอัตโนมัติสำหรับอาจารย์)` : undefined,
      approvedAt: isInstantApproved ? new Date().toISOString().replace('T', ' ').slice(0, 19) : undefined,
    };

    onSubmitBooking(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header with PSC Color Accent */}
        <div className="bg-[#0C1A4B] text-white p-5 border-b-4 border-[#EC4899] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#EC4899]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-kanit">แบบฟอร์มขอจองห้องเรียนออนไลน์</h2>
              <p className="text-xs text-slate-200">
                {room.name} ({room.code}) • ความจุสูงสุด {room.capacity} ที่นั่ง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          {/* User Info Strip */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">ผู้ขอจอง:</span>
              <span className="font-bold text-[#002D62]">{currentUser.name}</span>
              <span className="text-slate-500 font-mono">({currentUser.code})</span>
            </div>
            <div className="text-slate-600">
              สังกัด: <span className="font-medium">{currentUser.department}</span>
            </div>
          </div>

          {/* Conflict Alert Banner */}
          {conflictResult.hasConflict ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-900">ตรวจพบการจองซ้อนทับ (Conflict Detected)</div>
                <p className="mt-0.5">{conflictResult.conflictReason}</p>
                <p className="text-[11px] text-rose-600 mt-1">
                  กรุณาเปลี่ยนวันที่ หรือเลือกช่วงเวลาอื่นที่ห้องยังว่าง
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <span className="font-semibold">ห้องว่าง:</span> ไม่พบการจองซ้ำซ้อนในช่วงเวลา {startTime} - {endTime} น.
              </span>
            </div>
          )}

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Date and Slot Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                วันที่ต้องการใช้ห้อง <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                min={getTodayDateStr(0)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
                required
              />
            </div>

            {/* Attendee Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                จำนวนผู้เข้าใช้ (คน) <span className="text-slate-400 font-normal">สูงสุด {room.capacity}</span>
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min={1}
                  max={room.capacity}
                  value={attendeeCount}
                  onChange={(e) => setAttendeeCount(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Preset Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                เลือกช่วงเวลา (Time Slot) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomTime(!isCustomTime)}
                className="text-xs text-[#FF6600] hover:underline font-medium"
              >
                {isCustomTime ? 'ใช้ช่วงเวลาคาบมาตรฐาน' : 'กำหนดเวลาเอง (Custom)'}
              </button>
            </div>

            {!isCustomTime ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PSC_TIME_SLOTS.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => handleSlotChange(slot.id)}
                      className={`p-2.5 rounded-lg text-left text-xs border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#FF6600] bg-orange-50 text-[#FF6600] font-semibold ring-1 ring-[#FF6600]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {slot.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6600]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6600]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Purpose & Project info */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              วัตถุประสงค์การใช้ห้อง / หัวข้อกิจกรรม <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="ระบุรายละเอียด เช่น ติวเสริมก่อนสอบ, ซ้อมแข่งขันเขียนโปรแกรม, กิจกรรมสัมมนาสาขาวิชา..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
              required
            />
          </div>

          {/* Subject info (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                รหัสวิชา (ถ้ามี)
              </label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="เช่น 30204-2004"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่อรายวิชา (ถ้ามี)
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="เช่น การพัฒนาโปรแกรมบนอุปกรณ์เคลื่อนที่"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
              />
            </div>
          </div>

          {/* Advisor Teacher Selection for Students */}
          {currentUser.role === 'student' && (
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1.5">
              <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-700" />
                อาจารย์ผู้รับผิดชอบ / อาจารย์ที่ปรึกษาเพื่อส่งคำขออนุมัติ <span className="text-rose-500">*</span>
              </label>
              <select
                value={advisorTeacherId}
                onChange={(e) => setAdvisorTeacherId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600] bg-white text-slate-800"
                required
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.department})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-amber-700">
                * คำขอของนักศึกษาจะถูกส่งไปยังอาจารย์ผู้รับผิดชอบและเจ้าหน้าที่อาคารเพื่อพิจารณาอนุมัติ
              </p>
            </div>
          )}

          {/* Policy Notice for Teachers */}
          {currentUser.role === 'teacher' && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>สิทธิ์อาจารย์/บุคลากร:</strong> ได้รับการอนุมัติการจองทันที (Instant Approval) สำหรับห้องปฏิบัติการทั่วไป
              </span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={conflictResult.hasConflict}
              className={`px-5 py-2.5 rounded-xl text-white font-semibold text-xs transition-all shadow-md ${
                conflictResult.hasConflict
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'btn-psc-primary'
              }`}
            >
              {currentUser.role === 'teacher' ? 'ยืนยันการจองทันที' : 'ส่งคำขอจองห้องเรียน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
