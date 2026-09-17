import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Users,
  RotateCcw
} from 'lucide-react';
import { Room, Booking, User } from '../types';
import { PSC_TIME_SLOTS, getTodayDateStr } from '../data/mockData';

interface CalendarTimelineProps {
  rooms: Room[];
  bookings: Booking[];
  currentUser: User;
  onBookSlot: (room: Room, defaultSlotStartTime?: string, defaultSlotEndTime?: string) => void;
  onOpenResetModal?: (roomId?: string) => void;
}

export const CalendarTimeline: React.FC<CalendarTimelineProps> = ({
  rooms,
  bookings,
  currentUser,
  onBookSlot,
  onOpenResetModal,
}) => {
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr(0));
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');

  const handleDateShift = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const displayedRooms = selectedRoomId === 'all' 
    ? rooms 
    : rooms.filter((r) => r.id === selectedRoomId);

  // Format Thai date
  const formatThaiDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-[#e7edf6] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-[#D6297E]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0C1A4B] font-kanit">
              ตารางการใช้งานห้องเรียน (Room Schedule)
            </h2>
            <p className="text-xs text-[#5b6785]">
              ตรวจสอบสถานะห้องว่างแบบเรียลไทม์ หรือคลิกช่วงเวลาว่างเพื่อจองได้ทันที
            </p>
          </div>
        </div>

        {/* Date Selector and Shift Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#f5f8fd] p-1 rounded-xl border border-[#e7edf6]">
            <button
              onClick={() => handleDateShift(-1)}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
              title="วันก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate(getTodayDateStr(0))}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                selectedDate === getTodayDateStr(0)
                  ? 'bg-[#0C1A4B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              วันนี้
            </button>
            <button
              onClick={() => handleDateShift(1)}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
              title="วันถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#e7edf6] text-xs font-medium focus:ring-2 focus:ring-[#EC4899] bg-white text-[#16223f]"
          />

          {/* Room Filter Dropdown */}
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#e7edf6] text-xs font-medium focus:ring-2 focus:ring-[#EC4899] bg-white text-[#16223f]"
          >
            <option value="all">ห้องเรียน: ทั้งหมด ({rooms.length})</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} - {r.name.slice(0, 28)}...
              </option>
            ))}
          </select>

          {/* Reset button (Teachers & Admins only) */}
          {onOpenResetModal && (currentUser.role === 'teacher' || currentUser.role === 'admin') && (
            <button
              onClick={() => onOpenResetModal(selectedRoomId !== 'all' ? selectedRoomId : undefined)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs transition-colors shadow-2xs group"
              title="รีเซ็ตตารางเวลาการจองห้องเรียน (เฉพาะอาจารย์/แอดมิน)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600 group-hover:-rotate-90 transition-transform duration-300" />
              <span>รีเซ็ตตารางห้อง</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Banner */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-600">
        <div>ตารางประจำ: <span className="text-[#002D62] font-bold text-sm">{formatThaiDate(selectedDate)}</span></div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> อนุมัติแล้ว
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span> รอการอนุมัติ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 border border-slate-300"></span> ว่าง
          </span>
        </div>
      </div>

      {/* Responsive Matrix Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs min-w-[800px]">
            <thead>
              <tr className="bg-[#002D62] text-white divide-x divide-slate-700">
                <th className="p-3.5 w-60 font-bold sticky left-0 z-20 bg-[#002D62]">
                  ห้องเรียน / อาคาร
                </th>
                {PSC_TIME_SLOTS.map((slot) => (
                  <th key={slot.id} className="p-3 text-center font-semibold min-w-[130px]">
                    <div className="font-bold">{slot.label.split('(')[0]}</div>
                    <div className="text-[11px] text-slate-300 font-normal">
                      {slot.startTime} - {slot.endTime} น.
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayedRooms.map((room) => {
                return (
                  <tr key={room.id} className="hover:bg-slate-50/70 transition-colors divide-x divide-slate-100">
                    {/* Sticky Room Info Column */}
                    <td className="p-3.5 sticky left-0 z-10 bg-white shadow-sm">
                      <div className="font-bold text-[#002D62] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF6600]"></span>
                        {room.code}
                      </div>
                      <div className="text-slate-800 text-[11px] font-medium line-clamp-1">
                        {room.name}
                      </div>
                      <div className="text-slate-400 text-[10px] mt-0.5">
                        {room.building} (จุ {room.capacity} คน)
                      </div>
                    </td>

                    {/* Time Slot Columns */}
                    {PSC_TIME_SLOTS.map((slot) => {
                      // Find bookings overlapping this slot
                      const slotBooking = bookings.find((b) => {
                        if (b.roomId !== room.id || b.date !== selectedDate) return false;
                        if (b.status !== 'approved' && b.status !== 'pending') return false;
                        // Overlap condition
                        return b.startTime < slot.endTime && b.endTime > slot.startTime;
                      });

                      if (slotBooking) {
                        const isApproved = slotBooking.status === 'approved';
                        const isMine = slotBooking.userId === currentUser.id;

                        return (
                          <td key={slot.id} className="p-2 align-top">
                            <div
                              className={`h-full min-h-[90px] p-2 rounded-xl border flex flex-col justify-between text-[11px] transition-all shadow-xs ${
                                isApproved
                                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                                  : 'bg-amber-50/80 border-amber-300 text-amber-900'
                              } ${isMine ? 'ring-2 ring-[#FF6600]' : ''}`}
                            >
                              <div>
                                <div className="flex items-center justify-between font-bold text-[10px] uppercase">
                                  <span>{slotBooking.bookingNumber}</span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                      isApproved ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                                    }`}
                                  >
                                    {isApproved ? 'อนุมัติแล้ว' : 'รออนุมัติ'}
                                  </span>
                                </div>
                                <div className="font-semibold mt-1 line-clamp-1 text-slate-800">
                                  {slotBooking.purpose}
                                </div>
                                <div className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{slotBooking.userName}</span>
                                </div>
                              </div>
                              <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-black/5 flex items-center justify-between">
                                <span>{slotBooking.startTime} - {slotBooking.endTime} น.</span>
                                {isMine && (
                                  <span className="text-[#FF6600] font-bold">ของฉัน</span>
                                )}
                              </div>
                            </div>
                          </td>
                        );
                      }

                      // Empty Slot - clickable to book directly
                      return (
                        <td key={slot.id} className="p-2 align-middle text-center">
                          <button
                            onClick={() => onBookSlot(room, slot.startTime, slot.endTime)}
                            className="w-full h-full min-h-[90px] rounded-xl border border-dashed border-slate-200 hover:border-[#FF6600] hover:bg-orange-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-[#FF6600] transition-all group"
                          >
                            <PlusCircle className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-medium">ว่าง - จองคาบนี้</span>
                            <span className="text-[9px] text-slate-400">คลิกเพื่อจอง</span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
