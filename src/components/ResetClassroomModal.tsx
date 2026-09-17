import React, { useState } from 'react';
import { 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Building2, 
  CalendarX2, 
  Sparkles,
  RefreshCw,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { Room, User } from '../types';

interface ResetClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  currentUser?: User;
  onResetAllToDefault: () => void;
  onClearAllBookings: () => void;
  onResetSingleRoom: (roomId: string) => void;
  defaultRoomId?: string;
}

export const ResetClassroomModal: React.FC<ResetClassroomModalProps> = ({
  isOpen,
  onClose,
  rooms,
  currentUser,
  onResetAllToDefault,
  onClearAllBookings,
  onResetSingleRoom,
  defaultRoomId,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(defaultRoomId || rooms[0]?.id || '');
  const [resetType, setResetType] = useState<'default' | 'clear-all' | 'single-room'>('default');

  if (!isOpen) return null;

  const isAuthorized = currentUser ? (currentUser.role === 'teacher' || currentUser.role === 'admin') : true;

  const handleConfirm = () => {
    if (!isAuthorized) {
      alert('ขออภัย เฉพาะอาจารย์หรือผู้ดูแลระบบเท่านั้นที่มีสิทธิ์รีเซ็ตห้องเรียน');
      return;
    }
    if (resetType === 'default') {
      onResetAllToDefault();
    } else if (resetType === 'clear-all') {
      onClearAllBookings();
    } else if (resetType === 'single-room') {
      if (selectedRoomId) {
        onResetSingleRoom(selectedRoomId);
      }
    }
    onClose();
  };

  const selectedRoomObj = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#e7edf6] overflow-hidden">
        {/* Header */}
        <div className="bg-[#0C1A4B] text-white p-5 border-b-4 border-[#EC4899] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#EC4899]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-kanit text-white">
                รีเซ็ตข้อมูลห้องเรียน (Reset Classrooms)
              </h3>
              <p className="text-xs text-slate-300">
                คืนค่าตารางการจองและล้างสถานะห้องเรียนสำหรับการทดสอบระบบ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Permission Badge */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0C1A4B]/5 border border-[#0C1A4B]/10 text-xs">
            <div className="flex items-center gap-2 text-[#0C1A4B] font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ระดับสิทธิ์ที่อนุญาต:</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0C1A4B] text-white">
              เฉพาะอาจารย์ & ผู้ดูแลระบบ
            </span>
          </div>

          {!isAuthorized && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>ขออภัย บัญชีปัจจุบันเป็นสิทธิ์นักศึกษา ไม่มีสิทธิ์ดำเนินการรีเซ็ตข้อมูลห้องเรียน</span>
            </div>
          )}

          <div className="text-xs text-[#5b6785]">
            กรุณาเลือกรูปแบบการรีเซ็ตข้อมูลห้องเรียนที่ต้องการ:
          </div>

          <div className="space-y-3">
            {/* Option 1: Factory Default */}
            <label
              onClick={() => setResetType('default')}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                resetType === 'default'
                  ? 'border-[#EC4899] bg-pink-50/40 shadow-xs'
                  : 'border-[#e7edf6] hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="resetType"
                checked={resetType === 'default'}
                onChange={() => setResetType('default')}
                className="mt-1 text-[#EC4899] focus:ring-[#EC4899]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-bold text-sm text-[#0C1A4B]">
                  <Sparkles className="w-4 h-4 text-[#EC4899]" />
                  <span>คืนค่าตารางเริ่มต้นมาตรฐาน (Restore Default Schedules)</span>
                </div>
                <p className="text-xs text-[#5b6785] mt-1 leading-relaxed">
                  รีเซ็ตรายการจองทั้งหมดกลับเป็นชุดข้อมูลเริ่มต้นของวิทยาลัย (มีรายการตัวอย่างของนักศึกษาและอาจารย์ เพื่อใช้สาธิต)
                </p>
              </div>
            </label>

            {/* Option 2: Clear All Bookings */}
            <label
              onClick={() => setResetType('clear-all')}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                resetType === 'clear-all'
                  ? 'border-[#EC4899] bg-pink-50/40 shadow-xs'
                  : 'border-[#e7edf6] hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="resetType"
                checked={resetType === 'clear-all'}
                onChange={() => setResetType('clear-all')}
                className="mt-1 text-[#EC4899] focus:ring-[#EC4899]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-bold text-sm text-[#0C1A4B]">
                  <CalendarX2 className="w-4 h-4 text-rose-500" />
                  <span>ล้างการจองทั้งหมดให้ห้องว่าง 100% (Make All Rooms Free)</span>
                </div>
                <p className="text-xs text-[#5b6785] mt-1 leading-relaxed">
                  ลบรายการจองของทุกห้องเรียนออกทั้งหมด ทำให้ห้องเรียนทุกห้องว่างตลอดทั้งวัน พร้อมเริ่มทดสอบจองใหม่ตั้งแต่ต้น
                </p>
              </div>
            </label>

            {/* Option 3: Reset Single Room */}
            <label
              onClick={() => setResetType('single-room')}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                resetType === 'single-room'
                  ? 'border-[#EC4899] bg-pink-50/40 shadow-xs'
                  : 'border-[#e7edf6] hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="resetType"
                checked={resetType === 'single-room'}
                onChange={() => setResetType('single-room')}
                className="mt-1 text-[#EC4899] focus:ring-[#EC4899]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-bold text-sm text-[#0C1A4B]">
                  <Building2 className="w-4 h-4 text-[#1877C9]" />
                  <span>รีเซ็ตเฉพาะห้องที่เลือก (Reset Single Classroom)</span>
                </div>
                <p className="text-xs text-[#5b6785] mt-1 leading-relaxed">
                  ลบการจองและเคลียร์คิวให้ห้องเรียนห้องที่ระบุว่างทันที โดยไม่กระทบห้องอื่น
                </p>

                {resetType === 'single-room' && (
                  <div className="mt-3 pt-3 border-t border-pink-100">
                    <label className="block text-[11px] font-bold text-[#0C1A4B] mb-1">
                      เลือกห้องเรียนที่ต้องการรีเซ็ต:
                    </label>
                    <select
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#e7edf6] text-xs font-semibold text-[#16223f] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#EC4899]"
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.code} - {r.name} ({r.building})
                        </option>
                      ))}
                    </select>
                    {selectedRoomObj && (
                      <div className="mt-2 text-[11px] text-[#1877C9] bg-blue-50/80 p-2 rounded-lg border border-blue-100">
                        📍 ห้อง {selectedRoomObj.code} จะถูกยกเลิกการจองทั้งหมดและกลับมาว่างทันที
                      </div>
                    )}
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Warning notice */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              การรีเซ็ตจะส่งผลทันทีต่อตารางเวลา, สถานะในปฏิทิน, และการแจ้งเตือนในระบบ
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#f5f8fd] border-t border-[#e7edf6] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#e7edf6] text-xs font-semibold text-[#5b6785] hover:bg-white transition-all"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isAuthorized}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isAuthorized
                ? 'btn-psc-primary cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ยืนยันการรีเซ็ต</span>
          </button>
        </div>
      </div>
    </div>
  );
};
